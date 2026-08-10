-- Migration 007: Refonte table banners (ALTER existing table)
-- Add new columns to existing banners table

-- Add new columns (IF NOT EXISTS prevents errors if run twice)
ALTER TABLE banners ADD COLUMN IF NOT EXISTS image_url TEXT NOT NULL DEFAULT '';
ALTER TABLE banners ADD COLUMN IF NOT EXISTS title TEXT NOT NULL DEFAULT '';
ALTER TABLE banners ADD COLUMN IF NOT EXISTS subtitle TEXT DEFAULT '';
ALTER TABLE banners ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE banners ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;
ALTER TABLE banners ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

-- Migrate old data: copy old columns to new ones
UPDATE banners SET
  image_url = COALESCE(image, ''),
  title = COALESCE(alt, ''),
  display_order = COALESCE("order", 0)
WHERE image_url = '' AND image IS NOT NULL;

-- Enable RLS (idempotent)
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist (ignore errors)
DROP POLICY IF EXISTS "Public read active banners" ON banners;
DROP POLICY IF EXISTS "Admin full access banners" ON banners;

-- Create new policies
CREATE POLICY "Public read active banners" ON banners
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Admin full access banners" ON banners
  FOR ALL USING (auth.role() = 'service_role');
