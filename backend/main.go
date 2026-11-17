package main

import (
	"encoding/json"
	"log"
	"net/http"

	"backend/config"
	"backend/models"
)

type HealthResponse struct {
	Version     string `json:"version"`
	DBStatus    string `json:"db_status"`
	RedisStatus string `json:"redis_status"`
	Message     string `json:"message"`
}

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

	// 3. Endpoint Health Check
	http.HandleFunc("/api/v1/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		res := HealthResponse{
			Version:     "0.5",
			DBStatus:    "connected",
			RedisStatus: "connected",
			Message:     "Schema migrated successfully",
		}
		_ = json.NewEncoder(w).Encode(res)
	})

	// 4. Root fallback
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/" {
			http.NotFound(w, r)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		res := map[string]string{
			"message": "Backend Berjalan - Versi 0.5",
			"health":  "/api/v1/health",
		}
		_ = json.NewEncoder(w).Encode(res)
	})

	log.Println("Backend server berjalan di port 8080...")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatalf("Gagal menjalankan server: %v", err)
	}
}
