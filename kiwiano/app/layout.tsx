import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kiwiano — Torneos de Pádel",
  description: "Sistema de torneos de pádel mexicano con sorteo de cartas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased dark">
      <body className={`${inter.className} min-h-full flex flex-col bg-gray-950`}>{children}</body>
    </html>
  );
}
