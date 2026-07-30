import { getMockProductBySlug, MOCK_PRODUCTS } from "@/lib/mock-data";
import { formatPrice, getDiscountPercent } from "@/lib/data";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProductDetailClient } from "./ProductDetailClient";

export const revalidate = 3600;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getMockProductBySlug(slug);
  if (!product) return { title: "Produit non trouvé" };

  const discount = getDiscountPercent(product.price, product.old_price);

  return {
    title: `${product.name} - ${formatPrice(product.price)} | SHEIN Outlet Algérie`,
    description: `${product.description.slice(0, 150)}${discount ? ` -${discount}% de réduction !` : ""} Livraison partout en Algérie. Paiement à la livraison.`,
    openGraph: {
      title: `${product.name} - ${formatPrice(product.price)}`,
      description: product.description.slice(0, 200),
      type: "website",
      locale: "fr_DZ",
      images: product.images[0]
        ? [{ url: product.images[0], width: 600, height: 800, alt: product.name }]
        : [],
    },
  };
}

export async function generateStaticParams() {
  return MOCK_PRODUCTS.map((p) => ({ slug: p.slug }));
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = getMockProductBySlug(slug);
  if (!product) notFound();

  return <ProductDetailClient product={product} />;
}
