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
    <div className="max-w-4xl mx-auto space-y-10">
      {/* 1. Header Halaman */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-10 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-black rounded-full uppercase tracking-wider">
            TRANSPARANSI PUBLIK & DEWAN PERS
          </span>
          <span className="text-xs text-slate-500 font-mono">Pasal 12 UU Pers No. 40/1999</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight font-serif">
          Tentang Kami & Susunan Redaksi
        </h1>

        <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
          Sesuai amanat Pasal 12 Undang-Undang Pers No. 40 Tahun 1999 dan Pedoman Pemberitaan Media Siber (PPMS) butir 3, perusahaan pers wajib mengumumkan nama, alamat, dan penanggung jawab secara terbuka melalui media yang bersangkutan.
        </p>
      </div>

      {/* 2. Visi dan Misi */}
      <section className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200/90 space-y-6">
        <div className="flex items-center justify-between border-b-2 border-red-600 pb-3">
          <h2 className="text-xl sm:text-2xl font-black text-slate-950 uppercase tracking-tight flex items-center gap-2">
            <span className="w-2.5 h-6 bg-red-600 rounded-xs"></span>
            Visi & Komitmen Jurnalistik
          </h2>
          <span className="text-xs text-slate-400 font-semibold">Independen & Akuntabel</span>
        </div>

        <p className="text-slate-700 leading-relaxed text-base sm:text-lg">
          Menjadi media siber independen, faktual, dan terdepan dalam mengabarkan kebenaran dengan senantiasa mengedepankan asas praduga tak bersalah, verifikasi berimbang, dan kepatuhan mutlak terhadap Kode Etik Jurnalistik (KEJ) serta Pedoman Pemberitaan Media Siber (PPMS).
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="text-2xl">🔍</div>
            <h3 className="font-bold text-slate-950 text-base">1. Faktual & Terverifikasi</h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              Setiap naskah berita diuji silang kepada narasumber berkompeten demi mencegah peredaran hoaks dan disinformasi.
            </p>
          </div>

          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="text-2xl">⚖️</div>
            <h3 className="font-bold text-slate-950 text-base">2. Hak Jawab Terbuka</h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              Menyediakan saluran langsung bagi pihak yang merasa dirugikan untuk mengajukan koreksi fakta atau Hak Jawab secara adil.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Box Redaksi Penuh */}
      <section className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200/90 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-red-600 pb-3">
          <h2 className="text-xl sm:text-2xl font-black text-slate-950 uppercase tracking-tight flex items-center gap-2">
            <span className="w-2.5 h-6 bg-red-600 rounded-xs"></span>
            Susunan Dewan Redaksi
          </h2>
          <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            ✓ Terverifikasi Dewan Pers
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
          <div className="space-y-1.5 bg-slate-50 p-5 rounded-2xl border border-slate-200">
            <span className="text-xs uppercase font-bold text-slate-500 block">Pemimpin Redaksi / Penanggung Jawab</span>
            <span className="text-xl font-black text-slate-950 block">{redaksi.editor_in_chief}</span>
            <p className="text-xs text-slate-600 pt-1">Memegang Sertifikasi Wartawan Utama Dewan Pers</p>
          </div>

          <div className="space-y-1.5 bg-slate-50 p-5 rounded-2xl border border-slate-200">
            <span className="text-xs uppercase font-bold text-slate-500 block">Susunan Staf Redaksi</span>
            <span className="font-semibold text-slate-800 leading-snug block text-sm">{redaksi.team}</span>
          </div>

          <div className="space-y-1.5 bg-slate-50 p-5 rounded-2xl border border-slate-200">
            <span className="text-xs uppercase font-bold text-slate-500 block">Alamat Kantor Redaksi</span>
            <span className="font-medium text-slate-800 leading-snug block text-xs sm:text-sm">{redaksi.office_address}</span>
          </div>

          <div className="space-y-1.5 bg-slate-50 p-5 rounded-2xl border border-slate-200">
            <span className="text-xs uppercase font-bold text-slate-500 block">Kontak Resmi Redaksi</span>
            <div className="text-slate-800 space-y-1 pt-0.5 text-xs sm:text-sm">
              <p>
                <span className="text-slate-500">Email:</span>{" "}
                <a href={`mailto:${redaksi.email}`} className="text-red-700 font-bold hover:underline">
                  {redaksi.email}
                </a>
              </p>
              <p>
                <span className="text-slate-500">Telepon:</span>{" "}
                <span className="font-semibold">{redaksi.phone}</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Mekanisme Hak Jawab & Ralat */}
      <section id="hak-jawab" className="bg-amber-50/90 rounded-3xl p-6 sm:p-10 border-2 border-amber-300 shadow-xs space-y-4">
        <h2 className="text-xl sm:text-2xl font-black text-amber-950 flex items-center gap-2">
          <span>⚖️</span> Mekanisme Ralat, Koreksi, dan Hak Jawab
        </h2>
        <p className="text-sm text-amber-950 leading-relaxed">
          Pemberitaan media siber kami tunduk penuh pada Pedoman Pemberitaan Media Siber (PPMS). Ralat, koreksi, dan hak jawab wajib ditautkan pada berita yang bersangkutan dengan mencantumkan waktu ralat dimuat dan disahkan secara transparan.
        </p>
        <div className="pt-2 flex flex-wrap gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-red-700 text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-red-800 transition-colors shadow-xs"
          >
            Lihat Berita Terbaru
          </Link>
          <a
            href="https://dewanpers.or.id"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-white text-slate-900 border border-slate-300 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors"
          >
            Situs Resmi Dewan Pers ↗
          </a>
        </div>
      </section>

      {/* 5. Ketentuan Layanan UGC */}
      <section id="tos" className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200/90 space-y-4 text-xs sm:text-sm text-slate-600">
        <h2 className="text-xl font-black text-slate-950 border-b border-slate-200 pb-3">
          Ketentuan Layanan & Isi Buatan Pengguna (UGC)
        </h2>
        <p>
          Pengguna yang berpartisipasi dalam kolom komentar wajib mematuhi ketentuan etika berinternet. Redaksi menerapkan filter otomatis berbasis AI/regex dan moderasi aktif terhadap konten yang mengandung:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-slate-800 font-medium">
          <li>Tautan atau URL spam / promosi komersial ilegal.</li>
          <li>Perjudian online, pornografi, ujaran kebencian SARA, serta fitnah.</li>
          <li>Kata-kata kasar atau intimidasi antar pembaca.</li>
        </ul>
        <p className="pt-2 text-slate-500 text-xs">
          Redaksi berhak mencabut atau menghapus komentar yang terindikasi melanggar hukum tanpa pemberitahuan sebelumnya.
        </p>
      </section>
    </div>
  );
}
