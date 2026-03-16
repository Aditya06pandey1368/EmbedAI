// app/(admin)/admin/users/page.tsx

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import AdminUsers from "../../../../components/admin/AdminUsers";

export default async function AdminUsersPage() {
  try {
    await requireAdmin();
  } catch {
    redirect("/dashboard");
  }
  return <AdminUsers />;
}