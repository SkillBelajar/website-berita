import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticleBySlug, formatDateTimeWIB } from "@/lib/api";

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

  return (
    <article className="max-w-4xl mx-auto space-y-8">
      {/* Navigasi Breadcrumbs */}
      <nav className="text-xs text-neutral-500 flex items-center gap-2">
        <Link href="/" className="hover:text-blue-700">
          Beranda
        </Link>
        <span>/</span>
        <span className="text-neutral-400">
          {article.is_advertorial ? "Advertorial" : "Berita Redaksi"}
        </span>
        <span>/</span>
        <span className="text-neutral-800 font-medium truncate max-w-xs">
          {article.title}
        </span>
      </nav>

      {/* Header Judul & Badges */}
      <div className="space-y-4 border-b border-neutral-200 pb-6">
        <div className="flex flex-wrap items-center gap-2">
          {article.is_advertorial ? (
            <span className="px-3 py-1 rounded-sm text-xs font-black bg-amber-400 text-neutral-950 uppercase tracking-wider border border-amber-500 shadow-xs">
              IKLAN BERBAYAR / ADVERTORIAL
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-sm text-xs font-semibold bg-blue-100 text-blue-900 uppercase">
              Warta Berita Redaksi
            </span>
          )}

          <span className="text-xs text-neutral-500">
            Kepatuhan PPMS Dewan Pers
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight leading-tight">
          {article.title}
        </h1>

        {/* Metadata Timestamp & Wartawan (Wajib PPMS) */}
        <div className="pt-2 flex flex-wrap items-center justify-between text-xs sm:text-sm text-neutral-600 gap-3 bg-neutral-100/70 p-3.5 rounded-lg border border-neutral-200/80">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-neutral-900">
              Wartawan: {article.author?.name || "Redaksi"}
            </span>
            <span className="text-neutral-400">•</span>
            <span className="text-neutral-700">
              <strong className="font-semibold text-neutral-900">Dipublikasikan:</strong>{" "}
              {formatDateTimeWIB(article.created_at)}
            </span>
          </div>

          {isEdited && (
            <div className="text-amber-900 font-medium flex items-center gap-1.5 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 text-xs">
              <span>🕒</span>
              <span>
                <strong className="font-semibold">Diperbarui:</strong>{" "}
                {formatDateTimeWIB(article.updated_at)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Advertorial Disclaimer jika artikel adalah iklan */}
      {article.is_advertorial && (
        <div className="p-4 rounded-xl bg-amber-50 border-2 border-amber-300 text-amber-950 text-xs sm:text-sm flex items-start gap-3">
          <span className="text-xl">📢</span>
          <div>
            <strong className="font-bold block">PEMBERITAHUAN ADVERTORIAL:</strong>
            Materi ini merupakan konten komersial berbayar yang disajikan sesuai standar keterbukaan informasi. Redaksi tidak bertanggung jawab atas transaksi bisnis langsung yang timbul dari promosi ini.
          </div>
        </div>
      )}

      {/* BLOK ALERT RALAT (Correction Log - WAJIB PPMS) */}
      {hasCorrections && (
        <section
          aria-label="Catatan Ralat Berita"
          className="rounded-xl bg-rose-50/80 border-2 border-rose-300 p-5 sm:p-6 space-y-3 shadow-xs"
        >
          <div className="flex items-center gap-2 text-rose-900 font-bold text-base sm:text-lg border-b border-rose-200 pb-2">
            <span className="text-xl">⚠️</span>
            <span>[RALAT BERITA & TRANSPARANSI KOREKSI REDAKSI]</span>
          </div>

          <p className="text-xs sm:text-sm text-rose-950 leading-relaxed">
            Sesuai butir 5 Pedoman Pemberitaan Media Siber (PPMS), setiap ralat dan koreksi atas kekeliruan fakta wajib ditautkan pada berita yang bersangkutan dengan mencantumkan alasan serta waktu ralat dilakukan.
          </p>

          <div className="space-y-2.5 pt-1">
            {corrections.map((corr, idx) => (
              <div
                key={corr.id || idx}
                className="bg-white/90 p-3.5 rounded-lg border border-rose-200 text-xs sm:text-sm text-neutral-800 space-y-1"
              >
                <div className="flex flex-wrap justify-between items-center text-[11px] text-neutral-500 font-mono">
                  <span>Pembaruan #{idx + 1}</span>
                  <span>Waktu Ralat: {formatDateTimeWIB(corr.created_at)}</span>
                </div>
                <p className="font-semibold text-rose-900 leading-snug">
                  &ldquo;{corr.reason}&rdquo;
                </p>
                {corr.editor?.name && (
                  <p className="text-[11px] text-neutral-600">
                    Diverifikasi & disahkan oleh Editor:{" "}
                    <span className="font-medium text-neutral-900">
                      {corr.editor.name}
                    </span>
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Konten Utama Artikel dengan Tipografi Nyaman Dibaca */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-10 shadow-xs">
        <div className="text-neutral-800 leading-loose text-base sm:text-lg space-y-6 font-normal">
          {article.content.split("\n\n").map((paragraph, index) => (
            <p key={index} className="text-justify sm:text-left">
              {paragraph}
            </p>
          ))}
        </div>

        {/* Hak Jawab & Footer Artikel */}
        <div className="mt-12 pt-6 border-t border-neutral-200 bg-neutral-50 -mx-6 sm:-mx-10 -mb-6 sm:-mb-10 p-6 sm:p-8 rounded-b-2xl space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1 text-xs text-neutral-600">
              <strong className="text-neutral-900 font-semibold block text-sm">
                Hak Jawab & Koreksi Publik
              </strong>
              <p>
                Bagi narasumber atau masyarakat yang merasa dirugikan oleh materi pemberitaan ini, Anda berhak mengajukan klarifikasi atau Hak Jawab sesuai Pasal 5 UU Pers No. 40/1999.
              </p>
            </div>
            <Link
              href="/tentang-kami#hak-jawab"
              className="whitespace-nowrap px-4 py-2 bg-neutral-900 text-white hover:bg-neutral-800 text-xs font-semibold rounded-lg transition-colors shadow-xs"
            >
              Ajukan Hak Jawab ↗
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
