import { getProductBySlug, getAllProductSlugs, getRelatedProducts } from "@/lib/supabase-data";
import { formatPrice, getDiscountPercent } from "@/lib/data";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProductDetailClient } from "./ProductDetailClient";
import { MobileHeader } from "@/components/MobileHeader";

// ISR: regenerate every hour
export const revalidate = 3600;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Produit non trouvé" };

  const discount = getDiscountPercent(product.price, product.old_price);
  const canonical = `${SITE_URL}/product/${product.slug}`;

  return {
    title: `${product.name} - ${formatPrice(product.price)} | SHEIN Outlet Algérie`,
    description: `${product.description.slice(0, 150)}${discount ? ` -${discount}% de réduction !` : ""} Livraison partout en Algérie. Paiement à la livraison.`,
    alternates: {
      canonical,
    },
    openGraph: {
      title: `${product.name} - ${formatPrice(product.price)}`,
      description: product.description.slice(0, 200),
      type: "website",
      locale: "fr_DZ",
      url: canonical,
      images: product.images[0]
        ? [{ url: product.images[0].url, width: 600, height: 800, alt: product.name }]
        : [],
    },
  };
}

export async function generateStaticParams() {
  const slugs = await getAllProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

// JSON-LD Schema.org Product structured data
function ProductJsonLd({ product }: { product: { name: string; slug: string; description: string; price: number; old_price: number | null; images: { url: string }[]; stock: number } }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images[0]?.url || undefined,
    url: `${SITE_URL}/product/${product.slug}`,
    brand: {
      "@type": "Brand",
      name: "SHEIN Outlet",
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "DZD",
      price: product.price,
      availability: product.stock > 0
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "SHEIN Outlet Algérie",
      },
      ...(product.old_price && product.old_price > product.price
        ? { priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0] }
        : {}),
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const relatedProducts = await getRelatedProducts(product, 8);

  return (
    <>
      <ProductJsonLd product={product} />
      <MobileHeader />
      <ProductDetailClient product={product} relatedProducts={relatedProducts} />
    </>
  );
}
