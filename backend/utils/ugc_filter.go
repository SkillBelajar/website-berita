package utils

import (
	"regexp"
	"strings"
)

// urlRegex mendeteksi pola link/URL (http, https, www, dan ekstensi domain umum untuk spam backlink)
var urlRegex = regexp.MustCompile(`(?i)(https?://[^\s]+|www\.[^\s]+|[a-zA-Z0-9.-]+\.(com|net|org|id|xyz|link|online|club|vip|top|site|info|biz|ru|cn|live|cc)(/[^\s]*)?)`)

// forbiddenWords kamus kata terlarang (spam judi, pornografi, ujaran kasar)
var forbiddenWords = []string{
	"judi",
	"slot",
	"gacor",
	"kasino",
	"casino",
	"anjing",
	"bangsat",
	"togel",
	"poker",
	"sbobet",
	"pragmatic",
	"maxwin",
	"kontol",
	"memek",
	"bajingan",
}

// IsContentClean mengecek apakah konten komentar bersih dari tautan (URL) dan kata terlarang
func IsContentClean(content string) bool {
	// 1. Cek apakah terdapat tautan/URL
	if urlRegex.MatchString(content) {
		return false
	}

	// 2. Normalisasi teks ke huruf kecil
	lowerContent := strings.ToLower(content)

	// 3. Cek keberadaan kata terlarang dalam kamus
	for _, word := range forbiddenWords {
		pattern := `(?i)(^|[^a-zA-Z0-9])` + regexp.QuoteMeta(word) + `([^a-zA-Z0-9]|$)`
		matched, err := regexp.MatchString(pattern, lowerContent)
		if err == nil && matched {
			return false
		}
		if strings.Contains(lowerContent, word) {
			return false
		}
	}

	return true
}
