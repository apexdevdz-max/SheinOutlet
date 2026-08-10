-- Migration: Add category attribute templates table
-- Allows defining default characteristics per subcategory

CREATE TABLE IF NOT EXISTS category_attribute_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  attribute_name TEXT NOT NULL,
  attribute_values TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookup by category
CREATE INDEX IF NOT EXISTS idx_cat_attr_templates_category 
  ON category_attribute_templates(category_id);
