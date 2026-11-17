import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-10">
      {/* Top Banner Alert Kepatuhan PPMS */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-blue-900 to-indigo-900 text-white shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-700 tracking-wider">
              PPMS Compliant
            </span>
            <span className="text-xs text-blue-200">Sertifikasi & Kepatuhan Pers Digital</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight">
            Standar Jurnalistik Berimbang & Berintegritas
          </h2>
          <p className="text-xs text-blue-200 max-w-2xl">
            Setiap berita yang mengalami perbaikan fakta dilengkapi dengan Log Ralat Tersemat permanen dan mekanisme Hak Jawab transparan.
          </p>
        </div>
        <Link
          href="/tentang-kami"
          className="whitespace-nowrap px-4 py-2 bg-white text-blue-900 hover:bg-blue-50 text-xs font-bold rounded-lg transition-colors shadow-xs"
        >
          Lihat Box Redaksi →
        </Link>
      </div>

      {/* Featured Headline */}
      <section className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
            Terbaru
          </span>
          <span className="text-xs text-neutral-500 font-medium">17 November 2026</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight leading-tight hover:text-blue-700 transition-colors">
          <Link href="/tentang-kami#artikel">
            Peresmian Jembatan Baru Ketapang Dihadiri Tokoh Daerah dan Dorong Akselerasi Logistik
          </Link>
        </h1>
        <p className="mt-4 text-neutral-600 text-sm sm:text-base leading-relaxed line-clamp-3">
          Jembatan penghubung utama antardaerah resmi dibuka setelah melalui serangkaian uji kelayakan beban struktural. Proyek strategis ini diharapkan memangkas waktu tempuh distribusi hasil pertanian dan produk UMKM lokal secara signifikan.
        </p>
        <div className="mt-6 pt-4 border-t border-neutral-100 flex flex-wrap items-center justify-between text-xs text-neutral-500 gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-800">Penulis: Budi Santoso</span>
            <span>•</span>
            <span className="text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-sm">
              Editor: Dewi Lestari
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-amber-700 font-mono text-[11px] bg-amber-50 px-2 py-0.5 rounded-sm">
              Log Ralat: 1 Pembaruan
            </span>
            <Link
              href="/tentang-kami"
              className="text-blue-700 font-semibold hover:underline"
            >
              Baca Selengkapnya →
            </Link>
          </div>
        </div>
      </section>

      {/* Kategori Berita */}
      <section id="kategori" className="space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
          <h2 className="text-lg font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-5 bg-blue-700 rounded-xs"></span>
            Kanal Berita
          </h2>
          <span className="text-xs text-neutral-500">Kanal Berita Terkini</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { name: "Nasional", desc: "Kebijakan & Regulasi Pemerintahan" },
            { name: "Daerah", desc: "Kabar Infrastruktur & Warga" },
            { name: "Ekonomi", desc: "Pasar, Perdagangan, & UMKM" },
            { name: "Teknologi", desc: "Inovasi & Transformasi Digital" },
          ].map((cat) => (
            <div
              key={cat.name}
              className="p-4 bg-white rounded-xl border border-neutral-200 hover:border-blue-400 hover:shadow-xs transition-all"
            >
              <h3 className="font-bold text-neutral-900 text-sm">{cat.name}</h3>
              <p className="text-xs text-neutral-500 mt-1">{cat.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
