import Link from "next/link";
import { getRedaksiData } from "@/lib/api";

export default async function Footer() {
  const redaksi = await getRedaksiData();

  return (
    <footer className="bg-slate-950 text-slate-300 border-t-4 border-red-700 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
          {/* Kolom Kiri: Profil Media */}
          <div className="space-y-4">
            <div className="flex flex-col">
              <span className="text-2xl font-black text-white tracking-tight uppercase font-serif">
                RADAR <span className="text-red-500">BERITA</span>
              </span>
              <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">
                Portal Jurnalisme Siber PPMS
              </span>
            </div>
            <p className="text-sm leading-relaxed text-slate-400">
              Media siber independen berstandar nasional yang menjunjung tinggi Undang-Undang Pers No. 40 Tahun 1999, Kode Etik Jurnalistik (KEJ), dan Pedoman Pemberitaan Media Siber (PPMS) Dewan Pers.
            </p>
            <div className="pt-2 text-xs text-slate-400">
              <p>© {new Date().getFullYear()} Radar Berita Siber. Seluruh hak cipta dilindungi.</p>
            </div>
          </div>

          {/* Kolom Tengah: Box Redaksi Dinamis */}
          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-white border-b border-slate-800 pb-2 flex items-center gap-2">
              <span className="w-2 h-4 bg-red-600 rounded-xs"></span>
              Box Redaksi (Penanggung Jawab)
            </h3>
            <div className="space-y-2.5 text-xs text-slate-300">
              <div>
                <span className="text-slate-400 block text-[11px] uppercase font-bold">Pemimpin Redaksi / Penanggung Jawab:</span>
                <span className="font-bold text-white text-sm">{redaksi.editor_in_chief}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] uppercase font-bold">Susunan Tim Redaksi:</span>
                <span className="text-slate-300 leading-snug">{redaksi.team}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] uppercase font-bold">Alamat Kantor:</span>
                <span className="text-slate-300 leading-snug">{redaksi.office_address}</span>
              </div>
              <div className="pt-1 flex flex-col sm:flex-row sm:gap-4 gap-1 text-[11px]">
                <div>
                  <span className="text-slate-400 font-bold">Email: </span>
                  <a href={`mailto:${redaksi.email}`} className="text-red-400 hover:underline">
                    {redaksi.email}
                  </a>
                </div>
                <div>
                  <span className="text-slate-400 font-bold">Telepon: </span>
                  <span className="text-slate-200">{redaksi.phone}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Tautan Kepatuhan PPMS & Layanan */}
          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-white border-b border-slate-800 pb-2 flex items-center gap-2">
              <span className="w-2 h-4 bg-red-600 rounded-xs"></span>
              Kepatuhan & Regulasi
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/tentang-kami"
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <span className="text-red-500 font-bold">›</span> Tentang Kami & Visi Misi
                </Link>
              </li>
              <li>
                <a
                  href="https://dewanpers.or.id/kebijakan/peraturan/detail/197/pedoman-pemberitaan-media-siber"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <span className="text-red-500 font-bold">›</span> Pedoman Pemberitaan Media Siber (PPMS)
                </a>
              </li>
              <li>
                <Link
                  href="/tentang-kami#hak-jawab"
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <span className="text-red-500 font-bold">›</span> Saluran Ralat & Hak Jawab
                </Link>
              </li>
              <li>
                <Link
                  href="/panduan-pengguna"
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <span className="text-red-500 font-bold">›</span> Panduan Pembaca & Etika Komentar
                </Link>
              </li>
            </ul>

            <div className="mt-4 p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
              Masyarakat dan narasumber berhak mengajukan hak jawab, ralat, atau koreksi atas kekeliruan fakta dalam pemberitaan sesuai amanat UU Pers No. 40/1999.
            </div>
          </div>
        </div>

        {/* Bottom Bar: ATURAN MUTLAK Nomor Versi */}
        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Standar Kepatuhan Siber Dewan Pers Republik Indonesia</span>
          </div>
          <div className="font-mono text-slate-300 font-bold bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
            Versi Aplikasi: 1.2 (Sistem Foto Unggulan & Editor Base64)
          </div>
        </div>
      </div>
    </footer>
  );
}
