package routes

import (
	"encoding/json"
	"net/http"

	"backend/controllers"
	"backend/middleware"
)

// SetupRoutes mendaftarkan seluruh endpoint publik dan terproteksi ke router HTTP
func SetupRoutes(mux *http.ServeMux) {
	authCtrl := controllers.NewAuthController()
	articleCtrl := controllers.NewArticleController()
	commentCtrl := controllers.NewCommentController()

	// 1. Endpoint Kesehatan / Health
	mux.HandleFunc("/api/v1/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]string{
			"version":      "0.8",
			"db_status":    "connected",
			"redis_status": "connected",
			"message":      "UGC Risk Management & Moderation active",
		})
	})

	// 2. Endpoint Autentikasi Publik
	mux.HandleFunc("POST /api/v1/auth/register", authCtrl.Register)
	mux.HandleFunc("POST /api/v1/auth/login", authCtrl.Login)

	// 3. Endpoint Artikel Publik (Cached Redis)
	mux.HandleFunc("GET /api/v1/articles", articleCtrl.GetArticles)
	mux.HandleFunc("GET /api/v1/articles/{slug}", articleCtrl.GetArticleBySlug)

	// 4. Endpoint UGC Komentar Publik
	mux.HandleFunc("GET /api/v1/articles/{id}/comments", commentCtrl.GetArticleComments)

	// 5. Endpoint Terproteksi User Terotentikasi (AuthMiddleware)
	meHandler := http.HandlerFunc(authCtrl.Me)
	mux.Handle("GET /api/v1/auth/me", middleware.AuthMiddleware(meHandler))

	// User submit comment (dengan auto-filter UGC)
	createCommentHandler := http.HandlerFunc(commentCtrl.CreateComment)
	mux.Handle("POST /api/v1/articles/{id}/comments", middleware.AuthMiddleware(createCommentHandler))

	// User report comment (report abuse)
	reportCommentHandler := http.HandlerFunc(commentCtrl.ReportComment)
	mux.Handle("POST /api/v1/comments/{id}/report", middleware.AuthMiddleware(reportCommentHandler))

	// 6. Endpoint Terproteksi CMS Editorial (AuthMiddleware & RoleMiddleware)
	// Create Article: Superadmin, Editor, Journalist
	createArticleHandler := http.HandlerFunc(articleCtrl.CreateArticle)
	mux.Handle("POST /api/v1/admin/articles",
		middleware.AuthMiddleware(
			middleware.RoleMiddleware("superadmin", "editor", "journalist")(createArticleHandler),
		),
	)

	// Correct Article (PPMS): Hanya Superadmin dan Editor
	correctArticleHandler := http.HandlerFunc(articleCtrl.CorrectArticle)
	mux.Handle("PUT /api/v1/admin/articles/{id}/correction",
		middleware.AuthMiddleware(
			middleware.RoleMiddleware("superadmin", "editor")(correctArticleHandler),
		),
	)

	// Antrean Moderasi Komentar (Superadmin & Editor)
	moderationQueueHandler := http.HandlerFunc(commentCtrl.GetModerationQueue)
	mux.Handle("GET /api/v1/admin/moderation/comments",
		middleware.AuthMiddleware(
			middleware.RoleMiddleware("superadmin", "editor")(moderationQueueHandler),
		),
	)

	// Aksi Moderasi Komentar (Superadmin & Editor: Delete / Ignore)
	moderateActionHandler := http.HandlerFunc(commentCtrl.ModerateCommentAction)
	mux.Handle("PUT /api/v1/admin/moderation/comments/{id}",
		middleware.AuthMiddleware(
			middleware.RoleMiddleware("superadmin", "editor")(moderateActionHandler),
		),
	)

	// Uji coba RBAC ruang redaksi
	editorOnlyHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]string{
			"message": "Akses ruang redaksi diizinkan untuk Editor/Superadmin",
		})
	})
	mux.Handle("GET /api/v1/editor/ping",
		middleware.AuthMiddleware(
			middleware.RoleMiddleware("editor", "superadmin")(editorOnlyHandler),
		),
	)

	// 7. Fallback Root
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/" {
			http.NotFound(w, r)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]string{
			"message":  "Backend Berjalan - Versi 0.8",
			"health":   "/api/v1/health",
			"articles": "/api/v1/articles",
		})
	})
}
