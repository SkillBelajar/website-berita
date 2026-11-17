package controllers

import (
	"context"
	"encoding/json"
	"net/http"
	"strconv"
	"strings"
	"time"

	"backend/config"
	"backend/middleware"
	"backend/models"

	"gorm.io/gorm"
)

type CreateArticleRequest struct {
	Title         string `json:"title"`
	Slug          string `json:"slug"`
	Content       string `json:"content"`
	FeaturedImage string `json:"featured_image"`
	ImageCaption  string `json:"image_caption"`
	IsAdvertorial bool   `json:"is_advertorial"`
}

type CorrectArticleRequest struct {
	Content          string `json:"content"`
	FeaturedImage    string `json:"featured_image"`
	ImageCaption     string `json:"image_caption"`
	CorrectionReason string `json:"correction_reason"`
}

type ArticleController struct{}

func NewArticleController() *ArticleController {
	return &ArticleController{}
}

// CreateArticle membuat artikel baru dan mengaitkan AuthorID dari konteks JWT
func (c *ArticleController) CreateArticle(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		middleware.RespondError(w, http.StatusMethodNotAllowed, "Metode tidak diizinkan")
		return
	}

	authorIDVal := r.Context().Value(middleware.UserIDKey)
	authorID, ok := authorIDVal.(uint)
	if !ok || authorID == 0 {
		middleware.RespondError(w, http.StatusUnauthorized, "Pengguna tidak terautentikasi")
		return
	}

	var req CreateArticleRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		middleware.RespondError(w, http.StatusBadRequest, "Format JSON tidak valid")
		return
	}

	req.Title = strings.TrimSpace(req.Title)
	req.Slug = strings.TrimSpace(strings.ToLower(req.Slug))
	req.Content = strings.TrimSpace(req.Content)

	if req.Title == "" || req.Slug == "" || req.Content == "" {
		middleware.RespondError(w, http.StatusBadRequest, "Judul, slug, dan konten wajib diisi")
		return
	}

	// Cek keunikan slug
	var existing models.Article
	if err := config.DB.Where("slug = ?", req.Slug).First(&existing).Error; err == nil {
		middleware.RespondError(w, http.StatusConflict, "Slug artikel sudah digunakan")
		return
	}

	now := time.Now()
	article := models.Article{
		Title:         req.Title,
		Slug:          req.Slug,
		Content:       req.Content,
		FeaturedImage: req.FeaturedImage,
		ImageCaption:  req.ImageCaption,
		AuthorID:      authorID,
		IsAdvertorial: req.IsAdvertorial,
		CreatedAt:     now,
		UpdatedAt:     now,
	}

	if err := config.DB.Create(&article).Error; err != nil {
		middleware.RespondError(w, http.StatusInternalServerError, "Gagal menyimpan artikel")
		return
	}

	// Invalidate cache list artikel di Redis
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()
	_ = config.DeleteCache(ctx, "articles_list")

	// Preload author untuk response
	_ = config.DB.Preload("Author").First(&article, article.ID)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Artikel berhasil dibuat",
		"article": article,
	})
}

// GetArticles mengambil daftar artikel publik dengan Redis Caching
func (c *ArticleController) GetArticles(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		middleware.RespondError(w, http.StatusMethodNotAllowed, "Metode tidak diizinkan")
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	cacheKey := "articles_list"

	// 1. Cek Redis Cache
	if cachedData, err := config.GetCache(ctx, cacheKey); err == nil && cachedData != "" {
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("X-Cache", "HIT")
		_, _ = w.Write([]byte(cachedData))
		return
	}

	// 2. Query Database jika cache MISS
	var articles []models.Article
	err := config.DB.
		Preload("Author", func(db *gorm.DB) *gorm.DB {
			return db.Select("id, name, email, role")
		}).
		Preload("Corrections").
		Order("created_at desc").
		Find(&articles).Error

	if err != nil {
		middleware.RespondError(w, http.StatusInternalServerError, "Gagal mengambil data artikel")
		return
	}

	responsePayload, err := json.Marshal(map[string]interface{}{
		"success": true,
		"data":    articles,
		"total":   len(articles),
	})
	if err != nil {
		middleware.RespondError(w, http.StatusInternalServerError, "Gagal memproses data artikel")
		return
	}

	// 3. Simpan ke Redis (TTL 5 Menit)
	_ = config.SetCache(ctx, cacheKey, responsePayload, 5*time.Minute)

	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("X-Cache", "MISS")
	_, _ = w.Write(responsePayload)
}

// GetArticleBySlug mengambil detail artikel publik berdasarkan slug beserta relasi log ralat PPMS
func (c *ArticleController) GetArticleBySlug(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		middleware.RespondError(w, http.StatusMethodNotAllowed, "Metode tidak diizinkan")
		return
	}

	slug := r.PathValue("slug")
	if slug == "" {
		// Fallback pemotongan URL jika tanpa PathValue
		parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
		if len(parts) >= 4 {
			slug = parts[3]
		}
	}

	slug = strings.TrimSpace(strings.ToLower(slug))
	if slug == "" {
		middleware.RespondError(w, http.StatusBadRequest, "Slug artikel wajib disertakan")
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	cacheKey := "article_" + slug

	// 1. Cek Redis Cache
	if cachedData, err := config.GetCache(ctx, cacheKey); err == nil && cachedData != "" {
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("X-Cache", "HIT")
		_, _ = w.Write([]byte(cachedData))
		return
	}

	// 2. Query Database jika cache MISS
	var article models.Article
	err := config.DB.
		Where("slug = ?", slug).
		Preload("Author", func(db *gorm.DB) *gorm.DB {
			return db.Select("id, name, email, role")
		}).
		Preload("Corrections.Editor", func(db *gorm.DB) *gorm.DB {
			return db.Select("id, name, email, role")
		}).
		First(&article).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			middleware.RespondError(w, http.StatusNotFound, "Artikel tidak ditemukan")
			return
		}
		middleware.RespondError(w, http.StatusInternalServerError, "Gagal mengambil detail artikel")
		return
	}

	responsePayload, err := json.Marshal(map[string]interface{}{
		"success": true,
		"data":    article,
	})
	if err != nil {
		middleware.RespondError(w, http.StatusInternalServerError, "Gagal memproses data artikel")
		return
	}

	// 3. Simpan ke Redis (TTL 5 Menit)
	_ = config.SetCache(ctx, cacheKey, responsePayload, 5*time.Minute)

	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("X-Cache", "MISS")
	_, _ = w.Write(responsePayload)
}

// CorrectArticle mengimplementasikan Kepatuhan PPMS: Update konten berita dan menambahkan Log Ralat Tersemat
func (c *ArticleController) CorrectArticle(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut && r.Method != http.MethodPost {
		middleware.RespondError(w, http.StatusMethodNotAllowed, "Metode tidak diizinkan")
		return
	}

	editorIDVal := r.Context().Value(middleware.UserIDKey)
	editorID, ok := editorIDVal.(uint)
	if !ok || editorID == 0 {
		middleware.RespondError(w, http.StatusUnauthorized, "Pengguna tidak terautentikasi")
		return
	}

	idStr := r.PathValue("id")
	if idStr == "" {
		// Fallback pemotongan URL jika tanpa PathValue
		parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
		if len(parts) >= 5 {
			idStr = parts[4]
		}
	}

	articleID, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil || articleID == 0 {
		middleware.RespondError(w, http.StatusBadRequest, "ID artikel tidak valid")
		return
	}

	var req CorrectArticleRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		middleware.RespondError(w, http.StatusBadRequest, "Format JSON tidak valid")
		return
	}

	req.CorrectionReason = strings.TrimSpace(req.CorrectionReason)
	req.Content = strings.TrimSpace(req.Content)

	// Validasi Kepatuhan PPMS: Alasan ralat WAJIB disertakan
	if req.CorrectionReason == "" {
		middleware.RespondError(w, http.StatusBadRequest, "Alasan ralat (correction_reason) WAJIB dicantumkan sesuai standar Kepatuhan PPMS")
		return
	}
	if req.Content == "" {
		middleware.RespondError(w, http.StatusBadRequest, "Konten berita hasil perbaikan wajib diisi")
		return
	}

	// Cari artikel di database
	var article models.Article
	if err := config.DB.First(&article, articleID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			middleware.RespondError(w, http.StatusNotFound, "Artikel tidak ditemukan")
			return
		}
		middleware.RespondError(w, http.StatusInternalServerError, "Gagal mencari artikel")
		return
	}

	// 1. Update konten artikel (GORM otomatis memperbarui UpdatedAt / dateModified)
	article.Content = req.Content
	if req.FeaturedImage != "" {
		article.FeaturedImage = req.FeaturedImage
	}
	if req.ImageCaption != "" {
		article.ImageCaption = req.ImageCaption
	}
	article.UpdatedAt = time.Now()
	if err := config.DB.Save(&article).Error; err != nil {
		middleware.RespondError(w, http.StatusInternalServerError, "Gagal memperbarui konten artikel")
		return
	}

	// 2. Tambahkan baris baru pada tabel CorrectionLog (Log Ralat Tersemat)
	correctionLog := models.CorrectionLog{
		ArticleID: article.ID,
		EditorID:  editorID,
		Reason:    req.CorrectionReason,
		CreatedAt: time.Now(),
	}

	if err := config.DB.Create(&correctionLog).Error; err != nil {
		middleware.RespondError(w, http.StatusInternalServerError, "Gagal mencatat log ralat PPMS")
		return
	}

	// 3. Invalidate Redis Cache agar publik langsung melihat pembaruan & log ralat
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()
	_ = config.DeleteCache(ctx, "articles_list", "article_"+article.Slug)

	// Ambil data lengkap artikel setelah diralat beserta riwayat ralat
	_ = config.DB.
		Preload("Author", func(db *gorm.DB) *gorm.DB {
			return db.Select("id, name, email, role")
		}).
		Preload("Corrections.Editor", func(db *gorm.DB) *gorm.DB {
			return db.Select("id, name, email, role")
		}).
		First(&article, article.ID)

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"success":        true,
		"message":        "Artikel berhasil diralat dan log ralat tersemat telah dicatat sesuai standar PPMS",
		"article":        article,
		"new_correction": correctionLog,
	})
}
