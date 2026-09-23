import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import "highlight.js/styles/github.css";
import { SITE_URL } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const notoSansKR = Noto_Sans_KR({
  variable: "--font-muji",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "PHJ.dev",
    template: "%s | PHJ.dev",
  },
  description: "생각과 코드 조각을 기록하는 공간",
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: SITE_URL,
    siteName: "PHJ.dev",
    title: "PHJ.dev",
    description: "생각과 코드 조각을 기록하는 공간",
  },
  twitter: {
    card: "summary_large_image",
    title: "PHJ.dev",
    description: "생각과 코드 조각을 기록하는 공간",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${geistSans.variable} ${geistMono.variable} ${notoSansKR.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
