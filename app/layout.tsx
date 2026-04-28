import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext", "cyrillic", "cyrillic-ext"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SMRT / MONEY — Quantum Jump Protocol for Zero-Fee Global Transfers",
  description:
    "P2P global money transfer and exchange. Smart Mid-Point rates — better than banks and exchange offices. Transparent 0.2% platform fee. On-chain escrow.",
  keywords: ["P2P", "exchange", "USDT", "GEL", "Smart Rate", "zero fee", "blockchain"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      suppressHydrationWarning
      lang="en"
      className={`${inter.variable} h-full`}
    >
      <body className="flex min-h-full flex-col bg-[#050d14] antialiased">{children}</body>
    </html>
  );
}
