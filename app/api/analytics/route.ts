// app/api/analytics/route.ts

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const botId = searchParams.get("botId");

  if (!botId) {
    return NextResponse.json({ error: "botId is required" }, { status: 400 });
  }

  // Verify bot belongs to this user
  const { data: bot } = await supabaseAdmin
    .from("bots")
    .select("id, name, total_messages, created_at")
    .eq("id", botId)
    .eq("user_id", userId)
    .single();

  if (!bot) {
    return NextResponse.json({ error: "Bot not found" }, { status: 404 });
  }

  // Get total messages count
  const { count: totalMessages } = await supabaseAdmin
    .from("chat_messages")
    .select("*", { count: "exact", head: true })
    .eq("bot_id", botId)
    .eq("role", "user");

  // Get messages from last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: recentMessages } = await supabaseAdmin
    .from("chat_messages")
    .select("created_at")
    .eq("bot_id", botId)
    .eq("role", "user")
    .gte("created_at", sevenDaysAgo.toISOString())
    .order("created_at", { ascending: true });

  // Group messages by day for the chart
  const dailyData: Record<string, number> = {};

  // Initialize last 7 days with 0
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const key = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    dailyData[key] = 0;
  }

  // Fill in actual message counts
  recentMessages?.forEach((msg) => {
    const key = new Date(msg.created_at).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    if (dailyData[key] !== undefined) {
      dailyData[key]++;
    }
  });

  const chartData = Object.entries(dailyData).map(([date, count]) => ({
    date,
    messages: count,
  }));

  // Get total sessions
  const { count: totalSessions } = await supabaseAdmin
    .from("chat_sessions")
    .select("*", { count: "exact", head: true })
    .eq("bot_id", botId);

  // Get total documents
  const { count: totalDocuments } = await supabaseAdmin
    .from("documents")
    .select("*", { count: "exact", head: true })
    .eq("bot_id", botId)
    .eq("status", "done");

  return NextResponse.json({
    stats: {
      totalMessages: totalMessages || 0,
      totalSessions: totalSessions || 0,
      totalDocuments: totalDocuments || 0,
      messagesThisWeek: recentMessages?.length || 0,
    },
    chartData,
  });
}