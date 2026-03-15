// app/(dashboard)/dashboard/bots/[botId]/page.tsx

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import BotDetails from "@/components/dashboard/BotDetails";

interface Props {
  params: Promise<{ botId: string }>;
}

export default async function BotPage({ params }: Props) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { botId } = await params;

  // Fetch bot from database
  const { data: bot, error } = await supabaseAdmin
    .from("bots")
    .select("*")
    .eq("id", botId)
    .eq("user_id", userId) // make sure this bot belongs to this user
    .single();

  // If bot not found or doesn't belong to user → redirect
  if (error || !bot) redirect("/dashboard/bots");

  return <BotDetails bot={bot} />;
}