// app/(dashboard)/dashboard/history/page.tsx

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import ChatHistory from "@/components/dashboard/ChatHistory";

export default async function HistoryPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { data: bots } = await supabaseAdmin
    .from("bots")
    .select("id, name")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return <ChatHistory bots={bots ?? []} />;
}