package controllers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"
	"time"

	"backend/config"
	"backend/middleware"
	"backend/models"
	"backend/utils"

	"gorm.io/gorm"
)

type CreateCommentRequest struct {
	Content string `json:"content"`
}

type ReportCommentRequest struct {
	Reason string `json:"reason"`
}

type ModerateActionRequest struct {
	Action string `json:"action"` // "delete" atau "ignore"
}

type CommentController struct{}

func NewCommentController() *CommentController {
	return &CommentController{}
}

// CreateComment menambahkan komentar pada artikel setelah lolos filter otomatis
func (c *CommentController) CreateComment(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		middleware.RespondError(w, http.StatusMethodNotAllowed, "Metode tidak diizinkan")
		return
	}

	userIDVal := r.Context().Value(middleware.UserIDKey)
	userID, ok := userIDVal.(uint)
	if !ok || userID == 0 {
		middleware.RespondError(w, http.StatusUnauthorized, "Pengguna tidak terautentikasi")
		return
	}

	// Ambil article_id dari path
	idStr := r.PathValue("id")
	if idStr == "" {
		parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
		if len(parts) >= 5 {
			idStr = parts[3]
		}
	}

	articleID, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil || articleID == 0 {
		middleware.RespondError(w, http.StatusBadRequest, "ID artikel tidak valid")
		return
	}

	// Cek apakah artikel ada
	var article models.Article
	if err := config.DB.First(&article, articleID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			middleware.RespondError(w, http.StatusNotFound, "Artikel tidak ditemukan")
			return
		}
		middleware.RespondError(w, http.StatusInternalServerError, "Gagal memverifikasi artikel")
		return
	}

	var req CreateCommentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		middleware.RespondError(w, http.StatusBadRequest, "Format JSON tidak valid")
		return
	}

	req.Content = strings.TrimSpace(req.Content)
	if req.Content == "" {
		middleware.RespondError(w, http.StatusBadRequest, "Isi komentar tidak boleh kosong")
		return
	}

	// Cek filter UGC otomatis
	if !utils.IsContentClean(req.Content) {
		middleware.RespondError(w, http.StatusBadRequest, "Komentar ditolak: mengandung tautan atau kata terlarang")
		return
	}

	comment := models.Comment{
		ArticleID: uint(articleID),
		UserID:    userID,
		Content:   req.Content,
		Status:    models.CommentApproved,
		CreatedAt: time.Now(),
	}

	if err := config.DB.Create(&comment).Error; err != nil {
		middleware.RespondError(w, http.StatusInternalServerError, "Gagal menyimpan komentar")
		return
	}

	_ = config.DB.Preload("User", func(db *gorm.DB) *gorm.DB {
		return db.Select("id, name, email, role")
	}).First(&comment, comment.ID)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Komentar berhasil dipublikasikan",
		"comment": comment,
	})
}

// GetArticleComments mengambil semua komentar berstatus approved dari artikel tertentu
func (c *CommentController) GetArticleComments(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		middleware.RespondError(w, http.StatusMethodNotAllowed, "Metode tidak diizinkan")
		return
	}

	idStr := r.PathValue("id")
	if idStr == "" {
		parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
		if len(parts) >= 5 {
			idStr = parts[3]
		}
	}

	articleID, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil || articleID == 0 {
		middleware.RespondError(w, http.StatusBadRequest, "ID artikel tidak valid")
		return
	}

	var comments []models.Comment
	err = config.DB.
		Where("article_id = ? AND status = ?", articleID, models.CommentApproved).
		Preload("User", func(db *gorm.DB) *gorm.DB {
			return db.Select("id, name, role")
		}).
		Order("created_at desc").
		Find(&comments).Error

	if err != nil {
		middleware.RespondError(w, http.StatusInternalServerError, "Gagal mengambil komentar")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"data":    comments,
		"total":   len(comments),
	})
}

// ReportComment menangani pelaporan komentar bermasalah oleh pengguna
func (c *CommentController) ReportComment(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		middleware.RespondError(w, http.StatusMethodNotAllowed, "Metode tidak diizinkan")
		return
	}

	reporterIDVal := r.Context().Value(middleware.UserIDKey)
	reporterID, ok := reporterIDVal.(uint)
	if !ok || reporterID == 0 {
		middleware.RespondError(w, http.StatusUnauthorized, "Pengguna tidak terautentikasi")
		return
	}

	idStr := r.PathValue("id")
	if idStr == "" {
		parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
		if len(parts) >= 5 {
			idStr = parts[3]
		}
	}

	commentID, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil || commentID == 0 {
		middleware.RespondError(w, http.StatusBadRequest, "ID komentar tidak valid")
		return
	}

	// Cek apakah komentar ada
	var comment models.Comment
	if err := config.DB.First(&comment, commentID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			middleware.RespondError(w, http.StatusNotFound, "Komentar yang dilaporkan tidak ditemukan")
			return
		}
		middleware.RespondError(w, http.StatusInternalServerError, "Gagal mencari komentar")
		return
	}

	var req ReportCommentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		middleware.RespondError(w, http.StatusBadRequest, "Format JSON tidak valid")
		return
	}

	req.Reason = strings.TrimSpace(req.Reason)
	if req.Reason == "" {
		middleware.RespondError(w, http.StatusBadRequest, "Alasan pelaporan wajib diisi")
		return
	}

	report := models.CommentReport{
		CommentID:  uint(commentID),
		ReporterID: reporterID,
		Reason:     req.Reason,
		Status:     models.ReportOpen,
		CreatedAt:  time.Now(),
	}

	if err := config.DB.Create(&report).Error; err != nil {
		middleware.RespondError(w, http.StatusInternalServerError, "Gagal membuat laporan komentar")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Laporan komentar berhasil dikirim dan masuk antrean moderasi",
		"report":  report,
	})
}

// GetModerationQueue mengembalikan antrean laporan komentar berstatus open untuk Editor/Admin
func (c *CommentController) GetModerationQueue(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		middleware.RespondError(w, http.StatusMethodNotAllowed, "Metode tidak diizinkan")
		return
	}

	var reports []models.CommentReport
	err := config.DB.
		Where("status = ?", models.ReportOpen).
		Preload("Comment").
		Preload("Comment.User", func(db *gorm.DB) *gorm.DB {
			return db.Select("id, name, email, role")
		}).
		Preload("Reporter", func(db *gorm.DB) *gorm.DB {
			return db.Select("id, name, email, role")
		}).
		Order("created_at desc").
		Find(&reports).Error

	if err != nil {
		middleware.RespondError(w, http.StatusInternalServerError, "Gagal mengambil antrean moderasi")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"data":    reports,
		"total":   len(reports),
	})
}

// ModerateCommentAction mengeksekusi tindakan moderasi pada komentar (delete atau ignore)
func (c *CommentController) ModerateCommentAction(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut && r.Method != http.MethodPost {
		middleware.RespondError(w, http.StatusMethodNotAllowed, "Metode tidak diizinkan")
		return
	}

	idStr := r.PathValue("id")
	if idStr == "" {
		parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
		if len(parts) >= 6 {
			idStr = parts[5]
		}
	}

	commentID, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil || commentID == 0 {
		middleware.RespondError(w, http.StatusBadRequest, "ID komentar tidak valid")
		return
	}

	var req ModerateActionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		middleware.RespondError(w, http.StatusBadRequest, "Format JSON tidak valid")
		return
	}

	action := strings.ToLower(strings.TrimSpace(req.Action))
	if action != "delete" && action != "ignore" {
		middleware.RespondError(w, http.StatusBadRequest, "Aksi tidak valid. Pilihan: 'delete' atau 'ignore'")
		return
	}

	var comment models.Comment
	if err := config.DB.First(&comment, commentID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			middleware.RespondError(w, http.StatusNotFound, "Komentar tidak ditemukan")
			return
		}
		middleware.RespondError(w, http.StatusInternalServerError, "Gagal mencari komentar")
		return
	}

	if action == "delete" {
		comment.Status = models.CommentRejected
		_ = config.DB.Save(&comment)
	}

	// Update seluruh report terkait komentar ini menjadi reviewed
	_ = config.DB.Model(&models.CommentReport{}).
		Where("comment_id = ?", commentID).
		Update("status", models.ReportReviewed)

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Tindakan moderasi berhasil dijalankan",
		"action":  action,
		"comment": comment,
	})
}
