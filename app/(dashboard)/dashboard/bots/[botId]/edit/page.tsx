// app/(dashboard)/dashboard/bots/[botId]/edit/page.tsx

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import EditBotForm from "@/components/dashboard/EditBotForm";

interface Props {
  params: Promise<{ botId: string }>;
}

export default async function EditBotPage({ params }: Props) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { botId } = await params;

  const { data: bot } = await supabaseAdmin
    .from("bots")
    .select("*")
    .eq("id", botId)
    .eq("user_id", userId)
    .single();

  if (!bot) redirect("/dashboard/bots");

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-white">Edit Bot</h1>
        <p className="text-slate-400 mt-1 text-sm">
          Update your bot's settings and appearance.
        </p>
      </div>
      <EditBotForm bot={bot} />
    </div>
  );
}