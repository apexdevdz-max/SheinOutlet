"use client";

import { useState, useRef, useEffect } from "react";
import { useAdminStore } from "@/lib/store/useAdminStore";
import { toast } from "@/lib/store/useToastStore";
import type { Category, CategoryAttributeTemplate } from "@/lib/types";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { ImageCropModal } from "@/components/admin/ImageCropModal";

/* ── Quick sub-category inline modal ── */
function QuickAddSub({ parentId, onClose }: { parentId: string; onClose: () => void }) {
  const addCategory = useAdminStore((s) => s.addCategory);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    await addCategory({
      name: name.trim(),
      slug: name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
      parent_id: parentId,
      image_url: "",
      show_in_header: false,
      display_order: 0,
    } as any);
    setSaving(false);
    setName("");
    onClose();
  }

  return (
    <form onSubmit={handleAdd} className="flex items-center gap-2 pl-14 py-2 animate-fade-in">
      <span className="text-gray-300">└</span>
      <input
        autoFocus
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nom de la sous-catégorie..."
        className="flex-1 px-3 py-1.5 rounded-lg border border-pink-200 bg-pink-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/30"
      />
      <button type="submit" disabled={saving} className="px-3 py-1.5 rounded-lg bg-pink-500 text-white text-xs font-semibold hover:bg-pink-600 disabled:opacity-50">
        {saving ? "..." : "Ajouter"}
      </button>
      <button type="button" onClick={onClose} className="px-2 py-1.5 rounded-lg text-gray-400 hover:text-gray-600 text-xs">
        Annuler
      </button>
    </form>
  );
}

/* ── Attribute Templates Modal ── */
function AttributeTemplatesModal({ categoryId, categoryName, onClose }: { categoryId: string; categoryName: string; onClose: () => void }) {
  const [templates, setTemplates] = useState<CategoryAttributeTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [newValues, setNewValues] = useState("");
  const [saving, setSaving] = useState(false);

  // Fetch templates for this category
  useEffect(() => {
    fetch(`/api/admin/category-templates?category_id=${categoryId}`)
      .then((r) => r.json())
      .then((data) => setTemplates(data.templates || []))
      .catch(() => toast.error("Erreur chargement"))
      .finally(() => setLoading(false));
  }, [categoryId]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/category-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category_id: categoryId,
          attribute_name: newName.trim(),
          attribute_values: newValues.split(",").map((v) => v.trim()).filter(Boolean),
        }),
      });
      if (!res.ok) throw new Error();
      const { template } = await res.json();
      setTemplates([...templates, template]);
      setNewName("");
      setNewValues("");
      toast.success("Caractéristique ajoutée");
    } catch {
      toast.error("Erreur");
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    try {
      await fetch(`/api/admin/category-templates?id=${id}`, { method: "DELETE" });
      setTemplates(templates.filter((t) => t.id !== id));
      toast.success("Supprimé");
    } catch {
      toast.error("Erreur suppression");
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="border-b border-gray-100 px-5 py-4 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl z-10">
          <div>
            <h2 className="text-sm font-bold text-gray-900">Caractéristiques prédéfinies</h2>
            <p className="text-xs text-gray-400">{categoryName}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400"></button>
        </div>

        <div className="p-5 space-y-4">
          {loading && <p className="text-center text-sm text-gray-400">Chargement...</p>}

          {!loading && templates.length > 0 && (
            <div className="space-y-2">
              {templates.map((tpl) => (
                <div key={tpl.id} className="flex items-start justify-between gap-3 px-3 py-2 rounded-lg bg-gray-50">
                  <div>
                    <p className="text-sm font-medium text-gray-700">{tpl.attribute_name}</p>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {tpl.attribute_values.map((v, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 text-[10px] font-medium">{v}</span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(tpl.id)}
                    className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-red-300 hover:text-red-500 flex-shrink-0"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add new template */}
          <form onSubmit={handleAdd} className="space-y-3 pt-2 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Ajouter une caractéristique</p>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nom (ex: Capacité, Taille, Matière...)"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/30"
            />
            <input
              type="text"
              value={newValues}
              onChange={(e) => setNewValues(e.target.value)}
              placeholder="Valeurs séparées par virgule (ex: 128GB, 256GB, 512GB)"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/30"
            />
            <button
              type="submit"
              disabled={saving || !newName.trim()}
              className="w-full py-2 rounded-lg bg-pink-500 text-white text-sm font-semibold hover:bg-pink-600 disabled:opacity-50 transition-colors"
            >
              {saving ? "Ajout..." : "Ajouter"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function AdminCategories() {
  const categories = useAdminStore((s) => s.categories);
  const addCategory = useAdminStore((s) => s.addCategory);
  const updateCategory = useAdminStore((s) => s.updateCategory);
  const deleteCategory = useAdminStore((s) => s.deleteCategory);

  const [modal, setModal] = useState<{ open: boolean; category: Category | null }>({ open: false, category: null });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [quickAddParent, setQuickAddParent] = useState<string | null>(null);
  const [attrModalCat, setAttrModalCat] = useState<{ id: string; name: string } | null>(null);
  const [collapsedCats, setCollapsedCats] = useState<Set<string>>(new Set());
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const initializedRef = useRef(false);

  const parentCats = categories.filter((c) => !c.parent_id).sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

  // Collapse all subcategories by default on first load
  useEffect(() => {
    if (!initializedRef.current && parentCats.length > 0) {
      setCollapsedCats(new Set(parentCats.map((c) => c.id)));
      initializedRef.current = true;
    }
  }, [parentCats]);

  function getSubcategories(parentId: string) {
    return categories.filter((c) => c.parent_id === parentId).sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
  }

  function toggleCollapse(catId: string) {
    setCollapsedCats((prev) => {
      const next = new Set(prev);
      if (next.has(catId)) next.delete(catId);
      else next.add(catId);
      return next;
    });
  }

  /* ── Drag and drop handler ── */
  async function handleDragEnd(result: DropResult) {
    const { source, destination, type } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    if (type === "PARENT") {
      // Reorder parent categories
      const reordered = Array.from(parentCats);
      const [moved] = reordered.splice(source.index, 1);
      reordered.splice(destination.index, 0, moved);

      // Update all display_order values
      const updates = reordered.map((cat, i) =>
        updateCategory(cat.id, { display_order: i })
      );
      await Promise.all(updates);
    } else if (type === "SUB") {
      // Reorder subcategories within the same parent
      const parentId = source.droppableId.replace("sub-", "");
      const subs = getSubcategories(parentId);
      const reordered = Array.from(subs);
      const [moved] = reordered.splice(source.index, 1);
      reordered.splice(destination.index, 0, moved);

      const updates = reordered.map((cat, i) =>
        updateCategory(cat.id, { display_order: i })
      );
      await Promise.all(updates);
    }
  }

  /* ── Form state ── */
  const [form, setForm] = useState({
    name: "",
    slug: "",
    parent_id: "",
    image_url: "",
    show_in_header: true,
    display_order: 0,
  });
  const [subInputs, setSubInputs] = useState<string[]>([""]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function openModal(cat: Category | null) {
    if (cat) {
      setForm({
        name: cat.name,
        slug: cat.slug,
        parent_id: cat.parent_id || "",
        image_url: cat.image_url || "",
        show_in_header: cat.show_in_header ?? true,
        display_order: cat.display_order,
      });
      setSubInputs([]); // No sub-inputs when editing an existing category
    } else {
      setForm({ name: "", slug: "", parent_id: "", image_url: "", show_in_header: true, display_order: 0 });
      setSubInputs([""]);
    }
    setModal({ open: true, category: cat });
  }

  /* ── Image upload ── */
  async function handleImageUpload(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("files", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Upload failed");
      const { urls } = await res.json();
      if (urls && urls.length > 0) {
        setForm((f) => ({ ...f, image_url: urls[0] }));
      }
    } catch (err) {
      console.error("Upload error:", err);
    }
    setUploading(false);
  }

  /* ── Save handler ── */
  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const slug = form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const data: any = {
      name: form.name,
      slug,
      parent_id: form.parent_id || null,
      image_url: form.image_url,
      show_in_header: form.show_in_header,
      display_order: Number(form.display_order),
    };

    if (modal.category) {
      // Editing existing
      await updateCategory(modal.category.id, data);
    } else {
      // Creating new — include subcategories
      data.subcategories = subInputs.filter((s) => s.trim());
      await addCategory(data);
    }
    setSaving(false);
    setModal({ open: false, category: null });
  }

  /* ── Sub-input helpers ── */
  function addSubInput() {
    setSubInputs([...subInputs, ""]);
  }
  function updateSubInput(index: number, value: string) {
    const next = [...subInputs];
    next[index] = value;
    setSubInputs(next);
  }
  function removeSubInput(index: number) {
    setSubInputs(subInputs.filter((_, i) => i !== index));
  }

  const isCreatingParent = !modal.category && !form.parent_id;

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Catégories</h1>
          <p className="text-sm text-gray-500 mt-0.5">{parentCats.length} catégories principales · {categories.length - parentCats.length} sous-catégories</p>
        </div>
        <button
          onClick={() => openModal(null)}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm font-semibold hover:from-pink-600 hover:to-rose-600 transition-all shadow-lg shadow-pink-500/25 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Ajouter
        </button>
      </div>

      {/* Categories Grid with DnD */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="parent-list" type="PARENT">
          {(provided) => (
            <div className="space-y-4" ref={provided.innerRef} {...provided.droppableProps}>
              {parentCats.map((parent, index) => {
                const subs = getSubcategories(parent.id);
                const isCollapsed = collapsedCats.has(parent.id);
                return (
                  <Draggable key={parent.id} draggableId={parent.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`bg-white rounded-2xl border border-gray-100 overflow-hidden transition-shadow ${snapshot.isDragging ? "shadow-xl ring-2 ring-pink-300" : ""}`}
                      >
                        {/* Parent row */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                          <div className="flex items-center gap-3">
                            {/* Drag handle */}
                            <div
                              {...provided.dragHandleProps}
                              className="w-6 flex flex-col items-center justify-center gap-[3px] cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 flex-shrink-0"
                              title="Glisser pour réordonner"
                            >
                              <span className="block w-4 h-0.5 bg-current rounded-full" />
                              <span className="block w-4 h-0.5 bg-current rounded-full" />
                              <span className="block w-4 h-0.5 bg-current rounded-full" />
                            </div>
                            {/* Category image or fallback */}
                            {parent.image_url ? (
                              <img src={parent.image_url} alt={parent.name} className="w-12 h-12 rounded-xl object-cover" />
                            ) : (
                              <div className="w-12 h-12 rounded-xl bg-pink-50 flex items-center justify-center text-lg">
                                
                              </div>
                            )}
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-bold text-gray-900">{parent.name}</h3>
                                {parent.show_in_header && (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-green-100 text-green-700">NAV</span>
                                )}
                              </div>
                              <p className="text-xs text-gray-400">/{parent.slug} · {subs.length} sous-catégorie{subs.length > 1 ? "s" : ""}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {/* Toggle subcategories */}
                            {subs.length > 0 && (
                              <button
                                onClick={() => toggleCollapse(parent.id)}
                                title={isCollapsed ? "Afficher les sous-catégories" : "Masquer les sous-catégories"}
                                className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-transform"
                              >
                                <svg className={`w-4 h-4 transition-transform duration-200 ${isCollapsed ? "-rotate-90" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                              </button>
                            )}
                            {/* Quick add sub-category button */}
                            <button
                              onClick={() => setQuickAddParent(quickAddParent === parent.id ? null : parent.id)}
                              title="Ajouter une sous-catégorie"
                              className="w-8 h-8 rounded-lg hover:bg-green-50 flex items-center justify-center text-green-500"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            </button>
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

                        {/* Subcategories with DnD */}
                        {!isCollapsed && subs.length > 0 && (
                          <Droppable droppableId={`sub-${parent.id}`} type="SUB">
                            {(subProvided) => (
                              <div ref={subProvided.innerRef} {...subProvided.droppableProps} className="divide-y divide-gray-50">
                                {subs.map((sub, subIndex) => (
                                  <Draggable key={sub.id} draggableId={sub.id} index={subIndex}>
                                    {(subDrag, subSnap) => (
                                      <div
                                        ref={subDrag.innerRef}
                                        {...subDrag.draggableProps}
                                        className={`flex items-center justify-between px-5 py-3 pl-14 ${subSnap.isDragging ? "bg-pink-50 shadow-md rounded-lg" : ""}`}
                                      >
                                        <div className="flex items-center gap-2">
                                          {/* Sub drag handle */}
                                          <div
                                            {...subDrag.dragHandleProps}
                                            className="w-4 flex flex-col items-center justify-center gap-[2px] cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 mr-1"
                                          >
                                            <span className="block w-3 h-0.5 bg-current rounded-full" />
                                            <span className="block w-3 h-0.5 bg-current rounded-full" />
                                            <span className="block w-3 h-0.5 bg-current rounded-full" />
                                          </div>
                                          <span className="text-gray-300">└</span>
                                          <span className="text-sm text-gray-700">{sub.name}</span>
                                          <span className="text-xs text-gray-400">/{sub.slug}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <button
                                            onClick={() => setAttrModalCat({ id: sub.id, name: sub.name })}
                                            title="Caractéristiques prédéfinies"
                                            className="w-7 h-7 rounded-lg hover:bg-purple-50 flex items-center justify-center text-purple-400 hover:text-purple-600"
                                          >
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                          </button>
                                          <button onClick={() => openModal(sub)} className="w-7 h-7 rounded-lg hover:bg-blue-50 flex items-center justify-center text-blue-400">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                          </button>
                                          <button onClick={() => deleteCategory(sub.id)} className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-red-300">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                                {subProvided.placeholder}
                              </div>
                            )}
                          </Droppable>
                        )}

                        {/* Quick add sub-category inline */}
                        {quickAddParent === parent.id && (
                          <QuickAddSub parentId={parent.id} onClose={() => setQuickAddParent(null)} />
                        )}
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* ══════════════ MODAL ══════════════ */}
      {modal.open && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setModal({ open: false, category: null })}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Modal header */}
            <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl z-10">
              <h2 className="text-lg font-bold text-gray-900">{modal.category ? "Modifier la catégorie" : "Nouvelle catégorie"}</h2>
              <button onClick={() => setModal({ open: false, category: null })} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400"></button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la catégorie *</label>
                <input
                  type="text" required value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="ex: Femme, Homme, Beauté..."
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/30"
                />
              </div>

              {/* Image upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image de la catégorie</label>
                <p className="text-xs text-gray-400 mb-2">Apparaît sur le site entre le carrousel et les ventes flash</p>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleImageUpload(e.target.files[0]); }} />

                {form.image_url ? (
                  <div className="relative group">
                    <img src={form.image_url} alt="Aperçu" className="w-full h-40 object-cover rounded-xl border border-gray-100" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-3">
                      <button type="button" onClick={() => setCropModalOpen(true)} className="px-3 py-1.5 rounded-lg bg-white text-gray-800 text-xs font-semibold flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" /></svg>
                        Recadrer
                      </button>
                      <button type="button" onClick={() => fileRef.current?.click()} className="px-3 py-1.5 rounded-lg bg-white text-gray-800 text-xs font-semibold">Changer</button>
                      <button type="button" onClick={() => setForm({ ...form, image_url: "" })} className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-semibold">Supprimer</button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="w-full h-32 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-pink-300 hover:bg-pink-50/30 transition-colors"
                  >
                    {uploading ? (
                      <div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-xs text-gray-400">Cliquer pour uploader une image</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Show in header toggle */}
              <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-gray-700">Afficher dans la navigation</p>
                  <p className="text-xs text-gray-400">Visible dans la barre du header</p>
                </div>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, show_in_header: !form.show_in_header })}
                  className={`relative w-11 h-6 rounded-full transition-colors ${form.show_in_header ? "bg-pink-500" : "bg-gray-300"}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.show_in_header ? "translate-x-5" : ""}`} />
                </button>
              </div>

              {/* Parent selector (only when editing) */}
              {modal.category && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie parente</label>
                  <select value={form.parent_id} onChange={(e) => setForm({ ...form, parent_id: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/30">
                    <option value="">— Aucune (catégorie principale) —</option>
                    {parentCats.filter((c) => c.id !== modal.category?.id).map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Dynamic sub-categories (only when creating a parent) */}
              {isCreatingParent && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">Sous-catégories</label>
                    <button type="button" onClick={addSubInput} className="text-xs text-pink-500 font-semibold hover:text-pink-600 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                      Ajouter
                    </button>
                  </div>
                  <div className="space-y-2">
                    {subInputs.map((val, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-gray-300 text-sm">└</span>
                        <input
                          type="text"
                          value={val}
                          onChange={(e) => updateSubInput(i, e.target.value)}
                          placeholder={`Sous-catégorie ${i + 1}`}
                          className="flex-1 px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/30"
                        />
                        {subInputs.length > 1 && (
                          <button type="button" onClick={() => removeSubInput(i)} className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-red-400">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setModal({ open: false, category: null })} className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">Annuler</button>
                <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm font-semibold shadow-lg shadow-pink-500/25 disabled:opacity-50">
                  {saving ? "Enregistrement..." : modal.category ? "Enregistrer" : "Créer la catégorie"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════ IMAGE CROP MODAL ══════════════ */}
      {cropModalOpen && form.image_url && (
        <ImageCropModal
          imageUrl={form.image_url}
          onSave={(newUrl) => {
            setForm((f) => ({ ...f, image_url: newUrl }));
            setCropModalOpen(false);
          }}
          onClose={() => setCropModalOpen(false)}
        />
      )}

      {/* ══════════════ ATTRIBUTE TEMPLATES MODAL ══════════════ */}
      {attrModalCat && (
        <AttributeTemplatesModal
          categoryId={attrModalCat.id}
          categoryName={attrModalCat.name}
          onClose={() => setAttrModalCat(null)}
        />
      )}
    </div>
  );
}
