import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminDataProvider } from "@/components/admin/AdminDataProvider";
import { AdminLangGuard } from "@/components/admin/AdminLangGuard";
import { Suspense } from "react";

export const metadata = {
  title: "Admin — SHEIN Outlet",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminLangGuard>
      <div className="min-h-screen bg-gray-50">
        <Suspense fallback={null}>
          <AdminSidebar />
        </Suspense>
        <main className="ml-64 min-h-screen">
          <AdminDataProvider>{children}</AdminDataProvider>
        </main>
      </div>
    </AdminLangGuard>
  );
}
