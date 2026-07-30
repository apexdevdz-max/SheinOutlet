"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product, CartItem, FavoriteItem } from "@/lib/types";

interface StoreState {
  // Cart
  cart: CartItem[];
  addToCart: (product: Product, size: string, color: string) => void;
  removeFromCart: (productId: string, size: string, color: string) => void;
  updateQuantity: (productId: string, size: string, color: string, quantity: number) => void;
  clearCart: () => void;
  getCartCount: () => number;
  getCartTotal: () => number;

  // Favorites
  favorites: FavoriteItem[];
  toggleFavorite: (product: Product) => void;
  isFavorite: (productId: string) => boolean;
  getFavoritesCount: () => number;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // UI
  isMobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Cart State
      cart: [],

      addToCart: (product, size, color) => {
        const { cart } = get();
        const existing = cart.find(
          (item) =>
            item.product.id === product.id &&
            item.selectedSize === size &&
            item.selectedColor === color
        );

        if (existing) {
          set({
            cart: cart.map((item) =>
              item.product.id === product.id &&
              item.selectedSize === size &&
              item.selectedColor === color
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ),
          });
        } else {
          set({
            cart: [...cart, { product, quantity: 1, selectedSize: size, selectedColor: color }],
          });
        }
      },

      removeFromCart: (productId, size, color) => {
        set({
          cart: get().cart.filter(
            (item) =>
              !(
                item.product.id === productId &&
                item.selectedSize === size &&
                item.selectedColor === color
              )
          ),
        });
      },

      updateQuantity: (productId, size, color, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(productId, size, color);
          return;
        }
        set({
          cart: get().cart.map((item) =>
            item.product.id === productId &&
            item.selectedSize === size &&
            item.selectedColor === color
              ? { ...item, quantity }
              : item
          ),
        });
      },

      clearCart: () => set({ cart: [] }),

      getCartCount: () => get().cart.reduce((sum, item) => sum + item.quantity, 0),

      getCartTotal: () =>
        get().cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0),

      // Favorites State
      favorites: [],

      toggleFavorite: (product) => {
        const { favorites } = get();
        const exists = favorites.find((f) => f.product.id === product.id);
        if (exists) {
          set({ favorites: favorites.filter((f) => f.product.id !== product.id) });
        } else {
          set({
            favorites: [...favorites, { product, addedAt: new Date().toISOString() }],
          });
        }
      },

      isFavorite: (productId) => get().favorites.some((f) => f.product.id === productId),

      getFavoritesCount: () => get().favorites.length,

      // Search
      searchQuery: "",
      setSearchQuery: (query) => set({ searchQuery: query }),

      // UI
      isMobileMenuOpen: false,
      setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
    }),
    {
      name: "shein-outlet-store",
      partialize: (state) => ({
        cart: state.cart,
        favorites: state.favorites,
      }),
    }
  )
);
