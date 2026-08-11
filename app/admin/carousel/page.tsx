"use client";

import { useState, useRef, useEffect } from "react";
import { useAdminStore } from "@/lib/store/useAdminStore";
import { toast } from "@/lib/store/useToastStore";
import { ImageCropEditor } from "@/components/admin/ImageCropEditor";
import type { Banner, Category } from "@/lib/types";

/* ══════════════════════════════════════════════════════════ */
/*  Link Selector Component                                  */
/* ══════════════════════════════════════════════════════════ */

type LinkType = "category" | "subcategory" | "promo" | "new" | "custom";

function LinkSelector({
  value,
  onChange,
  categories,
}: {
  value: string;
  onChange: (href: string) => void;
  categories: Category[];
}) {
  // Detect current link type
  function detectType(): LinkType {
    if (value === "/?filter=promo") return "promo";
    if (value === "/?filter=new") return "new";
    if (value.startsWith("/?cat=")) {
      const slug = value.replace("/?cat=", "");
      const cat = categories.find((c) => c.slug === slug);
      if (cat?.parent_id) return "subcategory";
      return "category";
    }
    return "custom";
  }

  const [linkType, setLinkType] = useState<LinkType>(detectType);
  const parents = categories.filter((c) => !c.parent_id);

  function handleTypeChange(type: LinkType) {
    setLinkType(type);
    if (type === "promo") onChange("/?filter=promo");
    else if (type === "new") onChange("/?filter=new");
    else if (type === "custom") onChange("/");
    else onChange("");
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Lien de redirection</label>
      <div className="flex flex-wrap gap-1.5">
        {([
          { type: "category" as LinkType, label: "Catégorie" },
          { type: "subcategory" as LinkType, label: "Sous-catégorie" },
          { type: "promo" as LinkType, label: "Promotions" },
          { type: "new" as LinkType, label: "Nouveautés" },
          { type: "custom" as LinkType, label: "URL personnalisée" },
        ]).map(({ type, label }) => (
          <button
            key={type}
            type="button"
            onClick={() => handleTypeChange(type)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              linkType === type
                ? "bg-pink-500 text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {linkType === "category" && (
        <select
          value={value.replace("/?cat=", "")}
          onChange={(e) => onChange(`/?cat=${e.target.value}`)}
          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/30"
        >
          <option value="">Choisir une catégorie...</option>
          {parents.map((c) => (
            <option key={c.id} value={c.slug}>{c.name}</option>
          ))}
        </select>
      )}

      {linkType === "subcategory" && (
        <select
          value={value.replace("/?cat=", "")}
          onChange={(e) => onChange(`/?cat=${e.target.value}`)}
          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/30"
        >
          <option value="">Choisir une sous-catégorie...</option>
          {parents.map((parent) => {
            const subs = categories.filter((c) => c.parent_id === parent.id);
            if (subs.length === 0) return null;
            return (
              <optgroup key={parent.id} label={parent.name}>
                {subs.map((sub) => (
                  <option key={sub.id} value={sub.slug}>{sub.name}</option>
                ))}
              </optgroup>
            );
          })}
        </select>
      )}

      {linkType === "custom" && (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://... ou /categories"
          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/30"
        />
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════ */
/*  Banner Preview Component                                 */
/* ══════════════════════════════════════════════════════════ */

function BannerPreview({ imageUrl, title, subtitle, showText }: { imageUrl: string; title: string; subtitle: string; showText: boolean }) {
  if (!imageUrl) return null;
  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3 py-1.5 bg-gray-50 border-b border-gray-100">
        Prévisualisation du rendu
      </p>
      <div className="relative aspect-[2.5/1] bg-gray-900">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
        {/* Text overlay */}
        {showText && (title || subtitle) && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-4 md:p-6">
            {title && (
              <h3 className="text-white text-sm md:text-xl font-bold drop-shadow-lg leading-tight">{title}</h3>
            )}
            {subtitle && (
              <p className="text-white/80 text-xs md:text-sm mt-0.5 drop-shadow">{subtitle}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════ */
/*  Main Admin Carousel Page                                 */
/* ══════════════════════════════════════════════════════════ */

export default function AdminCarousel() {
  const banners = useAdminStore((s) => s.banners);
  const categories = useAdminStore((s) => s.categories);
  const addBanner = useAdminStore((s) => s.addBanner);
  const updateBanner = useAdminStore((s) => s.updateBanner);
  const deleteBanner = useAdminStore((s) => s.deleteBanner);
  const reorderBanners = useAdminStore((s) => s.reorderBanners);

  const [modal, setModal] = useState<{ open: boolean; banner: Banner | null }>({ open: false, banner: null });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState({
    image_url: "",
    title: "",
    subtitle: "",
    href: "/",
    is_active: true,
    show_text: true,
  });

  // Image crop state
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  function openModal(banner: Banner | null) {
    if (banner) {
      setForm({
        image_url: banner.image_url,
        title: banner.title,
        subtitle: banner.subtitle || "",
        href: banner.href,
        is_active: banner.is_active,
        show_text: banner.show_text ?? true,
      });
    } else {
      setForm({ image_url: "", title: "", subtitle: "", href: "/", is_active: true, show_text: true });
    }
    setRawImageSrc(null);
    setModal({ open: true, banner });
  }

  // Handle file selection (before crop)
  function handleFileSelect(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Format invalide", "Seules les images sont acceptées.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setRawImageSrc(reader.result as string);
    reader.readAsDataURL(file);
  }

  // After crop: upload to Cloudinary
  async function handleCropComplete(blob: Blob) {
    setRawImageSrc(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("files", new File([blob], "banner.webp", { type: "image/webp" }));
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error(await res.text());
      const { urls } = await res.json();
      if (urls && urls.length > 0) {
        setForm((f) => ({ ...f, image_url: urls[0] }));
        toast.success("Image recadrée et uploadée");
      }
    } catch (err) {
      toast.apiError(err instanceof Error ? err : "Erreur lors de l'upload");
    }
    setUploading(false);
  }

  // Save banner
  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.image_url) {
      toast.error("Image requise", "Veuillez sélectionner et recadrer une image.");
      return;
    }
    setSaving(true);
    if (modal.banner) {
      await updateBanner(modal.banner.id, form);
    } else {
      await addBanner({
        ...form,
        display_order: banners.length + 1,
      } as any);
    }
    setSaving(false);
    setModal({ open: false, banner: null });
  }

  // Reorder helpers
  function moveUp(index: number) {
    if (index === 0) return;
    const updated = [...banners];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    reorderBanners(updated.map((b, i) => ({ ...b, display_order: i + 1 })));
  }

  function moveDown(index: number) {
    if (index >= banners.length - 1) return;
    const updated = [...banners];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    reorderBanners(updated.map((b, i) => ({ ...b, display_order: i + 1 })));
  }

  // Toggle active quickly from the list
  function toggleActive(banner: Banner) {
    updateBanner(banner.id, { is_active: !banner.is_active });
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Gestion du carrousel</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {banners.filter((b) => b.is_active).length} active{banners.filter((b) => b.is_active).length > 1 ? "s" : ""} sur {banners.length} bannière{banners.length > 1 ? "s" : ""}
          </p>
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
      <div className="space-y-3">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`bg-white rounded-2xl border overflow-hidden shadow-sm hover:shadow-md transition-all ${
              banner.is_active ? "border-gray-100" : "border-dashed border-gray-200 opacity-60"
            }`}
          >
            <div className="flex items-stretch">
              {/* Miniature */}
              <div className="relative w-44 md:w-56 flex-shrink-0 bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={banner.image_url}
                  alt={banner.title}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-2 left-2 w-6 h-6 rounded-md bg-black/60 text-white text-[10px] font-bold flex items-center justify-center backdrop-blur-sm">
                  {index + 1}
                </span>
                {!banner.is_active && (
                  <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                    <span className="px-2 py-1 rounded-lg bg-gray-800/80 text-white text-[10px] font-bold">INACTIF</span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
                <div>
                  <h3 className="font-bold text-gray-900 truncate">{banner.title || "Sans titre"}</h3>
                  {banner.subtitle && (
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{banner.subtitle}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    <span className="inline-flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                      {banner.href}
                    </span>
                  </p>
                </div>

                <div className="flex items-center gap-2 mt-3">
                  {/* Toggle active */}
                  <button
                    onClick={() => toggleActive(banner)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      banner.is_active
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    {banner.is_active ? "✓ Actif" : "Inactif"}
                  </button>

                  {/* Reorder */}
                  <div className="flex gap-0.5">
                    <button
                      onClick={() => moveUp(index)}
                      disabled={index === 0}
                      className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-pink-500 disabled:opacity-20"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" /></svg>
                    </button>
                    <button
                      onClick={() => moveDown(index)}
                      disabled={index >= banners.length - 1}
                      className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-pink-500 disabled:opacity-20"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                  </div>

                  <div className="flex-1" />

                  {/* Edit */}
                  <button
                    onClick={() => openModal(banner)}
                    className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-blue-500 hover:bg-blue-50"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </button>

                  {/* Delete */}
                  {deleteConfirm === banner.id ? (
                    <button
                      onClick={() => { deleteBanner(banner.id); setDeleteConfirm(null); }}
                      className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-bold"
                    >
                      Confirmer
                    </button>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(banner.id)}
                      className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-red-400 hover:bg-red-50"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {banners.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-5xl mb-3"></p>
          <p className="text-sm">Aucune bannière. Ajoutez-en une pour le carrousel.</p>
        </div>
      )}

      {/* ══════════════ MODAL ══════════════ */}
      {modal.open && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setModal({ open: false, banner: null })}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[92vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl z-10">
              <h2 className="text-lg font-bold text-gray-900">
                {modal.banner ? "Modifier la bannière" : "Nouvelle bannière"}
              </h2>
              <button onClick={() => setModal({ open: false, banner: null })} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400"></button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5">
              {/* ── Image Upload Zone ── */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image de la bannière *</label>

                {form.image_url ? (
                  <div className="relative rounded-xl overflow-hidden border border-gray-200 group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={form.image_url} alt="Bannière" className="w-full aspect-[2.5/1] object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        className="px-3 py-2 rounded-lg bg-white/90 backdrop-blur-sm text-sm font-semibold text-gray-800 hover:bg-white shadow"
                      >
                        Remplacer
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, image_url: "" }))}
                        className="px-3 py-2 rounded-lg bg-red-500/90 backdrop-blur-sm text-sm font-semibold text-white hover:bg-red-600 shadow"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOver(false);
                      const file = e.dataTransfer.files[0];
                      if (file) handleFileSelect(file);
                    }}
                    onClick={() => fileRef.current?.click()}
                    className={`aspect-[2.5/1] border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all ${
                      dragOver
                        ? "border-pink-400 bg-pink-50"
                        : "border-gray-200 bg-gray-50 hover:border-pink-300 hover:bg-pink-50/50"
                    }`}
                  >
                    {uploading ? (
                      <div className="flex items-center gap-2 text-pink-500">
                        <div className="w-5 h-5 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm font-medium">Upload en cours...</span>
                      </div>
                    ) : (
                      <>
                        <svg className="w-10 h-10 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-sm text-gray-500">
                          <span className="font-semibold text-pink-500">Cliquez</span> ou glissez-déposez
                        </p>
                        <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP — ratio 2.5:1 recommandé</p>
                      </>
                    )}
                  </div>
                )}

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect(file);
                    e.target.value = "";
                  }}
                />
              </div>


              {/* ── Title ── */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titre <span className="text-gray-400">(optionnel)</span></label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Nouvelle Collection — Jusqu’à -70%"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/30"
                />
              </div>

              {/* ── Subtitle ── */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sous-titre <span className="text-gray-400">(optionnel)</span></label>
                <input
                  type="text"
                  value={form.subtitle}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  placeholder="Découvrez nos dernières tendances"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/30"
                />
              </div>

              {/* ── Show text toggle ── */}
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium text-gray-700">Afficher le texte sur la bannière</p>
                  <p className="text-xs text-gray-400 mt-0.5">Le titre et sous-titre seront visibles côté client</p>
                </div>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, show_text: !form.show_text })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    form.show_text ? "bg-purple-500" : "bg-gray-200"
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form.show_text ? "translate-x-6" : "translate-x-1"}`} />
                </button>
              </div>

              {/* ── Link ── */}
              <LinkSelector
                value={form.href}
                onChange={(href) => setForm({ ...form, href })}
                categories={categories}
              />

              {/* ── Active toggle ── */}
              <div className="flex items-center justify-between py-2">
                <span className="text-sm font-medium text-gray-700">Bannière active</span>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, is_active: !form.is_active })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    form.is_active ? "bg-pink-500" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                      form.is_active ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* ── Preview ── */}
              <BannerPreview imageUrl={form.image_url} title={form.title} subtitle={form.subtitle} showText={form.show_text} />

              {/* ── Actions ── */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModal({ open: false, banner: null })}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving || !form.image_url}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm font-semibold shadow-lg shadow-pink-500/25 disabled:opacity-50"
                >
                  {saving ? "Enregistrement..." : modal.banner ? "Enregistrer" : "Ajouter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════ CROP EDITOR ══════════════ */}
      {rawImageSrc && (
        <ImageCropEditor
          imageSrc={rawImageSrc}
          onCropComplete={handleCropComplete}
          onCancel={() => setRawImageSrc(null)}
        />
      )}
    </div>
  );
}
