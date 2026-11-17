"use client";

import Link from "next/link";
import { useState, FormEvent } from "react";
import { clientFetch } from "@/lib/api";
import { saveAuth } from "@/lib/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const executeLogin = async () => {
    // Ambil value dari state atau DOM langsung untuk mendukung password manager & autofill
    const inputEmail =
      email.trim() ||
      (typeof document !== "undefined"
        ? (document.querySelector('input[type="email"]') as HTMLInputElement)?.value?.trim()
        : "") ||
      "";
    const inputPass =
      password ||
      (typeof document !== "undefined"
        ? (document.querySelector('input[type="password"]') as HTMLInputElement)?.value
        : "") ||
      "";

    if (!inputEmail || !inputPass) {
      setErrorMsg("Mohon masukkan email dan kata sandi.");
      return;
    }

    setErrorMsg("");
    setSuccessMsg("");
    setIsLoading(true);

    try {
      const res = await clientFetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inputEmail, password: inputPass }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Email atau kata sandi tidak sesuai.");
        setIsLoading(false);
        return;
      }

      // Ambil nama dari /auth/me jika ada, atau gunakan default
      let userName = "Pembaca";
      try {
        const meRes = await clientFetch("/auth/me", {
          headers: { Authorization: `Bearer ${data.token}` },
        });
        if (meRes.ok) {
          const meData = await meRes.json();
          if (meData.name) userName = meData.name;
        }
      } catch {
        // abaikan jika me gagal, nama fallback dipakai
      }

      // Tentukan tujuan redirect berdasarkan role pengguna
      const redirectTarget =
        data.role === "superadmin" || data.role === "editor"
          ? "/admin"
          : data.role === "journalist"
          ? "/tulis-berita"
          : "/";

      const targetLabel =
        redirectTarget === "/admin"
          ? "Panel Redaksi & Administrator"
          : redirectTarget === "/tulis-berita"
          ? "Ruang Tulis Berita"
          : "Beranda";

      saveAuth(data.token, data.role, userName, inputEmail);
      setSuccessMsg(`Login berhasil! Selamat datang, ${userName}. Mengalihkan ke ${targetLabel}...`);

      setTimeout(() => {
        window.location.href = redirectTarget;
      }, 500);
    } catch {
      setErrorMsg("Gagal terhubung ke server autentikasi. Silakan periksa koneksi Anda.");
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    executeLogin();
  };

  return (
    <div className="max-w-md mx-auto my-8 bg-white rounded-3xl border border-slate-200/90 shadow-sm p-8 sm:p-10 space-y-6">
      <div className="text-center space-y-2">
        <span className="inline-block px-3 py-1 bg-red-50 text-red-700 text-xs font-bold rounded-full uppercase tracking-wider">
          Autentikasi Pembaca & Redaksi
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
          Masuk ke Akun Anda
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Masuk untuk berpartisipasi dalam redaksi, moderasi, komentar, atau pengaduan pers.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2.5 animate-pulse">
          <span className="text-base">✅</span>
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
          <span>⚠️</span>
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} action="#" className="space-y-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Alamat Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nama@email.com"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Kata Sandi
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !!successMsg}
          className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-red-700 hover:bg-red-800 disabled:opacity-50 transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <span>Memverifikasi...</span>
          ) : successMsg ? (
            <span>Berhasil Masuk ✓</span>
          ) : (
            <>
              <span>Masuk Sekarang</span>
              <span>→</span>
            </>
          )}
        </button>
      </form>

      <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
        Belum memiliki akun?{" "}
        <Link href="/register" className="font-bold text-red-700 hover:underline">
          Daftar Akun Baru
        </Link>
      </div>
    </div>
  );
}
