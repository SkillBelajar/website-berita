package main

import (
	"encoding/json"
	"log"
	"net/http"
)

type Response struct {
	Message string `json:"message"`
}

func main() {
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		res := Response{
			Message: "Backend Berjalan - Versi 0.4",
		}
		_ = json.NewEncoder(w).Encode(res)
	})

	log.Println("Backend dummy server berjalan di port 8080...")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatalf("Gagal menjalankan server: %v", err)
	}
}
