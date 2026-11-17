import Link from "next/link";

export const metadata = {
  title: "Panduan Pengguna & Kepatuhan Pers - Radar Berita",
  description: "Pedoman etika berkomentar, tata cara pelaporan abuse, serta mekanisme pengajuan hak jawab sesuai UU Pers dan PPMS Dewan Pers.",
};

export default function PanduanPenggunaPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Header Halaman */}
      <div className="border-b border-slate-200 pb-6 space-y-3">
        <div className="inline-block px-3.5 py-1 bg-blue-100 text-blue-900 text-xs font-bold rounded-full uppercase tracking-wider">
          Panduan Interaksi Pembaca & Dewan Pers
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
          Panduan Komunitas & Kepatuhan Hukum Media Siber
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl">
          Sebagai media siber yang berpedoman pada Undang-Undang Pers No. 40 Tahun 1999 dan Pedoman Pemberitaan Media Siber (PPMS) Dewan Pers, Radar Berita berkomitmen menciptakan ruang publik yang sehat, berimbang, dan berintegritas.
        </p>
      </div>

      {/* Bagian 1: Syarat & Ketentuan Berkomentar (UGC) */}
      <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-sm space-y-5">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <span className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 font-black text-lg flex items-center justify-center shrink-0">
            1
          </span>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Syarat & Ketentuan Kolom Komentar (UGC)
            </h2>
            <p className="text-xs text-slate-500">
              Kepatuhan Butir 6 Pedoman Pemberitaan Media Siber
            </p>
          </div>
        </div>

        <p className="text-sm text-slate-700 leading-relaxed">
          Ruang komentar disediakan bagi pembaca untuk bertukar gagasan, pandangan, dan kritik konstruktif. Demi menjaga kepatuhan hukum dan etika bermedia, pengguna dilarang memuat isi buatan pengguna (UGC) yang:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
          <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 text-rose-950 space-y-1">
            <strong className="block font-bold">🚫 Tautan & Spam Komersial</strong>
            <p className="text-rose-900 text-xs">
              Dilarang menyisipkan tautan (URL) eksternal, promosi afiliasi, atau backlink ilegal. Sistem menerapkan filter otomatis penolakan link secara ketat.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 text-rose-950 space-y-1">
            <strong className="block font-bold">🚫 Judi & Pornografi</strong>
            <p className="text-rose-900 text-xs">
              Dilarang keras memuat ajakan, kata kunci perjudian online (slot, gacor, kasino), materi asusila, dan promosi narkoba.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 text-rose-950 space-y-1">
            <strong className="block font-bold">🚫 Ujaran Kebencian & SARA</strong>
            <p className="text-rose-900 text-xs">
              Dilarang mendiskriminasi, menghina, atau memprovokasi berdasarkan Suku, Agama, Ras, dan Antargolongan (SARA).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 text-rose-950 space-y-1">
            <strong className="block font-bold">🚫 Fitnah & Anonimitas Berbahaya</strong>
            <p className="text-rose-900 text-xs">
              Dilarang menuduh tanpa bukti sah atau menyerang kehormatan pribadi pihak lain. Seluruh pengguna wajib masuk menggunakan akun terdaftar.
            </p>
          </div>
        </div>
      </section>

      {/* Bagian 2: Prosedur Pelaporan Komentar (Report Abuse) */}
      <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-sm space-y-5">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <span className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-700 font-black text-lg flex items-center justify-center shrink-0">
            2
          </span>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Prosedur Pelaporan Komentar Bermasalah (Report Abuse)
            </h2>
            <p className="text-xs text-slate-500">
              Mekanisme Partisipasi Publik dalam Pengawasan Konten
            </p>
          </div>
        </div>

        <p className="text-sm text-slate-700 leading-relaxed">
          Jika Anda menemukan komentar yang melanggar ketentuan hukum atau norma kesantunan, Anda dapat berpartisipasi melaporkannya secara langsung:
        </p>

        <ol className="list-decimal pl-5 space-y-2 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <li>
            Pastikan Anda telah masuk (login) ke akun pembaca Anda.
          </li>
          <li>
            Pada komentar yang melanggar, klik tombol <strong>[🚩 Laporkan]</strong> yang tertera di pojok kanan atas kartu komentar.
          </li>
          <li>
            Tuliskan alasan pengaduan Anda secara jelas (misalnya: mengandung ujaran kebencian, spam, atau promosi ilegal).
          </li>
          <li>
            Laporan Anda akan otomatis masuk ke <strong>Antrean Moderasi Redaksi</strong>. Tim editor akan meninjau dan menghapus komentar yang terbukti melanggar dalam waktu paling lambat 2x24 jam sejak laporan diterima.
          </li>
        </ol>
      </section>

      {/* Bagian 3: Hak Jawab & Hak Koreksi */}
      <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-sm space-y-5">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <span className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 font-black text-lg flex items-center justify-center shrink-0">
            3
          </span>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Mekanisme Pengajuan Hak Jawab & Koreksi Berita
            </h2>
            <p className="text-xs text-slate-500">
              Kepatuhan Pasal 5 UU Pers No. 40/1999 & Butir 5 PPMS
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-300 text-amber-950 text-xs sm:text-sm space-y-2">
          <strong className="block font-bold">Pasal 5 Ayat (2) & (3) UU Pers:</strong>
          <p className="italic leading-relaxed">
            &ldquo;Pers wajib melayani Hak Jawab dan Pers wajib melayani Hak Koreksi.&rdquo;
          </p>
        </div>

        <div className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <h3 className="font-bold text-slate-900 text-base">Ketentuan Pengajuan:</h3>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <strong>Siapa yang Berhak:</strong> Setiap pihak (perseorangan, lembaga, institusi, atau kuasa hukumnya) yang merasa dirugikan nama baiknya atau mendapati kekeliruan fakta dalam materi pemberitaan.
            </li>
            <li>
              <strong>Cara Pengajuan:</strong> Gunakan formulir <strong>[Ajukan Hak Jawab / Koreksi Berita]</strong> yang tersedia di bagian bawah setiap naskah artikel, atau kirimkan surat resmi ke email redaksi: <span className="font-mono text-blue-700">redaksi@berita-ppms.id</span>.
            </li>
            <li>
              <strong>Kewajiban Redaksi:</strong> Redaksi wajib menautkan ralat atau mempublikasikan Hak Jawab dengan merujuk langsung ke artikel bersangkutan serta mencantumkan waktu pembaruan secara transparan.
            </li>
          </ul>
        </div>

        <div className="pt-2 flex flex-wrap gap-3">
          <Link
            href="/tentang-kami"
            className="px-5 py-2.5 rounded-xl font-bold text-xs bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-xs"
          >
            Lihat Susunan Dewan Redaksi →
          </Link>
          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl font-bold text-xs bg-slate-100 text-slate-800 hover:bg-slate-200 transition-colors"
          >
            Kembali ke Beranda Berita
          </Link>
        </div>
      </section>
    </div>
  );
}
