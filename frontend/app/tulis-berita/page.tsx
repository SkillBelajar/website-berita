"use client";

import Link from "next/link";
import { useState, useEffect, useRef, FormEvent, ChangeEvent } from "react";
import { clientFetch, parseArticleBlocks } from "@/lib/api";
import { getAuth, AuthState } from "@/lib/auth";

export default function TulisBeritaPage() {
  const [auth, setAuth] = useState<AuthState>({
    token: null,
    role: null,
    name: null,
    email: null,
  });
  const [isLoaded, setIsLoaded] = useState(false);

  // Form Fields
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [isAdvertorial, setIsAdvertorial] = useState(false);
  const [featuredImage, setFeaturedImage] = useState("");
  const [imageCaption, setImageCaption] = useState("");

  // Editor View State
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [publishedSlug, setPublishedSlug] = useState<string | null>(null);

  // Refs
  const featuredImageInputRef = useRef<HTMLInputElement>(null);
  const contentImageInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setAuth(getAuth());
    setIsLoaded(true);
  }, []);

  // Helper kompresi gambar lokal browser ke Base64 (JPG teroptimasi)
  const compressImageToBase64 = (
    file: File,
    maxWidth = 1200,
    quality = 0.82
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(event.target?.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL("image/jpeg", quality);
          resolve(compressed);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  // 1. Handler Upload Foto Unggulan (Featured Image)
  const handleFeaturedImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMsg("Berkas yang dipilih harus berupa gambar (JPG, PNG, WebP).");
      return;
    }

    setIsProcessingImage(true);
    setErrorMsg("");

    try {
      const base64Data = await compressImageToBase64(file, 1200, 0.82);
      setFeaturedImage(base64Data);
      if (!imageCaption) {
        setImageCaption("Foto: Dokumentasi Liputan Redaksi");
      }
    } catch {
      setErrorMsg("Gagal memproses dan mengonversi gambar ke Base64.");
    } finally {
      setIsProcessingImage(false);
      if (featuredImageInputRef.current) {
        featuredImageInputRef.current.value = "";
      }
    }
  };

  // 2. Handler Upload & Sisipkan Foto ke Dalam Tulisan (Inline Content Image)
  const handleContentImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMsg("Berkas yang disisipkan harus berupa gambar.");
      return;
    }

    setIsProcessingImage(true);
    setErrorMsg("");

    try {
      const base64Data = await compressImageToBase64(file, 1000, 0.8);
      const captionPrompt =
        window.prompt("Masukkan keterangan/kredit foto untuk naskah ini (opsional):") ||
        "Dokumentasi liputan lapangan";

      const insertString = `\n\n![${captionPrompt.trim()}](${base64Data})\n\n`;

      // Sisipkan pada kursor textarea jika memungkinkan
      const textarea = textareaRef.current;
      if (textarea) {
        const startPos = textarea.selectionStart;
        const endPos = textarea.selectionEnd;
        const currentVal = textarea.value;

        const updated =
          currentVal.substring(0, startPos) +
          insertString +
          currentVal.substring(endPos);
        setContent(updated);

        // Kembalikan fokus kursor
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(
            startPos + insertString.length,
            startPos + insertString.length
          );
        }, 50);
      } else {
        setContent((prev) => prev + insertString);
      }
    } catch {
      setErrorMsg("Gagal menyisipkan gambar ke dalam naskah.");
    } finally {
      setIsProcessingImage(false);
      if (contentImageInputRef.current) {
        contentImageInputRef.current.value = "";
      }
    }
  };

  // Helper sisipkan tag teks di textarea
  const insertTextSnippet = (before: string, after: string, defaultText = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;
    const currentVal = textarea.value;
    const selected = currentVal.substring(startPos, endPos) || defaultText;

    const updated =
      currentVal.substring(0, startPos) +
      before +
      selected +
      after +
      currentVal.substring(endPos);

    setContent(updated);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        startPos + before.length,
        startPos + before.length + selected.length
      );
    }, 50);
  };

  // Helper pembuat slug otomatis dari judul
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    // Update slug jika slug belum pernah diubah manual secara radikal
    setSlug(generateSlug(val));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setPublishedSlug(null);

    if (!auth.token) {
      setErrorMsg("Sesi login Anda tidak aktif. Silakan masuk terlebih dahulu.");
      return;
    }

    if (!title.trim() || !slug.trim() || !content.trim()) {
      setErrorMsg("Judul, slug URL, dan naskah berita wajib diisi.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await clientFetch("/admin/articles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          slug: slug.trim(),
          content: content.trim(),
          featured_image: featuredImage,
          image_caption: imageCaption.trim(),
          is_advertorial: isAdvertorial,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Gagal menerbitkan artikel. Silakan periksa kembali formulir.");
        setIsLoading(false);
        return;
      }

      setPublishedSlug(slug.trim());
      // Reset form naskah
      setTitle("");
      setSlug("");
      setContent("");
      setFeaturedImage("");
      setImageCaption("");
      setIsAdvertorial(false);
      setActiveTab("write");
    } catch {
      setErrorMsg("Terjadi kegagalan komunikasi dengan server API redaksi.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center text-slate-500">
        <p>Memuat formulir redaksi...</p>
      </div>
    );
  }

  const isStaff =
    auth.token &&
    (auth.role === "superadmin" || auth.role === "editor" || auth.role === "journalist");

  if (!isStaff) {
    return (
      <div className="max-w-2xl mx-auto my-12 bg-white rounded-3xl border border-slate-200/90 shadow-sm p-8 sm:p-10 text-center space-y-6">
        <div className="w-16 h-16 bg-red-50 text-red-700 text-3xl font-black rounded-2xl flex items-center justify-center mx-auto border border-red-200">
          🔒
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-slate-950">Akses Ruang Redaksi Terbatas</h1>
          <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
            Halaman penulisan berita ini hanya dapat diakses oleh wartawan terakreditasi, redaktur
            pelaksana, atau superadmin sesuai Pedoman Pemberitaan Media Siber.
          </p>
        </div>
        <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
          <Link
            href="/login"
            className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-red-700 hover:bg-red-800 transition-colors shadow-xs"
          >
            Masuk sebagai Staf Redaksi
          </Link>
          <Link
            href="/"
            className="px-6 py-2.5 rounded-xl font-bold text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  // Hitung metrik sederhana
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const readTimeEst = Math.max(1, Math.ceil(wordCount / 180));

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header Halaman */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase bg-red-700 text-white tracking-wider">
              Ruang Redaksi
            </span>
            <span className="text-xs text-slate-500 font-semibold">
              Wartawan: <strong className="text-slate-900">{auth.name}</strong> ({auth.role})
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            Tulis & Tayangkan Berita Baru
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Naskah langsung terdistribusi ke beranda utama dengan kepatuhan log koreksi Dewan Pers.
          </p>
        </div>

        <Link
          href="/"
          className="self-start sm:self-center px-4 py-2 text-xs font-bold text-slate-600 hover:text-red-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
        >
          ← Lihat Beranda
        </Link>
      </div>

      {/* Banner Berhasil Diterbitkan */}
      {publishedSlug && (
        <div className="bg-emerald-50 border-2 border-emerald-400 rounded-3xl p-6 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-emerald-800 font-black text-base">
            <span className="text-xl">🎉</span>
            <span>Berita Berhasil Diterbitkan & Tayang ke Publik!</span>
          </div>
          <p className="text-xs sm:text-sm text-emerald-700 leading-relaxed">
            Naskah Anda telah tersimpan ke pangkalan data dan cache indeks beranda telah diperbarui secara instan.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              href={`/article/${publishedSlug}`}
              className="px-5 py-2.5 rounded-xl text-xs font-black text-white bg-emerald-700 hover:bg-emerald-800 transition-colors shadow-xs"
            >
              Lihat Naskah Berita ↗
            </Link>
            <button
              type="button"
              onClick={() => setPublishedSlug(null)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-emerald-900 bg-emerald-100 hover:bg-emerald-200 transition-colors"
            >
              Tulis Naskah Tambahan
            </button>
          </div>
        </div>
      )}

      {/* Banner Error */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-bold flex items-center gap-2.5">
          <span className="text-base">⚠️</span>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Formulir Penulisan */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6">
        {/* Judul Berita */}
        <div className="space-y-2">
          <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
            Judul Berita <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={handleTitleChange}
            placeholder="Contoh: Pemkab Luncurkan Fasilitas Kesehatan Gratis bagi Warga Kurang Mampu"
            className="w-full px-4 py-3 rounded-2xl border border-slate-300 text-slate-900 text-base font-bold placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all"
          />
        </div>

        {/* Slug URL */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Slug URL (Permalink) <span className="text-red-600">*</span>
          </label>
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs">
            <span className="text-slate-400 select-none">/article/</span>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(generateSlug(e.target.value))}
              placeholder="judul-slug-berita"
              className="w-full bg-transparent text-slate-900 font-mono text-xs focus:outline-none"
            />
          </div>
        </div>

        {/* 1. SEKSI UNGGAH GAMBAR UNGGULAN (FEATURED IMAGE) */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
              Foto Unggulan / Thumbnail Utama
            </label>
            <span className="text-[11px] text-slate-500 font-medium">
              Otomatis dikonversi ke Base64 terkompresi
            </span>
          </div>

          <input
            type="file"
            ref={featuredImageInputRef}
            onChange={handleFeaturedImageUpload}
            accept="image/*"
            className="hidden"
          />

          {featuredImage ? (
            <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 p-3 space-y-3">
              <div className="relative aspect-16/9 rounded-xl overflow-hidden bg-slate-900">
                <img
                  src={featuredImage}
                  alt="Pratinjau Foto Unggulan"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <input
                  type="text"
                  value={imageCaption}
                  onChange={(e) => setImageCaption(e.target.value)}
                  placeholder="Kredit Foto / Sumber (contoh: Foto: Tim Redaksi / Antara)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-600"
                />

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => featuredImageInputRef.current?.click()}
                    className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors cursor-pointer"
                  >
                    Ganti Foto
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFeaturedImage("");
                      setImageCaption("");
                    }}
                    className="px-3 py-1.5 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors cursor-pointer"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div
              onClick={() => featuredImageInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-red-600 hover:bg-red-50/20 rounded-2xl p-6 text-center cursor-pointer transition-all space-y-2"
            >
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 text-2xl flex items-center justify-center mx-auto">
                📸
              </div>
              <div className="space-y-0.5">
                <p className="text-xs sm:text-sm font-bold text-slate-800">
                  Klik untuk Unggah Foto Unggulan Berita
                </p>
                <p className="text-[11px] text-slate-500">
                  Mendukung format JPG, PNG, atau WebP (koneksi Base64 mandiri tanpa cloud storage)
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Tipe Berita: Redaksi vs Advertorial */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
            Klasifikasi Naskah Berita
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                !isAdvertorial
                  ? "border-red-600 bg-red-50/50"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <input
                type="radio"
                name="article_type"
                checked={!isAdvertorial}
                onChange={() => setIsAdvertorial(false)}
                className="mt-1 text-red-600 focus:ring-red-600"
              />
              <div className="space-y-0.5">
                <span className="font-bold text-sm text-slate-900 block">
                  📰 Berita Editorial Redaksi
                </span>
                <span className="text-xs text-slate-500 leading-snug block">
                  Liputan murni, independen, dan berimbang sesuai KEJ & PPMS.
                </span>
              </div>
            </label>

            <label
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                isAdvertorial
                  ? "border-amber-500 bg-amber-50/50"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <input
                type="radio"
                name="article_type"
                checked={isAdvertorial}
                onChange={() => setIsAdvertorial(true)}
                className="mt-1 text-amber-600 focus:ring-amber-500"
              />
              <div className="space-y-0.5">
                <span className="font-bold text-sm text-slate-900 block">
                  📢 Iklan Berbayar / Advertorial
                </span>
                <span className="text-xs text-slate-500 leading-snug block">
                  Konten kerja sama komersial; wajib menyertakan label khusus.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* 2. SEKSI EDITOR NASKAH + UPLOAD GAMBAR INLINE */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <label className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Isi Naskah Berita <span className="text-red-600">*</span>
              </label>

              {/* Tab Switcher: Editor vs Live Preview */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-bold border border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveTab("write")}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    activeTab === "write"
                      ? "bg-white text-slate-950 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  ✍️ Tulis
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("preview")}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    activeTab === "preview"
                      ? "bg-white text-slate-950 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  👁️ Pratinjau Naskah
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
              <span>{wordCount} kata</span>
              <span>•</span>
              <span>± {readTimeEst} menit baca</span>
            </div>
          </div>

          {/* Hidden File Input untuk Sisip Foto Tulisan */}
          <input
            type="file"
            ref={contentImageInputRef}
            onChange={handleContentImageUpload}
            accept="image/*"
            className="hidden"
          />

          {/* Toolbar Format & Sisip Gambar Inline */}
          {activeTab === "write" && (
            <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => contentImageInputRef.current?.click()}
                disabled={isProcessingImage}
                className="px-2.5 py-1.5 bg-red-700 hover:bg-red-800 text-white rounded-lg font-bold flex items-center gap-1 shadow-2xs cursor-pointer transition-colors"
                title="Unggah dan sisipkan foto ke dalam naskah berita"
              >
                <span>🖼️</span> Sisipkan Foto ke Naskah (Base64)
              </button>

              <span className="text-slate-300">|</span>

              <button
                type="button"
                onClick={() => insertTextSnippet("## ", "\n", "Subjudul Liputan")}
                className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-md font-bold text-slate-700 transition-colors"
                title="Tambahkan Subjudul H2"
              >
                Subjudul (H2)
              </button>

              <button
                type="button"
                onClick={() => insertTextSnippet('> "', '" — Nama Narasumber, Jabatan', "Pernyataan narasumber")}
                className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-md font-bold text-slate-700 transition-colors"
                title="Kutipan narasumber"
              >
                Kutipan (&gt;)
              </button>

              <button
                type="button"
                onClick={() => insertTextSnippet("**", "**", "teks penting")}
                className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-md font-bold text-slate-700 transition-colors"
                title="Teks tebal"
              >
                <b>B</b> Tebal
              </button>

              <button
                type="button"
                onClick={() => insertTextSnippet("\n\n", "", "")}
                className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-md font-bold text-slate-700 transition-colors"
                title="Paragraf baru"
              >
                Paragraf Baru
              </button>

              {isProcessingImage && (
                <span className="text-[11px] font-bold text-amber-700 ml-auto animate-pulse">
                  ⏳ Mengompresi gambar...
                </span>
              )}
            </div>
          )}

          {/* Area Textarea atau Live Preview */}
          {activeTab === "write" ? (
            <textarea
              ref={textareaRef}
              required
              rows={16}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Tuliskan naskah berita di sini. Gunakan tombol '🖼️ Sisipkan Foto ke Naskah' di atas untuk menyisipkan foto liputan di antara paragraf tulisan Anda..."
              className="w-full p-4 rounded-2xl border border-slate-300 text-slate-900 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all font-sans"
            />
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 sm:p-8 space-y-6 min-h-[380px]">
              <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  Pratinjau Hasil Naskah Pembaca
                </span>
                <span className="text-xs text-slate-400">
                  {parseArticleBlocks(content).length} Blok Konten
                </span>
              </div>

              {/* Tampilkan Featured Image di Pratinjau jika ada */}
              {featuredImage && (
                <figure className="space-y-2">
                  <div className="aspect-16/9 rounded-2xl overflow-hidden bg-slate-900">
                    <img
                      src={featuredImage}
                      alt={title || "Foto Unggulan"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {imageCaption && (
                    <figcaption className="text-center text-xs italic text-slate-500 font-medium">
                      {imageCaption}
                    </figcaption>
                  )}
                </figure>
              )}

              {/* Render Konten Pratinjau via parseArticleBlocks */}
              {parseArticleBlocks(content).length > 0 ? (
                <div className="space-y-4 text-slate-800 leading-relaxed text-sm sm:text-base">
                  {parseArticleBlocks(content).map((block, index) => {
                    if (block.type === "image") {
                      return (
                        <figure
                          key={index}
                          className="my-4 space-y-1.5 rounded-xl border border-slate-200 bg-white p-2.5 shadow-2xs"
                        >
                          <img
                            src={block.src}
                            alt={block.alt || "Foto Liputan"}
                            className="w-full max-h-[420px] object-cover rounded-lg"
                          />
                          {block.alt && (
                            <figcaption className="text-center text-xs italic text-slate-600 pt-1">
                              📷 {block.alt}
                            </figcaption>
                          )}
                        </figure>
                      );
                    }

                    if (block.type === "h2") {
                      return (
                        <h2
                          key={index}
                          className="text-lg sm:text-xl font-black text-slate-900 font-serif pt-4 pb-1 border-b border-slate-200"
                        >
                          {block.text}
                        </h2>
                      );
                    }

                    if (block.type === "quote") {
                      return (
                        <blockquote
                          key={index}
                          className="border-l-4 border-red-700 pl-4 py-2 italic bg-red-50/50 rounded-r-xl text-slate-800 font-serif"
                        >
                          {block.text}
                        </blockquote>
                      );
                    }

                    return (
                      <p key={index} className="text-justify sm:text-left">
                        {block.text}
                      </p>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic text-center py-12">
                  Belum ada naskah yang ditulis. Silakan kembali ke tab &ldquo;✍️ Tulis&rdquo; untuk mulai menulis berita.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Kotak Pedoman Jurnalistik */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1.5">
          <span className="font-bold text-slate-900 block">
            ⚖️ Pedoman Pemberitaan Media Siber (PPMS) Dewan Pers:
          </span>
          <p className="leading-relaxed">
            Pastikan berita telah memenuhi unsur verifikasi dan konfirmasi. Jika di kemudian hari
            ditemukan kekeliruan data, perubahan naskah hanya boleh dilakukan melalui mekanisme{" "}
            <strong>Ralat Berita</strong> agar riwayat koreksi tercatat secara transparan bagi publik.
          </p>
        </div>

        {/* Tombol Aksi */}
        <div className="pt-2 flex items-center justify-end gap-3">
          <button
            type="submit"
            disabled={isLoading}
            className="px-8 py-3.5 rounded-2xl font-black text-sm text-white bg-red-700 hover:bg-red-800 disabled:opacity-50 transition-all shadow-md cursor-pointer flex items-center gap-2"
          >
            {isLoading ? (
              <span>Menerbitkan Naskah...</span>
            ) : (
              <>
                <span>Tayangkan Berita Sekarang</span>
                <span>→</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
