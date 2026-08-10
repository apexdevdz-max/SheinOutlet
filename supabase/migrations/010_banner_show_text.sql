-- Migration 010: Add show_text toggle to banners
-- Controls whether title/subtitle are displayed on the client-side carousel
ALTER TABLE banners ADD COLUMN IF NOT EXISTS show_text BOOLEAN DEFAULT true;
