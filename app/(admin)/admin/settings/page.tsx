// app/(admin)/admin/settings/page.tsx

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import AdminSettings from "@/components/admin/AdminSettings";

export default async function AdminSettingsPage() {
  try { await requireAdmin(); } catch { redirect("/dashboard"); }
  return <AdminSettings />;
}