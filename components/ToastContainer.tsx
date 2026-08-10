"use client";

import { useToastStore, type ToastType } from "@/lib/store/useToastStore";
import { useEffect, useState } from "react";

const ICONS: Record<ToastType, React.ReactNode> = {
  success: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3l9.5 16.5H2.5L12 3z" />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
    </svg>
  ),
};

const STYLES: Record<ToastType, { bg: string; border: string; icon: string; text: string }> = {
  success: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    icon: "text-emerald-500 bg-emerald-100",
    text: "text-emerald-800",
  },
  error: {
    bg: "bg-red-50",
    border: "border-red-200",
    icon: "text-red-500 bg-red-100",
    text: "text-red-800",
  },
  warning: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    icon: "text-amber-600 bg-amber-100",
    text: "text-amber-800",
  },
  info: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: "text-blue-500 bg-blue-100",
    text: "text-blue-800",
  },
};

function ToastItem({ id, type, title, message, duration }: { id: string; type: ToastType; title: string; message?: string; duration?: number }) {
  const removeToast = useToastStore((s) => s.removeToast);
  const [exiting, setExiting] = useState(false);
  const s = STYLES[type];

  useEffect(() => {
    const exitTime = (duration || 3500) - 400;
    const t = setTimeout(() => setExiting(true), exitTime);
    return () => clearTimeout(t);
  }, [duration]);

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-sm max-w-sm w-full transition-all duration-300 ${s.bg} ${s.border} ${
        exiting ? "opacity-0 translate-x-8" : "opacity-100 translate-x-0"
      }`}
      role="alert"
    >
      {/* Icon */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${s.icon}`}>
        {ICONS[type]}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pt-0.5">
        <p className={`text-sm font-semibold ${s.text}`}>{title}</p>
        {message && (
          <p className={`text-xs mt-0.5 ${s.text} opacity-80`}>{message}</p>
        )}
      </div>

      {/* Close */}
      <button
        onClick={() => removeToast(id)}
        className={`flex-shrink-0 p-1 rounded-md hover:bg-black/5 transition-colors ${s.text} opacity-50 hover:opacity-100`}
        aria-label="Fermer"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto animate-slide-in-right">
          <ToastItem {...t} />
        </div>
      ))}
    </div>
  );
}
