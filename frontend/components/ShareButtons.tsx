"use client";

import { useState } from "react";

export default function ShareButtons({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleShareWA = () => {
    if (typeof window !== "undefined") {
      const url = encodeURIComponent(window.location.href);
      const text = encodeURIComponent(`${title} - Baca selengkapnya di Radar Berita: `);
      window.open(`https://api.whatsapp.com/send?text=${text}${url}`, "_blank");
    }
  };

  const handleShareX = () => {
    if (typeof window !== "undefined") {
      const url = encodeURIComponent(window.location.href);
      const text = encodeURIComponent(`${title} via @RadarBerita `);
      window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank");
    }
  };

  return (
    <div className="flex items-center gap-2 pt-2">
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 mr-1 hidden sm:inline">
        Bagikan:
      </span>
      <button
        onClick={handleShareWA}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors shadow-2xs cursor-pointer"
        title="Bagikan ke WhatsApp"
      >
        <span className="text-sm">💬</span>
        <span>WhatsApp</span>
      </button>

      <button
        onClick={handleShareX}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-300 transition-colors shadow-2xs cursor-pointer"
        title="Bagikan ke X / Twitter"
      >
        <span className="text-sm font-mono">𝕏</span>
        <span>Post</span>
      </button>

      <button
        onClick={handleCopy}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all shadow-2xs cursor-pointer ${
          copied
            ? "bg-blue-600 text-white border border-blue-600"
            : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-300"
        }`}
        title="Salin Tautan Berita"
      >
        <span>{copied ? "✓" : "🔗"}</span>
        <span>{copied ? "Tautan Tersalin!" : "Salin Link"}</span>
      </button>
    </div>
  );
}
