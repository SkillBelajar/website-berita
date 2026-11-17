"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { getAuth, clearAuth, AuthState } from "@/lib/auth";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [auth, setAuth] = useState<AuthState>({
    token: null,
    role: null,
    name: null,
    email: null,
  });

  useEffect(() => {
    setAuth(getAuth());
    const updateAuth = () => setAuth(getAuth());
    window.addEventListener("auth-changed", updateAuth);
    return () => window.removeEventListener("auth-changed", updateAuth);
  }, []);

  const handleLogout = () => {
    clearAuth();
  };

  return (
    <header className="bg-white border-b-2 border-red-700 sticky top-0 z-50 shadow-sm">
      {/* 1. TOP UTILITY BAR (Edisi & Kepatuhan Pers) */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          {/* Tanggal & Edisi */}
          <div className="flex items-center gap-3 text-[11px]">
            <span className="font-semibold text-white">
              Selasa, 17 November 2026
            </span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-300">Edisi Digital Nasional</span>
            <span className="text-slate-500">|</span>
            <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Terverifikasi Dewan Pers (PPMS)</span>
            </div>
          </div>

          {/* Akses Cepat Kepatuhan */}
          <div className="hidden sm:flex items-center gap-3 text-[11px] text-slate-300">
            <Link
              href="/tentang-kami#hak-jawab"
              className="text-amber-300 hover:text-white font-medium transition-colors"
            >
              ⚖️ Saluran Hak Jawab
            </Link>
            <span className="text-slate-600">•</span>
            <Link
              href="/tentang-kami"
              className="hover:text-white transition-colors"
            >
              Box Redaksi
            </Link>
            <span className="text-slate-600">•</span>
            <Link
              href="/panduan-pengguna"
              className="hover:text-white transition-colors"
            >
              Panduan Pembaca
            </Link>
          </div>
        </div>
      </div>

      {/* 2. BREAKING NEWS TICKER */}
      <div className="bg-slate-100 border-b border-slate-200 py-1.5 px-4 text-xs">
        <div className="max-w-7xl mx-auto flex items-center gap-3 overflow-hidden">
          <span className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm bg-red-700 text-white font-black text-[10px] uppercase tracking-wider shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
            TERKINI
          </span>
          <div className="truncate text-slate-800 font-medium">
            <Link
              href="/article/peresmian-jembatan-baru-ketapang"
              className="hover:text-red-700 hover:underline transition-colors"
            >
              Peresmian Jembatan Baru Ketapang Dihadiri Tokoh Daerah dan Dorong Akselerasi Logistik
            </Link>
            <span className="mx-2 text-slate-400">•</span>
            <Link
              href="/article/inovasi-layanan-keuangan-digital-ekonomi-lokal"
              className="hover:text-red-700 hover:underline transition-colors text-slate-600"
            >
              [Advertorial] Inovasi Layanan Keuangan Digital Dorong Pertumbuhan Ekonomi Lokal
            </Link>
          </div>
        </div>
      </div>

      {/* 3. MAIN NEWSPAPER MASTHEAD */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex items-center justify-between gap-4">
          {/* Brand Logo Surat Kabar */}
          <div className="flex flex-col">
            <Link href="/" className="group flex items-baseline gap-1">
              <span className="text-3xl sm:text-5xl font-black tracking-tight text-slate-950 uppercase font-serif">
                RADAR
              </span>
              <span className="text-3xl sm:text-5xl font-black tracking-tight text-red-600 uppercase font-serif">
                BERITA
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block mb-1"></span>
            </Link>
            <span className="text-[10px] sm:text-xs font-bold tracking-widest uppercase text-slate-500 mt-0.5">
              Harian Siber Independen • Standar Kepatuhan PPMS Dewan Pers
            </span>
          </div>

          {/* User Auth Section Desktop */}
          <div className="hidden md:flex items-center gap-3">
            {auth.token ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 px-3.5 py-1.5 rounded-full shadow-2xs">
                  <div className="w-7 h-7 rounded-full bg-red-700 text-white text-xs font-bold flex items-center justify-center">
                    {auth.name ? auth.name[0].toUpperCase() : "U"}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-slate-900 leading-tight">
                      {auth.name}
                    </span>
                    <span className="text-[10px] text-red-700 font-semibold uppercase">
                      {auth.role || "Pembaca"}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-red-700 hover:bg-red-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  Keluar
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-red-700 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                >
                  Masuk Akun
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-xs font-bold text-white bg-red-700 hover:bg-red-800 rounded-lg transition-colors shadow-xs"
                >
                  Daftar
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              type="button"
              className="p-2 rounded-md text-slate-800 hover:bg-slate-100 focus:outline-none cursor-pointer"
              aria-label="Menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* 4. PRIMARY CATEGORY NAVIGATION RIBBON */}
      <div className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="hidden md:flex items-center justify-between text-xs font-bold uppercase tracking-wider">
            <div className="flex items-center">
              <Link
                href="/"
                className="py-3 px-4 bg-red-700 text-white hover:bg-red-800 transition-colors flex items-center gap-1.5"
              >
                <span>🏠</span> BERANDA
              </Link>
              <Link
                href="/#kategori"
                className="py-3 px-4 text-slate-200 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Nasional
              </Link>
              <Link
                href="/#kategori"
                className="py-3 px-4 text-slate-200 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Daerah
              </Link>
              <Link
                href="/#kategori"
                className="py-3 px-4 text-slate-200 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Ekonomi & Bisnis
              </Link>
              <Link
                href="/#kategori"
                className="py-3 px-4 text-slate-200 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Teknologi
              </Link>
              <Link
                href="/#kategori"
                className="py-3 px-4 text-amber-300 hover:text-amber-200 hover:bg-slate-800 transition-colors flex items-center gap-1"
              >
                <span>📢</span> Advertorial
              </Link>
              <Link
                href="/tentang-kami"
                className="py-3 px-4 text-slate-200 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Struktur Redaksi
              </Link>
              <Link
                href="/panduan-pengguna"
                className="py-3 px-4 text-slate-200 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Panduan Pengguna
              </Link>
            </div>

            <div className="flex items-center gap-2 text-slate-400 text-[11px] font-normal normal-case">
              <span>Transparansi Pers PPMS</span>
            </div>
          </nav>
        </div>

        {/* Mobile menu dropdown */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-slate-800 bg-slate-900 py-3 px-4 space-y-2 text-sm font-semibold">
            <Link
              href="/"
              onClick={() => setIsMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-white bg-red-700"
            >
              Beranda
            </Link>
            <Link
              href="/#kategori"
              onClick={() => setIsMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-slate-200 hover:bg-slate-800"
            >
              Nasional & Daerah
            </Link>
            <Link
              href="/#kategori"
              onClick={() => setIsMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-slate-200 hover:bg-slate-800"
            >
              Ekonomi & Bisnis
            </Link>
            <Link
              href="/tentang-kami"
              onClick={() => setIsMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-slate-200 hover:bg-slate-800"
            >
              Tentang Kami & Redaksi
            </Link>
            <Link
              href="/panduan-pengguna"
              onClick={() => setIsMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-slate-200 hover:bg-slate-800"
            >
              Panduan Pengguna & PPMS
            </Link>

            <div className="pt-3 border-t border-slate-800">
              {auth.token ? (
                <div className="space-y-2">
                  <div className="text-xs text-slate-300">
                    Masuk sebagai: <strong className="text-white">{auth.name}</strong> ({auth.role})
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full py-2 text-xs font-bold text-white bg-red-700 rounded-md"
                  >
                    Keluar Akun
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Link
                    href="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-1/2 text-center py-2 text-xs font-bold text-slate-900 bg-white rounded-md"
                  >
                    Masuk
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-1/2 text-center py-2 text-xs font-bold text-white bg-red-700 rounded-md"
                  >
                    Daftar
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 5. TRENDING TOPICS PILLS */}
      <div className="bg-slate-50 border-b border-slate-200 py-2 px-4 text-xs hidden sm:block">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px] shrink-0">
            Topik Hangat:
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {[
              { tag: "#JembatanKetapang", href: "/article/peresmian-jembatan-baru-ketapang" },
              { tag: "#KeuanganDigital", href: "/article/inovasi-layanan-keuangan-digital-ekonomi-lokal" },
              { tag: "#KepatuhanPPMS", href: "/panduan-pengguna" },
              { tag: "#DewanPers", href: "/tentang-kami" },
              { tag: "#HakJawabPublik", href: "/tentang-kami#hak-jawab" },
            ].map((topic) => (
              <Link
                key={topic.tag}
                href={topic.href}
                className="px-2.5 py-0.5 rounded-full bg-white border border-slate-300 text-slate-700 hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-colors font-medium text-[11px]"
              >
                {topic.tag}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
