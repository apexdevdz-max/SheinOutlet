"use client";

import { useState } from "react";
import { useAdminStore } from "@/lib/store/useAdminStore";
import type { Banner } from "@/lib/types";

export default function AdminCarousel() {
  const banners = useAdminStore((s) => s.banners);
  const addBanner = useAdminStore((s) => s.addBanner);
  const updateBanner = useAdminStore((s) => s.updateBanner);
  const deleteBanner = useAdminStore((s) => s.deleteBanner);
  const reorderBanners = useAdminStore((s) => s.reorderBanners);

  const [modal, setModal] = useState<{ open: boolean; banner: Banner | null }>({ open: false, banner: null });
  const [form, setForm] = useState({ image: "", alt: "", href: "/" });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  function openModal(banner: Banner | null) {
    if (banner) {
      setForm({ image: banner.image, alt: banner.alt, href: banner.href });
    } else {
      setForm({ image: "", alt: "", href: "/" });
    }
    setModal({ open: true, banner });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (modal.banner) {
      await updateBanner(modal.banner.id, form);
    } else {
      await addBanner({
        image: form.image,
        alt: form.alt,
        href: form.href,
        order: banners.length + 1,
      });
    }
    setModal({ open: false, banner: null });
  }

  function moveUp(index: number) {
    if (index === 0) return;
    const updated = [...banners];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    reorderBanners(updated.map((b, i) => ({ ...b, order: i + 1 })));
  }

  function moveDown(index: number) {
    if (index >= banners.length - 1) return;
    const updated = [...banners];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    reorderBanners(updated.map((b, i) => ({ ...b, order: i + 1 })));
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Gestion du carrousel</h1>
          <p className="text-sm text-gray-500 mt-0.5">{banners.length} bannière{banners.length > 1 ? "s" : ""} active{banners.length > 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={() => openModal(null)}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm font-semibold hover:from-pink-600 hover:to-rose-600 transition-all shadow-lg shadow-pink-500/25 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Ajouter une bannière
        </button>
      </div>

      {/* Banner Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {banners.map((banner, index) => (
          <div key={banner.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
            {/* Preview */}
            <div className="relative aspect-[2.5/1] bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={banner.image}
                alt={banner.alt}
                className="w-full h-full object-cover"
              />
              {/* Order badge */}
              <span className="absolute top-2 left-2 w-7 h-7 rounded-lg bg-black/60 text-white text-xs font-bold flex items-center justify-center backdrop-blur-sm">
                {index + 1}
              </span>
              {/* Reorder arrows */}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => moveUp(index)}
                  disabled={index === 0}
                  className="w-7 h-7 rounded-lg bg-white/90 backdrop-blur-sm shadow flex items-center justify-center text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" /></svg>
                </button>
                <button
                  onClick={() => moveDown(index)}
                  disabled={index >= banners.length - 1}
                  className="w-7 h-7 rounded-lg bg-white/90 backdrop-blur-sm shadow flex items-center justify-center text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                </button>
              </div>
            </div>

            {/* Info */}
            <div className="p-4">
              <p className="text-sm font-medium text-gray-900 truncate">{banner.alt}</p>
              <p className="text-xs text-gray-400 mt-0.5">Lien : {banner.href}</p>
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={() => openModal(banner)}
                  className="flex-1 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  Modifier
                </button>
                {deleteConfirm === banner.id ? (
                  <button
                    onClick={() => { deleteBanner(banner.id); setDeleteConfirm(null); }}
                    className="py-2 px-3 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors"
                  >
                    Confirmer
                  </button>
                ) : (
                  <button
                    onClick={() => setDeleteConfirm(banner.id)}
                    className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-red-400 hover:bg-red-50 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {banners.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-5xl mb-3">🖼️</p>
          <p className="text-sm">Aucune bannière. Ajoutez-en une pour le carrousel.</p>
        </div>
      )}

      {/* Modal */}
      {modal.open && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setModal({ open: false, banner: null })}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">{modal.banner ? "Modifier la bannière" : "Nouvelle bannière"}</h2>
              <button onClick={() => setModal({ open: false, banner: null })} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400">✕</button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL de l&apos;image *</label>
                <input type="text" required value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/30"
                  placeholder="/images/hero/banner1.png ou https://..." />
              </div>
              {/* Preview */}
              {form.image && (
                <div className="aspect-[3/1] bg-gray-100 rounded-xl overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={form.image} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Texte alternatif *</label>
                <input type="text" required value={form.alt} onChange={(e) => setForm({ ...form, alt: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/30"
                  placeholder="Nouvelle Collection — Jusqu'à -70%" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lien de destination</label>
                <input type="text" value={form.href} onChange={(e) => setForm({ ...form, href: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/30"
                  placeholder="/categories ou /?cat=femme" />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setModal({ open: false, banner: null })} className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">Annuler</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm font-semibold shadow-lg shadow-pink-500/25">
                  {modal.banner ? "Enregistrer" : "Ajouter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
