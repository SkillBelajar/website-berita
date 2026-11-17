import Link from "next/link";
import { getArticles, formatDateTimeWIB } from "@/lib/api";

export const metadata = {
  title: "Beranda - Radar Berita Kepatuhan PPMS",
  description: "Portal berita independen, anti-hoaks, dengan transparansi log ralat dan pembedaan konten advertorial.",
};

export default async function Home() {
  const articles = await getArticles();

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
            Standar Jurnalistik Berimbang & Anti-Hoaks
          </h2>
          <p className="text-xs text-blue-200 max-w-2xl">
            Setiap berita yang mengalami perbaikan data dilengkapi dengan Log Ralat Tersemat permanen dan pelabelan tegas pada iklan berbayar (Advertorial).
          </p>
        </div>
        <Link
          href="/tentang-kami"
          className="whitespace-nowrap px-4 py-2 bg-white text-blue-900 hover:bg-blue-50 text-xs font-bold rounded-lg transition-colors shadow-xs"
        >
          Lihat Box Redaksi →
        </Link>
      </div>

      {/* Headline Utama jika ada artikel */}
      {articles.length > 0 && (
        <section className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 shadow-xs hover:border-blue-300 transition-all">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {articles[0].is_advertorial ? (
              <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500 text-neutral-950 uppercase tracking-wider border border-amber-600">
                IKLAN BERBAYAR / ADVERTORIAL
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 uppercase">
                Headline Utama
              </span>
            )}
            <span className="text-xs text-neutral-500 font-medium">
              Dipublikasikan: {formatDateTimeWIB(articles[0].created_at)}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight leading-tight hover:text-blue-700 transition-colors">
            <Link href={`/article/${articles[0].slug}`}>
              {articles[0].title}
            </Link>
          </h1>

          <p className="mt-4 text-neutral-600 text-sm sm:text-base leading-relaxed line-clamp-3">
            {articles[0].content}
          </p>

          <div className="mt-6 pt-4 border-t border-neutral-100 flex flex-wrap items-center justify-between text-xs text-neutral-500 gap-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-neutral-800">
                Penulis: {articles[0].author?.name || "Redaksi"}
              </span>
              <span>•</span>
              <span className="text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-sm">
                Status: Tayang Terverifikasi
              </span>
            </div>

            <div className="flex items-center gap-3">
              {articles[0].corrections && articles[0].corrections.length > 0 && (
                <span className="text-amber-800 bg-amber-100/90 border border-amber-300 font-semibold text-[11px] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <span>⚠️</span> Log Ralat ({articles[0].corrections.length})
                </span>
              )}
              <Link
                href={`/article/${articles[0].slug}`}
                className="text-blue-700 font-bold hover:underline"
              >
                Baca Selengkapnya →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Grid Card Daftar Artikel */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
          <h2 className="text-xl font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2.5 h-6 bg-blue-700 rounded-xs"></span>
            Kabar Berita Terkini
          </h2>
          <span className="text-xs text-neutral-500 font-medium">
            Total {articles.length} Artikel Ditayangkan
          </span>
        </div>

        {articles.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-neutral-200 p-8 space-y-3">
            <p className="text-neutral-500 text-sm">Belum ada artikel yang dipublikasikan.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => {
              const hasCorrection = article.corrections && article.corrections.length > 0;

              return (
                <article
                  key={article.id}
                  className="bg-white rounded-xl border border-neutral-200 overflow-hidden flex flex-col justify-between hover:shadow-md hover:border-blue-300 transition-all"
                >
                  <div className="p-5 space-y-3">
                    {/* Badge Advertorial vs Berita */}
                    <div className="flex flex-wrap items-center justify-between gap-1">
                      {article.is_advertorial ? (
                        <span className="px-2.5 py-0.5 rounded text-[11px] font-black bg-amber-400 text-neutral-950 uppercase tracking-wider border border-amber-500">
                          ADVERTORIAL
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-100 text-neutral-700 uppercase">
                          Warta Berita
                        </span>
                      )}

                      {hasCorrection && (
                        <span className="text-amber-800 bg-amber-50 border border-amber-200 font-semibold text-[10px] px-2 py-0.5 rounded-sm">
                          ⚠️ Ada Ralat
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-neutral-900 text-base leading-snug hover:text-blue-700 transition-colors line-clamp-2">
                      <Link href={`/article/${article.slug}`}>
                        {article.title}
                      </Link>
                    </h3>

                    <p className="text-neutral-600 text-xs leading-relaxed line-clamp-3">
                      {article.content}
                    </p>
                  </div>

                  <div className="p-5 pt-0 border-t border-neutral-100 mt-2">
                    <div className="pt-3 flex items-center justify-between text-[11px] text-neutral-500">
                      <span>{article.author?.name || "Redaksi"}</span>
                      <span>{formatDateTimeWIB(article.created_at)}</span>
                    </div>
                    <div className="pt-2 text-right">
                      <Link
                        href={`/article/${article.slug}`}
                        className="text-xs font-bold text-blue-700 hover:text-blue-900"
                      >
                        Buka Naskah →
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Kanal Berita */}
      <section id="kategori" className="space-y-4 pt-4 border-t border-neutral-200">
        <div className="flex items-center justify-between pb-2">
          <h2 className="text-lg font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-5 bg-blue-700 rounded-xs"></span>
            Kanal Topik
          </h2>
          <span className="text-xs text-neutral-500">Kanalisasi Informasi</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { name: "Nasional", desc: "Kebijakan & Regulasi Publik" },
            { name: "Daerah", desc: "Kabar Infrastruktur & Warga" },
            { name: "Ekonomi & Bisnis", desc: "Pasar, Perdagangan, & UMKM" },
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
