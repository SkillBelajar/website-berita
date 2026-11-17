export interface Author {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface CorrectionLog {
  id: number;
  article_id: number;
  editor_id: number;
  editor?: Author;
  reason: string;
  created_at: string;
}

export interface Article {
  id: number;
  title: string;
  slug: string;
  content: string;
  author_id: number;
  author?: Author;
  is_advertorial: boolean;
  created_at: string;
  updated_at: string;
  corrections?: CorrectionLog[];
}

export interface RedaksiInfo {
  id?: number;
  editor_in_chief: string;
  team: string;
  office_address: string;
  email: string;
  phone: string;
}

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

const candidateBases = [
  API_BASE_URL,
  "http://localhost:8383/api/v1",
  "http://backend:8080/api/v1",
];

export async function getRedaksiData(): Promise<RedaksiInfo> {
  for (const base of candidateBases) {
    try {
      const res = await fetch(`${base}/settings/redaksi`, {
        next: { revalidate: 60 },
      });
      if (res.ok) {
        const json = await res.json();
        if (json && json.data) {
          return json.data;
        }
      }
    } catch {
      // coba kandidat berikutnya
    }
  }

  return {
    editor_in_chief: "Dewan Redaksi Portal Berita",
    team: "Redaktur Pelaksana & Tim Jurnalistik",
    office_address: "Gedung Pers Graha Utama, Jakarta",
    email: "redaksi@berita-ppms.id",
    phone: "+62 21 555-8899",
  };
}

export async function getArticles(): Promise<Article[]> {
  for (const base of candidateBases) {
    try {
      const res = await fetch(`${base}/articles`, {
        cache: "no-store",
      });
      if (res.ok) {
        const json = await res.json();
        if (json && Array.isArray(json.data)) {
          return json.data;
        }
      }
    } catch {
      // coba kandidat berikutnya
    }
  }

  return [];
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  for (const base of candidateBases) {
    try {
      const res = await fetch(`${base}/articles/${slug}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const json = await res.json();
        if (json && json.data) {
          return json.data;
        }
      }
    } catch {
      // coba kandidat berikutnya
    }
  }

  return null;
}

export function formatDateTimeWIB(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;

    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Jakarta",
    }).format(d) + " WIB";
  } catch {
    return dateStr;
  }
}
