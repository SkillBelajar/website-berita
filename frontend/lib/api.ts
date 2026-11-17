export interface RedaksiInfo {
  id?: number;
  editor_in_chief: string;
  team: string;
  office_address: string;
  email: string;
  phone: string;
}

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export async function getRedaksiData(): Promise<RedaksiInfo> {
  const candidateUrls = [
    `${API_BASE_URL}/settings/redaksi`,
    "http://localhost:8383/api/v1/settings/redaksi",
    "http://backend:8080/api/v1/settings/redaksi",
  ];

  for (const url of candidateUrls) {
    try {
      const res = await fetch(url, {
        next: { revalidate: 60 },
      });
      if (res.ok) {
        const json = await res.json();
        if (json && json.data) {
          return json.data;
        }
      }
    } catch {
      // lanjut mencoba kandidat URL berikutnya
    }
  }

  // Fallback default jika backend belum aktif/terjangkau
  return {
    editor_in_chief: "Dewan Redaksi Portal Berita",
    team: "Redaktur Pelaksana & Tim Jurnalistik",
    office_address: "Gedung Pers Graha Utama, Jakarta",
    email: "redaksi@berita-ppms.id",
    phone: "+62 21 555-8899",
  };
}
