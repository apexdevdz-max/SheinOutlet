-- Migration 009: Add dynamic attributes JSONB column to products
-- Replaces the rigid sizes/colors/sizes_label system with a flexible array of {label, values}
-- Example: [{"label": "Stockage", "values": ["128GB", "256GB"]}, {"label": "Couleur", "values": ["Noir", "Blanc"]}]
ALTER TABLE products ADD COLUMN IF NOT EXISTS attributes JSONB DEFAULT '[]';

-- Migrate existing data: convert sizes+sizes_label and colors into attributes JSON
UPDATE products SET attributes = (
  CASE
    WHEN (sizes IS NOT NULL AND array_length(sizes, 1) > 0) AND (colors IS NOT NULL AND array_length(colors, 1) > 0) THEN
      jsonb_build_array(
        jsonb_build_object('label', COALESCE(sizes_label, 'Taille'), 'values', to_jsonb(sizes)),
        jsonb_build_object('label', 'Couleur', 'values', to_jsonb(colors))
      )
    WHEN (sizes IS NOT NULL AND array_length(sizes, 1) > 0) THEN
      jsonb_build_array(
        jsonb_build_object('label', COALESCE(sizes_label, 'Taille'), 'values', to_jsonb(sizes))
      )
    WHEN (colors IS NOT NULL AND array_length(colors, 1) > 0) THEN
      jsonb_build_array(
        jsonb_build_object('label', 'Couleur', 'values', to_jsonb(colors))
      )
    ELSE '[]'::jsonb
  END
)
WHERE attributes = '[]'::jsonb OR attributes IS NULL;
