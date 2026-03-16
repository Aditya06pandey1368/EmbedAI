// app/(admin)/admin/page.tsx

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import AdminOverview from "../../../components/admin/AdminOverview";

export default async function AdminPage() {
  try {
    await requireAdmin();
  } catch {
    redirect("/dashboard");
  }

  return <AdminOverview />;
}