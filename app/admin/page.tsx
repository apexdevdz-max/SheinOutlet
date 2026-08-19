"use client";

import { useState, useEffect, useCallback } from "react";
import type { Order, OrderItem } from "@/lib/types";

type OrderWithItems = Order & { items: OrderItem[] };

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: "En attente",  color: "text-yellow-700", bg: "bg-yellow-50 border-yellow-200" },
  confirmed: { label: "Confirmée",   color: "text-blue-700",   bg: "bg-blue-50 border-blue-200" },
  shipped:   { label: "Expédiée",    color: "text-purple-700", bg: "bg-purple-50 border-purple-200" },
  delivered: { label: "Livrée",      color: "text-green-700",  bg: "bg-green-50 border-green-200" },
  cancelled: { label: "Annulée",     color: "text-red-700",    bg: "bg-red-50 border-red-200" },
};

const STATUS_TABS = [
  { key: "all",       label: "Toutes" },
  { key: "pending",   label: "En attente" },
  { key: "confirmed", label: "Confirmées" },
  { key: "shipped",   label: "Expédiées" },
  { key: "delivered", label: "Livrées" },
  { key: "cancelled", label: "Annulées" },
];

export default function AdminDashboard() {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/orders");
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateStatus = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus as Order["status"] } : o))
        );
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  // Filtering
  const filtered = orders.filter((o) => {
    if (statusFilter !== "all" && o.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchId = o.id.toLowerCase().includes(q);
      const matchName = `${o.customer_first_name} ${o.customer_last_name}`.toLowerCase().includes(q);
      const matchPhone = o.customer_phone.includes(q);
      if (!matchId && !matchName && !matchPhone) return false;
    }
    return true;
  });

  // Stats
  const countByStatus = (s: string) => orders.filter((o) => o.status === s).length;

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900">Gestion des Commandes</h1>
        <p className="text-sm text-gray-500 mt-1">
          {orders.length} commande{orders.length > 1 ? "s" : ""} au total
        </p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
          <button
            key={key}
            onClick={() => setStatusFilter(statusFilter === key ? "all" : key)}
            className={`p-3 rounded-xl border text-left transition-all ${
              statusFilter === key ? `${cfg.bg} border-2 shadow-sm` : "bg-white border-gray-100 hover:shadow-sm"
            }`}
          >
            <p className={`text-xl font-black ${statusFilter === key ? cfg.color : "text-gray-900"}`}>
              {countByStatus(key)}
            </p>
            <p className="text-[11px] font-medium text-gray-500">{cfg.label}</p>
          </button>
        ))}
      </div>

      {/* Search + Tabs */}
      <div className="bg-white rounded-xl border border-gray-100 mb-4">
        <div className="p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          {/* Search */}
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Rechercher par nom, téléphone ou ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-200"
            />
          </div>
        </div>

        {/* Status Tabs */}
        <div className="px-4 pb-3 flex gap-1 overflow-x-auto scrollbar-hide">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === tab.key
                  ? "bg-gray-900 text-white"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              {tab.label}
              {tab.key !== "all" && (
                <span className="ml-1.5 opacity-60">{countByStatus(tab.key)}</span>
              )}
              {tab.key === "all" && (
                <span className="ml-1.5 opacity-60">{orders.length}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-1/3 mb-3" />
              <div className="h-3 bg-gray-100 rounded w-2/3 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-gray-500 font-medium">Aucune commande trouvée</p>
          <p className="text-xs text-gray-400 mt-1">
            {search ? "Modifiez votre recherche" : "Les commandes apparaîtront ici"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => {
            const expanded = expandedOrder === order.id;
            const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;

            return (
              <div
                key={order.id}
                className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-sm transition-shadow"
              >
                {/* Order Header Row */}
                <button
                  onClick={() => setExpandedOrder(expanded ? null : order.id)}
                  className="w-full p-4 lg:p-5 text-left"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                    {/* Order ref + date */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-gray-400">#{order.id.slice(0, 8)}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.color}`}>
                          {cfg.label}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-gray-900">
                        {order.customer_first_name} {order.customer_last_name}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {order.customer_phone} — {order.wilaya}{order.commune ? `, ${order.commune}` : ""}
                      </p>
                    </div>

                    {/* Amount + date */}
                    <div className="flex items-center gap-4 lg:gap-6">
                      <div className="text-right">
                        <p className="text-base font-black text-gray-900">
                          {(order.total_amount || 0).toLocaleString("fr-DZ")} DA
                        </p>
                        <p className="text-[10px] text-gray-400">{formatDate(order.created_at)}</p>
                      </div>
                      <svg
                        className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </button>

                {/* Expanded Details */}
                {expanded && (
                  <div className="border-t border-gray-100 px-4 lg:px-5 py-4 bg-gray-50/50">
                    {/* Customer Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                      <div>
                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Client</h4>
                        <p className="text-sm font-semibold text-gray-900">
                          {order.customer_first_name} {order.customer_last_name}
                        </p>
                        <p className="text-sm text-gray-600">{order.customer_phone}</p>
                      </div>
                      <div>
                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Adresse</h4>
                        <p className="text-sm text-gray-600">{order.address}</p>
                        <p className="text-sm text-gray-600">{order.commune}, {order.wilaya}</p>
                      </div>
                    </div>

                    {order.notes && (
                      <div className="mb-5 p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                        <p className="text-[10px] font-bold text-yellow-600 uppercase tracking-wider mb-1">Notes</p>
                        <p className="text-sm text-yellow-800">{order.notes}</p>
                      </div>
                    )}

                    {/* Order Items */}
                    <div className="mb-5">
                      <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">
                        Articles ({order.items?.length || 0})
                      </h4>
                      <div className="space-y-2">
                        {(order.items || []).map((item) => (
                          <div key={item.id} className="flex items-center gap-3 p-2.5 bg-white rounded-lg border border-gray-100">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{item.product_name}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                {item.size && <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{item.size}</span>}
                                {item.color && <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{item.color}</span>}
                                <span className="text-[10px] text-gray-400">x{item.quantity}</span>
                              </div>
                            </div>
                            <p className="text-sm font-bold text-gray-900 whitespace-nowrap">
                              {(item.unit_price * item.quantity).toLocaleString("fr-DZ")} DA
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Totals */}
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 mb-5">
                      <div>
                        <p className="text-xs text-gray-500">
                          Livraison: {(order.shipping_cost || 0).toLocaleString("fr-DZ")} DA
                        </p>
                      </div>
                      <p className="text-lg font-black text-gray-900">
                        Total: {(order.total_amount || 0).toLocaleString("fr-DZ")} DA
                      </p>
                    </div>

                    {/* Status Changer */}
                    <div>
                      <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Modifier le statut</h4>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(STATUS_CONFIG).map(([key, s]) => (
                          <button
                            key={key}
                            onClick={() => updateStatus(order.id, key)}
                            disabled={updatingId === order.id || order.status === key}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                              order.status === key
                                ? `${s.bg} ${s.color} border-2`
                                : "bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700"
                            } ${updatingId === order.id ? "opacity-50 cursor-wait" : ""} ${order.status === key ? "cursor-default" : "cursor-pointer"}`}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
