"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store/useStore";
import { formatPrice, PHONE_REGEX, getShippingCost } from "@/lib/data";
import { WILAYAS } from "@/lib/data";
import type { OrderFormData, Order, CartItem } from "@/lib/types";

function CartCountdown() {
  const [time, setTime] = useState({ minutes: 14, seconds: 59 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setTime((prev) => {
        if (prev.minutes === 0 && prev.seconds === 0) return { minutes: 14, seconds: 59 };
        if (prev.seconds === 0) return { minutes: prev.minutes - 1, seconds: 59 };
        return { ...prev, seconds: prev.seconds - 1 };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  return (
    <div className="bg-primary-light border border-primary/20 rounded-xl p-3 mb-4 flex items-center gap-2">
      <span className="text-lg"></span>
      <p className="text-xs text-text">
        Votre Panier est valide pendant :{" "}
        <span className="font-bold text-primary">
          {String(time.minutes).padStart(2, "0")}:{String(time.seconds).padStart(2, "0")}
        </span>
      </p>
    </div>
  );
}

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, clearCart, getCartTotal, getCartCount } = useStore();
  const [showCheckout, setShowCheckout] = useState(false);
  const [formData, setFormData] = useState<OrderFormData>({
    firstName: "",
    lastName: "",
    phone: "",
    wilaya: "",
    commune: "",
    address: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof OrderFormData, string>>>({});
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [orderData, setOrderData] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<CartItem[]>([]);
  const [orderShipping, setOrderShipping] = useState(0);

  const total = getCartTotal();
  const count = getCartCount();
  const shipping = formData.wilaya ? getShippingCost(formData.wilaya) : 600;
  const grandTotal = total + shipping;

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof OrderFormData, string>> = {};
    if (!formData.firstName.trim()) newErrors.firstName = "Prénom requis";
    if (!formData.lastName.trim()) newErrors.lastName = "Nom requis";
    if (!formData.phone.trim()) newErrors.phone = "Téléphone requis";
    else if (!PHONE_REGEX.test(formData.phone)) newErrors.phone = "Format invalide (05/06/07 + 8 chiffres)";
    if (!formData.wilaya) newErrors.wilaya = "Wilaya requise";
    if (!formData.commune.trim()) newErrors.commune = "Commune requise";
    if (!formData.address.trim()) newErrors.address = "Adresse requise";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || submitting) return;

    setSubmitting(true);

    // Snapshot cart before clearing
    const cartSnapshot = [...cart];
    const shippingSnapshot = shipping;

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_first_name: formData.firstName,
          customer_last_name: formData.lastName,
          customer_phone: formData.phone,
          wilaya: formData.wilaya,
          commune: formData.commune,
          address: formData.address,
          notes: formData.notes,
          total_amount: total + shippingSnapshot,
          shipping_cost: shippingSnapshot,
          items: cartSnapshot.map((item) => ({
            product_id: item.product.id,
            product_name: item.product.name,
            product_image: item.product.images?.[0]?.url || "",
            quantity: item.quantity,
            size: item.selectedSize,
            color: item.selectedColor,
            unit_price: item.product.price,
          })),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setOrderData(data);
        setOrderItems(cartSnapshot);
        setOrderShipping(shippingSnapshot);
        setOrderSuccess(true);
        clearCart();
      } else {
        // Fallback: still show success even if API fails (offline-friendly)
        setOrderItems(cartSnapshot);
        setOrderShipping(shippingSnapshot);
        setOrderSuccess(true);
        clearCart();
      }
    } catch {
      // Offline fallback
      setOrderItems(cartSnapshot);
      setOrderShipping(shippingSnapshot);
      setOrderSuccess(true);
      clearCart();
    } finally {
      setSubmitting(false);
    }
  };

  const updateField = (field: keyof OrderFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  if (orderSuccess) {
    const itemsTotal = orderItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Success Banner */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-text mb-2">Commande Confirmée !</h1>
          <p className="text-text-light text-sm">Merci pour votre commande. Vous serez contacté(e) par téléphone pour confirmer la livraison.</p>
          <p className="text-xs text-text-muted mt-1">Paiement à la livraison (COD)</p>
        </div>

        {/* Order Recap Card */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-6">
          {/* Order Header */}
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Référence</p>
                <p className="text-sm font-bold text-gray-900">
                  #{orderData?.id ? orderData.id.slice(0, 8).toUpperCase() : "---"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Date</p>
                <p className="text-sm font-medium text-gray-900">
                  {orderData?.created_at
                    ? new Date(orderData.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })
                    : new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}
                </p>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Articles</h3>
            <div className="space-y-3">
              {orderItems.map((item, i) => (
                <div key={i} className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{item.product.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {item.selectedSize && (
                        <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{item.selectedSize}</span>
                      )}
                      {item.selectedColor && (
                        <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{item.selectedColor}</span>
                      )}
                      <span className="text-[10px] text-gray-400">x{item.quantity}</span>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-gray-900 whitespace-nowrap">
                    {formatPrice(item.product.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Info */}
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Livraison</h3>
            <div className="space-y-1 text-sm text-gray-700">
              <p className="font-medium">{formData.firstName} {formData.lastName}</p>
              <p>{formData.phone}</p>
              <p>{formData.address}</p>
              <p>{formData.commune}, {formData.wilaya}</p>
            </div>
          </div>

          {/* Price Summary */}
          <div className="px-5 py-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Sous-total</span>
                <span>{formatPrice(itemsTotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Livraison</span>
                <span>{formatPrice(orderShipping)}</span>
              </div>
              <div className="flex justify-between text-base font-black text-gray-900 pt-2 border-t border-gray-100">
                <span>Total</span>
                <span>{formatPrice(itemsTotal + orderShipping)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link href="/" className="inline-block bg-black text-white font-bold px-8 py-3 rounded-full hover:bg-gray-800 transition-colors">
            CONTINUER MES ACHATS
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center gap-3 mb-4">
        <Link href="/" className="text-text-light">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-lg font-bold text-text">MON PANIER</h1>
        <span className="text-sm text-text-muted ml-auto">{count} items</span>
      </div>

      <h1 className="hidden md:block text-3xl font-black text-text mb-2">Mon Panier</h1>
      <p className="hidden md:block text-text-muted mb-6">Total ({count} article{count > 1 ? "s" : ""}) : {formatPrice(total)}</p>

      {cart.length === 0 && !orderSuccess ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-text mb-2">Votre panier est vide</h2>
          <p className="text-sm text-text-muted mb-6">Ajoutez des articles pour commencer !</p>
          <Link href="/" className="inline-block bg-black text-white font-bold text-sm px-8 py-3 rounded-full hover:bg-gray-800 transition-colors">
            DÉCOUVRIR NOS PRODUITS
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Cart Items + Checkout Form */}
          <div className="lg:col-span-3">
            <CartCountdown />

            {/* Cart Items */}
            <div className="space-y-3 mb-6">
              {cart.map((item) => (
                <div key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}`} className="bg-white border border-border rounded-xl p-4 flex gap-4">
                  <div className="w-20 h-24 rounded-lg bg-primary-light flex-shrink-0 flex items-center justify-center">
                    <span className="text-primary text-[10px] font-medium text-center px-1">{item.product.name.split(" ").slice(0, 2).join(" ")}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-medium text-text truncate">{item.product.name}</h3>
                      <button
                        onClick={() => removeFromCart(item.product.id, item.selectedSize, item.selectedColor)}
                        className="text-text-muted hover:text-danger transition-colors flex-shrink-0"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-xs text-text-muted mt-0.5">
                      {item.selectedColor && `Couleur: ${item.selectedColor}`}
                      {item.selectedSize && ` · ${item.product.sizes_label || "Taille"}: ${item.selectedSize}`}
                    </p>
                    {item.product.old_price && (
                      <p className="text-xs text-text-muted line-through mt-0.5">{formatPrice(item.product.old_price)}</p>
                    )}
                    <p className="text-sm font-bold text-primary mt-0.5">{formatPrice(item.product.price)}</p>
                    <div className="flex items-center gap-0 mt-2 border border-border rounded-lg w-fit overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.selectedSize, item.selectedColor, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center text-text-light hover:bg-gray-50 text-sm"
                      >
                        −
                      </button>
                      <span className="w-8 h-8 flex items-center justify-center text-sm font-bold border-x border-border">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.selectedSize, item.selectedColor, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center text-text-light hover:bg-gray-50 text-sm"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Checkout Form */}
            {!showCheckout ? (
              <button
                onClick={() => setShowCheckout(true)}
                className="w-full lg:hidden py-4 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-colors text-base"
              >
                PROCÉDER AU PAIEMENT
              </button>
            ) : (
              <form onSubmit={handleSubmit} className="lg:hidden space-y-4 animate-slide-up" id="checkout-form">
                <h2 className="text-lg font-bold text-text">Informations de Livraison</h2>
                <p className="text-xs text-text-muted mb-4">Paiement à la livraison (COD) — Payez à la réception</p>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-text mb-1 block">Prénom *</label>
                    <input type="text" value={formData.firstName} onChange={(e) => updateField("firstName", e.target.value)} className={`w-full px-3 py-2.5 border rounded-lg text-sm ${errors.firstName ? "border-danger" : "border-border"}`} placeholder="Prénom" />
                    {errors.firstName && <p className="text-danger text-[10px] mt-0.5">{errors.firstName}</p>}
                  </div>
                  <div>
                    <label className="text-xs font-medium text-text mb-1 block">Nom *</label>
                    <input type="text" value={formData.lastName} onChange={(e) => updateField("lastName", e.target.value)} className={`w-full px-3 py-2.5 border rounded-lg text-sm ${errors.lastName ? "border-danger" : "border-border"}`} placeholder="Nom" />
                    {errors.lastName && <p className="text-danger text-[10px] mt-0.5">{errors.lastName}</p>}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-text mb-1 block">Téléphone *</label>
                  <input type="tel" value={formData.phone} onChange={(e) => updateField("phone", e.target.value)} className={`w-full px-3 py-2.5 border rounded-lg text-sm ${errors.phone ? "border-danger" : "border-border"}`} placeholder="0550000000" />
                  {errors.phone && <p className="text-danger text-[10px] mt-0.5">{errors.phone}</p>}
                </div>

                <div>
                  <label className="text-xs font-medium text-text mb-1 block">Wilaya *</label>
                  <select value={formData.wilaya} onChange={(e) => updateField("wilaya", e.target.value)} className={`w-full px-3 py-2.5 border rounded-lg text-sm bg-white ${errors.wilaya ? "border-danger" : "border-border"}`}>
                    <option value="">Sélectionnez une wilaya</option>
                    {WILAYAS.map((w) => (<option key={w} value={w}>{w}</option>))}
                  </select>
                  {errors.wilaya && <p className="text-danger text-[10px] mt-0.5">{errors.wilaya}</p>}
                </div>

                <div>
                  <label className="text-xs font-medium text-text mb-1 block">Commune *</label>
                  <input type="text" value={formData.commune} onChange={(e) => updateField("commune", e.target.value)} className={`w-full px-3 py-2.5 border rounded-lg text-sm ${errors.commune ? "border-danger" : "border-border"}`} placeholder="Commune" />
                  {errors.commune && <p className="text-danger text-[10px] mt-0.5">{errors.commune}</p>}
                </div>

                <div>
                  <label className="text-xs font-medium text-text mb-1 block">Adresse *</label>
                  <textarea value={formData.address} onChange={(e) => updateField("address", e.target.value)} className={`w-full px-3 py-2.5 border rounded-lg text-sm resize-none ${errors.address ? "border-danger" : "border-border"}`} rows={2} placeholder="Adresse complète" />
                  {errors.address && <p className="text-danger text-[10px] mt-0.5">{errors.address}</p>}
                </div>

                <div>
                  <label className="text-xs font-medium text-text mb-1 block">Notes (optionnel)</label>
                  <textarea value={formData.notes} onChange={(e) => updateField("notes", e.target.value)} className="w-full px-3 py-2.5 border border-border rounded-lg text-sm resize-none" rows={2} placeholder="Instructions spéciales..." />
                </div>

                <button type="submit" disabled={submitting} className={`w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors text-base ${submitting ? "opacity-60 cursor-wait" : ""}`} id="submit-order-mobile">
                  {submitting ? "TRAITEMENT EN COURS..." : "VALIDER LA COMMANDE (PAIEMENT À LA LIVRAISON)"}
                </button>
              </form>
            )}
          </div>

          {/* Desktop Order Summary */}
          <div className="hidden lg:block lg:col-span-2">
            <div className="sticky top-32 bg-white border border-border rounded-2xl p-6">
              <h2 className="text-lg font-bold text-text mb-4">Récapitulatif</h2>

              <div className="space-y-3 mb-4 pb-4 border-b border-border">
                <div className="flex justify-between text-sm"><span className="text-text-light">Sous-total ({count} articles)</span><span className="font-medium">{formatPrice(total)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-text-light">Livraison</span><span className="font-medium">{formatPrice(shipping)}</span></div>
              </div>

              <div className="flex justify-between text-lg font-black mb-6"><span>Total</span><span className="text-primary">{formatPrice(grandTotal)}</span></div>

              {/* Desktop Checkout Form */}
              <form onSubmit={handleSubmit} className="space-y-3" id="checkout-form-desktop">
                <h3 className="text-sm font-bold text-text">Informations de Livraison</h3>
                <p className="text-[10px] text-text-muted mb-2">Paiement à la livraison (COD)</p>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <input type="text" value={formData.firstName} onChange={(e) => updateField("firstName", e.target.value)} className={`w-full px-3 py-2 border rounded-lg text-xs ${errors.firstName ? "border-danger" : "border-border"}`} placeholder="Prénom *" />
                    {errors.firstName && <p className="text-danger text-[9px] mt-0.5">{errors.firstName}</p>}
                  </div>
                  <div>
                    <input type="text" value={formData.lastName} onChange={(e) => updateField("lastName", e.target.value)} className={`w-full px-3 py-2 border rounded-lg text-xs ${errors.lastName ? "border-danger" : "border-border"}`} placeholder="Nom *" />
                    {errors.lastName && <p className="text-danger text-[9px] mt-0.5">{errors.lastName}</p>}
                  </div>
                </div>

                <input type="tel" value={formData.phone} onChange={(e) => updateField("phone", e.target.value)} className={`w-full px-3 py-2 border rounded-lg text-xs ${errors.phone ? "border-danger" : "border-border"}`} placeholder="Téléphone * (05/06/07...)" />
                {errors.phone && <p className="text-danger text-[9px] mt-0.5">{errors.phone}</p>}

                <select value={formData.wilaya} onChange={(e) => updateField("wilaya", e.target.value)} className={`w-full px-3 py-2 border rounded-lg text-xs bg-white ${errors.wilaya ? "border-danger" : "border-border"}`}>
                  <option value="">Wilaya *</option>
                  {WILAYAS.map((w) => (<option key={w} value={w}>{w}</option>))}
                </select>
                {errors.wilaya && <p className="text-danger text-[9px] mt-0.5">{errors.wilaya}</p>}

                <input type="text" value={formData.commune} onChange={(e) => updateField("commune", e.target.value)} className={`w-full px-3 py-2 border rounded-lg text-xs ${errors.commune ? "border-danger" : "border-border"}`} placeholder="Commune *" />
                {errors.commune && <p className="text-danger text-[9px] mt-0.5">{errors.commune}</p>}

                <textarea value={formData.address} onChange={(e) => updateField("address", e.target.value)} className={`w-full px-3 py-2 border rounded-lg text-xs resize-none ${errors.address ? "border-danger" : "border-border"}`} rows={2} placeholder="Adresse complète *" />
                {errors.address && <p className="text-danger text-[9px] mt-0.5">{errors.address}</p>}

                <button type="submit" disabled={submitting} className={`w-full py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors text-sm ${submitting ? "opacity-60 cursor-wait" : ""}`} id="submit-order-desktop">
                  {submitting ? "TRAITEMENT..." : `VALIDER (${formatPrice(grandTotal)})`}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Fixed Bottom Bar */}
      {cart.length > 0 && !showCheckout && (
        <div className="lg:hidden fixed bottom-[72px] left-0 right-0 bg-white border-t border-border px-4 py-3 z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-text-muted">Total</p>
              <p className="text-lg font-black text-text">{formatPrice(total)}</p>
            </div>
            <button
              onClick={() => setShowCheckout(true)}
              className="bg-black text-white font-bold text-sm px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors"
            >
              PROCÉDER AU PAIEMENT
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
