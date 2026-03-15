// app/(dashboard)/dashboard/bots/[botId]/chat/page.tsx

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import ChatWidget from "@/components/widget/ChatWidget";

interface Props {
  params: Promise<{ botId: string }>;
}

export default async function BotChatTestPage({ params }: Props) {
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
    <div className="min-h-screen bg-slate-950 relative">

      {/* Page content */}
      <div className="max-w-2xl mx-auto pt-20 px-4 text-center">
        <h1 className="text-3xl font-extrabold text-white mb-3">
          Test your bot
        </h1>
        <p className="text-slate-400 mb-4">
          This is how your chatbot will look on your website.
          Click the bubble in the bottom right corner.
        </p>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
          <p className="text-slate-500 text-sm">
            ← Your website content would be here →
          </p>
        </div>
      </div>

      {/* The actual widget */}
      <ChatWidget
        botId={bot.id}
        botName={bot.name}
        welcomeMessage={bot.welcome_message}
        primaryColor={bot.primary_color}
      />
    </div>
  );
}