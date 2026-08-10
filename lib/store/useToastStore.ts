"use client";

import { create } from "zustand";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastState {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

/* ── Map common DB/API errors to user-friendly French messages ── */
const ERROR_MAP: [RegExp, string][] = [
  [/duplicate key.*categories_slug/i, "Cette catégorie existe déjà."],
  [/duplicate key.*products_slug/i, "Un produit avec ce nom existe déjà."],
  [/duplicate key/i, "Cet élément existe déjà dans la base de données."],
  [/violates foreign key/i, "Impossible de supprimer : cet élément est lié à d'autres données."],
  [/violates not-null/i, "Un champ obligatoire est manquant."],
  [/value too long/i, "Le texte saisi est trop long."],
  [/invalid input syntax/i, "Format de données invalide."],
  [/permission denied/i, "Vous n'avez pas les droits pour cette action."],
  [/network|fetch|ECONNREFUSED/i, "Erreur de connexion. Vérifiez votre réseau."],
  [/timeout|ETIMEDOUT/i, "Le serveur met trop de temps à répondre."],
  [/413|too large/i, "Le fichier est trop volumineux."],
  [/404|not found/i, "Élément introuvable."],
  [/401|unauthorized/i, "Session expirée. Veuillez vous reconnecter."],
  [/500|internal server/i, "Erreur interne du serveur. Réessayez plus tard."],
];

export function humanizeError(raw: string): string {
  for (const [pattern, friendly] of ERROR_MAP) {
    if (pattern.test(raw)) return friendly;
  }
  // If no match, try to extract the message after "error:"
  const match = raw.match(/["""]?error["""]?\s*:\s*["""]?(.+?)["""]?\s*[},]?$/i);
  if (match) return match[1].trim();
  return raw.length > 120 ? raw.slice(0, 120) + "…" : raw;
}

let counter = 0;

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  addToast: (toast) => {
    const id = `toast-${++counter}-${Date.now()}`;
    const duration = toast.duration ?? (toast.type === "error" ? 6000 : 3500);
    set((s) => ({ toasts: [...s.toasts, { ...toast, id, duration }] }));

    // Auto-dismiss
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, duration);
  },

  removeToast: (id) => {
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
  },
}));

/* ── Shorthand helpers ── */
export const toast = {
  success: (title: string, message?: string) =>
    useToastStore.getState().addToast({ type: "success", title, message }),
  error: (title: string, message?: string) =>
    useToastStore.getState().addToast({ type: "error", title, message: message ? humanizeError(message) : undefined }),
  info: (title: string, message?: string) =>
    useToastStore.getState().addToast({ type: "info", title, message }),
  warning: (title: string, message?: string) =>
    useToastStore.getState().addToast({ type: "warning", title, message }),
  /** Parse a raw error and show a user-friendly toast */
  apiError: (rawError: string | Error) => {
    const raw = rawError instanceof Error ? rawError.message : rawError;
    useToastStore.getState().addToast({
      type: "error",
      title: "Erreur",
      message: humanizeError(raw),
    });
  },
};
