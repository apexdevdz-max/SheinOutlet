-- Migration 008: Add sizes_label to products
-- Allows customizing the "Taille" label per product (e.g., "Stockage", "Capacité")
ALTER TABLE products ADD COLUMN IF NOT EXISTS sizes_label TEXT DEFAULT 'Taille';
