// app/api/admin/stats/route.ts

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Platform wide stats
  const { count: totalUsers } = await supabaseAdmin
    .from("users")
    .select("*", { count: "exact", head: true });

  const { count: totalBots } = await supabaseAdmin
    .from("bots")
    .select("*", { count: "exact", head: true });

  const { count: totalDocuments } = await supabaseAdmin
    .from("documents")
    .select("*", { count: "exact", head: true });

  const { count: totalMessages } = await supabaseAdmin
    .from("chat_messages")
    .select("*", { count: "exact", head: true })
    .eq("role", "user");

  // New users this week
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { count: newUsersThisWeek } = await supabaseAdmin
    .from("users")
    .select("*", { count: "exact", head: true })
    .gte("created_at", sevenDaysAgo.toISOString());

  return NextResponse.json({
    stats: {
      totalUsers:       totalUsers       || 0,
      totalBots:        totalBots        || 0,
      totalDocuments:   totalDocuments   || 0,
      totalMessages:    totalMessages    || 0,
      newUsersThisWeek: newUsersThisWeek || 0,
    },
  });
}