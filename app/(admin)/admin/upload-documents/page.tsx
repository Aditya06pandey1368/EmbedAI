// app/(admin)/admin/upload-documents/page.tsx

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { supabaseAdmin } from "@/lib/supabase";
import DocumentsManager from "@/components/dashboard/DocumentsManager";

export default async function AdminUploadDocumentsPage() {
  const userId = await requireAdmin().catch(() => null);
  if (!userId) redirect("/dashboard");

  // Get all bots owned by admin
  const { data: bots } = await supabaseAdmin
    .from("bots")
    .select("id, name")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-white">
          Upload Company Documents
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Upload documents to train EmbedAI's company bots.
        </p>
      </div>
      <DocumentsManager bots={bots ?? []} />
    </div>
  );
}