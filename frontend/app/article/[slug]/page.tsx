import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticleBySlug, formatDateTimeWIB, getArticleMeta } from "@/lib/api";
import ShareButtons from "@/components/ShareButtons";
import CommentSection from "@/components/CommentSection";
import HakJawabForm from "@/components/HakJawabForm";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return {
      title: "Artikel Tidak Ditemukan - Radar Berita",
    };
  }

  return {
    title: `${article.title} - Radar Berita`,
    description: article.content.slice(0, 150) + "...",
  };
}

export default async function ArticleDetailPage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const meta = getArticleMeta(article);
  const corrections = article.corrections || [];
  const hasCorrections = corrections.length > 0;
  const isEdited = hasCorrections || article.updated_at !== article.created_at;

  // Pemisahan paragraf naskah berita
  const rawParagraphs = article.content.split("\n\n").filter((p) => p.trim() !== "");
  const paragraphs = rawParagraphs.length > 0 ? rawParagraphs : [article.content];

  // Inisial avatar wartawan
  const authorName = article.author?.name || "Redaksi Radar Berita";
  const authorInitials = authorName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <article className="max-w-4xl mx-auto space-y-8">
      {/* 1. BREADCRUMBS NAV */}
      <nav className="text-xs text-slate-500 flex flex-wrap items-center gap-2 px-1">
        <Link href="/" className="hover:text-red-700 transition-colors font-medium">
          Beranda
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-red-700 font-bold uppercase tracking-wider">
          {meta.category}
        </span>
        <span className="text-slate-300">/</span>
        <span className="text-slate-700 font-medium truncate max-w-xs sm:max-w-md">
          {article.title}
        </span>
      </nav>

      {/* 2. HEADER BERITA (Masthead Artikel & Metadata Jurnalistik) */}
      <header className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-10 space-y-6">
        {/* Kategori & Status Kepatuhan */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            {article.is_advertorial ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-400 text-slate-950 uppercase tracking-wider border border-amber-500 shadow-2xs">
                <span>📢</span> IKLAN BERBAYAR / ADVERTORIAL
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-red-700 text-white uppercase tracking-wider shadow-2xs">
                <span>📰</span> {meta.category}
              </span>
            )}

            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              PPMS Terverifikasi
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span>⏱️ {meta.readTime}</span>
          </div>
        </div>

        {/* Judul Berita Besar & Tegas */}
        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight leading-[1.2] font-serif">
          {article.title}
        </h1>

        {/* Baris Byline Wartawan, Timestamp & Share */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-full bg-red-700 text-white font-black flex items-center justify-center text-sm shadow-xs shrink-0">
              {authorInitials}
            </div>

            <div className="text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900">{authorName}</span>
                <span className="text-[10px] text-red-700 font-bold bg-red-50 border border-red-200 px-2 py-0.5 rounded-sm">
                  Jurnalis Redaksi
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-slate-500 text-xs pt-1">
                <span>
                  <strong>Tayang:</strong> {formatDateTimeWIB(article.created_at)}
                </span>

                {isEdited && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span className="text-amber-800 font-semibold bg-amber-50 px-2 py-0.5 rounded-sm border border-amber-200">
                      🕒 <strong>Diperbarui:</strong> {formatDateTimeWIB(article.updated_at)}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Tombol Bagikan */}
          <ShareButtons title={article.title} />
        </div>
      </header>

      {/* 3. FOTO UTAMA JURNALISTIK DENGAN CAPTION & KREDIT */}
      <figure className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden space-y-3 p-3 sm:p-4">
        <div className="relative aspect-16/9 rounded-2xl overflow-hidden bg-slate-900">
          <img
            src={meta.imageUrl}
            alt={article.title}
            className="w-full h-full object-cover brightness-95"
          />
        </div>
        <figcaption className="px-2 pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-slate-500">
          <span className="italic font-medium text-slate-700">
            Dokumentasi liputan: {article.title}
          </span>
          <span className="font-mono text-[11px] text-slate-500 shrink-0">
            {meta.photoCredit}
          </span>
        </figcaption>
      </figure>

      {/* 4. BANNER DISCLAIMER ADVERTORIAL (Jika Naskah Iklan) */}
      {article.is_advertorial && (
        <section
          aria-label="Pemberitahuan Advertorial"
          className="rounded-2xl bg-amber-50 border-2 border-amber-300 p-5 sm:p-6 text-amber-950 shadow-xs space-y-1.5"
        >
          <div className="flex items-center gap-2 font-black text-amber-950 text-sm sm:text-base">
            <span className="text-xl">📢</span>
            <span>TRANSPARANSI KONTEN ADVERTORIAL (IKLAN MITRA)</span>
          </div>
          <p className="text-xs sm:text-sm text-amber-900 leading-relaxed">
            Artikel ini merupakan konten kemitraan komersial berbayar yang dipublikasikan secara terbuka sesuai prinsip Pedoman Pemberitaan Media Siber (PPMS) butir 4 mengenai pembedaan tegas antara berita dan iklan komersial.
          </p>
        </section>
      )}

      {/* 5. BLOK ALERT RALAT (Correction Log - WAJIB PPMS) */}
      {hasCorrections && (
        <section
          aria-label="Catatan Ralat Berita"
          className="rounded-2xl bg-rose-50 border-2 border-rose-300 p-6 sm:p-7 space-y-3 shadow-xs"
        >
          <div className="flex items-center gap-2 text-rose-950 font-black text-base sm:text-lg border-b border-rose-200 pb-2.5">
            <span className="text-2xl">⚠️</span>
            <span>[RALAT BERITA & TRANSPARANSI KOREKSI REDAKSI]</span>
          </div>

          <p className="text-xs sm:text-sm text-rose-950 leading-relaxed">
            Sesuai butir 5 Pedoman Pemberitaan Media Siber (PPMS), setiap ralat dan koreksi atas kekeliruan fakta wajib ditautkan pada berita yang bersangkutan dengan mencantumkan alasan serta waktu ralat dilakukan secara terbuka.
          </p>

          <div className="space-y-3 pt-1">
            {corrections.map((corr, idx) => (
              <div
                key={corr.id || idx}
                className="bg-white p-4 rounded-xl border border-rose-200 text-xs sm:text-sm text-slate-800 space-y-1.5 shadow-2xs"
              >
                <div className="flex flex-wrap justify-between items-center text-[11px] text-slate-500 font-mono border-b border-slate-100 pb-1">
                  <span className="font-bold text-rose-800">Catatan Ralat #{idx + 1}</span>
                  <span>Waktu Ralat: {formatDateTimeWIB(corr.created_at)}</span>
                </div>
                <p className="font-semibold text-rose-900 leading-snug pt-0.5">
                  &ldquo;{corr.reason}&rdquo;
                </p>
                {corr.editor?.name && (
                  <p className="text-[11px] text-slate-600">
                    Diverifikasi & disahkan oleh Editor:{" "}
                    <span className="font-bold text-slate-900">
                      {corr.editor.name}
                    </span>
                  </p>
                )}
              </div>
            ))};
          </div>
        </section>
      )}

      {/* 6. ISI NASKAH ARTIKEL LENGKAP */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 lg:p-14 shadow-sm space-y-6">
        <div className="text-slate-800 leading-[2] sm:leading-[2.1] text-base sm:text-lg space-y-6">
          {paragraphs.map((paragraph, index) => (
            <p
              key={index}
              className={`text-justify sm:text-left ${
                index === 0 ? "drop-cap font-medium text-slate-900" : ""
              }`}
            >
              {paragraph}
            </p>
          ))}
        </div>

        {/* Footer Berbagi Artikel */}
        <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-slate-500">
            Suka dengan artikel ini? Bagikan kepada rekan dan keluarga:
          </div>
          <ShareButtons title={article.title} />
        </div>
      </div>

      {/* 7. FORMULIR HAK JAWAB & KOREKSI REDAKSI (Kepatuhan Butir 5 PPMS & UU Pers) */}
      <HakJawabForm articleId={article.id} articleTitle={article.title} />

      {/* 8. KOLOM KOMENTAR PUBLIK (Kepatuhan Butir 6 PPMS & Moderasi UGC) */}
      <CommentSection articleId={article.id} />

      {/* 9. NAVIGASI KEMBALI */}
      <div className="flex justify-between items-center px-2 pt-4 text-xs font-bold text-red-700">
        <Link href="/" className="hover:underline flex items-center gap-1">
          <span>←</span> Kembali ke Beranda
        </Link>
        <Link href="/tentang-kami" className="hover:underline flex items-center gap-1">
          Box Redaksi & Kepatuhan PPMS <span>→</span>
        </Link>
      </div>
    </article>
  );
}
