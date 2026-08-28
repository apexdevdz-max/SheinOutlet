import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";

import { Header } from "@/components/Header";
import { ContactDrawer } from "@/components/ContactDrawer";
import { MainContent } from "@/components/MainContent";
import { ToastContainer } from "@/components/ToastContainer";
import { FooterWrapper } from "@/components/FooterWrapper";
import { LanguageProvider } from "@/lib/i18n/context";
import type { Lang } from "@/lib/i18n/context";
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

const VALID_LANGS: Lang[] = ["fr", "en", "ar"];

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Read language preference from cookie — available on the server
  const cookieStore = await cookies();
  const cookieLang = cookieStore.get("preferred-lang")?.value;
  const lang: Lang = VALID_LANGS.includes(cookieLang as Lang)
    ? (cookieLang as Lang)
    : "fr";
  const dir = lang === "ar" ? "rtl" : "ltr";

  return (
    <html lang={lang} dir={dir}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased flex flex-col min-h-screen">
        <LanguageProvider initialLang={lang}>
          <ToastContainer />
          <Suspense fallback={null}>
            <Header />
          </Suspense>
          <MainContent>{children}</MainContent>

          <Suspense fallback={null}>
            <FooterWrapper />
          </Suspense>
          <ContactDrawer />
        </LanguageProvider>
      </body>
    </html>
  );
}
