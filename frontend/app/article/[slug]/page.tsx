import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticleBySlug, formatDateTimeWIB } from "@/lib/api";
import ShareButtons from "@/components/ShareButtons";

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

  const corrections = article.corrections || [];
  const hasCorrections = corrections.length > 0;
  const isEdited = hasCorrections || article.updated_at !== article.created_at;

  // Ekstrak lead paragraph atau teaser singkat
  const paragraphs = article.content.split("\n\n").filter((p) => p.trim() !== "");
  const leadParagraph = paragraphs.length > 0 ? paragraphs[0] : "";
  const remainingParagraphs = paragraphs.length > 1 ? paragraphs.slice(1) : [];

  // Inisial untuk avatar wartawan
  const authorName = article.author?.name || "Redaksi";
  const authorInitials = authorName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <article className="max-w-4xl mx-auto space-y-8">
      {/* Navigasi Breadcrumbs */}
      <nav className="text-xs text-slate-500 flex flex-wrap items-center gap-2 px-1">
        <Link href="/" className="hover:text-blue-700 transition-colors font-medium">
          Beranda
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-500 font-medium">
          {article.is_advertorial ? "Kanal Advertorial" : "Kanal Redaksi"}
        </span>
        <span className="text-slate-300">/</span>
        <span className="text-slate-700 font-medium truncate max-w-xs sm:max-w-md">
          {article.title}
        </span>
      </nav>

      {/* HEADER UTAMA BERITA (Hero Header dengan Kontras Tinggi & Menarik) */}
      <header className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-10 lg:p-12 space-y-7">
        {/* Baris Kategori & Tag Kepatuhan */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-5">
          <div className="flex flex-wrap items-center gap-2.5">
            {article.is_advertorial ? (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 uppercase tracking-wider border border-amber-400 shadow-2xs">
                <span>📢</span> IKLAN BERBAYAR / ADVERTORIAL
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-blue-700 text-white uppercase tracking-wider shadow-2xs">
                <span>📰</span> Warta Berita Redaksi
              </span>
            )}

            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              PPMS Terverifikasi
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span>⏱️ ±2 Menit Baca</span>
          </div>
        </div>

        {/* JUDUL BESAR & MENONJOL (High-Impact Typography) */}
        <div className="space-y-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-950 tracking-tight leading-[1.2] sm:leading-[1.18]">
            {article.title}
          </h1>

          {/* Lead Deck / Teaser Rangkuman yang Memikat */}
          {leadParagraph && (
            <p className={`text-base sm:text-lg lg:text-xl font-normal leading-relaxed ${
              article.is_advertorial
                ? "text-amber-950/80 border-l-4 border-amber-400 pl-4 py-0.5"
                : "text-slate-600 border-l-4 border-blue-600 pl-4 py-0.5"
            }`}>
              {leadParagraph}
            </p>
          )}
        </div>

        {/* METADATA WARTAWAN, EDITOR, TIMESTAMP, DAN TOMBOL SHARE */}
        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Info Wartawan & Waktu */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-blue-700 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
              {authorInitials}
            </div>

            <div className="text-xs sm:text-sm">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900">{authorName}</span>
                <span className="text-[11px] text-blue-700 font-semibold bg-blue-50 px-1.5 py-0.5 rounded-xs" title="Jurnalis Terverifikasi Dewan Pers">
                  ✓ Wartawan
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-slate-500 text-xs pt-0.5">
                <span>
                  <strong className="text-slate-700 font-medium">Tayang:</strong>{" "}
                  {formatDateTimeWIB(article.created_at)}
                </span>

                {isEdited && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span className="text-amber-800 font-medium bg-amber-50 px-2 py-0.5 rounded-sm border border-amber-200">
                      🕒 <strong className="font-semibold">Diperbarui:</strong>{" "}
                      {formatDateTimeWIB(article.updated_at)}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Tombol Bagikan Cepat */}
          <ShareButtons title={article.title} />
        </div>
      </header>

      {/* BANNER DISCLAIMER ADVERTORIAL (Jika Naskah adalah Iklan Komersial) */}
      {article.is_advertorial && (
        <section
          aria-label="Pemberitahuan Advertorial"
          className="rounded-2xl bg-amber-50/90 border-2 border-amber-300 p-5 sm:p-6 text-amber-950 shadow-xs space-y-1.5"
        >
          <div className="flex items-center gap-2 font-bold text-amber-950 text-sm sm:text-base">
            <span className="text-xl">📢</span>
            <span>TRANSPARANSI KONTEN ADVERTORIAL (IKLAN MITRA)</span>
          </div>
          <p className="text-xs sm:text-sm text-amber-900 leading-relaxed">
            Artikel ini merupakan konten kemitraan komersial berbayar yang dipublikasikan secara terbuka sesuai prinsip Pedoman Pemberitaan Media Siber (PPMS) butir 4 mengenai pembedaan tegas antara berita dan iklan. Isi materi promosi menjadi tanggung jawab penyedia layanan terkait.
          </p>
        </section>
      )}

      {/* BLOK ALERT RALAT (Correction Log - WAJIB PPMS) */}
      {hasCorrections && (
        <section
          aria-label="Catatan Ralat Berita"
          className="rounded-2xl bg-rose-50/90 border-2 border-rose-300 p-6 sm:p-7 space-y-3 shadow-xs"
        >
          <div className="flex items-center gap-2 text-rose-950 font-bold text-base sm:text-lg border-b border-rose-200 pb-2.5">
            <span className="text-2xl">⚠️</span>
            <span>[RALAT BERITA & TRANSPARANSI KOREKSI REDAKSI]</span>
          </div>

          <p className="text-xs sm:text-sm text-rose-950 leading-relaxed">
            Sesuai butir 5 Pedoman Pemberitaan Media Siber (PPMS), setiap ralat dan koreksi atas kekeliruan fakta wajib ditautkan pada berita yang bersangkutan dengan mencantumkan alasan serta waktu ralat dilakukan.
          </p>

          <div className="space-y-3 pt-1">
            {corrections.map((corr, idx) => (
              <div
                key={corr.id || idx}
                className="bg-white/95 p-4 rounded-xl border border-rose-200 text-xs sm:text-sm text-slate-800 space-y-1.5 shadow-2xs"
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
                    <span className="font-semibold text-slate-900">
                      {corr.editor.name}
                    </span>
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ISI ARTIKEL UTAMA (Tipografi Surat Kabar yang Nyaman dan Menyenangkan) */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 lg:p-14 shadow-sm space-y-8">
        <div className="text-slate-800 leading-[1.9] sm:leading-[2.05] text-base sm:text-lg font-normal space-y-6">
          {remainingParagraphs.length > 0 ? (
            remainingParagraphs.map((paragraph, index) => (
              <p key={index} className="text-justify sm:text-left">
                {paragraph}
              </p>
            ))
          ) : (
            <p className="text-justify sm:text-left">
              {article.content}
            </p>
          )}
        </div>

        {/* Baris Berbagi di Akhir Naskah */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-slate-500">
            Suka dengan artikel ini? Bagikan kepada rekan dan keluarga Anda:
          </div>
          <ShareButtons title={article.title} />
        </div>

        {/* HAK JAWAB & FOOTER ARTIKEL SESUAI PPMS */}
        <div className="mt-10 pt-6 border-t border-slate-200 bg-slate-50/80 -mx-6 sm:-mx-10 lg:-mx-14 -mb-6 sm:-mb-10 lg:-mb-14 p-6 sm:p-10 rounded-b-3xl space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1 text-xs text-slate-600">
              <strong className="text-slate-900 font-bold block text-sm sm:text-base flex items-center gap-1.5">
                <span>⚖️</span> Hak Jawab & Klarifikasi Publik
              </strong>
              <p className="max-w-xl leading-relaxed">
                Bagi narasumber atau masyarakat yang merasa dirugikan oleh materi pemberitaan ini, Anda berhak mengajukan klarifikasi, ralat fakta, atau Hak Jawab sesuai Pasal 5 UU Pers No. 40/1999 dan Pedoman Pemberitaan Media Siber.
              </p>
            </div>
            <Link
              href="/tentang-kami#hak-jawab"
              className="whitespace-nowrap px-5 py-2.5 bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
            >
              <span>Ajukan Hak Jawab</span>
              <span>↗</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Navigasi Kembali */}
      <div className="flex justify-between items-center px-2 text-xs font-semibold text-blue-700">
        <Link href="/" className="hover:underline flex items-center gap-1">
          <span>←</span> Kembali ke Beranda Utama
        </Link>
        <Link href="/tentang-kami" className="hover:underline flex items-center gap-1">
          Box Redaksi & PPMS <span>→</span>
        </Link>
      </div>
    </article>
  );
}
