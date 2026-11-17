"use client";

import Link from "next/link";
import { useState, useEffect, FormEvent } from "react";
import { clientFetch } from "@/lib/api";
import { getAuth, AuthState } from "@/lib/auth";

export default function TulisBeritaPage() {
  const [auth, setAuth] = useState<AuthState>({
    token: null,
    role: null,
    name: null,
    email: null,
  });
  const [isLoaded, setIsLoaded] = useState(false);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [isAdvertorial, setIsAdvertorial] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [publishedSlug, setPublishedSlug] = useState<string | null>(null);

  useEffect(() => {
    setAuth(getAuth());
    setIsLoaded(true);
  }, []);

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
      setIsAdvertorial(false);
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

        {/* Isi Naskah Berita */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
              Isi Naskah Berita <span className="text-red-600">*</span>
            </label>
            <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
              <span>{wordCount} kata</span>
              <span>•</span>
              <span>± {readTimeEst} menit baca</span>
            </div>
          </div>
          <textarea
            required
            rows={14}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Tuliskan naskah berita lengkap di sini (gunakan paragraf teratur). Hindari disinformasi dan periksa konfirmasi dari pihak terkait..."
            className="w-full p-4 rounded-2xl border border-slate-300 text-slate-900 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all font-sans"
          />
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
