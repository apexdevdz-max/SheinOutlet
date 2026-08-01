-- ============================================================
-- SHEIN OUTLET - Migration: Optimization Indexes
-- À exécuter dans Supabase Dashboard > SQL Editor
-- ============================================================

-- Pré-requis : extension pour recherche floue (trigram)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ──────────────────────────────────────────────
-- PRODUCTS - Index additionnels
-- ──────────────────────────────────────────────

-- Listing par catégorie trié par date (page catégorie)
CREATE INDEX IF NOT EXISTS idx_products_category_created
  ON products(category_id, created_at DESC);

-- Filtre par prix (filtres sidebar)
CREATE INDEX IF NOT EXISTS idx_products_price
  ON products(price);

-- Produits en stock uniquement
CREATE INDEX IF NOT EXISTS idx_products_in_stock
  ON products(stock) WHERE stock > 0;

-- Tri par date décroissante (nouveautés)
CREATE INDEX IF NOT EXISTS idx_products_created_desc
  ON products(created_at DESC);

-- Recherche texte floue sur le nom (trigram)
CREATE INDEX IF NOT EXISTS idx_products_name_trgm
  ON products USING GIN (name gin_trgm_ops);

-- Recherche texte floue sur la description
CREATE INDEX IF NOT EXISTS idx_products_desc_trgm
  ON products USING GIN (description gin_trgm_ops);

-- ──────────────────────────────────────────────
-- ORDERS - Index additionnels
-- ──────────────────────────────────────────────

-- Listing admin : commandes triées par date
CREATE INDEX IF NOT EXISTS idx_orders_created_desc
  ON orders(created_at DESC);

-- Filtre admin : statut + date
CREATE INDEX IF NOT EXISTS idx_orders_status_created
  ON orders(status, created_at DESC);

-- ──────────────────────────────────────────────
-- CATEGORIES - Index additionnel
-- ──────────────────────────────────────────────

-- Tri par ordre d'affichage
CREATE INDEX IF NOT EXISTS idx_categories_display_order
  ON categories(display_order);
