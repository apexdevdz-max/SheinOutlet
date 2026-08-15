"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useAdminStore } from "@/lib/store/useAdminStore";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { ImageCropEditor } from "@/components/admin/ImageCropEditor";
import type { Product, Category, CategoryAttributeTemplate, ProductAttribute } from "@/lib/types";

/* ══════════════════════════════════════════════════════════ */
/*  Shared UI Components                                     */
/* ══════════════════════════════════════════════════════════ */

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled ? "bg-pink-500" : "bg-gray-200"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          enabled ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

/* ══════════════════════════════════════════════════════════ */
/*  Media Uploader Component                                 */
/* ══════════════════════════════════════════════════════════ */

const PRODUCT_ASPECT_RATIO = 3 / 4; // Portrait 3:4 — matches ProductCard display

function MediaUploader({
  images,
  onChange,
}: {
  images: string[];
  onChange: (urls: string[]) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Crop queue state
  const [cropQueue, setCropQueue] = useState<File[]>([]);
  const [cropSrc, setCropSrc] = useState<string | null>(null);

  // When cropQueue changes, load the next image for cropping
  useEffect(() => {
    if (cropQueue.length > 0 && !cropSrc) {
      const file = cropQueue[0];
      const reader = new FileReader();
      reader.onload = () => setCropSrc(reader.result as string);
      reader.readAsDataURL(file);
    }
  }, [cropQueue, cropSrc]);

  // Upload a single blob to Cloudinary
  const uploadBlob = useCallback(
    async (blob: Blob, filename: string) => {
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("files", new File([blob], filename, { type: blob.type }));

        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const err = await res.json();
          alert(err.error || "Erreur d'upload");
          return;
        }

        const { urls } = await res.json();
        if (Array.isArray(urls) && urls.length > 0) {
          onChange([...images, ...urls]);
        }
      } catch {
        alert("Erreur lors de l'upload");
      } finally {
        setUploading(false);
      }
    },
    [images, onChange]
  );

  // Upload raw files directly (for videos)
  const uploadFilesDirect = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;
      setUploading(true);
      try {
        const formData = new FormData();
        files.forEach((f) => formData.append("files", f));

        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const err = await res.json();
          alert(err.error || "Erreur d'upload");
          return;
        }

        const { urls } = await res.json();
        if (Array.isArray(urls)) {
          onChange([...images, ...urls]);
        }
      } catch {
        alert("Erreur lors de l'upload des fichiers");
      } finally {
        setUploading(false);
      }
    },
    [images, onChange]
  );

  // Entry point: separate images (→ crop queue) and videos (→ direct upload)
  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      if (fileArray.length === 0) return;

      const imageFiles: File[] = [];
      const videoFiles: File[] = [];

      for (const f of fileArray) {
        if (f.type.startsWith("video/")) {
          videoFiles.push(f);
        } else if (f.type.startsWith("image/")) {
          imageFiles.push(f);
        }
      }

      // Videos: upload immediately without crop
      if (videoFiles.length > 0) {
        uploadFilesDirect(videoFiles);
      }

      // Images: add to crop queue
      if (imageFiles.length > 0) {
        setCropQueue((prev) => [...prev, ...imageFiles]);
      }
    },
    [uploadFilesDirect]
  );

  // After crop: upload the cropped blob, advance queue
  function handleCropComplete(blob: Blob) {
    const currentFile = cropQueue[0];
    const filename = currentFile ? currentFile.name.replace(/\.[^.]+$/, ".webp") : "product.webp";
    uploadBlob(blob, filename);
    setCropSrc(null);
    setCropQueue((prev) => prev.slice(1));
  }

  // Cancel crop: skip this file, advance queue
  function handleCropCancel() {
    setCropSrc(null);
    setCropQueue((prev) => prev.slice(1));
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  }

  function removeImage(index: number) {
    onChange(images.filter((_, i) => i !== index));
  }

  function handleImageDragEnd(result: DropResult) {
    if (!result.destination) return;
    if (result.source.index === result.destination.index) return;
    const reordered = Array.from(images);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    onChange(reordered);
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Photos & Vidéos du produit
      </label>

      {/* Existing images preview with drag & drop */}
      {images.length > 0 && (
        <DragDropContext onDragEnd={handleImageDragEnd}>
          <Droppable droppableId="product-images" direction="horizontal">
            {(provided) => (
              <div
                className="flex flex-wrap gap-2 mb-3"
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {images.map((url, i) => (
                  <Draggable key={`img-${i}-${url}`} draggableId={`img-${i}-${url}`} index={i}>
                    {(dragProvided, snapshot) => (
                      <div
                        ref={dragProvided.innerRef}
                        {...dragProvided.draggableProps}
                        {...dragProvided.dragHandleProps}
                        className={`relative group w-20 h-20 rounded-lg overflow-hidden border bg-gray-50 cursor-grab active:cursor-grabbing transition-all ${
                          snapshot.isDragging
                            ? "ring-2 ring-pink-400 shadow-lg opacity-90 scale-105"
                            : "border-gray-200 hover:border-pink-300"
                        } ${i === 0 ? "ring-2 ring-pink-500" : ""}`}
                      >
                        {url.includes("/video/") ? (
                          <div className="w-full h-full flex items-center justify-center bg-gray-800 text-white text-xs">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          </div>
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={url} alt="" className="w-full h-full object-cover" />
                        )}
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); removeImage(i); }}
                          className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                        >
                          x
                        </button>
                        <span className={`absolute bottom-0 left-0 right-0 text-white text-[8px] text-center py-0.5 transition-opacity ${
                          i === 0 ? "bg-pink-500 opacity-100 font-bold" : "bg-black/50 opacity-0 group-hover:opacity-100"
                        }`}>
                          {i === 0 ? "Principale" : i + 1}
                        </span>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
          dragOver
            ? "border-pink-400 bg-pink-50"
            : "border-gray-200 bg-gray-50 hover:border-pink-300 hover:bg-pink-50/50"
        }`}
      >
        {uploading ? (
          <div className="flex items-center justify-center gap-2 text-pink-500">
            <div className="w-5 h-5 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium">Upload en cours...</span>
          </div>
        ) : (
          <>
            <svg className="w-8 h-8 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm text-gray-500">
              <span className="font-medium text-pink-500">Cliquez pour choisir</span> ou glissez-déposez
            </p>
            <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP, MP4 — max 10 MB</p>
          </>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files) handleFiles(e.target.files);
          e.target.value = ""; // Reset so the same file can be re-selected
        }}
      />

      {/* Manual URL input for existing URLs */}
      <details className="mt-2">
        <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">
          Ou ajouter une URL manuellement
        </summary>
        <div className="mt-1 flex gap-2">
          <input
            type="text"
            placeholder="https://..."
            id="manual-url-input"
            className="flex-1 px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-xs focus:outline-none focus:ring-2 focus:ring-pink-500/30"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                const input = e.target as HTMLInputElement;
                if (input.value.trim()) {
                  onChange([...images, input.value.trim()]);
                  input.value = "";
                }
              }
            }}
          />
          <button
            type="button"
            className="px-3 py-2 rounded-lg bg-gray-100 text-xs font-medium text-gray-600 hover:bg-gray-200"
            onClick={() => {
              const input = document.getElementById("manual-url-input") as HTMLInputElement;
              if (input?.value.trim()) {
                onChange([...images, input.value.trim()]);
                input.value = "";
              }
            }}
          >
            Ajouter
          </button>
        </div>
      </details>

      {/* ══════════ CROP EDITOR MODAL ══════════ */}
      {cropSrc && (
        <ImageCropEditor
          imageSrc={cropSrc}
          aspectRatio={PRODUCT_ASPECT_RATIO}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════ */
/*  Product Form Modal                                       */
/* ══════════════════════════════════════════════════════════ */

function ProductModal({
  product,
  categories,
  onSave,
  onClose,
}: {
  product: Product | null;
  categories: Category[];
  onSave: (data: Omit<Product, "id" | "created_at">) => void;
  onClose: () => void;
}) {
  // Find current parent category for editing
  const currentCat = product
    ? categories.find((c) => c.id === product.category_id)
    : null;
  const currentParentId = currentCat?.parent_id || currentCat?.id || "";

  // Compute initial discount
  const initialDiscount = product?.old_price && product.old_price > product.price
    ? Math.round((1 - product.price / product.old_price) * 100)
    : 0;
  // Build initial attributes from product data
  function getInitialAttributes(): ProductAttribute[] {
    if (product?.attributes && product.attributes.length > 0) {
      return product.attributes.map((a) => ({ label: a.label, values: [...a.values] }));
    }
    // Fallback: build from legacy sizes/colors
    const attrs: ProductAttribute[] = [];
    if (product?.sizes && product.sizes.length > 0) {
      attrs.push({ label: product.sizes_label || "Taille", values: [...product.sizes] });
    }
    if (product?.colors && product.colors.length > 0) {
      attrs.push({ label: "Couleur", values: [...product.colors] });
    }
    return attrs;
  }

  const [form, setForm] = useState({
    name: product?.name || "",
    slug: product?.slug || "",
    description: product?.description || "",
    price: product?.price || 0,
    old_price: product?.old_price || 0,
    images: product?.images || [] as string[],
    parentCategoryId: currentParentId,
    category_id: product?.category_id || "",
    stock: product?.stock || 50,
    is_flash_sale: product?.is_flash_sale || false,
    is_best_seller: product?.is_best_seller || false,
    discountPercent: initialDiscount,
  });

  const [attributes, setAttributes] = useState<ProductAttribute[]>(getInitialAttributes());
  // Raw text state for attribute values input (so commas can be typed freely)
  const [rawAttrValues, setRawAttrValues] = useState<Record<number, string>>(() => {
    const init: Record<number, string> = {};
    getInitialAttributes().forEach((a, i) => { init[i] = a.values.join(", "); });
    return init;
  });

  // Category data
  const parentCategories = categories.filter((c) => !c.parent_id);
  const subCategories = categories.filter((c) => c.parent_id === form.parentCategoryId);

  // When parent category changes, reset subcategory
  function handleParentChange(parentId: string) {
    const subs = categories.filter((c) => c.parent_id === parentId);
    setForm({
      ...form,
      parentCategoryId: parentId,
      category_id: subs.length > 0 ? "" : parentId,
    });
  }

  // When subcategory changes
  function handleSubChange(subId: string) {
    setForm({ ...form, category_id: subId || form.parentCategoryId });
  }

  // Fetch attribute templates for the selected category
  const [attrTemplates, setAttrTemplates] = useState<CategoryAttributeTemplate[]>([]);
  useEffect(() => {
    const catId = form.category_id;
    if (!catId) { setAttrTemplates([]); return; }
    const cat = categories.find((c) => c.id === catId);
    if (!cat || !cat.parent_id) { setAttrTemplates([]); return; }
    fetch(`/api/admin/category-templates?category_id=${catId}`)
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setAttrTemplates(data); else setAttrTemplates([]); })
      .catch(() => setAttrTemplates([]));
  }, [form.category_id, categories]);

  // Attribute helpers
  function addAttribute(label: string = "", values: string[] = []) {
    setAttributes([...attributes, { label, values }]);
    setRawAttrValues((prev) => ({ ...prev, [attributes.length]: values.join(", ") }));
  }

  function removeAttribute(index: number) {
    setAttributes(attributes.filter((_, i) => i !== index));
    // Rebuild raw values map with corrected indices
    setRawAttrValues((prev) => {
      const next: Record<number, string> = {};
      let j = 0;
      for (let i = 0; i < attributes.length; i++) {
        if (i === index) continue;
        next[j] = prev[i] ?? attributes[i].values.join(", ");
        j++;
      }
      return next;
    });
  }

  function updateAttributeLabel(index: number, label: string) {
    setAttributes(attributes.map((a, i) => i === index ? { ...a, label } : a));
  }

  function updateAttributeValues(index: number, rawStr: string) {
    setRawAttrValues((prev) => ({ ...prev, [index]: rawStr }));
  }

  function commitAttributeValues(index: number) {
    const raw = rawAttrValues[index] ?? "";
    const values = raw.split(",").map((v) => v.trim()).filter(Boolean);
    setAttributes(attributes.map((a, i) => i === index ? { ...a, values } : a));
  }

  function getAttributeValuesStr(index: number): string {
    return rawAttrValues[index] ?? attributes[index]?.values.join(", ") ?? "";
  }

  // Check if a template is already applied
  function isTemplateApplied(tpl: CategoryAttributeTemplate): boolean {
    return attributes.some(
      (a) => a.label.toLowerCase() === tpl.attribute_name.toLowerCase() &&
             tpl.attribute_values.every((v) => a.values.includes(v))
    );
  }

  // Toggle a template on/off
  function toggleTemplate(tpl: CategoryAttributeTemplate) {
    const existingIdx = attributes.findIndex(
      (a) => a.label.toLowerCase() === tpl.attribute_name.toLowerCase()
    );
    if (existingIdx >= 0) {
      // Remove it
      removeAttribute(existingIdx);
    } else {
      // Add it
      addAttribute(tpl.attribute_name, [...tpl.attribute_values]);
    }
  }

  // Discount percent → recalculate price from old_price
  function handleDiscountChange(percent: number) {
    const basePrice = form.old_price > 0 ? form.old_price : form.price;
    if (basePrice > 0 && percent > 0 && percent < 100) {
      const newPrice = Math.round(basePrice * (1 - percent / 100));
      setForm((f) => ({
        ...f,
        discountPercent: percent,
        price: Math.max(newPrice, 0),
        // If old_price wasn't set, set it to current price as the base
        old_price: f.old_price > 0 ? f.old_price : f.price,
      }));
    } else {
      setForm((f) => ({ ...f, discountPercent: percent }));
    }
  }

  // Old price change → recalculate with current discount
  function handleOldPriceChange(oldPrice: number) {
    if (oldPrice > 0 && form.discountPercent > 0) {
      const newPrice = Math.round(oldPrice * (1 - form.discountPercent / 100));
      setForm((f) => ({ ...f, old_price: oldPrice, price: Math.max(newPrice, 0) }));
    } else {
      setForm((f) => ({ ...f, old_price: oldPrice }));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Commit any raw attribute values that haven't been blurred yet
    const committedAttrs = attributes.map((a, i) => {
      const raw = rawAttrValues[i];
      if (raw !== undefined) {
        const values = raw.split(",").map((v) => v.trim()).filter(Boolean);
        return { ...a, values };
      }
      return a;
    });
    const slug =
      form.slug ||
      form.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    // Build legacy sizes/colors from attributes for backward compat
    const cleanAttrs = committedAttrs.filter((a) => a.label.trim() && a.values.length > 0);
    const sizesAttr = cleanAttrs.find((a) => {
      const l = a.label.toLowerCase();
      return l.includes("taille") || l.includes("size") || l.includes("pointure") || l.includes("stockage") || l.includes("capacit");
    }) || cleanAttrs.find((a) => !a.label.toLowerCase().includes("couleur") && !a.label.toLowerCase().includes("color"));
    const colorsAttr = cleanAttrs.find((a) => {
      const l = a.label.toLowerCase();
      return l.includes("couleur") || l.includes("color");
    });

    onSave({
      name: form.name,
      slug,
      description: form.description,
      price: Number(form.price),
      old_price: form.old_price ? Number(form.old_price) : null,
      images: form.images,
      category_id: form.category_id || null,
      attributes: cleanAttrs,
      sizes: sizesAttr?.values || [],
      sizes_label: sizesAttr?.label || "Taille",
      colors: colorsAttr?.values || [],
      stock: Number(form.stock),
      is_flash_sale: form.is_flash_sale,
      is_best_seller: form.is_best_seller,
    });
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 rounded-t-2xl flex items-center justify-between z-10">
          <h2 className="text-lg font-bold text-gray-900">
            {product ? "Modifier le produit" : "Nouveau produit"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom du produit *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/30 focus:border-pink-400"
              placeholder="Robe Élégante Rose Pastel"
            />
          </div>

          {/* ── Category selectors (parent + sub) ── */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie *</label>
              <select
                required
                value={form.parentCategoryId}
                onChange={(e) => handleParentChange(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/30 focus:border-pink-400"
              >
                <option value="">— Sélectionner —</option>
                {parentCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sous-catégorie</label>
              <select
                value={subCategories.length > 0 ? form.category_id : ""}
                onChange={(e) => handleSubChange(e.target.value)}
                disabled={subCategories.length === 0}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/30 focus:border-pink-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">— Aucune —</option>
                {subCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ── Price row with discount ── */}
          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ancien prix (DA)</label>
              <input
                type="number"
                value={form.old_price || ""}
                onChange={(e) => handleOldPriceChange(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/30 focus:border-pink-400"
                placeholder="3000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Réduction (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  max={99}
                  value={form.discountPercent || ""}
                  onChange={(e) => handleDiscountChange(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-orange-200 bg-orange-50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400 font-semibold text-orange-600"
                  placeholder="15"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-orange-400 text-sm font-bold">%</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prix final (DA) *</label>
              <input
                type="number"
                required
                value={form.price}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                className="w-full px-3 py-2.5 rounded-xl border border-green-200 bg-green-50 text-sm focus:outline-none focus:ring-2 focus:ring-green-400/30 focus:border-green-400 font-bold text-green-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock *</label>
              <input
                type="number"
                required
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/30 focus:border-pink-400"
              />
            </div>
          </div>

          {/* Live discount preview */}
          {form.old_price > 0 && form.price > 0 && form.price < form.old_price && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-pink-50 to-orange-50 border border-pink-100">
              <span className="text-xs text-gray-500">Économie :</span>
              <span className="text-sm font-bold text-pink-600">
                {(form.old_price - form.price).toLocaleString()} DA
              </span>
              <span className="text-xs text-gray-400">
                (soit -{Math.round((1 - form.price / form.old_price) * 100)}%)
              </span>
              <span className="ml-auto text-xs text-gray-400 line-through">
                {form.old_price.toLocaleString()} DA
              </span>
              <span className="text-sm font-bold text-green-600">
                → {form.price.toLocaleString()} DA
              </span>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/30 focus:border-pink-400 resize-none"
            />
          </div>

          {/* ── Media Upload ── */}
          <MediaUploader
            images={form.images}
            onChange={(urls) => setForm({ ...form, images: urls })}
          />

          {/* ══════ DYNAMIC ATTRIBUTES ══════ */}
          {attributes.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Caractéristiques du produit</p>
              {attributes.map((attr, idx) => (
                <div key={idx} className="flex items-start gap-2 p-3 rounded-xl border border-gray-100 bg-gray-50/50">
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={attr.label}
                      onChange={(e) => updateAttributeLabel(idx, e.target.value)}
                      placeholder="Nom (ex: Stockage, Couleur, Matière...)"
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-400/30 focus:border-purple-400"
                    />
                    <input
                      type="text"
                      value={getAttributeValuesStr(idx)}
                      onChange={(e) => updateAttributeValues(idx, e.target.value)}
                      onBlur={() => commitAttributeValues(idx)}
                      placeholder="Valeurs séparées par virgules (ex: 128GB, 256GB, 1TB)"
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-400/30 focus:border-purple-400"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAttribute(idx)}
                    className="mt-2 w-7 h-7 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors flex-shrink-0"
                    title="Supprimer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add manual attribute button */}
          <button
            type="button"
            onClick={() => addAttribute()}
            className="w-full py-2.5 rounded-xl border-2 border-dashed border-gray-200 text-sm font-medium text-gray-400 hover:border-purple-300 hover:text-purple-500 hover:bg-purple-50/30 transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Ajouter une caractéristique
          </button>

          {/* Predefined template toggles */}
          {attrTemplates.length > 0 && (
            <div className="rounded-xl border border-purple-100 bg-purple-50/30 p-3 space-y-3">
              <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                Caractéristiques prédéfinies
              </p>
              {attrTemplates.map((tpl) => {
                const applied = isTemplateApplied(tpl);
                const hasAttr = attributes.some((a) => a.label.toLowerCase() === tpl.attribute_name.toLowerCase());
                return (
                  <div key={tpl.id} className="flex items-center justify-between py-1">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700">{tpl.attribute_name}</p>
                      <p className="text-[11px] text-gray-400 truncate">{tpl.attribute_values.join(", ")}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleTemplate(tpl)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ml-3 ${
                        hasAttr ? "bg-purple-500" : "bg-gray-200"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                          hasAttr ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Toggles */}
          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <Toggle enabled={form.is_flash_sale} onChange={() => setForm({ ...form, is_flash_sale: !form.is_flash_sale })} />
              Vente Flash
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <Toggle enabled={form.is_best_seller} onChange={() => setForm({ ...form, is_best_seller: !form.is_best_seller })} />
              Meilleures ventes
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm font-semibold hover:from-pink-600 hover:to-rose-600 transition-all shadow-lg shadow-pink-500/25"
            >
              {product ? "Enregistrer" : "Ajouter le produit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════ */
/*  Bulk Action Modal                                        */
/* ══════════════════════════════════════════════════════════ */

function BulkActionModal({
  action,
  count,
  onConfirm,
  onClose,
}: {
  action: "discount" | "set_price";
  count: number;
  onConfirm: (value: number) => void;
  onClose: () => void;
}) {
  const [value, setValue] = useState<number>(0);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-gray-900 mb-1">
          {action === "discount" ? "Appliquer une réduction" : "Fixer le prix"}
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Sur {count} produit{count > 1 ? "s" : ""} sélectionné{count > 1 ? "s" : ""}
        </p>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {action === "discount" ? "Pourcentage de réduction" : "Nouveau prix (DA)"}
          </label>
          <div className="relative">
            <input
              type="number"
              min={0}
              max={action === "discount" ? 99 : undefined}
              value={value || ""}
              onChange={(e) => setValue(Number(e.target.value))}
              className={`w-full px-3 py-3 rounded-xl border text-lg font-bold focus:outline-none focus:ring-2 ${
                action === "discount"
                  ? "border-orange-200 bg-orange-50 text-orange-600 focus:ring-orange-400/30"
                  : "border-green-200 bg-green-50 text-green-700 focus:ring-green-400/30"
              }`}
              placeholder={action === "discount" ? "15" : "1200"}
              autoFocus
            />
            <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold ${
              action === "discount" ? "text-orange-400" : "text-green-400"
            }`}>
              {action === "discount" ? "%" : "DA"}
            </span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            onClick={() => value > 0 && onConfirm(value)}
            disabled={!value || value <= 0}
            className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm font-semibold hover:from-pink-600 hover:to-rose-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Appliquer
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════ */
/*  Main Admin Products Page                                 */
/* ══════════════════════════════════════════════════════════ */

export default function AdminProducts() {
  const products = useAdminStore((s) => s.products);
  const categories = useAdminStore((s) => s.categories);
  const addProduct = useAdminStore((s) => s.addProduct);
  const updateProduct = useAdminStore((s) => s.updateProduct);
  const deleteProduct = useAdminStore((s) => s.deleteProduct);
  const toggleStock = useAdminStore((s) => s.toggleStock);
  const toggleFlashSale = useAdminStore((s) => s.toggleFlashSale);
  const bulkDiscount = useAdminStore((s) => s.bulkDiscount);
  const bulkSetPrice = useAdminStore((s) => s.bulkSetPrice);

  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<{ open: boolean; product: Product | null }>({ open: false, product: null });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkModal, setBulkModal] = useState<{ open: boolean; action: "discount" | "set_price" } | null>(null);

  // ── Advanced Filter State ──
  const emptyFilters = {
    parentCategory: "",
    subCategory: "",
    priceMin: "",
    priceMax: "",
    sortPrice: "" as "" | "asc" | "desc",
    stockStatus: "" as "" | "in_stock" | "out_of_stock",
    flashSaleOnly: false,
    bestSellerOnly: false,
  };
  const [filters, setFilters] = useState(emptyFilters);
  const [draftFilters, setDraftFilters] = useState(emptyFilters);
  const [filterModalOpen, setFilterModalOpen] = useState(false);

  // Count active filters
  const activeFilterCount = [
    filters.parentCategory,
    filters.subCategory,
    filters.priceMin,
    filters.priceMax,
    filters.sortPrice,
    filters.stockStatus,
    filters.flashSaleOnly ? "x" : "",
    filters.bestSellerOnly ? "x" : "",
  ].filter(Boolean).length;

  // Category helpers for filter
  const parentCatsForFilter = categories.filter((c) => !c.parent_id);
  const subCatsForFilter = draftFilters.parentCategory
    ? categories.filter((c) => c.parent_id === draftFilters.parentCategory)
    : [];

  function openFilterModal() {
    setDraftFilters({ ...filters });
    setFilterModalOpen(true);
  }
  function applyFilters() {
    setFilters({ ...draftFilters });
    setFilterModalOpen(false);
  }
  function resetFilters() {
    setDraftFilters(emptyFilters);
    setFilters(emptyFilters);
    setFilterModalOpen(false);
  }

  // ── Filtering + Sorting Logic ──
  let filtered = products.filter((p) => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filters.parentCategory) {
      if (filters.subCategory) {
        if (p.category_id !== filters.subCategory) return false;
      } else {
        const subIds = categories.filter((c) => c.parent_id === filters.parentCategory).map((c) => c.id);
        if (p.category_id !== filters.parentCategory && !subIds.includes(p.category_id || "")) return false;
      }
    }
    if (filters.priceMin && p.price < Number(filters.priceMin)) return false;
    if (filters.priceMax && p.price > Number(filters.priceMax)) return false;
    if (filters.stockStatus === "in_stock" && p.stock <= 0) return false;
    if (filters.stockStatus === "out_of_stock" && p.stock > 0) return false;
    if (filters.flashSaleOnly && !p.is_flash_sale) return false;
    if (filters.bestSellerOnly && !p.is_best_seller) return false;
    return true;
  });

  if (filters.sortPrice === "asc") {
    filtered = [...filtered].sort((a, b) => a.price - b.price);
  } else if (filters.sortPrice === "desc") {
    filtered = [...filtered].sort((a, b) => b.price - a.price);
  }

  // Selection helpers
  const allSelected = filtered.length > 0 && filtered.every((p) => selectedIds.has(p.id));
  const someSelected = selectedIds.size > 0;

  function toggleSelectAll() {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((p) => p.id)));
    }
  }

  function toggleSelect(id: string) {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  }

  function getCategoryName(catId: string | null) {
    const cat = categories.find((c) => c.id === catId);
    if (!cat) return "—";
    // Show parent > sub format
    if (cat.parent_id) {
      const parent = categories.find((c) => c.id === cat.parent_id);
      return parent ? `${parent.name} › ${cat.name}` : cat.name;
    }
    return cat.name;
  }

  async function handleSave(data: Omit<Product, "id" | "created_at">) {
    if (modal.product) {
      await updateProduct(modal.product.id, data);
    } else {
      await addProduct(data);
    }
    setModal({ open: false, product: null });
  }

  async function handleBulkAction(value: number) {
    if (!bulkModal) return;
    const ids = Array.from(selectedIds);
    if (bulkModal.action === "discount") {
      await bulkDiscount(ids, value);
    } else {
      await bulkSetPrice(ids, value);
    }
    setBulkModal(null);
    setSelectedIds(new Set());
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Produits</h1>
          <p className="text-sm text-gray-500 mt-0.5">{products.length} produits au total</p>
        </div>
        <button
          onClick={() => setModal({ open: true, product: null })}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm font-semibold hover:from-pink-600 hover:to-rose-600 transition-all shadow-lg shadow-pink-500/25 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Ajouter un produit
        </button>
      </div>

      {/* Search + Filter Icon */}
      <div className="mb-4 flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un produit..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/30 focus:border-pink-400"
          />
        </div>

        {/* Filter trigger button */}
        <button
          onClick={openFilterModal}
          className={`relative w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${
            activeFilterCount > 0
              ? "border-pink-300 bg-pink-50 text-pink-600 shadow-sm"
              : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-700"
          }`}
          title="Filtres avancés"
        >
          <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          {activeFilterCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-pink-500 text-white text-[10px] font-bold flex items-center justify-center shadow">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Active filters summary chips */}
        {activeFilterCount > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {filters.parentCategory && (
              <span className="px-2.5 py-1 rounded-lg bg-pink-50 text-pink-700 text-xs font-medium border border-pink-200">
                {categories.find((c) => c.id === filters.parentCategory)?.name}
                {filters.subCategory && ` › ${categories.find((c) => c.id === filters.subCategory)?.name}`}
              </span>
            )}
            {(filters.priceMin || filters.priceMax) && (
              <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium border border-blue-200">
                {filters.priceMin && filters.priceMax ? `${filters.priceMin} – ${filters.priceMax} DA` : filters.priceMin ? `≥ ${filters.priceMin} DA` : `≤ ${filters.priceMax} DA`}
              </span>
            )}
            {filters.sortPrice && (
              <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 text-xs font-medium border border-purple-200">
                Prix {filters.sortPrice === "asc" ? "↑" : "↓"}
              </span>
            )}
            {filters.flashSaleOnly && (
              <span className="px-2.5 py-1 rounded-lg bg-orange-50 text-orange-700 text-xs font-medium border border-orange-200">Flash</span>
            )}
            {filters.bestSellerOnly && (
              <span className="px-2.5 py-1 rounded-lg bg-green-50 text-green-700 text-xs font-medium border border-green-200">Meilleures ventes</span>
            )}
            <button onClick={resetFilters} className="text-xs text-gray-400 hover:text-red-500 transition-colors ml-1" title="Réinitialiser">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        )}
      </div>

      {/* ══════════ FILTER MODAL ══════════ */}
      {filterModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setFilterModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filtres avancés
              </h2>
              <button onClick={() => setFilterModalOpen(false)} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400"></button>
            </div>

            <div className="p-6 space-y-5">
              {/* ── Catégorie / Sous-catégorie ── */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Navigation</label>
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={draftFilters.parentCategory}
                    onChange={(e) => setDraftFilters({ ...draftFilters, parentCategory: e.target.value, subCategory: "" })}
                    className="px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/30"
                  >
                    <option value="">Toutes les catégories</option>
                    {parentCatsForFilter.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <select
                    value={draftFilters.subCategory}
                    onChange={(e) => setDraftFilters({ ...draftFilters, subCategory: e.target.value })}
                    disabled={!draftFilters.parentCategory || subCatsForFilter.length === 0}
                    className="px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/30 disabled:opacity-40"
                  >
                    <option value="">Toutes les sous-cat.</option>
                    {subCatsForFilter.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* ── Tranches de Prix ── */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Tranches de prix (DA)</label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    value={draftFilters.priceMin}
                    onChange={(e) => setDraftFilters({ ...draftFilters, priceMin: e.target.value })}
                    placeholder="Prix min"
                    className="px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/30"
                  />
                  <input
                    type="number"
                    value={draftFilters.priceMax}
                    onChange={(e) => setDraftFilters({ ...draftFilters, priceMax: e.target.value })}
                    placeholder="Prix max"
                    className="px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/30"
                  />
                </div>
              </div>

              {/* ── Tri par prix ── */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Tri par prix</label>
                <div className="flex gap-2">
                  {([["", "Par défaut"], ["asc", "Croissant ↑"], ["desc", "Décroissant ↓"]] as const).map(([val, label]) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setDraftFilters({ ...draftFilters, sortPrice: val })}
                      className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all ${
                        draftFilters.sortPrice === val
                          ? "border-pink-400 bg-pink-50 text-pink-700"
                          : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Disponibilité ── */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Disponibilité</label>
                <div className="flex gap-2">
                  {([["", "Tous"], ["in_stock", "En stock"], ["out_of_stock", "Rupture"]] as const).map(([val, label]) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setDraftFilters({ ...draftFilters, stockStatus: val })}
                      className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all ${
                        draftFilters.stockStatus === val
                          ? "border-pink-400 bg-pink-50 text-pink-700"
                          : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Toggles rapides ── */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Filtres rapides</label>
                <div className="flex items-center gap-5">
                  <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <button
                      type="button"
                      onClick={() => setDraftFilters({ ...draftFilters, flashSaleOnly: !draftFilters.flashSaleOnly })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        draftFilters.flashSaleOnly ? "bg-orange-500" : "bg-gray-200"
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${draftFilters.flashSaleOnly ? "translate-x-6" : "translate-x-1"}`} />
                    </button>
                    Vente Flash
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <button
                      type="button"
                      onClick={() => setDraftFilters({ ...draftFilters, bestSellerOnly: !draftFilters.bestSellerOnly })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        draftFilters.bestSellerOnly ? "bg-green-500" : "bg-gray-200"
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${draftFilters.bestSellerOnly ? "translate-x-6" : "translate-x-1"}`} />
                    </button>
                    Meilleures ventes
                  </label>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="border-t border-gray-100 px-6 py-4 flex justify-between">
              <button
                onClick={resetFilters}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Réinitialiser
              </button>
              <button
                onClick={applyFilters}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm font-semibold shadow-lg shadow-pink-500/25 hover:from-pink-600 hover:to-rose-600 transition-all"
              >
                Appliquer les filtres
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Bulk Action Bar ── */}
      {someSelected && (
        <div className="mb-4 flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 animate-fade-in">
          <span className="text-sm font-semibold text-pink-700">
            {selectedIds.size} produit{selectedIds.size > 1 ? "s" : ""} sélectionné{selectedIds.size > 1 ? "s" : ""}
          </span>
          <div className="flex-1" />
          <button
            onClick={() => setBulkModal({ open: true, action: "discount" })}
            className="px-3 py-1.5 rounded-lg bg-orange-100 text-orange-700 text-xs font-semibold hover:bg-orange-200 transition-colors flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            Réduction %
          </button>
          <button
            onClick={() => setBulkModal({ open: true, action: "set_price" })}
            className="px-3 py-1.5 rounded-lg bg-green-100 text-green-700 text-xs font-semibold hover:bg-green-200 transition-colors flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Fixer le prix
          </button>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-xs font-medium hover:bg-gray-200 transition-colors"
          >
            Désélectionner
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                {/* Checkbox header */}
                <th className="w-10 px-3 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-pink-500 focus:ring-pink-500/30 cursor-pointer"
                  />
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Produit</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Catégorie</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">Prix</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600">Stock</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600">Flash</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const isSelected = selectedIds.has(p.id);
                const discount = p.old_price && p.old_price > p.price
                  ? Math.round((1 - p.price / p.old_price) * 100)
                  : null;

                return (
                  <tr
                    key={p.id}
                    className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${
                      isSelected ? "bg-pink-50/50" : ""
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="px-3 py-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(p.id)}
                        className="w-4 h-4 rounded border-gray-300 text-pink-500 focus:ring-pink-500/30 cursor-pointer"
                      />
                    </td>
                    {/* Product info */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                          {p.images[0] && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate max-w-[200px]">{p.name}</p>
                          <p className="text-xs text-gray-400">{p.slug}</p>
                        </div>
                      </div>
                    </td>
                    {/* Category */}
                    <td className="px-4 py-3 text-gray-600 text-xs">{getCategoryName(p.category_id)}</td>
                    {/* Price */}
                    <td className="px-4 py-3 text-right">
                      <span className="font-bold text-gray-900">{p.price.toLocaleString()} DA</span>
                      {p.old_price && (
                        <span className="block text-xs text-gray-400 line-through">
                          {p.old_price.toLocaleString()} DA
                        </span>
                      )}
                      {discount && (
                        <span className="inline-block mt-0.5 text-[10px] font-bold text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded-full">
                          -{discount}%
                        </span>
                      )}
                    </td>
                    {/* Stock toggle */}
                    <td className="px-4 py-3 text-center">
                      <Toggle enabled={p.stock > 0} onChange={() => toggleStock(p.id)} />
                    </td>
                    {/* Flash Sale toggle */}
                    <td className="px-4 py-3 text-center">
                      <Toggle enabled={p.is_flash_sale} onChange={() => toggleFlashSale(p.id)} />
                    </td>
                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setModal({ open: true, product: p })}
                          className="w-8 h-8 rounded-lg hover:bg-blue-50 flex items-center justify-center text-blue-500 transition-colors"
                          title="Modifier"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        {deleteConfirm === p.id ? (
                          <button
                            onClick={() => { deleteProduct(p.id); setDeleteConfirm(null); }}
                            className="px-2 py-1 rounded-lg bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition-colors"
                          >
                            Confirmer
                          </button>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(p.id)}
                            className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-red-400 transition-colors"
                            title="Supprimer"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">Aucun produit trouvé</div>
        )}
      </div>

      {/* Product Modal */}
      {modal.open && (
        <ProductModal
          product={modal.product}
          categories={categories}
          onSave={handleSave}
          onClose={() => setModal({ open: false, product: null })}
        />
      )}

      {/* Bulk Action Modal */}
      {bulkModal && (
        <BulkActionModal
          action={bulkModal.action}
          count={selectedIds.size}
          onConfirm={handleBulkAction}
          onClose={() => setBulkModal(null)}
        />
      )}
    </div>
  );
}
