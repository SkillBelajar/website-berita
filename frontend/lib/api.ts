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
  featured_image?: string;
  image_caption?: string;
  author_id: number;
  author?: Author;
  is_advertorial: boolean;
  created_at: string;
  updated_at: string;
  corrections?: CorrectionLog[];
}

export interface Comment {
  id: number;
  article_id: number;
  user_id: number;
  user?: Author;
  content: string;
  status: string;
  created_at: string;
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

// Helper client & server fetcher
export async function clientFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const isClient = typeof window !== "undefined";
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  if (isClient) {
    // Di browser client, selalu gunakan relative proxy Next.js /api/v1 agar aman dari mixed content & CORS
    return fetch(`/api/v1${cleanEndpoint}`, options);
  }

  let lastError: any = null;
  for (const base of candidateBases) {
    try {
      const url = `${base}${cleanEndpoint}`;
      const res = await fetch(url, options);
      return res;
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError || new Error("Gagal menghubungi server API");
}

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

    return (
      new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Jakarta",
      }).format(d) + " WIB"
    );
  } catch {
    return dateStr;
  }
}

export interface ArticleMeta {
  imageUrl: string;
  category: string;
  readTime: string;
  photoCredit: string;
  caption: string;
}

export function getArticleMeta(article: Article): ArticleMeta {
  const slug = (article.slug || "").toLowerCase();
  const title = (article.title || "").toLowerCase();

  // Jika artikel memiliki gambar unggulan kustom (Base64 atau URL)
  if (article.featured_image && article.featured_image.trim() !== "") {
    return {
      imageUrl: article.featured_image,
      category: article.is_advertorial ? "Advertorial Berbayar" : "Warta Redaksi",
      readTime: "± 3 menit baca",
      photoCredit: article.image_caption || "Foto: Dokumentasi Redaksi Radar Berita",
      caption: article.image_caption || `Dokumentasi peliputan: ${article.title}`,
    };
  }

  if (slug.includes("jembatan") || title.includes("jembatan")) {
    return {
      imageUrl:
        "https://images.unsplash.com/photo-1545558014-8692077e9b5c?auto=format&fit=crop&w=1200&q=80",
      category: "Infrastruktur & Daerah",
      readTime: "3 menit baca",
      photoCredit: "Foto: Humas Pemda & Dokumentasi Lapangan / Antara",
      caption:
        "Pemandangan bentang jembatan penghubung strategis antardaerah pasca uji kelayakan beban struktural.",
    };
  }

  if (slug.includes("keuangan") || title.includes("keuangan") || article.is_advertorial) {
    return {
      imageUrl:
        "https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=1200&q=80",
      category: "Ekonomi & Bisnis Digital",
      readTime: "2 menit baca",
      photoCredit: "Foto: Dokumentasi Kemitraan Finansial / Getty Images",
      caption:
        "Kemudahan transaksi digital nirsentuh yang kini menjadi motor penggerak pertumbuhan UMKM lokal.",
    };
  }

  return {
    imageUrl:
      "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80",
    category: "Warta Nasional",
    readTime: "3 menit baca",
    photoCredit: "Foto: Dokumentasi Ruang Redaksi Radar Berita",
    caption:
      "Pemberitaan jurnalisme faktual dan berimbang dengan standar kepatuhan pers PPMS Dewan Pers.",
  };
}

export interface ContentBlock {
  type: "paragraph" | "image" | "h2" | "quote";
  text?: string;
  alt?: string;
  src?: string;
}

/**
 * Parser tangguh untuk konten artikel:
 * Memisahkan teks biasa, subjudul (##), kutipan (>), dan gambar Markdown/Base64 (![alt](src))
 */
export function parseArticleBlocks(content: string): ContentBlock[] {
  if (!content) return [];
  const normalized = content.replace(/\r\n/g, "\n");
  const imgRegex = /!\[(.*?)\]\((.*?)\)/g;
  const blocks: ContentBlock[] = [];
  let lastIndex = 0;
  let match;

  while ((match = imgRegex.exec(normalized)) !== null) {
    const textBefore = normalized.substring(lastIndex, match.index);
    if (textBefore.trim()) {
      const subParagraphs = textBefore.split(/\n\s*\n/);
      for (const p of subParagraphs) {
        const trimmed = p.trim();
        if (!trimmed) continue;
        if (trimmed.startsWith("## ")) {
          blocks.push({ type: "h2", text: trimmed.replace(/^##\s+/, "") });
        } else if (trimmed.startsWith("> ")) {
          blocks.push({ type: "quote", text: trimmed.replace(/^>\s+/, "") });
        } else {
          blocks.push({ type: "paragraph", text: trimmed });
        }
      }
    }

    blocks.push({
      type: "image",
      alt: match[1],
      src: match[2],
    });

    lastIndex = imgRegex.lastIndex;
  }

  const remaining = normalized.substring(lastIndex);
  if (remaining.trim()) {
    const subParagraphs = remaining.split(/\n\s*\n/);
    for (const p of subParagraphs) {
      const trimmed = p.trim();
      if (!trimmed) continue;
      if (trimmed.startsWith("## ")) {
        blocks.push({ type: "h2", text: trimmed.replace(/^##\s+/, "") });
      } else if (trimmed.startsWith("> ")) {
        blocks.push({ type: "quote", text: trimmed.replace(/^>\s+/, "") });
      } else {
        blocks.push({ type: "paragraph", text: trimmed });
      }
    }
  }

  return blocks;
}
