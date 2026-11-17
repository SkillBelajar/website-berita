"use client";

import Link from "next/link";
import { useState, FormEvent } from "react";
import { clientFetch } from "@/lib/api";
import { saveAuth } from "@/lib/auth";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const executeRegister = async () => {
    setErrorMsg("");
    setSuccessMsg("");

    if (!name || !email || !password) {
      setErrorMsg("Mohon lengkapi seluruh formulir pendaftaran.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Kata sandi minimal harus 6 karakter.");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Registrasi
      const regRes = await clientFetch("/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role: "user" }),
      });

      const regData = await regRes.json();

      if (!regRes.ok) {
        setErrorMsg(regData.error || "Gagal melakukan registrasi.");
        setIsLoading(false);
        return;
      }

      // 2. Otomatis login
      const loginRes = await clientFetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (loginRes.ok) {
        const loginData = await loginRes.json();
        saveAuth(loginData.token, loginData.role, name, email);
        setSuccessMsg(`Pendaftaran berhasil! Selamat datang, ${name}. Mengalihkan...`);
        setTimeout(() => {
          window.location.href = "/";
        }, 700);
      } else {
        setSuccessMsg("Pendaftaran berhasil! Mengalihkan ke halaman login...");
        setTimeout(() => {
          window.location.href = "/login";
        }, 700);
      }
    } catch {
      setErrorMsg("Gagal terhubung ke server pendaftaran. Silakan coba lagi.");
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    executeRegister();
  };

  return (
    <div className="max-w-md mx-auto my-8 bg-white rounded-3xl border border-slate-200/90 shadow-sm p-8 sm:p-10 space-y-6">
      <div className="text-center space-y-2">
        <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full uppercase tracking-wider">
          Pendaftaran Pengguna
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
          Buat Akun Pembaca
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Bergabung untuk memberikan komentar dan berdiskusi secara sehat sesuai etika pers.
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
            Nama Lengkap
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama Anda"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all"
          />
        </div>

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
            placeholder="Minimal 6 karakter"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Konfirmasi Kata Sandi
          </label>
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Ulangi kata sandi"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all"
          />
        </div>

        <button
          type="button"
          onClick={executeRegister}
          disabled={isLoading || !!successMsg}
          className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-red-700 hover:bg-red-800 disabled:opacity-50 transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <span>Mendaftarkan...</span>
          ) : successMsg ? (
            <span>Berhasil Mendaftar ✓</span>
          ) : (
            <>
              <span>Daftar Akun</span>
              <span>→</span>
            </>
          )}
        </button>
      </form>

      <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
        Sudah memiliki akun?{" "}
        <Link href="/login" className="font-bold text-red-700 hover:underline">
          Masuk di Sini
        </Link>
      </div>
    </div>
  );
}
