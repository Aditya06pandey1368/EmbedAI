// app/api/bots/route.ts

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const PLAN_LIMITS = {
  starter: { bots: 1, documents: 5, queries: 100 },
  pro: { bots: 10, documents: 100, queries: 5000 },
  enterprise: { bots: Infinity, documents: Infinity, queries: Infinity },
};

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from("bots")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ bots: data });
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, welcome_message, primary_color } = await req.json();

  if (!name || name.trim() === "") {
    return NextResponse.json({ error: "Bot name is required" }, { status: 400 });
  }

  // Get user plan
  const { data: user } = await supabaseAdmin
    .from("users")
    .select("plan")
    .eq("id", userId)
    .single();

  const plan = (user?.plan || "starter") as keyof typeof PLAN_LIMITS;
  const limit = PLAN_LIMITS[plan].bots;

  // Count existing bots
  const { count: botCount } = await supabaseAdmin
    .from("bots")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  if ((botCount ?? 0) >= limit) {
    return NextResponse.json(
      {
        error: `You have reached the ${plan} plan limit of ${limit} bot${limit === 1 ? "" : "s"}. Please upgrade to create more.`,
        limitReached: true,
      },
      { status: 403 }
    );
  }

  // Upsert user
  await supabaseAdmin
    .from("users")
    .upsert(
      { id: userId, email: "" },
      { onConflict: "id", ignoreDuplicates: true }
    );

  const { data, error } = await supabaseAdmin
    .from("bots")
    .insert({
      user_id: userId,
      name: name.trim(),
      welcome_message: welcome_message || "Hi! How can I help you today?",
      primary_color: primary_color || "#0ea5e9",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ bot: data }, { status: 201 });
}

export async function DELETE(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const botId = searchParams.get("botId");

  if (!botId) {
    return NextResponse.json({ error: "botId required" }, { status: 400 });
  }

  // Verify bot belongs to user
  const { data: bot } = await supabaseAdmin
    .from("bots")
    .select("id")
    .eq("id", botId)
    .eq("user_id", userId)
    .single();

  if (!bot) {
    return NextResponse.json({ error: "Bot not found" }, { status: 404 });
  }

  // Delete bot — cascades to documents, chunks, sessions, messages
  await supabaseAdmin
    .from("bots")
    .delete()
    .eq("id", botId);

  return NextResponse.json({ success: true });
}



export async function PATCH(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const botId = searchParams.get("botId");

  if (!botId) {
    return NextResponse.json({ error: "botId required" }, { status: 400 });
  }

  const { name, welcome_message, primary_color, is_active } = await req.json();

  // Verify bot belongs to user
  const { data: bot } = await supabaseAdmin
    .from("bots")
    .select("id")
    .eq("id", botId)
    .eq("user_id", userId)
    .single();

  if (!bot) {
    return NextResponse.json({ error: "Bot not found" }, { status: 404 });
  }

  const { data, error } = await supabaseAdmin
    .from("bots")
    .update({
      name,
      welcome_message,
      primary_color,
      is_active,
    })
    .eq("id", botId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ bot: data });
}