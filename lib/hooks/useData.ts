"use client";

import { useState, useEffect } from "react";
import type { Product, Category } from "@/lib/types";

/* ─── Products ─── */

export function useProducts(params?: {
  category?: string;
  flashSale?: boolean;
  bestSeller?: boolean;
  limit?: number;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = new URL("/api/products", window.location.origin);
    if (params?.category) url.searchParams.set("category", params.category);
    if (params?.flashSale) url.searchParams.set("flash_sale", "true");
    if (params?.bestSeller) url.searchParams.set("best_seller", "true");
    if (params?.limit) url.searchParams.set("limit", String(params.limit));

    fetch(url.toString())
      .then((res) => res.json())
      .then((data) => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params?.category, params?.flashSale, params?.bestSeller, params?.limit]);

  return { products, loading };
}

/* ─── Categories ─── */

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        setCategories(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const parentCategories = categories.filter((c) => !c.parent_id);
  const getSubCategories = (parentId: string) =>
    categories.filter((c) => c.parent_id === parentId);

  return { categories, parentCategories, getSubCategories, loading };
}

/* ─── All products (for filtering on homepage) ─── */

export function useAllProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products?limit=200")
      .then((res) => res.json())
      .then((data) => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return { products, loading };
}
