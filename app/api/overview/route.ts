// app/api/overview/route.ts

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Total bots
  const { count: totalBots } = await supabaseAdmin
    .from("bots")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  // Total documents
  const { count: totalDocuments } = await supabaseAdmin
    .from("documents")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "done");

  // Total messages
  // Get user's bot IDs first
  const { data: userBots } = await supabaseAdmin
    .from("bots")
    .select("id")
    .eq("user_id", userId);

  const botIds = userBots?.map((b) => b.id) ?? [];

  // Total messages — only from user's bots
  const { count: totalMessages } = botIds.length > 0
    ? await supabaseAdmin
      .from("chat_messages")
      .select("*", { count: "exact", head: true })
      .eq("role", "user")
      .in("bot_id", botIds)
    : { count: 0 };

  // Messages this week — only from user's bots
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { count: messagesThisWeek } = botIds.length > 0
    ? await supabaseAdmin
      .from("chat_messages")
      .select("*", { count: "exact", head: true })
      .eq("role", "user")
      .in("bot_id", botIds)
      .gte("created_at", sevenDaysAgo.toISOString())
    : { count: 0 };

  // Add at the end of the GET function, replace the return:
  return NextResponse.json(
    { stats: { totalBots, totalDocuments, totalMessages, messagesThisWeek } },
    {
      headers: {
        "Cache-Control": "private, max-age=30", // cache for 30 seconds
      },
    }
  );
}