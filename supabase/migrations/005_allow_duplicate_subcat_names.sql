-- Migration: Allow duplicate subcategory names across different parent categories
-- Changes the UNIQUE constraint on slug from global to (slug, parent_id) composite

-- 1. Drop the existing global unique constraint on slug
ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_slug_key;

-- 2. Create a unique index that treats NULL parent_id correctly
-- This allows: femme (parent_id=NULL) and homme (parent_id=NULL) to have unique slugs
-- But also allows: accessoires (parent_id=femme_id) and accessoires (parent_id=homme_id)
CREATE UNIQUE INDEX IF NOT EXISTS categories_slug_parent_unique
  ON categories (slug, COALESCE(parent_id, '00000000-0000-0000-0000-000000000000'::uuid));
