-- Migration: Add show_in_header column to categories
-- Run this in your Supabase SQL Editor

ALTER TABLE categories ADD COLUMN IF NOT EXISTS show_in_header BOOLEAN DEFAULT TRUE;

-- Set subcategories (those with parent_id) to false by default
UPDATE categories SET show_in_header = FALSE WHERE parent_id IS NOT NULL;
