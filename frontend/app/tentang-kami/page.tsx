import Link from "next/link";
import { getRedaksiData } from "@/lib/api";

export const metadata = {
  title: "Tentang Kami & Susunan Redaksi - Radar Berita",
  description: "Struktur kepengurusan redaksi, penanggung jawab media, visi misi, dan kepatuhan PPMS Dewan Pers.",
};

export const dynamic = "force-dynamic";

export default async function TentangKamiPage() {
  const redaksi = await getRedaksiData();

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Header Halaman */}
      <div className="border-b border-neutral-200 pb-6">
        <div className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full mb-3 uppercase tracking-wider">
          Transparansi Publik & Dewan Pers
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">
          Tentang Kami & Box Redaksi
        </h1>
        <p className="mt-3 text-base text-neutral-600 leading-relaxed">
          Sesuai Pasal 12 UU Pers No. 40/1999 dan Pedoman Pemberitaan Media Siber (PPMS) butir 3, perusahaan pers wajib mengumumkan nama, alamat, dan penanggung jawab secara terbuka melalui media yang bersangkutan.
        </p>
      </div>

      {/* Visi dan Misi */}
      <section className="bg-white rounded-xl p-6 sm:p-8 shadow-xs border border-neutral-200 space-y-4">
        <h2 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
          <span className="w-2.5 h-6 bg-blue-600 rounded-sm"></span>
          Visi & Komitmen Jurnalistik
        </h2>
        <p className="text-neutral-700 leading-relaxed text-sm sm:text-base">
          Menjadi media siber independen, faktual, dan terdepan dalam mengabarkan kebenaran dengan senantiasa mengedepankan asas praduga tak bersalah, verifikasi berimbang, dan kepatuhan mutlak terhadap Kode Etik Jurnalistik (KEJ).
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 text-xs sm:text-sm">
            <h3 className="font-bold text-neutral-900 mb-1">1. Faktual & Terverifikasi</h3>
            <p className="text-neutral-600">Setiap informasi diuji silang kepada narasumber berkompeten sebelum dipublikasikan demi menghindari disinformasi.</p>
          </div>
          <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 text-xs sm:text-sm">
            <h3 className="font-bold text-neutral-900 mb-1">2. Terbuka Terhadap Koreksi</h3>
            <p className="text-neutral-600">Memberikan ruang seluas-luasnya bagi publik untuk mengajukan ralat, klarifikasi, dan Hak Jawab secara adil.</p>
          </div>
        </div>
      </section>

      {/* Box Redaksi Penuh */}
      <section className="bg-white rounded-xl p-6 sm:p-8 shadow-xs border border-neutral-200 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-200 pb-4">
          <h2 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
            <span className="w-2.5 h-6 bg-emerald-600 rounded-sm"></span>
            Susunan Dewan Redaksi
          </h2>
          <span className="text-xs text-neutral-500 font-mono">Status: Terverifikasi Digital</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
          <div className="space-y-1 bg-neutral-50 p-4 rounded-lg border border-neutral-100">
            <span className="text-xs uppercase font-semibold text-neutral-500 block">Pemimpin Redaksi / Penanggung Jawab</span>
            <span className="text-lg font-bold text-neutral-900">{redaksi.editor_in_chief}</span>
            <p className="text-xs text-neutral-600 pt-1">Memegang Sertifikasi Wartawan Utama Dewan Pers</p>
          </div>

          <div className="space-y-1 bg-neutral-50 p-4 rounded-lg border border-neutral-100">
            <span className="text-xs uppercase font-semibold text-neutral-500 block">Susunan Redaksi & Staf</span>
            <span className="font-medium text-neutral-800 leading-snug block">{redaksi.team}</span>
          </div>

          <div className="space-y-1 bg-neutral-50 p-4 rounded-lg border border-neutral-100">
            <span className="text-xs uppercase font-semibold text-neutral-500 block">Alamat Kantor Redaksi</span>
            <span className="font-medium text-neutral-800 leading-snug block">{redaksi.office_address}</span>
          </div>

          <div className="space-y-1 bg-neutral-50 p-4 rounded-lg border border-neutral-100">
            <span className="text-xs uppercase font-semibold text-neutral-500 block">Kontak Resmi Redaksi</span>
            <div className="text-neutral-800 space-y-1 pt-0.5">
              <p><span className="text-neutral-500">Email:</span> <a href={`mailto:${redaksi.email}`} className="text-blue-600 hover:underline">{redaksi.email}</a></p>
              <p><span className="text-neutral-500">Telepon:</span> {redaksi.phone}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mekanisme Hak Jawab & Ralat */}
      <section id="hak-jawab" className="bg-amber-50/60 rounded-xl p-6 sm:p-8 border border-amber-200/80 space-y-4">
        <h2 className="text-xl font-bold text-amber-950 flex items-center gap-2">
          <span>⚖️</span> Mekanisme Ralat, Koreksi, dan Hak Jawab
        </h2>
        <p className="text-sm text-amber-900 leading-relaxed">
          Pemberitaan media siber tunduk pada Pedoman Pemberitaan Media Siber (PPMS). Ralat, koreksi, dan hak jawab wajib ditautkan pada berita yang bersangkutan dengan mencantumkan waktu ralat dimuat.
        </p>
        <div className="pt-2 flex flex-wrap gap-3">
          <Link
            href="/#artikel"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-900 text-white text-xs font-semibold rounded-md hover:bg-amber-800 transition-colors shadow-xs"
          >
            Lihat Berita Terbaru
          </Link>
          <a
            href="https://dewanpers.or.id"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-amber-950 border border-amber-300 text-xs font-semibold rounded-md hover:bg-amber-50 transition-colors"
          >
            Situs Resmi Dewan Pers ↗
          </a>
        </div>
      </section>

      {/* Ketentuan Layanan UGC */}
      <section id="tos" className="bg-white rounded-xl p-6 sm:p-8 shadow-xs border border-neutral-200 space-y-4 text-xs sm:text-sm text-neutral-600">
        <h2 className="text-xl font-bold text-neutral-900">Ketentuan Layanan & Isi Buatan Pengguna (UGC)</h2>
        <p>
          Pengguna yang berpartisipasi dalam kolom komentar wajib mematuhi ketentuan etika berinternet. Redaksi menerapkan filter otomatis dan moderasi aktif terhadap konten yang mengandung:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-neutral-700">
          <li>Tautan atau URL spam / promosi ilegal.</li>
          <li>Perjudian online, pornografi, ujaran kebencian SARA, serta fitnah.</li>
          <li>Kata-kata kasar atau intimidasi antar pengguna.</li>
        </ul>
        <p className="pt-2 text-neutral-500 text-xs">
          Redaksi berhak mencabut atau menghapus komentar yang terindikasi melanggar hukum tanpa pemberitahuan sebelumnya.
        </p>
      </section>
    </div>
  );
}
