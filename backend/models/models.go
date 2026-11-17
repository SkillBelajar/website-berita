package models

import (
	"time"
)

// UserRole mendefinisikan peran pengguna di dalam portal berita
type UserRole string

const (
	RoleSuperadmin UserRole = "superadmin"
	RoleEditor     UserRole = "editor"
	RoleJournalist UserRole = "journalist"
	RoleUser       UserRole = "user"
)

// User merepresentasikan entitas pengguna sistem (Multi-role)
type User struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Name      string    `gorm:"type:varchar(100);not null" json:"name"`
	Email     string    `gorm:"type:varchar(100);uniqueIndex;not null" json:"email"`
	Password  string    `gorm:"type:varchar(255);not null" json:"-"`
	Role      UserRole  `gorm:"type:varchar(20);default:'user';not null" json:"role"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// Article merepresentasikan artikel berita dengan kepatuhan PPMS
type Article struct {
	ID            uint            `gorm:"primaryKey" json:"id"`
	Title         string          `gorm:"type:varchar(255);not null" json:"title"`
	Slug          string          `gorm:"type:varchar(255);uniqueIndex;not null" json:"slug"`
	Content       string          `gorm:"type:text;not null" json:"content"`
	AuthorID      uint            `gorm:"not null;index" json:"author_id"`
	Author        User            `gorm:"foreignKey:AuthorID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT" json:"author,omitempty"`
	IsAdvertorial bool            `gorm:"default:false;not null" json:"is_advertorial"`
	CreatedAt     time.Time       `gorm:"not null" json:"created_at"` // datePublished
	UpdatedAt     time.Time       `gorm:"not null" json:"updated_at"` // dateModified
	Corrections   []CorrectionLog `gorm:"foreignKey:ArticleID" json:"corrections,omitempty"`
	Comments      []Comment       `gorm:"foreignKey:ArticleID" json:"comments,omitempty"`
}

// CorrectionLog merepresentasikan log ralat tersemat sesuai regulasi PPMS
type CorrectionLog struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	ArticleID uint      `gorm:"not null;index" json:"article_id"`
	Article   Article   `gorm:"foreignKey:ArticleID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE" json:"-"`
	EditorID  uint      `gorm:"not null;index" json:"editor_id"`
	Editor    User      `gorm:"foreignKey:EditorID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT" json:"editor,omitempty"`
	Reason    string    `gorm:"type:text;not null" json:"reason"`
	CreatedAt time.Time `gorm:"not null" json:"created_at"`
}

// CommentStatus status moderasi komentar UGC
type CommentStatus string

const (
	CommentPending  CommentStatus = "pending"
	CommentApproved CommentStatus = "approved"
	CommentRejected CommentStatus = "rejected"
)

// Comment merepresentasikan User Generated Content (UGC) pada artikel berita
type Comment struct {
	ID        uint          `gorm:"primaryKey" json:"id"`
	ArticleID uint          `gorm:"not null;index" json:"article_id"`
	Article   Article       `gorm:"foreignKey:ArticleID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE" json:"-"`
	UserID    uint          `gorm:"not null;index" json:"user_id"`
	User      User          `gorm:"foreignKey:UserID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE" json:"user,omitempty"`
	Content   string        `gorm:"type:text;not null" json:"content"`
	Status    CommentStatus `gorm:"type:varchar(20);default:'pending';not null" json:"status"`
	CreatedAt time.Time     `json:"created_at"`
}

// ReportStatus status laporan penyalahgunaan komentar
type ReportStatus string

const (
	ReportOpen     ReportStatus = "open"
	ReportReviewed ReportStatus = "reviewed"
)

// CommentReport merepresentasikan pelaporan abuse terhadap komentar UGC
type CommentReport struct {
	ID         uint         `gorm:"primaryKey" json:"id"`
	CommentID  uint         `gorm:"not null;index" json:"comment_id"`
	Comment    Comment      `gorm:"foreignKey:CommentID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE" json:"-"`
	ReporterID uint         `gorm:"not null;index" json:"reporter_id"`
	Reporter   User         `gorm:"foreignKey:ReporterID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE" json:"reporter,omitempty"`
	Reason     string       `gorm:"type:varchar(255);not null" json:"reason"`
	Status     ReportStatus `gorm:"type:varchar(20);default:'open';not null" json:"status"`
	CreatedAt  time.Time    `json:"created_at"`
}

// ComplaintHakJawab merepresentasikan mekanisme pengajuan Hak Jawab PPMS
type ComplaintHakJawab struct {
	ID             uint      `gorm:"primaryKey" json:"id"`
	ArticleID      uint      `gorm:"not null;index" json:"article_id"`
	Article        Article   `gorm:"foreignKey:ArticleID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE" json:"-"`
	SubmitterName  string    `gorm:"type:varchar(100);not null" json:"submitter_name"`
	SubmitterEmail string    `gorm:"type:varchar(100);not null" json:"submitter_email"`
	Content        string    `gorm:"type:text;not null" json:"content"`
	Status         string    `gorm:"type:varchar(30);default:'pending';not null" json:"status"`
	CreatedAt      time.Time `json:"created_at"`
}

// SettingRedaksi merepresentasikan identitas penanggung jawab & struktur redaksi (Kepatuhan PPMS Pasal 3)
type SettingRedaksi struct {
	ID            uint   `gorm:"primaryKey" json:"id"`
	EditorInChief string `gorm:"type:varchar(100);not null" json:"editor_in_chief"`
	Team          string `gorm:"type:text;not null" json:"team"`
	OfficeAddress string `gorm:"type:text;not null" json:"office_address"`
	Email         string `gorm:"type:varchar(100);not null" json:"email"`
	Phone         string `gorm:"type:varchar(50);not null" json:"phone"`
}
