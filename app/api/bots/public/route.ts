import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const botId = searchParams.get("botId");

  if (!botId) {
    return NextResponse.json({ error: "botId required" }, { status: 400 });
  }

  const { data: bot } = await supabaseAdmin
    .from("bots")
    .select("id, name, welcome_message, primary_color, is_active")
    .eq("id", botId)
    .eq("is_active", true)
    .single();

  if (!bot) {
    return NextResponse.json({ error: "Bot not found" }, { status: 404 });
  }

  return NextResponse.json(
    { bot },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    }
  );
}