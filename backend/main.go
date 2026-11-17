package main

import (
	"log"
	"net/http"

	"backend/config"
	"backend/middleware"
	"backend/models"
	"backend/routes"
)

func main() {
	// 1. Inisialisasi koneksi Database & Redis
	db := config.ConnectDatabase()
	_ = config.ConnectRedis()

	// 2. Jalankan Auto-Migrate skema database
	log.Println("Menjalankan database auto-migration...")
	err := db.AutoMigrate(
		&models.User{},
		&models.Article{},
		&models.CorrectionLog{},
		&models.Comment{},
		&models.CommentReport{},
		&models.ComplaintHakJawab{},
		&models.SettingRedaksi{},
	)
	if err != nil {
		log.Fatalf("Gagal melakukan auto-migration database: %v", err)
	}
	log.Println("Auto-migration database berhasil diselesaikan.")

	// 3. Setup Routing
	mux := http.NewServeMux()
	routes.SetupRoutes(mux)

	// 4. Bungkus router dengan CORS Middleware untuk frontend Next.js
	handlerWithCORS := middleware.CORSMiddleware(mux)

	log.Println("Backend server berjalan di port 8080 dengan CORS aktif...")
	if err := http.ListenAndServe(":8080", handlerWithCORS); err != nil {
		log.Fatalf("Gagal menjalankan server: %v", err)
	}
}
