// app/(dashboard)/dashboard/bots/page.tsx

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import BotsList from "../../../../components/dashboard/BotsList";

export default async function BotsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { data: bots } = await supabaseAdmin
    .from("bots")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return <BotsList bots={bots ?? []} />;
}