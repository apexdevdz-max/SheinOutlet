import { AdminSidebar } from "@/components/admin/AdminSidebar";
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
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={null}>
        <AdminSidebar />
      </Suspense>
      <main className="ml-64 min-h-screen">
        {children}
      </main>
    </div>
  );
}
