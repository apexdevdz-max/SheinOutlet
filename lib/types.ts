export interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string;
  parent_id: string | null;
  display_order: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  old_price: number | null;
  images: string[];
  category_id: string;
  sizes: string[];
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
