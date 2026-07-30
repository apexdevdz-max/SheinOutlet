-- ============================================================
-- SHEIN OUTLET - Supabase SQL Schema
-- Marché Algérien : COD, 58 Wilayas, Dinars Algériens (DA)
-- ============================================================

-- 1. Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  image_url TEXT DEFAULT '',
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Products Table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  price INTEGER NOT NULL,                    -- Prix en DA (entier)
  old_price INTEGER,                         -- Ancien prix barré (nullable)
  images TEXT[] DEFAULT '{}',                -- Array d'URLs Cloudinary
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  sizes TEXT[] DEFAULT '{}',
  colors TEXT[] DEFAULT '{}',
  is_flash_sale BOOLEAN DEFAULT FALSE,
  is_best_seller BOOLEAN DEFAULT FALSE,
  stock INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Orders Table (COD = Paiement à la livraison)
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_first_name TEXT NOT NULL,
  customer_last_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,              -- Format : 05/06/07 + 8 chiffres
  wilaya TEXT NOT NULL,
  commune TEXT NOT NULL,
  address TEXT NOT NULL,
  notes TEXT DEFAULT '',
  total_amount INTEGER NOT NULL,             -- Total en DA
  shipping_cost INTEGER DEFAULT 600,
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_image TEXT DEFAULT '',
  quantity INTEGER NOT NULL DEFAULT 1,
  size TEXT DEFAULT '',
  color TEXT DEFAULT '',
  unit_price INTEGER NOT NULL
);

-- ============================================================
-- INDEXES D'OPTIMISATION
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_flash_sale ON products(is_flash_sale) WHERE is_flash_sale = TRUE;
CREATE INDEX IF NOT EXISTS idx_products_best_seller ON products(is_best_seller) WHERE is_best_seller = TRUE;
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_phone ON orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- PUBLIC READ: categories & products (anyone can browse)
CREATE POLICY "Public read categories" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Public read products" ON products
  FOR SELECT USING (true);

-- PUBLIC INSERT: orders & order_items (anyone can place an order via COD)
CREATE POLICY "Public insert orders" ON orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public insert order_items" ON order_items
  FOR INSERT WITH CHECK (true);

-- ADMIN: Full access (via service_role key or authenticated admin)
-- These policies allow admin users to manage everything
CREATE POLICY "Admin full access categories" ON categories
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Admin full access products" ON products
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Admin full access orders" ON orders
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Admin full access order_items" ON order_items
  FOR ALL USING (auth.role() = 'service_role');
