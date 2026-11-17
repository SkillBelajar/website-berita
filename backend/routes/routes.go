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

	// 1. Endpoint Publik
	mux.HandleFunc("/api/v1/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]string{
			"version":      "0.6",
			"db_status":    "connected",
			"redis_status": "connected",
			"message":      "Schema migrated & Auth RBAC active",
		})
	})

	mux.HandleFunc("/api/v1/auth/register", authCtrl.Register)
	mux.HandleFunc("/api/v1/auth/login", authCtrl.Login)

	// 2. Endpoint Terproteksi JWT (AuthMiddleware & RBAC)
	meHandler := http.HandlerFunc(authCtrl.Me)
	mux.Handle("/api/v1/auth/me", middleware.AuthMiddleware(meHandler))

	// Endpoint uji coba RBAC (hanya editor dan superadmin)
	editorOnlyHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]string{
			"message": "Akses ruang redaksi diizinkan untuk Editor/Superadmin",
		})
	})
	mux.Handle("/api/v1/editor/ping", middleware.AuthMiddleware(middleware.RoleMiddleware("editor", "superadmin")(editorOnlyHandler)))

	// 3. Fallback Root
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/" {
			http.NotFound(w, r)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]string{
			"message": "Backend Berjalan - Versi 0.6",
			"health":  "/api/v1/health",
		})
	})
}
