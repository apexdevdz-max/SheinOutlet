import type { Metadata } from "next";
import "./globals.css";
import { BottomNav } from "@/components/BottomNav";
import { Header } from "@/components/Header";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { MainContent } from "@/components/MainContent";
import { Suspense } from "react";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: "SHEIN Outlet Algérie - Mode à Petits Prix | Livraison 69 Wilayas",
  description:
    "Découvrez les meilleures offres mode pour Femme, Homme et Accessoires. Jusqu'à -70% de réduction. Livraison partout en Algérie. Paiement à la livraison (COD).",
  keywords: "SHEIN, outlet, Algérie, mode, vêtements, pas cher, livraison, wilayas",
  openGraph: {
    title: "SHEIN Outlet Algérie - Mode à Petits Prix",
    description: "Jusqu'à -70% sur la mode. Livraison 69 Wilayas. Paiement à la livraison.",
    type: "website",
    locale: "fr_DZ",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased flex flex-col min-h-screen">
        <Suspense fallback={null}>
          <Header />
        </Suspense>
        <MainContent>{children}</MainContent>
        <BottomNav />
        <WhatsAppButton />
      </body>
    </html>
  );
}
