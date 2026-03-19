// app/(admin)/admin/documents/page.tsx

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { supabaseAdmin } from "@/lib/supabase";
import AdminDocumentsList from "../../../../components/admin/AdminDocumentsList";

export default async function AdminDocumentsPage() {
  try { await requireAdmin(); } catch { redirect("/dashboard"); }

  const { data: documents } = await supabaseAdmin
    .from("documents")
    .select(`
      id, name, status, file_size, chunk_count, created_at,
      users ( email, name )
    `)
    .order("created_at", { ascending: false });

  return <AdminDocumentsList documents={documents ?? []} />;
}