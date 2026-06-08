import type { Metadata } from "next";
import { Inter, Geist, Geist_Mono } from "next/font/google";
import { env } from "@/lib/env";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const TITLE = "Nexora AI — Marketplace Model AI Premium";
const DESCRIPTION = "Temukan, beli, dan jual model AI premium dalam satu marketplace.";

export const metadata: Metadata = {
  metadataBase: new URL(env.SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  applicationName: "Nexora AI",
  openGraph: {
    type: "website",
    siteName: "Nexora AI",
    locale: "id_ID",
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="id"
      className={`${inter.variable} ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-base font-sans text-ink">
        {children}
      </body>
    </html>
  );
}
