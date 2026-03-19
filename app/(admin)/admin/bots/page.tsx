// app/(admin)/admin/bots/page.tsx

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { supabaseAdmin } from "@/lib/supabase";
import AdminBotsList from "@/components/admin/AdminBotsList";

export default async function AdminBotsPage() {
  try { await requireAdmin(); } catch { redirect("/dashboard"); }

  const { data } = await supabaseAdmin
    .from("bots")
    .select(`
      id, name, is_active, total_messages, created_at,
      users ( email, name )
    `)
    .order("created_at", { ascending: false });

  // Cast to any to avoid complex Supabase type issues
  const bots = (data ?? []) as any[];

  return <AdminBotsList bots={bots} />;
}