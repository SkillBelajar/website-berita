package controllers

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"backend/config"
	"backend/middleware"
	"backend/models"

	"gorm.io/gorm"
)

type UpdateRedaksiRequest struct {
	EditorInChief string `json:"editor_in_chief"`
	Team          string `json:"team"`
	OfficeAddress string `json:"office_address"`
	Email         string `json:"email"`
	Phone         string `json:"phone"`
}

type SubmitHakJawabRequest struct {
	ArticleID      uint   `json:"article_id"`
	SubmitterName  string `json:"submitter_name"`
	SubmitterEmail string `json:"submitter_email"`
	Content        string `json:"content"`
}

type ComplianceController struct{}

func NewComplianceController() *ComplianceController {
	return &ComplianceController{}
}

// GetRedaksi mengembalikan informasi struktur redaksi (Pedoman PPMS Pasal 3) dengan Redis Cache
func (c *ComplianceController) GetRedaksi(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		middleware.RespondError(w, http.StatusMethodNotAllowed, "Metode tidak diizinkan")
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	cacheKey := "redaksi_info"

	// 1. Cek Redis Cache
	if cachedData, err := config.GetCache(ctx, cacheKey); err == nil && cachedData != "" {
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("X-Cache", "HIT")
		_, _ = w.Write([]byte(cachedData))
		return
	}

	// 2. Query Database
	var setting models.SettingRedaksi
	err := config.DB.First(&setting).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			// Kembalikan default jika belum diset
			defaultData := map[string]interface{}{
				"success": true,
				"data": map[string]string{
					"editor_in_chief": "Belum diset",
					"team":            "Belum diset",
					"office_address":  "Belum diset",
					"email":           "redaksi@berita.com",
					"phone":           "-",
				},
				"message": "Pengaturan redaksi default (belum dikonfigurasi)",
			}
			w.Header().Set("Content-Type", "application/json")
			_ = json.NewEncoder(w).Encode(defaultData)
			return
		}
		middleware.RespondError(w, http.StatusInternalServerError, "Gagal mengambil data redaksi")
		return
	}

	responsePayload, err := json.Marshal(map[string]interface{}{
		"success": true,
		"data":    setting,
	})
	if err != nil {
		middleware.RespondError(w, http.StatusInternalServerError, "Gagal memproses data redaksi")
		return
	}

	// 3. Simpan ke Redis (TTL 10 Menit)
	_ = config.SetCache(ctx, cacheKey, responsePayload, 10*time.Minute)

	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("X-Cache", "MISS")
	_, _ = w.Write(responsePayload)
}

// UpdateRedaksi memperbarui atau menyisipkan data Box Redaksi (Khusus Editor/Superadmin)
func (c *ComplianceController) UpdateRedaksi(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut && r.Method != http.MethodPost {
		middleware.RespondError(w, http.StatusMethodNotAllowed, "Metode tidak diizinkan")
		return
	}

	var req UpdateRedaksiRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		middleware.RespondError(w, http.StatusBadRequest, "Format JSON tidak valid")
		return
	}

	req.EditorInChief = strings.TrimSpace(req.EditorInChief)
	req.Team = strings.TrimSpace(req.Team)
	req.OfficeAddress = strings.TrimSpace(req.OfficeAddress)
	req.Email = strings.TrimSpace(strings.ToLower(req.Email))
	req.Phone = strings.TrimSpace(req.Phone)

	if req.EditorInChief == "" || req.OfficeAddress == "" || req.Email == "" || req.Phone == "" {
		middleware.RespondError(w, http.StatusBadRequest, "Pemimpin redaksi, alamat kantor, email, dan nomor telepon wajib diisi")
		return
	}

	var setting models.SettingRedaksi
	err := config.DB.First(&setting).Error
	if err != nil && err != gorm.ErrRecordNotFound {
		middleware.RespondError(w, http.StatusInternalServerError, "Gagal membaca data redaksi")
		return
	}

	setting.EditorInChief = req.EditorInChief
	setting.Team = req.Team
	setting.OfficeAddress = req.OfficeAddress
	setting.Email = req.Email
	setting.Phone = req.Phone

	if err == gorm.ErrRecordNotFound {
		if err := config.DB.Create(&setting).Error; err != nil {
			middleware.RespondError(w, http.StatusInternalServerError, "Gagal membuat data redaksi")
			return
		}
	} else {
		if err := config.DB.Save(&setting).Error; err != nil {
			middleware.RespondError(w, http.StatusInternalServerError, "Gagal memperbarui data redaksi")
			return
		}
	}

	// Invalidate cache Redis
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()
	_ = config.DeleteCache(ctx, "redaksi_info")

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Struktur redaksi berhasil diperbarui sesuai standar PPMS",
		"data":    setting,
	})
}

// SubmitHakJawab menerima permohonan Hak Jawab / Koreksi dari publik atau narasumber luar
func (c *ComplianceController) SubmitHakJawab(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		middleware.RespondError(w, http.StatusMethodNotAllowed, "Metode tidak diizinkan")
		return
	}

	var req SubmitHakJawabRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		middleware.RespondError(w, http.StatusBadRequest, "Format JSON tidak valid")
		return
	}

	req.SubmitterName = strings.TrimSpace(req.SubmitterName)
	req.SubmitterEmail = strings.TrimSpace(strings.ToLower(req.SubmitterEmail))
	req.Content = strings.TrimSpace(req.Content)

	if req.ArticleID == 0 || req.SubmitterName == "" || req.SubmitterEmail == "" || req.Content == "" {
		middleware.RespondError(w, http.StatusBadRequest, "ID artikel, nama, email pemohon, dan isi hak jawab wajib diisi")
		return
	}

	// Validasi format email dasar
	if !strings.Contains(req.SubmitterEmail, "@") || !strings.Contains(req.SubmitterEmail, ".") {
		middleware.RespondError(w, http.StatusBadRequest, "Format email pemohon tidak valid")
		return
	}

	// Pastikan artikel yang diadukan ada di database
	var article models.Article
	if err := config.DB.First(&article, req.ArticleID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			middleware.RespondError(w, http.StatusNotFound, "Artikel rujukan tidak ditemukan")
			return
		}
		middleware.RespondError(w, http.StatusInternalServerError, "Gagal memverifikasi artikel rujukan")
		return
	}

	complaint := models.ComplaintHakJawab{
		ArticleID:      req.ArticleID,
		SubmitterName:  req.SubmitterName,
		SubmitterEmail: req.SubmitterEmail,
		Content:        req.Content,
		Status:         "pending",
		CreatedAt:      time.Now(),
	}

	if err := config.DB.Create(&complaint).Error; err != nil {
		middleware.RespondError(w, http.StatusInternalServerError, "Gagal menyimpan pengajuan hak jawab")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Permohonan Hak Jawab berhasil dikirim dan akan segera diproses oleh Dewan Redaksi",
		"ticket": map[string]interface{}{
			"id":              complaint.ID,
			"article_id":      complaint.ArticleID,
			"article_title":   article.Title,
			"submitter_name":  complaint.SubmitterName,
			"submitter_email": complaint.SubmitterEmail,
			"status":          complaint.Status,
			"created_at":      complaint.CreatedAt,
		},
	})
}

// GetHakJawabQueue menyajikan daftar tiket permohonan Hak Jawab untuk ditinjau oleh Editor/Admin
func (c *ComplianceController) GetHakJawabQueue(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		middleware.RespondError(w, http.StatusMethodNotAllowed, "Metode tidak diizinkan")
		return
	}

	var complaints []models.ComplaintHakJawab
	err := config.DB.
		Preload("Article", func(db *gorm.DB) *gorm.DB {
			return db.Select("id, title, slug")
		}).
		Order("created_at desc").
		Find(&complaints).Error

	if err != nil {
		middleware.RespondError(w, http.StatusInternalServerError, "Gagal mengambil daftar hak jawab")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"data":    complaints,
		"total":   len(complaints),
	})
}
