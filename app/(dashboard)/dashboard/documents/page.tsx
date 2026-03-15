// app/(dashboard)/dashboard/documents/page.tsx

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import DocumentsManager from "@/components/dashboard/DocumentsManager";

export default async function DocumentsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // Get all bots for the dropdown selector
  const { data: bots } = await supabaseAdmin
    .from("bots")
    .select("id, name")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return <DocumentsManager bots={bots ?? []} />;
}