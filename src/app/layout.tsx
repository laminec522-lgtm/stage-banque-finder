import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Suivi de dossiers – Cabinet comptable",
  description: "Application personnelle de suivi des dossiers au cabinet comptable",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="bg-gray-50 min-h-screen">{children}</body>
    </html>
  );
}
