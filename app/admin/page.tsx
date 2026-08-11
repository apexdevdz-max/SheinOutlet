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
      icon: "produits",
      color: "from-blue-500 to-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Catégories",
      value: parentCats,
      icon: "categories",
      color: "from-purple-500 to-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "En rupture",
      value: outOfStock,
      icon: "rupture",
      color: "from-orange-500 to-orange-600",
      bg: "bg-orange-50",
    },
    {
      label: "Ventes Flash",
      value: flashSaleActive,
      icon: "flash",
      color: "from-pink-500 to-rose-500",
      bg: "bg-pink-50",
    },
    {
      label: "Meilleures ventes",
      value: bestSellers,
      icon: "best",
      color: "from-emerald-500 to-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Bannières",
      value: banners.length,
      icon: "banners",
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
              <span className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                {stat.icon === "produits" && <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>}
                {stat.icon === "categories" && <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>}
                {stat.icon === "rupture" && <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>}
                {stat.icon === "flash" && <svg className="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                {stat.icon === "best" && <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>}
                {stat.icon === "banners" && <svg className="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
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
          <h3 className="text-sm font-bold text-gray-900 mb-4">Valeur estimée du stock</h3>
          <p className="text-3xl font-black text-gray-900">
            {totalValue.toLocaleString("fr-DZ")} <span className="text-lg font-bold text-gray-400">DA</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Basée sur {products.reduce((acc, p) => acc + p.stock, 0)} articles en stock
          </p>
        </div>

        {/* Derniers produits */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="text-sm font-bold text-gray-900 mb-4">Derniers produits ajoutés</h3>
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
