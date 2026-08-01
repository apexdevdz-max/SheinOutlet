"use client";

import { useState } from "react";
import { useAdminStore } from "@/lib/store/useAdminStore";
import type { Category } from "@/lib/types";

export default function AdminCategories() {
  const categories = useAdminStore((s) => s.categories);
  const addCategory = useAdminStore((s) => s.addCategory);
  const updateCategory = useAdminStore((s) => s.updateCategory);
  const deleteCategory = useAdminStore((s) => s.deleteCategory);

  const [modal, setModal] = useState<{ open: boolean; category: Category | null }>({ open: false, category: null });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const parentCats = categories.filter((c) => !c.parent_id);

  function getSubcategories(parentId: string) {
    return categories.filter((c) => c.parent_id === parentId);
  }

  /* ── Form state ── */
  const [form, setForm] = useState({ name: "", slug: "", parent_id: "", image_url: "", display_order: 0 });

  function openModal(cat: Category | null) {
    if (cat) {
      setForm({ name: cat.name, slug: cat.slug, parent_id: cat.parent_id || "", image_url: cat.image_url, display_order: cat.display_order });
    } else {
      setForm({ name: "", slug: "", parent_id: "", image_url: "", display_order: 0 });
    }
    setModal({ open: true, category: cat });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const slug = form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const data = {
      name: form.name,
      slug,
      parent_id: form.parent_id || null,
      image_url: form.image_url,
      display_order: Number(form.display_order),
    };

    if (modal.category) {
      await updateCategory(modal.category.id, data);
    } else {
      await addCategory(data as Omit<Category, "id">);
    }
    setModal({ open: false, category: null });
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Catégories</h1>
          <p className="text-sm text-gray-500 mt-0.5">{parentCats.length} catégories principales</p>
        </div>
        <button
          onClick={() => openModal(null)}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm font-semibold hover:from-pink-600 hover:to-rose-600 transition-all shadow-lg shadow-pink-500/25 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Ajouter
        </button>
      </div>

      {/* Categories Grid */}
      <div className="space-y-4">
        {parentCats.map((parent) => {
          const subs = getSubcategories(parent.id);
          return (
            <div key={parent.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              {/* Parent row */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-pink-50 flex items-center justify-center text-lg">
                    📂
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{parent.name}</h3>
                    <p className="text-xs text-gray-400">/{parent.slug} · {subs.length} sous-catégorie{subs.length > 1 ? "s" : ""}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => openModal(parent)} className="w-8 h-8 rounded-lg hover:bg-blue-50 flex items-center justify-center text-blue-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </button>
                  {deleteConfirm === parent.id ? (
                    <button onClick={() => { deleteCategory(parent.id); setDeleteConfirm(null); }} className="px-2 py-1 rounded-lg bg-red-500 text-white text-xs font-bold">
                      Confirmer
                    </button>
                  ) : (
                    <button onClick={() => setDeleteConfirm(parent.id)} className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-red-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Subcategories */}
              {subs.length > 0 && (
                <div className="divide-y divide-gray-50">
                  {subs.map((sub) => (
                    <div key={sub.id} className="flex items-center justify-between px-5 py-3 pl-14">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-300">└</span>
                        <span className="text-sm text-gray-700">{sub.name}</span>
                        <span className="text-xs text-gray-400">/{sub.slug}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => openModal(sub)} className="w-7 h-7 rounded-lg hover:bg-blue-50 flex items-center justify-center text-blue-400">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button onClick={() => deleteCategory(sub.id)} className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-red-300">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {modal.open && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setModal({ open: false, category: null })}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">{modal.category ? "Modifier" : "Nouvelle catégorie"}</h2>
              <button onClick={() => setModal({ open: false, category: null })} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400">✕</button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/30" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie parente</label>
                <select value={form.parent_id} onChange={(e) => setForm({ ...form, parent_id: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/30">
                  <option value="">— Aucune (catégorie principale) —</option>
                  {parentCats.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setModal({ open: false, category: null })} className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">Annuler</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm font-semibold shadow-lg shadow-pink-500/25">
                  {modal.category ? "Enregistrer" : "Créer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
