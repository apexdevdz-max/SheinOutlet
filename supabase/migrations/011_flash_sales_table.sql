-- ============================================================
-- Migration 011: Flash Sales Campaign Table
-- ============================================================

CREATE TABLE IF NOT EXISTS flash_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL DEFAULT 'FLASH SALE',
  subtitle TEXT NOT NULL DEFAULT 'Offres limitées !',
  end_date TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_flash_sales_active ON flash_sales(is_active) WHERE is_active = true;

-- RLS
ALTER TABLE flash_sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read flash_sales" ON flash_sales
  FOR SELECT USING (true);

CREATE POLICY "Admin full access flash_sales" ON flash_sales
  FOR ALL USING (auth.role() = 'service_role');
