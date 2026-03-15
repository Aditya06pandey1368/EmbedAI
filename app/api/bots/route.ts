// app/api/bots/route.ts

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// GET — fetch all bots for logged in user
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

// POST — create a new bot
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, welcome_message, primary_color } = await req.json();

  // Validate input
  if (!name || name.trim() === "") {
    return NextResponse.json({ error: "Bot name is required" }, { status: 400 });
  }

  // First make sure user exists in our DB
  // (in case webhook hasn't fired yet)
  await supabaseAdmin
    .from("users")
    .upsert({ id: userId, email: "" }, { onConflict: "id", ignoreDuplicates: true });

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