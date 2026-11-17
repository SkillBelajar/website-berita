"use client";

import Link from "next/link";
import { useState, useEffect, FormEvent } from "react";
import { clientFetch, Comment, formatDateTimeWIB } from "@/lib/api";
import { getAuth } from "@/lib/auth";

export default function CommentSection({ articleId }: { articleId: number }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // State Pelaporan (Report Abuse)
  const [reportingCommentId, setReportingCommentId] = useState<number | null>(null);
  const [reportReason, setReportReason] = useState("");
  const [reporting, setReporting] = useState(false);
  const [reportFeedback, setReportFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");

  const checkAuth = () => {
    const auth = getAuth();
    setIsLoggedIn(!!auth.token);
    setUserName(auth.name || "Pengguna");
  };

  const loadComments = async () => {
    try {
      setLoading(true);
      const res = await clientFetch(`/articles/${articleId}/comments`);
      if (res.ok) {
        const json = await res.json();
        if (json && Array.isArray(json.data)) {
          setComments(json.data);
        }
      }
    } catch {
      // diamkan atau abaikan jika gagal
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
    loadComments();

    const onAuthChange = () => checkAuth();
    window.addEventListener("auth-changed", onAuthChange);
    return () => window.removeEventListener("auth-changed", onAuthChange);
  }, [articleId]);

  const handleCommentSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const auth = getAuth();
    if (!auth.token) {
      setErrorMsg("Sesi login Anda telah berakhir. Silakan masuk kembali.");
      return;
    }

    if (!commentText.trim()) {
      setErrorMsg("Komentar tidak boleh kosong.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await clientFetch(`/articles/${articleId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ content: commentText.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Gagal mengirimkan komentar.");
        setSubmitting(false);
        return;
      }

      setSuccessMsg("Komentar Anda berhasil dipublikasikan.");
      setCommentText("");
      loadComments();
    } catch {
      setErrorMsg("Gagal menghubungi server komentar.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReportSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setReportFeedback(null);

    const auth = getAuth();
    if (!auth.token) {
      setReportFeedback({
        type: "error",
        text: "Anda wajib masuk (login) terlebih dahulu untuk melaporkan komentar.",
      });
      return;
    }

    if (!reportReason.trim()) {
      setReportFeedback({
        type: "error",
        text: "Mohon tuliskan alasan pelaporan komentar.",
      });
      return;
    }

    setReporting(true);

    try {
      const res = await clientFetch(`/comments/${reportingCommentId}/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ reason: reportReason.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setReportFeedback({
          type: "error",
          text: data.error || "Gagal mengirimkan laporan pengaduan.",
        });
      } else {
        setReportFeedback({
          type: "success",
          text: "Terima kasih. Laporan Anda telah masuk ke antrean moderasi redaksi untuk ditinjau.",
        });
        setTimeout(() => {
          setReportingCommentId(null);
          setReportReason("");
          setReportFeedback(null);
        }, 2200);
      }
    } catch {
      setReportFeedback({
        type: "error",
        text: "Gagal terhubung ke sistem pengaduan moderasi.",
      });
    } finally {
      setReporting(false);
    }
  };

  return (
    <section aria-label="Kolom Diskusi Komentar" className="space-y-6 pt-4">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <span>💬</span> Diskusi & Komentar Pembaca
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
            {comments.length}
          </span>
        </h2>
        <span className="text-xs text-slate-500 hidden sm:inline">
          Filter Otomatis Anti-Spam & Judi Aktif
        </span>
      </div>

      {/* Form Tambah Komentar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        {isLoggedIn ? (
          <form onSubmit={handleCommentSubmit} className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <div className="flex items-center gap-1.5 font-medium">
                <span>Berkomentar sebagai:</span>
                <strong className="text-slate-900 font-bold">{userName}</strong>
              </div>
              <Link
                href="/panduan-pengguna"
                className="text-blue-700 hover:underline text-[11px]"
              >
                Baca Pedoman Etika Berkomentar →
              </Link>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                <span>⚠️</span>
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <span>✓</span>
                <span>{successMsg}</span>
              </div>
            )}

            <div>
              <textarea
                required
                rows={3}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Tuliskan pandangan atau tanggapan Anda secara santun, berimbang, dan tidak mengandung tautan/kata terlarang..."
                className="w-full p-4 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all placeholder:text-slate-400"
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <span className="text-[11px] text-slate-400">
                Komentar diawasi filter moderasi otomatis Dewan Pers (PPMS butir 6).
              </span>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-50 transition-all shadow-xs cursor-pointer flex items-center gap-2"
              >
                {submitting ? "Memeriksa & Mengirim..." : "Kirim Tanggapan"}
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center py-6 space-y-3">
            <span className="text-3xl">🔒</span>
            <h3 className="text-base font-bold text-slate-900">
              Ingin ikut berdiskusi pada artikel ini?
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              Sesuai Pedoman Media Siber untuk mencegah anonimitas spam dan ujaran kebencian, Anda wajib memiliki akun terdaftar sebelum memberikan komentar.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <Link
                href="/login"
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 transition-colors shadow-xs"
              >
                Masuk / Login
              </Link>
              <Link
                href="/register"
                className="px-5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Daftar Akun Baru
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Daftar Komentar */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8 text-xs text-slate-400">
            Memuat daftar tanggapan pembaca...
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-xs text-slate-500 space-y-1">
            <p className="font-semibold">Belum ada komentar untuk artikel ini.</p>
            <p>Jadilah orang pertama yang memberikan opini berbobot!</p>
          </div>
        ) : (
          comments.map((comm) => (
            <div
              key={comm.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-3 shadow-2xs hover:border-slate-300 transition-all"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-300 text-slate-700 text-xs font-black flex items-center justify-center">
                    {comm.user?.name ? comm.user.name[0].toUpperCase() : "U"}
                  </div>
                  <div>
                    <span className="font-bold text-sm text-slate-900 block leading-tight">
                      {comm.user?.name || "Pengguna Terverifikasi"}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {formatDateTimeWIB(comm.created_at)}
                    </span>
                  </div>
                </div>

                {/* Tombol Laporkan Komentar (Report Abuse) */}
                <button
                  onClick={() => {
                    setReportingCommentId(comm.id);
                    setReportFeedback(null);
                    setReportReason("");
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                  title="Laporkan komentar ini jika melanggar ketentuan"
                >
                  <span>🚩</span>
                  <span className="hidden sm:inline">Laporkan</span>
                </button>
              </div>

              <p className="text-slate-800 text-sm leading-relaxed whitespace-pre-line">
                {comm.content}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Modal Dialog Pelaporan Komentar (Report Abuse) */}
      {reportingCommentId !== null && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🚩</span>
                <h3 className="font-black text-slate-900 text-base">
                  Laporkan Komentar #{reportingCommentId}
                </h3>
              </div>
              <button
                onClick={() => setReportingCommentId(null)}
                className="text-slate-400 hover:text-slate-700 text-lg leading-none cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Dewan Redaksi menjaga ruang diskusi yang bersih dan bebas dari pelanggaran hukum sesuai PPMS butir 6. Mohon berikan alasan pelaporan Anda:
            </p>

            {reportFeedback && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold ${
                  reportFeedback.type === "success"
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-rose-50 text-rose-800 border border-rose-200"
                }`}
              >
                {reportFeedback.text}
              </div>
            )}

            <form onSubmit={handleReportSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Alasan Pengaduan
                </label>
                <textarea
                  required
                  rows={3}
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder="Contoh: Mengandung promosi judi terselubung, fitnah, spam, atau ujaran kebencian..."
                  className="w-full p-3 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent placeholder:text-slate-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReportingCommentId(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 border border-slate-300 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={reporting}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {reporting ? "Mengirim Laporan..." : "Kirim Laporan Redaksi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
