// app/(admin)/admin/bots/page.tsx
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";

export default async function AdminBotsPage() {
  try { await requireAdmin(); } catch { redirect("/dashboard"); }
  return (
    <div>
      <h1 className="text-2xl font-extrabold text-white">All Bots</h1>
      <p className="text-slate-400 mt-2">Coming soon...</p>
    </div>
  );
}