import Link from "next/link";
import { getRedaksiData } from "@/lib/api";

export default async function Footer() {
  const redaksi = await getRedaksiData();

  return (
    <footer className="bg-neutral-900 text-neutral-300 border-t-4 border-blue-700 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
          {/* Kolom Kiri: Profil Media */}
          <div className="space-y-4">
            <div className="flex flex-col">
              <span className="text-2xl font-black text-white tracking-tight uppercase">
                RADAR <span className="text-blue-500">BERITA</span>
              </span>
              <span className="text-xs uppercase tracking-wider text-neutral-400 font-medium">
                Portal Jurnalisme Siber PPMS
              </span>
            </div>
            <p className="text-sm leading-relaxed text-neutral-400">
              Media siber independen yang menjunjung tinggi Undang-Undang Pers No. 40 Tahun 1999, Kode Etik Jurnalistik (KEJ), dan Pedoman Pemberitaan Media Siber (PPMS) Dewan Pers.
            </p>
            <div className="pt-2 text-xs text-neutral-400">
              <p>© {new Date().getFullYear()} Radar Berita Siber. Seluruh hak cipta dilindungi.</p>
            </div>
          </div>

          {/* Kolom Tengah: Box Redaksi Dinamis */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white border-b border-neutral-700 pb-2">
              Box Redaksi (Penanggung Jawab)
            </h3>
            <div className="space-y-2.5 text-xs text-neutral-300">
              <div>
                <span className="text-neutral-400 block text-[11px] uppercase">Pemimpin Redaksi / Penanggung Jawab:</span>
                <span className="font-semibold text-white">{redaksi.editor_in_chief}</span>
              </div>
              <div>
                <span className="text-neutral-400 block text-[11px] uppercase">Susunan Tim Redaksi:</span>
                <span className="text-neutral-300 leading-snug">{redaksi.team}</span>
              </div>
              <div>
                <span className="text-neutral-400 block text-[11px] uppercase">Alamat Kantor:</span>
                <span className="text-neutral-300 leading-snug">{redaksi.office_address}</span>
              </div>
              <div className="pt-1 flex flex-col sm:flex-row sm:gap-4 gap-1 text-[11px]">
                <div>
                  <span className="text-neutral-400">Email: </span>
                  <a href={`mailto:${redaksi.email}`} className="text-blue-400 hover:underline">
                    {redaksi.email}
                  </a>
                </div>
                <div>
                  <span className="text-neutral-400">Telepon: </span>
                  <span className="text-neutral-200">{redaksi.phone}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Tautan Kepatuhan PPMS & Layanan */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white border-b border-neutral-700 pb-2">
              Kepatuhan & Regulasi
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/tentang-kami"
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <span className="text-blue-500">›</span> Tentang Kami & Visi Misi
                </Link>
              </li>
              <li>
                <a
                  href="https://dewanpers.or.id/kebijakan/peraturan/detail/197/pedoman-pemberitaan-media-siber"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <span className="text-blue-500">›</span> Pedoman Pemberitaan Media Siber (PPMS)
                </a>
              </li>
              <li>
                <Link
                  href="/tentang-kami#hak-jawab"
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <span className="text-blue-500">›</span> Mekanisme Ralat & Hak Jawab
                </Link>
              </li>
              <li>
                <Link
                  href="/tentang-kami#tos"
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <span className="text-blue-500">›</span> Ketentuan Layanan (ToS) & Moderasi UGC
                </Link>
              </li>
            </ul>

            <div className="mt-4 p-3 rounded-md bg-neutral-800/80 border border-neutral-700/60 text-[11px] text-neutral-400">
              Masyarakat berhak mengajukan hak jawab, ralat, atau koreksi atas kekeliruan berita sesuai Pasal 5 UU Pers.
            </div>
          </div>
        </div>

        {/* Bottom Bar: ATURAN MUTLAK Nomor Versi */}
        <div className="mt-12 pt-6 border-t border-neutral-800 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-neutral-400">
          <div>
            <span>Standar Kepatuhan Siber Dewan Pers Republik Indonesia</span>
          </div>
          <div className="font-mono text-neutral-400 font-semibold bg-neutral-800 px-3 py-1 rounded-sm border border-neutral-700">
            Versi Aplikasi: 0.11
          </div>
        </div>
      </div>
    </footer>
  );
}
