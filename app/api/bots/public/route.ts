// app/api/bots/public/route.ts

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const botId = searchParams.get("botId");

  if (!botId) {
    return NextResponse.json(
      { error: "botId required" },
      { status: 400, headers: corsHeaders }
    );
  }

  const { data: bot } = await supabaseAdmin
    .from("bots")
    .select("id, name, welcome_message, primary_color, is_active")
    .eq("id", botId)
    .eq("is_active", true)
    .single();

  if (!bot) {
    return NextResponse.json(
      { error: "Bot not found" },
      { status: 404, headers: corsHeaders }
    );
  }

  return NextResponse.json(
    { bot },
    { headers: corsHeaders }
  );
}