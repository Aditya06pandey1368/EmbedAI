// app/api/bots/public/route.ts

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const botId = searchParams.get("botId");

  if (!botId) {
    return NextResponse.json({ error: "botId required" }, { status: 400 });
  }

  // Only return public-safe fields — never expose user_id or private data
  const { data: bot } = await supabaseAdmin
    .from("bots")
    .select("id, name, welcome_message, primary_color, is_active")
    .eq("id", botId)
    .eq("is_active", true)
    .single();

  if (!bot) {
    return NextResponse.json({ error: "Bot not found" }, { status: 404 });
  }

  // Add CORS headers so external websites can call this
  return NextResponse.json(
    { bot },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
      },
    }
  );
}