// app/api/history/route.ts

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
    .select("id")
    .eq("id", botId)
    .eq("user_id", userId)
    .single();

  if (!bot) {
    return NextResponse.json({ error: "Bot not found" }, { status: 404 });
  }

  // Get all sessions with their messages
  const { data: sessions } = await supabaseAdmin
    .from("chat_sessions")
    .select(`
      id,
      created_at,
      chat_messages (
        id,
        role,
        content,
        created_at
      )
    `)
    .eq("bot_id", botId)
    .order("created_at", { ascending: false })
    .limit(50); // last 50 sessions

  return NextResponse.json({ sessions: sessions || [] });
}