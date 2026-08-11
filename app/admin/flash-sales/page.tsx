"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "@/lib/store/useToastStore";
import type { FlashSale, Product } from "@/lib/types";

/* ══════════════════════════════════════════════════════════ */
/*  Countdown Preview Component                              */
/* ══════════════════════════════════════════════════════════ */

function CountdownPreview({ endDate, title, subtitle }: { endDate: string; title: string; subtitle: string }) {
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    function calc() {
      const diff = new Date(endDate).getTime() - Date.now();
      if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      };
    }
    setTime(calc());
    const interval = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(interval);
  }, [endDate]);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="rounded-2xl bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 p-5 md:p-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl"></span>
          <h2 className="text-white text-xl md:text-2xl font-black tracking-tight">{title || "FLASH SALE"}</h2>
          <span className="text-pink-400 text-sm font-medium ml-1">{subtitle || "Offres limitées !"}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-white/60 text-xs mr-2 hidden md:block">FIN DANS</span>
          {[
            { v: time.days, l: "JOURS" },
            { v: time.hours, l: "HEURES" },
            { v: time.minutes, l: "MIN" },
            { v: time.seconds, l: "SEC" },
          ].map((b, i) => (
            <div key={b.l} className="flex items-center">
              {i > 0 && <span className="text-white text-2xl font-light mx-0.5 mt-[-14px]">:</span>}
              <div className="flex flex-col items-center">
                <div className="bg-white text-black font-black text-lg w-12 h-12 rounded-lg flex items-center justify-center shadow-lg">
                  {pad(b.v)}
                </div>
                <span className="text-[9px] text-gray-400 mt-1 uppercase tracking-wider font-medium">{b.l}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-pink-500 text-white text-sm font-bold px-6 py-2.5 rounded-full">
          VOIR TOUTES LES OFFRES ›
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════ */
/*  Main Admin Flash Sales Page                              */
/* ══════════════════════════════════════════════════════════ */

export default function AdminFlashSales() {
  const [campaigns, setCampaigns] = useState<FlashSale[]>([]);
  const [flashProducts, setFlashProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [form, setForm] = useState({
    title: "FLASH SALE",
    subtitle: "Offres limitées !",
    end_date: "",
    is_active: true,
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [campRes, prodRes] = await Promise.all([
        fetch("/api/admin/flash-sales"),
        fetch("/api/products?flash_sale=true"),
      ]);
      const campData = await campRes.json();
      const prodData = await prodRes.json();
      setCampaigns(Array.isArray(campData) ? campData : []);
      setFlashProducts(Array.isArray(prodData) ? prodData : []);
    } catch {
      toast.error("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  function resetForm() {
    setForm({ title: "FLASH SALE", subtitle: "Offres limitées !", end_date: "", is_active: true });
    setEditingId(null);
  }

  function editCampaign(c: FlashSale) {
    setForm({
      title: c.title,
      subtitle: c.subtitle,
      end_date: c.end_date.slice(0, 16), // format for datetime-local
      is_active: c.is_active,
    });
    setEditingId(c.id);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.end_date) {
      toast.error("Veuillez définir une date de fin");
      return;
    }

    setSaving(true);
    try {
      const url = editingId
        ? `/api/admin/flash-sales/${editingId}`
        : "/api/admin/flash-sales";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          end_date: new Date(form.end_date).toISOString(),
          is_active: editingId ? form.is_active : false,
        }),
      });

      if (!res.ok) throw new Error("Erreur serveur");

      toast.success(editingId ? "Campagne mise à jour !" : "Campagne créée !");
      resetForm();
      fetchData();
    } catch {
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  }

  async function deleteCampaign(id: string) {
    if (!confirm("Supprimer cette campagne ?")) return;
    try {
      await fetch(`/api/admin/flash-sales/${id}`, { method: "DELETE" });
      toast.success("Campagne supprimée");
      if (editingId === id) resetForm();
      fetchData();
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  }

  async function toggleActive(c: FlashSale) {
    try {
      await fetch(`/api/admin/flash-sales/${c.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !c.is_active }),
      });
      toast.success(c.is_active ? "Campagne désactivée" : "Campagne activée !");
      fetchData();
    } catch {
      toast.error("Erreur");
    }
  }

  const activeCampaign = campaigns.find((c) => c.is_active);

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="h-4 bg-gray-200 rounded w-32" />
          <div className="h-40 bg-gray-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
          <span className="text-2xl"></span> Ventes Flash
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Configurez vos campagnes de ventes flash et leur compte à rebours
        </p>
      </div>

      {/* ── Active Campaign Status ── */}
      {activeCampaign && (
        <div className="mb-8">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Campagne active — Prévisualisation
          </p>
          <CountdownPreview
            endDate={activeCampaign.end_date}
            title={activeCampaign.title}
            subtitle={activeCampaign.subtitle}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* ── Left: Form ── */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="border-b border-gray-100 px-5 py-4">
              <h2 className="font-bold text-gray-900 text-sm">
                {editingId ? "Modifier la campagne" : "Nouvelle campagne"}
              </h2>
            </div>

            <div className="p-5 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Titre de la bannière</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="FLASH SALE"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/30"
                />
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Message d&apos;accroche</label>
                <input
                  type="text"
                  value={form.subtitle}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  placeholder="Offres limitées !"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/30"
                />
              </div>

              {/* End Date */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Date et heure de fin</label>
                <input
                  type="datetime-local"
                  value={form.end_date}
                  onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/30"
                  required
                />
              </div>

            </div>

            {/* Actions */}
            <div className="border-t border-gray-100 px-5 py-4 flex justify-between">
              {editingId && (
                <button type="button" onClick={resetForm} className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">
                  Annuler
                </button>
              )}
              <button
                type="submit"
                disabled={saving}
                className="ml-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm font-semibold shadow-lg shadow-pink-500/25 hover:from-pink-600 hover:to-rose-600 transition-all disabled:opacity-50"
              >
                {saving ? "Sauvegarde..." : editingId ? "Mettre à jour" : "Créer la campagne"}
              </button>
            </div>
          </form>
        </div>

        {/* ── Right: Campaigns List + Flash Products ── */}
        <div className="lg:col-span-3 space-y-6">
          {/* Campaigns */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="border-b border-gray-100 px-5 py-4">
              <h2 className="font-bold text-gray-900 text-sm">Campagnes ({campaigns.length})</h2>
            </div>
            {campaigns.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">
                Aucune campagne créée
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {campaigns.map((c) => {
                  const isExpired = new Date(c.end_date) <= new Date();
                  return (
                    <div key={c.id} className="px-5 py-4 flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-gray-900 text-sm truncate">{c.title}</h3>
                          {c.is_active && !isExpired && (
                            <span className="px-2 py-0.5 rounded-full bg-green-50 text-green-600 text-[10px] font-bold border border-green-200">
                              ACTIVE
                            </span>
                          )}
                          {isExpired && (
                            <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-500 text-[10px] font-bold border border-red-200">
                              EXPIRÉE
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {c.subtitle} · Fin : {new Date(c.end_date).toLocaleString("fr-FR")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Toggle Active */}
                        <button
                          onClick={() => toggleActive(c)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            c.is_active ? "bg-green-500" : "bg-gray-200"
                          }`}
                          title={c.is_active ? "Désactiver" : "Activer"}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${c.is_active ? "translate-x-6" : "translate-x-1"}`} />
                        </button>
                        {/* Edit */}
                        <button
                          onClick={() => editCampaign(c)}
                          className="w-8 h-8 rounded-lg hover:bg-blue-50 flex items-center justify-center text-gray-400 hover:text-blue-600 transition-colors"
                          title="Modifier"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        {/* Delete */}
                        <button
                          onClick={() => deleteCampaign(c.id)}
                          className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
                          title="Supprimer"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Flash Products */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="border-b border-gray-100 px-5 py-4 flex items-center justify-between">
              <h2 className="font-bold text-gray-900 text-sm">
                Produits Flash ({flashProducts.length})
              </h2>
              <a
                href="/admin/products"
                className="text-xs text-pink-500 font-medium hover:text-pink-600 transition-colors"
              >
                Gérer les produits →
              </a>
            </div>
            {flashProducts.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-400 text-sm">Aucun produit marqué "Vente Flash"</p>
                <p className="text-xs text-gray-300 mt-1">
                  Activez le toggle <span className="font-semibold">Flash</span> sur vos produits dans la page Produits
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50 max-h-[400px] overflow-y-auto">
                {flashProducts.map((p) => (
                  <div key={p.id} className="px-5 py-3 flex items-center gap-3">
                    {p.images?.[0] && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.images[0]} alt={p.name} className="w-10 h-10 rounded-lg object-cover border border-gray-100" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                      <p className="text-xs text-gray-400">
                        {p.price.toLocaleString()} DA
                        {p.old_price && (
                          <span className="line-through ml-2">{p.old_price.toLocaleString()} DA</span>
                        )}
                      </p>
                    </div>
                    {p.old_price && (
                      <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-500 text-[10px] font-bold">
                        -{Math.round(((p.old_price - p.price) / p.old_price) * 100)}%
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
