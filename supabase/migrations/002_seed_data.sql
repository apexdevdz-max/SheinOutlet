-- ============================================================
-- SHEIN OUTLET - Seed Data
-- Insère les catégories et produits de mock-data.ts dans Supabase
-- À exécuter dans Supabase Dashboard > SQL Editor
-- APRÈS avoir exécuté schema.sql et 001_optimization_indexes.sql
-- ============================================================

-- ──────────────────────────────────────────────
-- CATEGORIES
-- On utilise des UUIDs déterministes pour pouvoir
-- les référencer dans les produits
-- ──────────────────────────────────────────────

INSERT INTO categories (id, name, slug, image_url, parent_id, display_order) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'FEMME', 'femme', '/images/cat-femme.jpg', NULL, 1),
  ('a0000000-0000-0000-0000-000000000002', 'HOMME', 'homme', '/images/cat-homme.jpg', NULL, 2),
  ('a0000000-0000-0000-0000-000000000003', 'CHAUSSURES', 'chaussures', '/images/cat-chaussures.jpg', NULL, 3),
  ('a0000000-0000-0000-0000-000000000004', 'SACS & ACCESSOIRES', 'sacs-accessoires', '/images/cat-sacs.jpg', NULL, 4)
ON CONFLICT (slug) DO NOTHING;

-- Sub-categories (parent_id references above)
INSERT INTO categories (id, name, slug, image_url, parent_id, display_order) VALUES
  -- Femme sub-cats
  ('a0000000-0000-0000-0000-000000000005', 'Robes', 'robes', '/images/sub-robes.jpg', 'a0000000-0000-0000-0000-000000000001', 1),
  ('a0000000-0000-0000-0000-000000000006', 'Tops', 'tops', '/images/sub-tops.jpg', 'a0000000-0000-0000-0000-000000000001', 2),
  ('a0000000-0000-0000-0000-000000000007', 'Pantalons', 'pantalons', '/images/sub-pantalons.jpg', 'a0000000-0000-0000-0000-000000000001', 3),
  ('a0000000-0000-0000-0000-000000000008', 'Jupes', 'jupes', '/images/sub-jupes.jpg', 'a0000000-0000-0000-0000-000000000001', 4),
  ('a0000000-0000-0000-0000-000000000009', 'Lingerie & Bain', 'lingerie-bain', '/images/sub-lingerie.jpg', 'a0000000-0000-0000-0000-000000000001', 5),
  ('a0000000-0000-0000-0000-000000000010', 'Bijoux', 'bijoux', '/images/sub-bijoux.jpg', 'a0000000-0000-0000-0000-000000000001', 6),
  -- Homme sub-cats
  ('a0000000-0000-0000-0000-000000000011', 'T-Shirts', 'tshirts-homme', '/images/sub-tshirts.jpg', 'a0000000-0000-0000-0000-000000000002', 1),
  ('a0000000-0000-0000-0000-000000000012', 'Pantalons', 'pantalons-homme', '/images/sub-pantalons-h.jpg', 'a0000000-0000-0000-0000-000000000002', 2),
  ('a0000000-0000-0000-0000-000000000013', 'Vestes', 'vestes-homme', '/images/sub-vestes.jpg', 'a0000000-0000-0000-0000-000000000002', 3),
  -- Chaussures sub-cats
  ('a0000000-0000-0000-0000-000000000014', 'Sneakers', 'sneakers', '/images/sub-sneakers.jpg', 'a0000000-0000-0000-0000-000000000003', 1),
  ('a0000000-0000-0000-0000-000000000015', 'Talons', 'talons', '/images/sub-talons.jpg', 'a0000000-0000-0000-0000-000000000003', 2),
  -- Sacs sub-cats
  ('a0000000-0000-0000-0000-000000000016', 'Sacs à main', 'sacs-a-main', '/images/sub-sacs.jpg', 'a0000000-0000-0000-0000-000000000004', 1),
  ('a0000000-0000-0000-0000-000000000017', 'Lunettes', 'lunettes', '/images/sub-lunettes.jpg', 'a0000000-0000-0000-0000-000000000004', 2)
ON CONFLICT (slug) DO NOTHING;


-- ──────────────────────────────────────────────
-- PRODUCTS
-- ──────────────────────────────────────────────

INSERT INTO products (id, name, slug, description, price, old_price, images, category_id, sizes, colors, is_flash_sale, is_best_seller, stock, created_at) VALUES
(
  'b0000000-0000-0000-0000-000000000001',
  'Robe Élégante Rose Pastel',
  'robe-elegante-rose-pastel',
  'Robe élégante en tissu fluide, coupe ajustée avec finitions soignées. Parfaite pour les occasions spéciales et les soirées.',
  1800, 3000,
  ARRAY['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80'],
  'a0000000-0000-0000-0000-000000000005',
  ARRAY['S','M','L','XL'],
  ARRAY['Rose','Noir','Blanc'],
  TRUE, TRUE, 45,
  '2025-01-15T10:00:00Z'
),
(
  'b0000000-0000-0000-0000-000000000002',
  'Lunettes de Soleil Aviateur',
  'lunettes-soleil-aviateur',
  'Lunettes de soleil style aviateur avec verres polarisés et monture dorée légère. Protection UV400.',
  350, 700,
  ARRAY['https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80'],
  'a0000000-0000-0000-0000-000000000017',
  ARRAY['Unique'],
  ARRAY['Doré','Argenté','Noir'],
  TRUE, TRUE, 120,
  '2025-01-14T10:00:00Z'
),
(
  'b0000000-0000-0000-0000-000000000003',
  'Sac à Main Chaîne Dorée',
  'sac-main-chaine-doree',
  'Sac à main élégant avec chaîne dorée, cuir synthétique premium. Compartiment principal spacieux avec poche intérieure zippée.',
  1400, 2000,
  ARRAY['https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=800&q=80'],
  'a0000000-0000-0000-0000-000000000016',
  ARRAY['Unique'],
  ARRAY['Rose','Noir','Beige'],
  TRUE, TRUE, 30,
  '2025-01-13T10:00:00Z'
),
(
  'b0000000-0000-0000-0000-000000000004',
  'Sneakers Blanches Classic',
  'sneakers-blanches-classic',
  'Baskets blanches classiques en cuir synthétique. Semelle confortable et design intemporel qui s''accorde avec tout.',
  1950, 3000,
  ARRAY['https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80'],
  'a0000000-0000-0000-0000-000000000014',
  ARRAY['36','37','38','39','40','41','42'],
  ARRAY['Blanc','Blanc/Rose'],
  TRUE, TRUE, 60,
  '2025-01-12T10:00:00Z'
),
(
  'b0000000-0000-0000-0000-000000000005',
  'Top Crop Rose Tendance',
  'top-crop-rose-tendance',
  'Crop top tendance en coton doux. Coupe ajustée, idéal pour un look décontracté et stylé.',
  650, 1200,
  ARRAY['https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&q=80'],
  'a0000000-0000-0000-0000-000000000006',
  ARRAY['XS','S','M','L'],
  ARRAY['Rose','Blanc','Noir'],
  FALSE, TRUE, 80,
  '2025-01-11T10:00:00Z'
),
(
  'b0000000-0000-0000-0000-000000000006',
  'Jupe Plissée Mi-Longue',
  'jupe-plissee-mi-longue',
  'Jupe plissée élégante mi-longue, taille élastique confortable. Tissu fluide et léger.',
  1200, 1800,
  ARRAY['https://images.unsplash.com/photo-1583496924844-3d1918a55c27?w=800&q=80'],
  'a0000000-0000-0000-0000-000000000008',
  ARRAY['S','M','L','XL'],
  ARRAY['Rose','Noir','Bleu Marine'],
  FALSE, TRUE, 55,
  '2025-01-10T10:00:00Z'
),
(
  'b0000000-0000-0000-0000-000000000007',
  'Veste Jean Oversize',
  'veste-jean-oversize',
  'Veste en jean oversize délavée. Look décontracté avec poches avant et boutons métalliques.',
  2500, 4000,
  ARRAY['https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&q=80'],
  'a0000000-0000-0000-0000-000000000013',
  ARRAY['M','L','XL','XXL'],
  ARRAY['Bleu Clair','Bleu Foncé'],
  TRUE, FALSE, 25,
  '2025-01-09T10:00:00Z'
),
(
  'b0000000-0000-0000-0000-000000000008',
  'Ensemble Jogging Femme',
  'ensemble-jogging-femme',
  'Ensemble jogging confortable en coton mélangé. Sweat à capuche et pantalon assorti.',
  2200, 3500,
  ARRAY['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80'],
  'a0000000-0000-0000-0000-000000000007',
  ARRAY['S','M','L','XL'],
  ARRAY['Rose','Gris','Noir'],
  FALSE, TRUE, 35,
  '2025-01-08T10:00:00Z'
),
(
  'b0000000-0000-0000-0000-000000000009',
  'T-Shirt Imprimé Homme',
  'tshirt-imprime-homme',
  'T-shirt en coton 100% avec impression graphique tendance. Coupe regular fit.',
  500, 900,
  ARRAY['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80'],
  'a0000000-0000-0000-0000-000000000011',
  ARRAY['S','M','L','XL','XXL'],
  ARRAY['Blanc','Noir','Gris'],
  TRUE, FALSE, 100,
  '2025-01-07T10:00:00Z'
),
(
  'b0000000-0000-0000-0000-000000000010',
  'Escarpins Talons Nude',
  'escarpins-talons-nude',
  'Escarpins à talons hauts (8cm) en similicuir nude. Bout pointu élégant, semelle intérieure rembourrée.',
  1500, 2600,
  ARRAY['https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80'],
  'a0000000-0000-0000-0000-000000000015',
  ARRAY['36','37','38','39','40'],
  ARRAY['Nude','Noir','Rouge'],
  FALSE, TRUE, 40,
  '2025-01-06T10:00:00Z'
),
(
  'b0000000-0000-0000-0000-000000000011',
  'Bague Papillon Cristal',
  'bague-papillon-cristal',
  'Bague ajustable en alliage doré avec papillon en cristal. Bijou délicat et féminin.',
  250, 500,
  ARRAY['https://images.unsplash.com/photo-1605100804763-247f67963c9e?w=800&q=80'],
  'a0000000-0000-0000-0000-000000000010',
  ARRAY['Unique'],
  ARRAY['Doré','Argenté'],
  TRUE, FALSE, 200,
  '2025-01-05T10:00:00Z'
),
(
  'b0000000-0000-0000-0000-000000000012',
  'Pantalon Cargo Kaki Homme',
  'pantalon-cargo-kaki-homme',
  'Pantalon cargo en toile robuste avec poches latérales. Coupe décontractée et confortable.',
  1800, 2800,
  ARRAY['https://images.unsplash.com/photo-1555689502-c4b22d76c56f?w=800&q=80'],
  'a0000000-0000-0000-0000-000000000012',
  ARRAY['M','L','XL','XXL'],
  ARRAY['Kaki','Noir','Beige'],
  FALSE, FALSE, 45,
  '2025-01-04T10:00:00Z'
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  old_price = EXCLUDED.old_price,
  images = EXCLUDED.images,
  category_id = EXCLUDED.category_id,
  sizes = EXCLUDED.sizes,
  colors = EXCLUDED.colors,
  is_flash_sale = EXCLUDED.is_flash_sale,
  is_best_seller = EXCLUDED.is_best_seller,
  stock = EXCLUDED.stock;
