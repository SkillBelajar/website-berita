import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Radar Berita - Portal Jurnalisme Siber Kepatuhan PPMS",
  description: "Portal berita independen dan berimbang yang patuh pada Pedoman Pemberitaan Media Siber (PPMS) Dewan Pers Indonesia.",
};

export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-100/70 text-slate-900 font-sans selection:bg-red-100 selection:text-red-900">
        <Header />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <Suspense fallback={<div className="bg-slate-950 text-slate-400 p-8 text-center text-xs">Memuat data redaksi & kepatuhan...</div>}>
          <Footer />
        </Suspense>
      </body>
    </html>
  );
}
