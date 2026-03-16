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
  const { count: totalMessages } = await supabaseAdmin
    .from("chat_messages")
    .select("*", { count: "exact", head: true })
    .eq("role", "user");

  // Messages this week
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { count: messagesThisWeek } = await supabaseAdmin
    .from("chat_messages")
    .select("*", { count: "exact", head: true })
    .eq("role", "user")
    .gte("created_at", sevenDaysAgo.toISOString());

  return NextResponse.json({
    stats: {
      totalBots: totalBots || 0,
      totalDocuments: totalDocuments || 0,
      totalMessages: totalMessages || 0,
      messagesThisWeek: messagesThisWeek || 0,
    },
  });
}