-- Migration 012: Convert images column from TEXT[] to JSONB
-- Old format: TEXT[] with plain URL strings: '{"url1", "url2"}'
-- New format: JSONB array of objects: [{"url": "url1", "colorTags": []}, ...]
--
-- Step 1: Add a temporary JSONB column
ALTER TABLE products ADD COLUMN IF NOT EXISTS images_jsonb JSONB;

-- Step 2: Migrate existing TEXT[] data to JSONB format
-- Each string URL becomes {"url": "the_url", "colorTags": []}
UPDATE products SET images_jsonb = (
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object('url', elem, 'colorTags', '[]'::jsonb)
    ),
    '[]'::jsonb
  )
  FROM unnest(images) AS elem
)
WHERE images IS NOT NULL AND array_length(images, 1) > 0;

-- Set default for products with no images
UPDATE products SET images_jsonb = '[]'::jsonb WHERE images_jsonb IS NULL;

-- Step 3: Drop old column and rename new one
ALTER TABLE products DROP COLUMN images;
ALTER TABLE products RENAME COLUMN images_jsonb TO images;

-- Step 4: Set default for new rows
ALTER TABLE products ALTER COLUMN images SET DEFAULT '[]'::jsonb;
