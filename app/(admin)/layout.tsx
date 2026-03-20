// app/(admin)/layout.tsx

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminNavbar from "@/components/admin/AdminNavbar";
import PageTransition from "@/components/shared/PageTransition";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    await requireAdmin();
  } catch {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen bg-slate-950">
      <div className="fixed top-0 left-0 right-0 h-1 bg-red-500 z-50" />
      <AdminSidebar />
      <div className="flex-1 flex flex-col pt-1">
        <AdminNavbar />
        <main className="flex-1 p-6 overflow-auto">
          <PageTransition>
            {children}
          </PageTransition>
        </main>
      </div>
    </div>
  );
}