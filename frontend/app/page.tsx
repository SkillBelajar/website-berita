import Link from "next/link";
import { getArticles, formatDateTimeWIB, getArticleMeta } from "@/lib/api";

export const metadata = {
  title: "Radar Berita - Portal Jurnalisme Siber Kepatuhan PPMS",
  description: "Portal berita independen, faktual, dan berimbang dengan standar kepatuhan Pedoman Pemberitaan Media Siber Dewan Pers.",
};

export default async function Home() {
  const articles = await getArticles();

  const headlineArticle = articles.length > 0 ? articles[0] : null;
  const secondaryArticles = articles.length > 1 ? articles.slice(1) : [];

  const headlineMeta = headlineArticle ? getArticleMeta(headlineArticle) : null;

  return (
    <div className="space-y-10">
      {/* 1. HERO SHOWCASE SECTION (Layout Berita Utama & Kolom Terpopuler) */}
      {headlineArticle && headlineMeta ? (
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* KOLOM UTAMA (65% / 8 Cols) - HEADLINE BESAR */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden group hover:border-red-300 transition-all">
            <Link href={`/article/${headlineArticle.slug}`} className="block relative aspect-16/9 overflow-hidden bg-slate-900">
              <img
                src={headlineMeta.imageUrl}
                alt={headlineArticle.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out brightness-95"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

              {/* Floating Badges */}
              <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
                {headlineArticle.is_advertorial ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-400 text-slate-950 uppercase tracking-wider border border-amber-500 shadow-md">
                    <span>📢</span> ADVERTORIAL / IKLAN
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-red-600 text-white uppercase tracking-wider shadow-md">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                    BERITA UTAMA
                  </span>
                )}

                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-black/60 text-white backdrop-blur-xs">
                  {headlineMeta.category}
                </span>

                {headlineArticle.corrections && headlineArticle.corrections.length > 0 && (
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500 text-slate-950 flex items-center gap-1">
                    <span>⚠️</span> Ada Catatan Ralat
                  </span>
                )}
              </div>

              {/* Caption Overlay */}
              <div className="absolute bottom-3 right-4 text-[11px] text-slate-300/90 font-mono hidden sm:block">
                {headlineMeta.photoCredit}
              </div>
            </Link>

            {/* Konten Teks Headline */}
            <div className="p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <span className="text-red-700 font-bold uppercase tracking-wider">
                  {headlineMeta.category}
                </span>
                <span>•</span>
                <span>{headlineMeta.readTime}</span>
                <span>•</span>
                <span>Dipublikasikan: {formatDateTimeWIB(headlineArticle.created_at)}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-950 tracking-tight leading-tight sm:leading-[1.18] group-hover:text-red-600 transition-colors">
                <Link href={`/article/${headlineArticle.slug}`}>
                  {headlineArticle.title}
                </Link>
              </h1>

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed line-clamp-3">
                {headlineArticle.content}
              </p>

              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-red-700 text-white text-xs font-bold flex items-center justify-center">
                    {headlineArticle.author?.name ? headlineArticle.author.name[0].toUpperCase() : "W"}
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block leading-tight">
                      {headlineArticle.author?.name || "Wartawan Radar Berita"}
                    </span>
                    <span className="text-[11px] text-emerald-700 font-semibold">
                      ✓ Reporter Terakreditasi
                    </span>
                  </div>
                </div>

                <Link
                  href={`/article/${headlineArticle.slug}`}
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-700 hover:bg-red-800 transition-colors shadow-xs"
                >
                  <span>Baca Selengkapnya</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          </div>

          {/* KOLOM SAMPING (35% / 4 Cols) - BERITA TERPOPULER & PILIHAN */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b-2 border-red-600 pb-2.5">
                <h2 className="text-base font-black text-slate-950 uppercase tracking-wider flex items-center gap-1.5">
                  <span>🔥</span> BERITA TERPOPULER
                </h2>
                <span className="text-[11px] text-slate-400 font-semibold">
                  24 Jam Terakhir
                </span>
              </div>

              <div className="space-y-4">
                {articles.map((item, index) => {
                  const meta = getArticleMeta(item);
                  return (
                    <article
                      key={item.id}
                      className="flex items-start gap-3.5 group pb-4 border-b border-slate-100 last:border-0 last:pb-0"
                    >
                      <span className="w-7 h-7 rounded-lg bg-red-50 text-red-700 font-black text-sm flex items-center justify-center shrink-0 border border-red-200">
                        {index + 1}
                      </span>

                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold uppercase">
                          {item.is_advertorial ? (
                            <span className="text-amber-600 font-black">ADVERTORIAL</span>
                          ) : (
                            <span className="text-red-700">{meta.category}</span>
                          )}
                          <span>•</span>
                          <span>{formatDateTimeWIB(item.created_at)}</span>
                        </div>

                        <h3 className="font-bold text-slate-900 text-xs sm:text-sm leading-snug group-hover:text-red-600 transition-colors line-clamp-2">
                          <Link href={`/article/${item.slug}`}>
                            {item.title}
                          </Link>
                        </h3>
                      </div>

                      <Link href={`/article/${item.slug}`} className="shrink-0 w-18 h-18 rounded-xl overflow-hidden bg-slate-100">
                        <img
                          src={meta.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </Link>
                    </article>
                  );
                })}
              </div>
            </div>

            {/* WIDGET SALURAN HAK JAWAB CEPAT */}
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-6 shadow-sm space-y-3.5 border border-slate-800">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <span>⚖️</span> Kepatuhan PPMS Dewan Pers
              </div>
              <h3 className="font-black text-base text-white leading-snug">
                Punya Koreksi atau Hak Jawab atas Berita Kami?
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Kami menjamin hak pembaca dan narasumber untuk menyampaikan klarifikasi fakta secara transparan sesuai UU Pers.
              </p>
              <Link
                href="/tentang-kami#hak-jawab"
                className="inline-block w-full text-center py-2.5 px-4 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl transition-colors shadow-xs"
              >
                Ajukan Hak Jawab Sekarang ↗
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      {/* 2. BANNER INFORMATIF PPMS & ANTI-HOAKS */}
      <section className="bg-gradient-to-r from-red-800 via-rose-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-red-600 text-white tracking-wider">
              PPMS & KEJ VERIFIED
            </span>
            <span className="text-xs text-rose-200">Keterbukaan Informasi Publik</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Jurnalisme Teruji Bebas Disinformasi & Hoaks
          </h2>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
            Setiap berita yang mengalami perbaikan fakta dilengkapi dengan Log Ralat Tersemat permanen dan penandaan tegas pada materi Advertorial Komersial.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 shrink-0">
          <Link
            href="/tentang-kami"
            className="px-5 py-2.5 bg-white text-slate-950 hover:bg-slate-100 text-xs font-black rounded-xl transition-colors shadow-xs"
          >
            Struktur Redaksi →
          </Link>
          <Link
            href="/panduan-pengguna"
            className="px-5 py-2.5 bg-red-950/60 hover:bg-red-950 border border-red-500/50 text-white text-xs font-bold rounded-xl transition-colors"
          >
            Panduan Pembaca
          </Link>
        </div>
      </section>

      {/* 3. GRID KABAR BERITA TERKINI DENGAN GAMBAR EDITORIAL LENGKAP */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b-2 border-red-600 pb-3">
          <h2 className="text-xl sm:text-2xl font-black text-slate-950 uppercase tracking-tight flex items-center gap-2">
            <span className="w-3 h-7 bg-red-600 rounded-xs"></span>
            Warta Berita Terkini
          </h2>
          <span className="text-xs text-slate-500 font-semibold">
            {articles.length} Naskah Tayang
          </span>
        </div>

        {articles.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
            <p className="text-slate-500 text-sm">Belum ada artikel yang dipublikasikan.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {articles.map((article) => {
              const meta = getArticleMeta(article);
              const hasCorrection = article.corrections && article.corrections.length > 0;

              return (
                <article
                  key={article.id}
                  className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden flex flex-col justify-between hover:shadow-lg hover:border-red-300 transition-all group"
                >
                  {/* Foto Berita */}
                  <div>
                    <Link
                      href={`/article/${article.slug}`}
                      className="block relative aspect-16/10 overflow-hidden bg-slate-100"
                    >
                      <img
                        src={meta.imageUrl}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                      {/* Badge Kategori & Advertorial */}
                      <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
                        {article.is_advertorial ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950 uppercase tracking-wider border border-amber-500 shadow-2xs">
                            ADVERTORIAL
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-600 text-white uppercase tracking-wider shadow-2xs">
                            {meta.category}
                          </span>
                        )}

                        {hasCorrection && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950 flex items-center gap-1">
                            <span>⚠️</span> Ralat
                          </span>
                        )}
                      </div>

                      <div className="absolute bottom-2 right-3 text-[10px] text-white/80 font-mono">
                        {meta.readTime}
                      </div>
                    </Link>

                    {/* Deskripsi Teks */}
                    <div className="p-5 space-y-3">
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 font-semibold">
                        <span>{formatDateTimeWIB(article.created_at)}</span>
                        <span>•</span>
                        <span className="text-slate-600">{article.author?.name || "Redaksi"}</span>
                      </div>

                      <h3 className="font-bold text-slate-950 text-base sm:text-lg leading-snug group-hover:text-red-600 transition-colors line-clamp-2">
                        <Link href={`/article/${article.slug}`}>
                          {article.title}
                        </Link>
                      </h3>

                      <p className="text-slate-600 text-xs sm:text-sm leading-relaxed line-clamp-3">
                        {article.content}
                      </p>
                    </div>
                  </div>

                  {/* Footer Card */}
                  <div className="p-5 pt-0 border-t border-slate-100 mt-2">
                    <div className="pt-3 flex items-center justify-between text-xs">
                      <span className="text-slate-400 text-[11px] font-mono">
                        {meta.photoCredit.split("/")[0]}
                      </span>
                      <Link
                        href={`/article/${article.slug}`}
                        className="font-bold text-red-600 hover:text-red-800 flex items-center gap-1"
                      >
                        <span>Baca Berita</span>
                        <span>→</span>
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. KANAL KATEGORI TEMATIK */}
      <section id="kategori" className="space-y-5 pt-6 border-t border-slate-200">
        <div className="flex items-center justify-between border-b-2 border-red-600 pb-2.5">
          <h2 className="text-lg font-black text-slate-950 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2.5 h-6 bg-red-600 rounded-xs"></span>
            Kanal Liputan Tematik
          </h2>
          <span className="text-xs text-slate-500">Kanal Berita Pilihan</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {
              name: "Nasional",
              desc: "Kebijakan Publik & Regulasi Pemerintahan",
              icon: "🏛️",
              color: "border-blue-200 hover:border-blue-400",
            },
            {
              name: "Daerah",
              desc: "Kabar Infrastruktur, Warga & Komunitas",
              icon: "🌉",
              color: "border-emerald-200 hover:border-emerald-400",
            },
            {
              name: "Ekonomi & Bisnis",
              desc: "Pasar, Perdagangan, UMKM & Finansial",
              icon: "📈",
              color: "border-amber-200 hover:border-amber-400",
            },
            {
              name: "Teknologi",
              desc: "Inovasi, Transformasi Digital & Sains",
              icon: "💻",
              color: "border-purple-200 hover:border-purple-400",
            },
          ].map((cat) => (
            <div
              key={cat.name}
              className={`p-5 bg-white rounded-2xl border ${cat.color} hover:shadow-md transition-all space-y-1.5`}
            >
              <span className="text-2xl">{cat.icon}</span>
              <h3 className="font-bold text-slate-950 text-sm sm:text-base">{cat.name}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{cat.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
