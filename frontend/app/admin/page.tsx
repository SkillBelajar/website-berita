"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { clientFetch } from "@/lib/api";
import { getAuth, AuthState } from "@/lib/auth";

interface CommentReportItem {
  id: number;
  comment_id: number;
  reporter_id: number;
  reporter?: { name: string; email: string };
  comment?: { id: number; content: string; user?: { name: string } };
  reason: string;
  status: string;
  created_at: string;
}

interface HakJawabItem {
  id: number;
  article_id: number;
  article?: { id: number; title: string; slug: string };
  submitter_name: string;
  submitter_email: string;
  content: string;
  status: string;
  created_at: string;
}

interface ArticleItem {
  id: number;
  title: string;
  slug: string;
  is_advertorial: boolean;
  created_at: string;
}

export default function AdminDashboardPage() {
  const [auth, setAuth] = useState<AuthState>({
    token: null,
    role: null,
    name: null,
    email: null,
  });
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<"moderasi" | "hak-jawab" | "ralat" | "redaksi">("moderasi");

  // Data states
  const [reports, setReports] = useState<CommentReportItem[]>([]);
  const [hakJawabList, setHakJawabList] = useState<HakJawabItem[]>([]);
  const [articles, setArticles] = useState<ArticleItem[]>([]);

  // State Box Redaksi Form
  const [pemred, setPemred] = useState("");
  const [tim, setTim] = useState("");
  const [alamat, setAlamat] = useState("");
  const [emailRedaksi, setEmailRedaksi] = useState("");
  const [telepon, setTelepon] = useState("");

  // State Ralat Berita Form
  const [selectedArticleId, setSelectedArticleId] = useState<number | "">("");
  const [correctionReason, setCorrectionReason] = useState("");
  const [correctedContent, setCorrectedContent] = useState("");

  // Feedback states
  const [msgNotice, setMsgNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    const currentAuth = getAuth();
    setAuth(currentAuth);
    setIsLoaded(true);

    if (currentAuth.token && (currentAuth.role === "superadmin" || currentAuth.role === "editor")) {
      loadAllDashboardData(currentAuth.token);
    }
  }, []);

  const loadAllDashboardData = async (token: string) => {
    try {
      // 1. Ambil Antrean Moderasi Komentar
      const modRes = await clientFetch("/admin/moderation/comments", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (modRes.ok) {
        const modJson = await modRes.json();
        setReports(modJson.data || []);
      }

      // 2. Ambil Antrean Hak Jawab
      const hjRes = await clientFetch("/admin/complaints/hak-jawab", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (hjRes.ok) {
        const hjJson = await hjRes.json();
        setHakJawabList(hjJson.data || []);
      }

      // 3. Ambil Daftar Artikel untuk Ralat
      const artRes = await clientFetch("/articles");
      if (artRes.ok) {
        const artJson = await artRes.json();
        setArticles(artJson.data || []);
      }

      // 4. Ambil Setting Redaksi
      const redRes = await clientFetch("/settings/redaksi");
      if (redRes.ok) {
        const redJson = await redRes.json();
        if (redJson.data) {
          setPemred(redJson.data.editor_in_chief || "");
          setTim(redJson.data.team || "");
          setAlamat(redJson.data.office_address || "");
          setEmailRedaksi(redJson.data.email || "");
          setTelepon(redJson.data.phone || "");
        }
      }
    } catch {
      // tangani error secara silent
    }
  };

  // Aksi Moderasi Komentar
  const handleModerate = async (commentId: number, action: "delete" | "ignore") => {
    if (!auth.token) return;
    setIsActionLoading(true);
    setMsgNotice(null);

    try {
      const res = await clientFetch(`/admin/moderation/comments/${commentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ action }),
      });

      if (res.ok) {
        setMsgNotice({
          type: "success",
          text: action === "delete" ? "Komentar berhasil dihapus / ditolak." : "Laporan diabaikan, komentar tetap tayang.",
        });
        // Refresh laporan
        loadAllDashboardData(auth.token);
      } else {
        const data = await res.json();
        setMsgNotice({ type: "error", text: data.error || "Gagal melakukan aksi moderasi." });
      }
    } catch {
      setMsgNotice({ type: "error", text: "Terjadi gangguan saat memproses moderasi." });
    } finally {
      setIsActionLoading(false);
    }
  };

  // Simpan Box Redaksi
  const handleSaveRedaksi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.token) return;
    setIsActionLoading(true);
    setMsgNotice(null);

    try {
      const res = await clientFetch("/admin/settings/redaksi", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({
          editor_in_chief: pemred,
          team: tim,
          office_address: alamat,
          email: emailRedaksi,
          phone: telepon,
        }),
      });

      if (res.ok) {
        setMsgNotice({ type: "success", text: "Struktur Box Redaksi berhasil diperbarui & sinkron ke footer!" });
      } else {
        const data = await res.json();
        setMsgNotice({ type: "error", text: data.error || "Gagal memperbarui data redaksi." });
      }
    } catch {
      setMsgNotice({ type: "error", text: "Gagal terhubung ke server API." });
    } finally {
      setIsActionLoading(false);
    }
  };

  // Terbitkan Ralat Berita
  const handlePublishCorrection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.token || !selectedArticleId) {
      setMsgNotice({ type: "error", text: "Pilih artikel yang akan diralat terlebih dahulu." });
      return;
    }

    setIsActionLoading(true);
    setMsgNotice(null);

    try {
      const res = await clientFetch(`/admin/articles/${selectedArticleId}/correction`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({
          correction_reason: correctionReason.trim(),
          content: correctedContent.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMsgNotice({
          type: "success",
          text: `Ralat resmi berhasil diterbitkan! Log koreksi permanen telah tersemat pada artikel.`,
        });
        setCorrectionReason("");
        setCorrectedContent("");
        setSelectedArticleId("");
        loadAllDashboardData(auth.token);
      } else {
        setMsgNotice({ type: "error", text: data.error || "Gagal menerbitkan ralat." });
      }
    } catch {
      setMsgNotice({ type: "error", text: "Gagal menerbitkan ralat berita." });
    } finally {
      setIsActionLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="max-w-7xl mx-auto py-16 text-center text-slate-500">
        <p>Memuat Panel Kendali Redaksi...</p>
      </div>
    );
  }

  const isAuthorized = auth.token && (auth.role === "superadmin" || auth.role === "editor");

  if (!isAuthorized) {
    return (
      <div className="max-w-2xl mx-auto my-12 bg-white rounded-3xl border border-slate-200/90 shadow-sm p-8 sm:p-10 text-center space-y-6">
        <div className="w-16 h-16 bg-red-50 text-red-700 text-3xl font-black rounded-2xl flex items-center justify-center mx-auto border border-red-200">
          🛡️
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-slate-950">Akses Khusus Editor & Superadmin</h1>
          <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
            Halaman ini merupakan Pusat Kendali Redaksi (Admin Panel) untuk penanganan ralat berita,
            moderasi komentar pengguna, dan tindak lanjut aduan pers sesuai mandat Dewan Pers.
          </p>
        </div>
        <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
          <Link
            href="/login"
            className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-red-700 hover:bg-red-800 transition-colors shadow-xs"
          >
            Masuk sebagai Administrator
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

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* 1. Header Banner Panel */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase bg-red-600 text-white tracking-wider">
              Pusat Kendali Redaksi & Kepatuhan
            </span>
            <span className="text-xs text-slate-400">
              Masuk sebagai: <strong className="text-white">{auth.name}</strong> ({auth.role})
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Panel Administrator & Dewan Redaksi
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Pengelolaan kepatuhan UU Pers No. 40/1999, moderasi komentar UGC, ralat resmi, dan susunan redaksi.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/tulis-berita"
            className="px-4 py-2.5 rounded-xl text-xs font-black text-white bg-red-700 hover:bg-red-800 transition-colors shadow-xs flex items-center gap-1.5"
          >
            <span>✍️</span> Tulis Berita
          </Link>
          <Link
            href="/"
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            Lihat Beranda ↗
          </Link>
        </div>
      </div>

      {/* 2. Statistik Cepat */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            📰 Total Berita
          </span>
          <span className="text-2xl font-black text-slate-900">{articles.length}</span>
          <span className="text-[11px] text-slate-400 block">Naskah aktif tayang</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            🚩 Laporan Komentar
          </span>
          <span className="text-2xl font-black text-rose-600">{reports.length}</span>
          <span className="text-[11px] text-slate-400 block">Menunggu tindakan</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            ⚖️ Tiket Hak Jawab
          </span>
          <span className="text-2xl font-black text-amber-600">{hakJawabList.length}</span>
          <span className="text-[11px] text-slate-400 block">Aduan masuk publik</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            📜 Standar Dewan Pers
          </span>
          <span className="text-2xl font-black text-emerald-600">PPMS</span>
          <span className="text-[11px] text-slate-400 block">Kepatuhan UU Pers</span>
        </div>
      </div>

      {/* 3. Feedback Notifikasi */}
      {msgNotice && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2.5 ${
            msgNotice.type === "success"
              ? "bg-emerald-50 border border-emerald-300 text-emerald-800"
              : "bg-rose-50 border border-rose-300 text-rose-800"
          }`}
        >
          <span className="text-base">{msgNotice.type === "success" ? "✅" : "⚠️"}</span>
          <span>{msgNotice.text}</span>
        </div>
      )}

      {/* 4. Tab Navigasi Admin */}
      <div className="flex flex-wrap items-center gap-2 border-b-2 border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("moderasi")}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "moderasi"
              ? "bg-red-700 text-white shadow-xs"
              : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <span>🚩 Moderasi Komentar</span>
          {reports.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white text-red-700 font-black">
              {reports.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("hak-jawab")}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "hak-jawab"
              ? "bg-red-700 text-white shadow-xs"
              : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <span>⚖️ Antrean Hak Jawab</span>
          {hakJawabList.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-400 text-slate-950 font-black">
              {hakJawabList.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("ralat")}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "ralat"
              ? "bg-red-700 text-white shadow-xs"
              : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <span>📝 Meja Ralat Berita (PPMS)</span>
        </button>

        <button
          onClick={() => setActiveTab("redaksi")}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "redaksi"
              ? "bg-red-700 text-white shadow-xs"
              : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <span>🏛️ Kelola Box Redaksi</span>
        </button>
      </div>

      {/* 5. Konten Tab */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm">
        {/* TAB 1: MODERASI KOMENTAR */}
        {activeTab === "moderasi" && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl font-black text-slate-950">Antrean Moderasi Komentar (UGC)</h2>
              <p className="text-xs text-slate-500">
                Komentar yang dilaporkan oleh pembaca karena dugaan pelanggaran hukum, spam, atau SARA.
              </p>
            </div>

            {reports.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <span className="text-3xl block">🎉</span>
                <p className="text-sm font-bold text-slate-800">Tidak ada komentar yang dilaporkan.</p>
                <p className="text-xs text-slate-400">Seluruh diskusi komunitas saat ini dalam keadaan bersih.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reports.map((r) => (
                  <div
                    key={r.id}
                    className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-3 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 max-w-2xl">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-bold uppercase text-[10px]">
                          Laporan #{r.id}
                        </span>
                        <span className="text-slate-500">
                          Pelapor: <strong>{r.reporter?.name || "Anonim"}</strong>
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-400 text-[11px] font-mono">
                          {new Date(r.created_at).toLocaleDateString("id-ID")}
                        </span>
                      </div>
                      <div className="text-xs text-rose-700 font-semibold">
                        Alasan Pelaporan: &quot;{r.reason}&quot;
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 italic">
                        &quot;{r.comment?.content || "(Komentar tidak ditemukan)"}&quot;
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleModerate(r.comment_id, "delete")}
                        disabled={isActionLoading}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-2xs cursor-pointer"
                      >
                        🗑️ Hapus Komentar
                      </button>
                      <button
                        onClick={() => handleModerate(r.comment_id, "ignore")}
                        disabled={isActionLoading}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-200 hover:bg-slate-300 transition-colors cursor-pointer"
                      >
                        Abaikan Laporan
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ANTREAN HAK JAWAB */}
        {activeTab === "hak-jawab" && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl font-black text-slate-950">Antrean Permohonan Hak Jawab & Koreksi</h2>
              <p className="text-xs text-slate-500">
                Aduan dan hak koreksi resmi dari narasumber atau masyarakat sesuai Pasal 12 UU Pers No. 40/1999.
              </p>
            </div>

            {hakJawabList.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <span className="text-3xl block">⚖️</span>
                <p className="text-sm font-bold text-slate-800">Belum ada aduan hak jawab yang masuk.</p>
                <p className="text-xs text-slate-400">Semua berita berjalan sesuai verifikasi dan konfirmasi redaksi.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {hakJawabList.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs border-b border-slate-200 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-900 font-black uppercase text-[10px]">
                          Tiket #{item.id}
                        </span>
                        <span className="font-bold text-slate-900">{item.submitter_name}</span>
                        <span className="text-slate-500">({item.submitter_email})</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700 uppercase">
                        Status: {item.status}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                        Artikel Terkait:
                      </span>
                      {item.article ? (
                        <Link
                          href={`/article/${item.article.slug}`}
                          className="text-xs font-bold text-red-700 hover:underline block"
                        >
                          {item.article.title} ↗
                        </Link>
                      ) : (
                        <span className="text-xs text-slate-500">Artikel ID #{item.article_id}</span>
                      )}
                    </div>

                    <div className="p-3.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed">
                      <strong className="block text-slate-900 mb-1">Isi Permohonan Klarifikasi:</strong>
                      {item.content}
                    </div>

                    <div className="pt-1 flex items-center justify-between text-xs text-slate-500">
                      <span>Diterima: {new Date(item.created_at).toLocaleString("id-ID")} WIB</span>
                      <button
                        onClick={() => {
                          setActiveTab("ralat");
                          setSelectedArticleId(item.article_id);
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-red-700 hover:bg-red-800 transition-colors"
                      >
                        Buka Meja Ralat untuk Berita Ini →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: MEJA RALAT BERITA (PPMS) */}
        {activeTab === "ralat" && (
          <form onSubmit={handlePublishCorrection} className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl font-black text-slate-950">Meja Ralat Berita Resmi (PPMS)</h2>
              <p className="text-xs text-slate-500">
                Pembaruan isi artikel pasca tayang wajib menyertakan alasan ralat. Log koreksi akan tersemat permanen pada artikel.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
                Pilih Berita yang Ingin Dirawat / Dirawat <span className="text-red-600">*</span>
              </label>
              <select
                required
                value={selectedArticleId}
                onChange={(e) => setSelectedArticleId(Number(e.target.value) || "")}
                className="w-full px-4 py-3 rounded-2xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 bg-white"
              >
                <option value="">-- Pilih Artikel Tayang --</option>
                {articles.map((a) => (
                  <option key={a.id} value={a.id}>
                    #{a.id} - {a.title} {a.is_advertorial ? "(Advertorial)" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
                Alasan Ralat Berita (Wajib Kepatuhan PPMS) <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                value={correctionReason}
                onChange={(e) => setCorrectionReason(e.target.value)}
                placeholder="Contoh: Ralat waktu peresmian dari semula 09.00 WIB menjadi 10.00 WIB sesuai rilis Pemda."
                className="w-full px-4 py-3 rounded-2xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
              />
              <span className="text-[11px] text-slate-400 block">
                Catatan ini akan tampil di bagian atas artikel dalam kotak &quot;⚠️ RALAT BERITA&quot;.
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
                Isi Naskah Berita yang Telah Diperbaiki <span className="text-red-600">*</span>
              </label>
              <textarea
                required
                rows={10}
                value={correctedContent}
                onChange={(e) => setCorrectedContent(e.target.value)}
                placeholder="Tuliskan naskah utuh yang telah diperbaiki faktanya..."
                className="w-full p-4 rounded-2xl border border-slate-300 text-slate-900 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isActionLoading}
                className="px-8 py-3 rounded-2xl font-black text-sm text-white bg-red-700 hover:bg-red-800 disabled:opacity-50 transition-all shadow-md cursor-pointer flex items-center gap-2"
              >
                {isActionLoading ? "Menerbitkan Ralat..." : "Terbitkan Ralat Berita Resmi →"}
              </button>
            </div>
          </form>
        )}

        {/* TAB 4: KELOLA BOX REDAKSI */}
        {activeTab === "redaksi" && (
          <form onSubmit={handleSaveRedaksi} className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl font-black text-slate-950">Kelola Box Redaksi (Pasal 12 UU Pers)</h2>
              <p className="text-xs text-slate-500">
                Pembaruan ini akan otomatis mengubah informasi penanggung jawab di Footer situs dan halaman Tentang Kami.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
                  Pemimpin Redaksi / Penanggung Jawab
                </label>
                <input
                  type="text"
                  required
                  value={pemred}
                  onChange={(e) => setPemred(e.target.value)}
                  placeholder="Nama Pemimpin Redaksi"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
                  Nomor Telepon Kantor
                </label>
                <input
                  type="text"
                  required
                  value={telepon}
                  onChange={(e) => setTelepon(e.target.value)}
                  placeholder="+62 21 555-8899"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
                  Alamat Email Redaksi
                </label>
                <input
                  type="email"
                  required
                  value={emailRedaksi}
                  onChange={(e) => setEmailRedaksi(e.target.value)}
                  placeholder="redaksi@berita.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
                  Alamat Kantor Fisik
                </label>
                <input
                  type="text"
                  required
                  value={alamat}
                  onChange={(e) => setAlamat(e.target.value)}
                  placeholder="Gedung Pers Graha Utama Lt. 4, Jakarta"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
                Susunan Tim Redaksi (Waredpel, Redaktur, Wartawan)
              </label>
              <textarea
                required
                rows={3}
                value={tim}
                onChange={(e) => setTim(e.target.value)}
                placeholder="Wakil Pemimpin Redaksi: ...; Redaktur Pelaksana: ...; Tim Liputan: ..."
                className="w-full p-4 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 leading-relaxed"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isActionLoading}
                className="px-8 py-3 rounded-2xl font-black text-sm text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 transition-all shadow-md cursor-pointer"
              >
                {isActionLoading ? "Menyimpan..." : "Simpan Perubahan Box Redaksi →"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
