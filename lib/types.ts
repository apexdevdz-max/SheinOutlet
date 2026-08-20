export interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string;
  parent_id: string | null;
  show_in_header: boolean;
  display_order: number;
}

export interface ProductAttributeValue {
  value: string;
  available: boolean;
}

export interface ProductAttribute {
  label: string;
  values: ProductAttributeValue[];
}

export interface ProductImage {
  url: string;
  colorTags: string[];
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  old_price: number | null;
  images: ProductImage[];
  category_id: string | null;
  attributes: ProductAttribute[];
  // Legacy fields (kept for backward compat, derived from attributes)
  sizes: string[];
  sizes_label: string;
  colors: string[];
  is_flash_sale: boolean;
  is_best_seller: boolean;
  stock: number;
  created_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}

export interface FavoriteItem {
  product: Product;
  addedAt: string;
}

export interface OrderFormData {
  firstName: string;
  lastName: string;
  phone: string;
  wilaya: string;
  commune: string;
  address: string;
  notes: string;
}

export interface Order {
  id: string;
  customer_first_name: string;
  customer_last_name: string;
  customer_phone: string;
  wilaya: string;
  commune: string;
  address: string;
  notes: string;
  total_amount: number;
  shipping_cost: number;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_image: string;
  quantity: number;
  size: string;
  color: string;
  unit_price: number;
}

export interface Banner {
  id: string;
  image_url: string;
  title: string;
  subtitle: string;
  href: string;
  is_active: boolean;
  show_text: boolean;
  display_order: number;
  created_at?: string;
}

export interface SiteSettings {
  whatsappNumber: string;
  defaultShippingCost: number;
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  contactPhone: string;
}

export interface CategoryAttributeTemplate {
  id: string;
  category_id: string;
  attribute_name: string;
  attribute_values: string[];
  created_at?: string;
}

export interface FlashSale {
  id: string;
  title: string;
  subtitle: string;
  end_date: string;
  is_active: boolean;
  created_at?: string;
}
