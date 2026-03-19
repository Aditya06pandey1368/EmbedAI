// app/api/user/me/route.ts

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: user } = await supabaseAdmin
    .from("users")
    .select("id, email, name, plan, is_admin")
    .eq("id", userId)
    .single();

  if (!user) {
    return NextResponse.json({
      is_admin: false,
      plan: "starter",
    });
  }

  return NextResponse.json(user);
}