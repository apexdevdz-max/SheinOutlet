"use client";

import { useAdminStore } from "@/lib/store/useAdminStore";

export default function AdminDashboard() {
  const products = useAdminStore((s) => s.products);
  const categories = useAdminStore((s) => s.categories);
  const banners = useAdminStore((s) => s.banners);

  const outOfStock = products.filter((p) => p.stock === 0).length;
  const flashSaleActive = products.filter((p) => p.is_flash_sale).length;
  const bestSellers = products.filter((p) => p.is_best_seller).length;
  const totalValue = products.reduce((acc, p) => acc + p.price * p.stock, 0);
  const parentCats = categories.filter((c) => !c.parent_id).length;

  const stats = [
    {
      label: "Produits",
      value: products.length,
      icon: "📦",
      color: "from-blue-500 to-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Catégories",
      value: parentCats,
      icon: "📂",
      color: "from-purple-500 to-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "En rupture",
      value: outOfStock,
      icon: "⚠️",
      color: "from-orange-500 to-orange-600",
      bg: "bg-orange-50",
    },
    {
      label: "Ventes Flash",
      value: flashSaleActive,
      icon: "⚡",
      color: "from-pink-500 to-rose-500",
      bg: "bg-pink-50",
    },
    {
      label: "Best-sellers",
      value: bestSellers,
      icon: "🏆",
      color: "from-emerald-500 to-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Bannières",
      value: banners.length,
      icon: "🖼️",
      color: "from-cyan-500 to-cyan-600",
      bg: "bg-cyan-50",
    },
  ];

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Vue d&apos;ensemble de votre boutique SHEIN Outlet
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <span className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center text-lg`}>
                {stat.icon}
              </span>
            </div>
            <p className="text-2xl font-black text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-500 font-medium mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Valeur du stock */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="text-sm font-bold text-gray-900 mb-4">💰 Valeur estimée du stock</h3>
          <p className="text-3xl font-black text-gray-900">
            {totalValue.toLocaleString("fr-DZ")} <span className="text-lg font-bold text-gray-400">DA</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Basée sur {products.reduce((acc, p) => acc + p.stock, 0)} articles en stock
          </p>
        </div>

        {/* Derniers produits */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="text-sm font-bold text-gray-900 mb-4">🆕 Derniers produits ajoutés</h3>
          <div className="space-y-3">
            {products.slice(0, 4).map((p) => (
              <div key={p.id} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                  {p.images[0] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                  <p className="text-xs text-gray-500">{p.price.toLocaleString()} DA</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  p.stock > 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                }`}>
                  {p.stock > 0 ? "En stock" : "Rupture"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
