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
    // Muat initial state
    setAuth(getAuth());

    const updateAuth = () => {
      setAuth(getAuth());
    };

    window.addEventListener("auth-changed", updateAuth);
    return () => window.removeEventListener("auth-changed", updateAuth);
  }, []);

  const handleLogout = () => {
    clearAuth();
  };

  return (
    <header className="border-b border-neutral-200 bg-white sticky top-0 z-50 shadow-xs">
      {/* Top Banner PPMS Compliance */}
      <div className="bg-neutral-900 text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="font-medium">Portal Berita Kepatuhan PPMS Dewan Pers</span>
          </div>
          <div className="flex items-center gap-4 text-neutral-300 text-[11px]">
            <span>Terverifikasi Digital</span>
            <span>•</span>
            <Link href="/panduan-pengguna" className="hover:text-white underline underline-offset-2">
              Panduan Pembaca & PPMS
            </Link>
            <span>•</span>
            <Link href="/tentang-kami" className="hover:text-white underline underline-offset-2">
              Struktur Redaksi
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex flex-col">
              <span className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-900 uppercase">
                RADAR <span className="text-blue-700">BERITA</span>
              </span>
              <span className="text-[10px] tracking-widest uppercase font-semibold text-neutral-500">
                Media Siber Terpercaya & Berimbang
              </span>
            </Link>
          </div>

          {/* Navigation Links Desktop */}
          <nav className="hidden md:flex items-center gap-7">
            <Link
              href="/"
              className="text-sm font-semibold text-neutral-800 hover:text-blue-700 transition-colors"
            >
              Beranda
            </Link>
            <Link
              href="/#kategori"
              className="text-sm font-semibold text-neutral-600 hover:text-blue-700 transition-colors"
            >
              Kategori
            </Link>
            <Link
              href="/tentang-kami"
              className="text-sm font-semibold text-neutral-600 hover:text-blue-700 transition-colors"
            >
              Tentang Kami & Redaksi
            </Link>
            <Link
              href="/panduan-pengguna"
              className="text-sm font-semibold text-neutral-600 hover:text-blue-700 transition-colors"
            >
              Panduan Pengguna
            </Link>
          </nav>

          {/* User Auth Buttons Desktop */}
          <div className="hidden md:flex items-center gap-3">
            {auth.token ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full">
                  <span className="w-6 h-6 rounded-full bg-blue-700 text-white text-[11px] font-bold flex items-center justify-center">
                    {auth.name ? auth.name[0].toUpperCase() : "U"}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-900 leading-tight">
                      {auth.name}
                    </span>
                    <span className="text-[10px] text-blue-700 capitalize font-medium">
                      {auth.role || "User"}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors cursor-pointer"
                >
                  Keluar
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-semibold text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-md transition-colors shadow-xs"
                >
                  Daftar
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              type="button"
              className="p-2 rounded-md text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 focus:outline-hidden cursor-pointer"
              aria-label="Toggle menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-neutral-200 py-3 space-y-2">
            <Link
              href="/"
              onClick={() => setIsMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-neutral-800 hover:bg-neutral-100"
            >
              Beranda
            </Link>
            <Link
              href="/#kategori"
              onClick={() => setIsMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:bg-neutral-100"
            >
              Kategori
            </Link>
            <Link
              href="/tentang-kami"
              onClick={() => setIsMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:bg-neutral-100"
            >
              Tentang Kami & Redaksi
            </Link>
            <Link
              href="/panduan-pengguna"
              onClick={() => setIsMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:bg-neutral-100"
            >
              Panduan Pengguna
            </Link>

            <div className="pt-2 border-t border-neutral-200">
              {auth.token ? (
                <div className="px-3 py-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-blue-700 text-white text-xs font-bold flex items-center justify-center">
                      {auth.name ? auth.name[0].toUpperCase() : "U"}
                    </span>
                    <span className="text-sm font-bold text-slate-800">
                      {auth.name} ({auth.role})
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-center py-2 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-md cursor-pointer"
                  >
                    Keluar dari Akun
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Link
                    href="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-1/2 text-center py-2 text-sm font-semibold border border-neutral-300 rounded-md"
                  >
                    Masuk
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-1/2 text-center py-2 text-sm font-semibold text-white bg-blue-700 rounded-md"
                  >
                    Daftar
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
