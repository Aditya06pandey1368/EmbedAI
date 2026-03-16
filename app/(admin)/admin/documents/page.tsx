// app/(admin)/admin/documents/page.tsx
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";

export default async function AdminDocumentsPage() {
  try { await requireAdmin(); } catch { redirect("/dashboard"); }
  return (
    <div>
      <h1 className="text-2xl font-extrabold text-white">All Documents</h1>
      <p className="text-slate-400 mt-2">Coming soon...</p>
    </div>
  );
}