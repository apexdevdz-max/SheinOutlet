import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Catégories - SHEIN Outlet Algérie | Femme, Homme, Chaussures, Accessoires",
  description:
    "Parcourez toutes nos catégories : Femme, Homme, Chaussures, Sacs & Accessoires. Jusqu'à -70% de réduction. Livraison partout en Algérie.",
  openGraph: {
    title: "Catégories - SHEIN Outlet Algérie",
    description: "Femme, Homme, Chaussures, Accessoires — jusqu'à -70%. Livraison 69 Wilayas.",
    type: "website",
    locale: "fr_DZ",
  },
};

export default function CategoriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
