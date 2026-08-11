"use client";

import { useEffect } from "react";
import { useAdminStore } from "@/lib/store/useAdminStore";

/**
 * Client component that fetches all admin data from Supabase
 * on mount. Placed in the admin layout to run once.
 */
export function AdminDataProvider({ children }: { children: React.ReactNode }) {
  const fetchAll = useAdminStore((s) => s.fetchAll);
  const loading = useAdminStore((s) => s.loading);
  const error = useAdminStore((s) => s.error);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Chargement des données...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center bg-red-50 rounded-2xl p-8 max-w-md">
          <p className="text-red-600 font-semibold mb-2"> Erreur</p>
          <p className="text-sm text-red-500 mb-4">{error}</p>
          <button
            onClick={() => fetchAll()}
            className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
