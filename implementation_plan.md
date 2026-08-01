# Optimisation Globale : Supabase Egress, Cloudinary, SEO & Robustesse

## Contexte

Le projet est actuellement en **mode mock-data** : aucune requête Supabase n'est faite côté storefront (tout vient de `lib/mock-data.ts` importé en dur). Le schéma SQL Supabase existe mais les données ne sont pas encore utilisées dynamiquement. Les images utilisent des URLs Unsplash, pas encore Cloudinary. Le loader Cloudinary existe mais n'est pas exploité avec de vraies images. Il n'y a ni `sitemap.xml`, ni `robots.txt`, ni JSON-LD, ni `generateMetadata` sur la plupart des pages.

### Ce qui est déjà bien fait ✅
- **SSG avec ISR** sur les pages produit (`revalidate = 3600`, `generateStaticParams`)
- **`generateMetadata`** sur la page produit avec Open Graph
- **Cloudinary loader** custom déjà créé (`lib/cloudinary.ts`) avec `f_auto,q_auto,w_*`
- **Next.js Image** avec `sizes` et `loader` dans `ProductCard` et `ProductDetailClient`
- **Zustand persist** pour panier/favoris (pas de fetch Supabase pour ces données dynamiques)
- **Middleware** protège `/admin` côté serveur avec cookies
- **Schema SQL** a déjà les bons index de base (slug, category_id, flash_sale, best_seller)
- **RLS** bien configuré (public read, public insert orders, admin full via service_role)

---

## User Review Required

> [!IMPORTANT]
> **Passage Mock → Supabase** : Ce plan crée une couche de data-fetching Supabase côté serveur (`lib/supabase-data.ts`) qui remplacera progressivement `mock-data.ts`. Cependant, **les données doivent d'abord être insérées dans Supabase** (via le panel admin ou import SQL). Tant que la base est vide, le site affichera 0 produits. Voulez-vous que j'ajoute un fallback vers mock-data si la base est vide ?

> [!WARNING]
> **Variable d'environnement requise** : `NEXT_PUBLIC_SITE_URL` (ex: `https://shein-outlet.vercel.app`) est nécessaire pour les canonical URLs, sitemap, et JSON-LD. Je l'ajouterai avec un fallback `http://localhost:3000`.

---

## Proposed Changes

### A. Réduction Egress Supabase

#### [NEW] [supabase-data.ts](file:///c:/Users/internet/Desktop/sheinOutlet/lib/supabase-data.ts)
Couche d'accès données côté serveur avec :
- `getProducts({ category?, limit?, offset?, flash_sale?, best_seller? })` — select ciblé (id, name, slug, price, old_price, images[1], category_id, is_flash_sale, is_best_seller, stock, created_at) + pagination
- `getProductBySlug(slug)` — select complet pour page détail
- `getCategories()` — select ciblé (id, name, slug, parent_id, display_order)
- Chaque fonction avec gestion d'erreurs (try/catch, timeout)
- **Pas de `select('*')`** — colonnes explicites partout

#### [NEW] [search-index.json](file:///c:/Users/internet/Desktop/sheinOutlet/public/search-index.json)
Index JSON statique généré au build contenant `{id, name, slug, price, old_price, thumbnail, category_id}` pour chaque produit. Le script de génération sera dans `scripts/generate-search-index.ts` et appelé en `prebuild`.

#### [MODIFY] [page.tsx (homepage)](file:///c:/Users/internet/Desktop/sheinOutlet/app/page.tsx)
- Convertir en Server Component partiel : les données produits sont fetchées côté serveur avec ISR (`revalidate = 3600`)
- Les composants interactifs (carrousels, favoris) restent `"use client"` et reçoivent les données en props
- Supprime l'import direct de `MOCK_PRODUCTS`

#### [MODIFY] [categories/page.tsx](file:///c:/Users/internet/Desktop/sheinOutlet/app/categories/page.tsx)
- Ajouter `generateMetadata` avec titre/description dynamiques
- ISR `revalidate = 3600`

#### [MODIFY] [search/page.tsx](file:///c:/Users/internet/Desktop/sheinOutlet/app/search/page.tsx)
- Charger `search-index.json` côté client (fetch au mount, pas d'appel Supabase)
- Filtrage 100% client-side sur l'index léger

---

### B. Indexation Base de Données

#### [NEW] [supabase/migrations/001_optimization_indexes.sql](file:///c:/Users/internet/Desktop/sheinOutlet/supabase/migrations/001_optimization_indexes.sql)
Index additionnels au-delà de ceux déjà dans `schema.sql` :
```sql
-- Index composite pour listing + tri
CREATE INDEX IF NOT EXISTS idx_products_category_created ON products(category_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock) WHERE stock > 0;
CREATE INDEX IF NOT EXISTS idx_products_created_desc ON products(created_at DESC);

-- Full-text search (si recherche serveur ultérieure)
CREATE INDEX IF NOT EXISTS idx_products_name_trgm ON products USING GIN (name gin_trgm_ops);
-- Nécessite: CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Index composite pour orders admin
CREATE INDEX IF NOT EXISTS idx_orders_created_desc ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status_created ON orders(status, created_at DESC);
```

---

### C. Images / Cloudinary

#### [MODIFY] [next.config.ts](file:///c:/Users/internet/Desktop/sheinOutlet/next.config.ts)
- Ajouter `res.cloudinary.com` dans `remotePatterns`
- Garder `images.unsplash.com` pour compatibilité arrière

#### [MODIFY] [cloudinary.ts](file:///c:/Users/internet/Desktop/sheinOutlet/lib/cloudinary.ts)
- Supprimer `"use client"` (le loader est aussi utilisé côté serveur pour les metadata OG)
- Ajouter une fonction utilitaire `cloudinaryUrl(publicId, {width, quality})` pour usage hors composant Image

#### [MODIFY] [ProductCard.tsx](file:///c:/Users/internet/Desktop/sheinOutlet/components/ProductCard.tsx)
- Supprimer `unoptimized` (contre-productif, désactive toute l'optimisation Next.js Image)
- Vérifier que `sizes` est correct pour chaque contexte (grille vs carrousel)

#### [MODIFY] [ProductDetailClient.tsx](file:///c:/Users/internet/Desktop/sheinOutlet/app/product/%5Bslug%5D/ProductDetailClient.tsx)
- Ajouter `priority` sur la première image produit (above-the-fold)
- Supprimer `unoptimized` si présent
- Vérifier `sizes` pour la galerie principale vs thumbnails

---

### D. Lazy Loading

#### [MODIFY] [HeroCarousel.tsx](file:///c:/Users/internet/Desktop/sheinOutlet/components/HeroCarousel.tsx)
- Ajouter `priority` sur la première slide du hero (above-the-fold, LCP)
- Les slides suivantes restent en lazy loading par défaut

#### [MODIFY] [CategoryCarousels.tsx](file:///c:/Users/internet/Desktop/sheinOutlet/components/CategoryCarousels.tsx)
- Confirmer que les images dans les carrousels de catégories sont en lazy loading (comportement par défaut de Next Image — OK)

---

### E. SEO

#### [NEW] [app/sitemap.ts](file:///c:/Users/internet/Desktop/sheinOutlet/app/sitemap.ts)
Sitemap dynamique Next.js avec :
- Pages statiques (`/`, `/categories`, `/cart`, `/favorites`)
- Toutes les pages produit (`/product/[slug]`) avec `lastModified`
- Pages catégories filtrées

#### [NEW] [app/robots.ts](file:///c:/Users/internet/Desktop/sheinOutlet/app/robots.ts)
```
User-agent: *
Allow: /
Disallow: /admin
Disallow: /login
Sitemap: https://domain.com/sitemap.xml
```

#### [MODIFY] [product/[slug]/page.tsx](file:///c:/Users/internet/Desktop/sheinOutlet/app/product/%5Bslug%5D/page.tsx)
- Ajouter JSON-LD Schema.org `Product` (nom, prix, disponibilité, image, marque)
- Ajouter `canonical` URL dans metadata
- Enrichir OG avec `type: "og:product"`

#### [MODIFY] [categories/page.tsx](file:///c:/Users/internet/Desktop/sheinOutlet/app/categories/page.tsx)
- Ajouter `generateMetadata` pour SEO

#### [MODIFY] [layout.tsx](file:///c:/Users/internet/Desktop/sheinOutlet/app/layout.tsx)
- Ajouter `metadataBase` avec `NEXT_PUBLIC_SITE_URL`

---

### F. Backend / Robustesse

#### [NEW] [lib/supabase-admin.ts](file:///c:/Users/internet/Desktop/sheinOutlet/lib/supabase-admin.ts)
- Client Supabase avec `service_role` key pour les opérations admin (CRUD produits)
- **Uniquement importé côté serveur** (API routes ou Server Components)
- Gestion d'erreurs avec retry (1 retry après 1s)

#### [MODIFY] [.env.local](file:///c:/Users/internet/Desktop/sheinOutlet/.env.local)
- Ajouter `SUPABASE_SERVICE_ROLE_KEY` (non-public, jamais exposé au client)
- Ajouter `NEXT_PUBLIC_SITE_URL`

#### Vérifications de sécurité
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` est safe (limité par RLS)
- ✅ Pas de `service_role` key côté client
- ✅ Middleware protège `/admin` avec auth cookie

---

## Verification Plan

### Automated Tests
```bash
npx tsc --noEmit          # Zéro erreur TypeScript
npm run build             # Build complet avec SSG/ISR
```

### Manual Verification
1. Vérifier que `/sitemap.xml` et `/robots.txt` sont accessibles
2. Vérifier les JSON-LD sur les pages produit (Inspect → `<script type="application/ld+json">`)
3. Tester la recherche client-side avec `search-index.json`
4. Vérifier que les images ont les bons `srcset` via DevTools Network

---

## Actions Manuelles Requises (après implémentation)

| Action | Où | Détails |
|--------|------|---------|
| **Ajouter `SUPABASE_SERVICE_ROLE_KEY`** | `.env.local` + Netlify Dashboard | Trouvable dans Supabase > Settings > API > `service_role` (secret) |
| **Ajouter `NEXT_PUBLIC_SITE_URL`** | `.env.local` + Netlify Dashboard | Ex: `https://shein-outlet.dz` |
| **Exécuter le fichier SQL d'indexes** | Supabase Dashboard > SQL Editor | Copier-coller `supabase/migrations/001_optimization_indexes.sql` |
| **Activer l'extension pg_trgm** | Supabase Dashboard > SQL Editor | `CREATE EXTENSION IF NOT EXISTS pg_trgm;` (avant l'index GIN) |
| **Configurer Cloudinary** | Dashboard Cloudinary | Créer un dossier `shein-outlet/products` pour les images produit |
| **DNS / Domain** | Netlify + registrar | Pointer le domaine vers Netlify |
| **Insérer les produits** | Panel Admin `/admin/products` | Les produits doivent être dans Supabase pour que le SSG fonctionne |
