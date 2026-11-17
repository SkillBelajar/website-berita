package controllers

import (
	"encoding/json"
	"net/http"
	"strings"

	"backend/config"
	"backend/middleware"
	"backend/models"

	"golang.org/x/crypto/bcrypt"
)

type RegisterRequest struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
	Role     string `json:"role"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type AuthController struct{}

func NewAuthController() *AuthController {
	return &AuthController{}
}

// Register menangani pendaftaran pengguna baru
func (c *AuthController) Register(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		middleware.RespondError(w, http.StatusMethodNotAllowed, "Metode tidak diizinkan")
		return
	}

	var req RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		middleware.RespondError(w, http.StatusBadRequest, "Format JSON tidak valid")
		return
	}

	// Validasi dasar
	req.Name = strings.TrimSpace(req.Name)
	req.Email = strings.TrimSpace(strings.ToLower(req.Email))
	if req.Name == "" || req.Email == "" || req.Password == "" {
		middleware.RespondError(w, http.StatusBadRequest, "Nama, email, dan password wajib diisi")
		return
	}

	if len(req.Password) < 6 {
		middleware.RespondError(w, http.StatusBadRequest, "Password minimal 6 karakter")
		return
	}

	// Cek duplikasi email
	var existingUser models.User
	if err := config.DB.Where("email = ?", req.Email).First(&existingUser).Error; err == nil {
		middleware.RespondError(w, http.StatusConflict, "Email sudah terdaftar")
		return
	}

	// Tentukan role (default: user)
	userRole := models.RoleUser
	switch strings.ToLower(req.Role) {
	case string(models.RoleSuperadmin):
		userRole = models.RoleSuperadmin
	case string(models.RoleEditor):
		userRole = models.RoleEditor
	case string(models.RoleJournalist):
		userRole = models.RoleJournalist
	default:
		userRole = models.RoleUser
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		middleware.RespondError(w, http.StatusInternalServerError, "Gagal mengenkripsi password")
		return
	}

	newUser := models.User{
		Name:     req.Name,
		Email:    req.Email,
		Password: string(hashedPassword),
		Role:     userRole,
	}

	if err := config.DB.Create(&newUser).Error; err != nil {
		middleware.RespondError(w, http.StatusInternalServerError, "Gagal menyimpan data pengguna")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Registrasi berhasil",
		"user": map[string]interface{}{
			"id":    newUser.ID,
			"name":  newUser.Name,
			"email": newUser.Email,
			"role":  newUser.Role,
		},
	})
}

// Login menangani autentikasi pengguna dan mengembalikan token JWT
func (c *AuthController) Login(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		middleware.RespondError(w, http.StatusMethodNotAllowed, "Metode tidak diizinkan")
		return
	}

	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		middleware.RespondError(w, http.StatusBadRequest, "Format JSON tidak valid")
		return
	}

	req.Email = strings.TrimSpace(strings.ToLower(req.Email))
	if req.Email == "" || req.Password == "" {
		middleware.RespondError(w, http.StatusBadRequest, "Email dan password wajib diisi")
		return
	}

	var user models.User
	if err := config.DB.Where("email = ?", req.Email).First(&user).Error; err != nil {
		middleware.RespondError(w, http.StatusUnauthorized, "Email atau password salah")
		return
	}

	// Verifikasi hash password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		middleware.RespondError(w, http.StatusUnauthorized, "Email atau password salah")
		return
	}

	// Buat token JWT
	token, err := middleware.GenerateToken(user.ID, string(user.Role))
	if err != nil {
		middleware.RespondError(w, http.StatusInternalServerError, "Gagal membuat token autentikasi")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"token": token,
		"role":  user.Role,
	})
}

// Me mengembalikan profil pengguna yang sedang login berdasarkan context JWT
func (c *AuthController) Me(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		middleware.RespondError(w, http.StatusMethodNotAllowed, "Metode tidak diizinkan")
		return
	}

	userIDVal := r.Context().Value(middleware.UserIDKey)
	userID, ok := userIDVal.(uint)
	if !ok {
		middleware.RespondError(w, http.StatusUnauthorized, "Konteks pengguna tidak ditemukan")
		return
	}

	var user models.User
	if err := config.DB.First(&user, userID).Error; err != nil {
		middleware.RespondError(w, http.StatusNotFound, "Pengguna tidak ditemukan")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"id":         user.ID,
		"name":       user.Name,
		"email":      user.Email,
		"role":       user.Role,
		"created_at": user.CreatedAt,
	})
}
