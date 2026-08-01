-- ============================================================
-- SHEIN OUTLET - Migration: Banners & Site Settings tables
-- À exécuter dans Supabase Dashboard > SQL Editor
-- ============================================================

-- 5. Banners Table (carousel hero)
CREATE TABLE IF NOT EXISTS banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image TEXT NOT NULL DEFAULT '',
  alt TEXT NOT NULL DEFAULT '',
  href TEXT NOT NULL DEFAULT '/',
  "order" INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Site Settings Table (key-value)
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT ''
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_banners_order ON banners("order");

-- RLS
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Public read banners (storefront displays them)
CREATE POLICY "Public read banners" ON banners
  FOR SELECT USING (true);

-- Public read settings
CREATE POLICY "Public read site_settings" ON site_settings
  FOR SELECT USING (true);

-- Admin full access
CREATE POLICY "Admin full access banners" ON banners
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Admin full access site_settings" ON site_settings
  FOR ALL USING (auth.role() = 'service_role');

-- ── Insert default settings ──
INSERT INTO site_settings (key, value) VALUES
  ('whatsappNumber', '213550000000'),
  ('defaultShippingCost', '600'),
  ('siteName', 'SHEIN Outlet Algérie'),
  ('siteDescription', 'Mode à petits prix, livrée partout en Algérie.'),
  ('contactEmail', 'contact@shein-outlet.dz'),
  ('contactPhone', '+213 5 50 00 00 00')
ON CONFLICT (key) DO NOTHING;

-- ── Insert default banners ──
INSERT INTO banners (id, image, alt, href, "order") VALUES
  ('c0000000-0000-0000-0000-000000000001', '/images/hero/banner1.png', 'Nouvelle Collection — Jusqu''à -70%', '/categories', 1),
  ('c0000000-0000-0000-0000-000000000002', '/images/hero/banner2.png', 'Édition Limitée — Jusqu''à -50%', '/?filter=promo', 2),
  ('c0000000-0000-0000-0000-000000000003', '/images/hero/banner3.png', 'Streetwear Homme — Jusqu''à -60%', '/?cat=homme', 3)
ON CONFLICT (id) DO NOTHING;
