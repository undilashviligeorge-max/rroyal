import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { DevBrowserHint } from "./components/dev-browser-hint";
import { Providers } from "./providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RROYAL DEX — P2P USDT Exchange",
  description:
    "Trade USDT safely at national bank rates. P2P crypto-to-fiat matching for Georgia and beyond.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Providers>{children}</Providers>
        <DevBrowserHint />
      </body>
    </html>
  );
}
