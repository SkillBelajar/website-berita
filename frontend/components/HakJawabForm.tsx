"use client";

import { useState, FormEvent } from "react";
import { clientFetch } from "@/lib/api";

export default function HakJawabForm({
  articleId,
  articleTitle,
}: {
  articleId: number;
  articleTitle: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const res = await clientFetch("/complaints/hak-jawab", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          article_id: articleId,
          submitter_name: name.trim(),
          submitter_email: email.trim(),
          content: content.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Gagal mengirimkan pengajuan Hak Jawab.");
        setLoading(false);
        return;
      }

      setSuccessMsg(
        "Terima kasih, aduan/hak jawab Anda telah masuk ke antrean redaksi kami. Dewan Redaksi akan segera menindaklanjuti sesuai UU Pers No. 40/1999."
      );
      setName("");
      setEmail("");
      setContent("");
    } catch {
      setErrorMsg("Gagal terhubung ke server pengaduan Hak Jawab.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl border-2 border-slate-300 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-md space-y-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚖️</span>
            <span className="text-xs uppercase tracking-widest font-bold text-amber-400">
              Hak Jawab & Koreksi Berita (UU Pers Pasal 5)
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-black tracking-tight text-white">
            Merasa Fakta Berita Ini Kurang Tepat atau Merugikan Anda?
          </h3>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Sesuai Pedoman Pemberitaan Media Siber Dewan Pers, setiap narasumber atau masyarakat berhak mengajukan klarifikasi, ralat, dan Hak Jawab secara langsung tanpa dipungut biaya.
          </p>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="whitespace-nowrap px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider bg-amber-400 hover:bg-amber-300 text-slate-950 transition-all shadow-md cursor-pointer shrink-0"
        >
          {isOpen ? "Tutup Formulir ✕" : "Ajukan Hak Jawab / Koreksi Berita ↗"}
        </button>
      </div>

      {/* Form Ekspansi Inline */}
      {isOpen && (
        <div className="mt-4 pt-6 border-t border-slate-700/80 space-y-4 animate-in fade-in duration-300">
          <div className="bg-slate-800/80 p-3 rounded-xl text-xs text-slate-300 border border-slate-700">
            <span className="text-slate-400">Artikel yang diadukan: </span>
            <strong className="text-white font-semibold">{articleTitle}</strong> (ID #{articleId})
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-600 text-rose-200 text-xs font-semibold flex items-center gap-2">
              <span>⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-600 text-emerald-200 text-xs font-semibold space-y-1">
              <div className="flex items-center gap-2 text-sm font-bold">
                <span>✓</span>
                <span>Pengajuan Berhasil Terkirim</span>
              </div>
              <p>{successMsg}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Nama Lengkap Pemohon / Narasumber
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Budi Gunawan (Dinas PUPR)"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent placeholder:text-slate-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Alamat Email Resmi Pemohon
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@instansi-atau-pribadi.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent placeholder:text-slate-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Isi Hak Jawab, Klarifikasi, atau Koreksi Fakta
              </label>
              <textarea
                required
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Jelaskan secara rinci kekeliruan data atau klarifikasi yang ingin Anda sampaikan beserta fakta rujukan..."
                className="w-full p-4 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent placeholder:text-slate-500"
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2">
              <span className="text-[11px] text-slate-400">
                Data Anda dilindungi kerahasiaannya dan hanya digunakan untuk keperluan verifikasi redaksional.
              </span>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2.5 rounded-xl font-bold text-xs text-slate-300 hover:bg-slate-800 border border-slate-700 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider bg-amber-400 hover:bg-amber-300 text-slate-950 disabled:opacity-50 transition-all cursor-pointer shadow-md"
                >
                  {loading ? "Mengirim Aduan..." : "Kirimkan Hak Jawab"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
