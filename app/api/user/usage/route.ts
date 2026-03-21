// app/api/user/usage/route.ts

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get user plan and query count
  const { data: user } = await supabaseAdmin
    .from("users")
    .select("plan, queries_this_month, queries_reset_date")
    .eq("id", userId)
    .single();

  // Check if we need to reset monthly counter
  if (user?.queries_reset_date) {
    const resetDate = new Date(user.queries_reset_date);
    const now = new Date();
    const daysSinceReset = (now.getTime() - resetDate.getTime()) / (1000 * 60 * 60 * 24);

    // Reset counter if more than 30 days have passed
    if (daysSinceReset >= 30) {
      await supabaseAdmin
        .from("users")
        .update({
          queries_this_month: 0,
          queries_reset_date: now.toISOString(),
        })
        .eq("id", userId);

      user.queries_this_month = 0;
    }
  }

  // Get actual bot count
  const { count: botCount } = await supabaseAdmin
    .from("bots")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  // Get actual document count
  const { count: docCount } = await supabaseAdmin
    .from("documents")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "done");

  const PLAN_LIMITS = {
    starter:    { bots: 1,        documents: 5,       queries: 100      },
    pro:        { bots: 10,       documents: 100,     queries: 5000     },
    enterprise: { bots: Infinity, documents: Infinity, queries: Infinity },
  };

  const plan = (user?.plan || "starter") as keyof typeof PLAN_LIMITS;
  const limits = PLAN_LIMITS[plan];

  return NextResponse.json({
    plan,
    usage: {
      bots:     { used: botCount    || 0, limit: limits.bots      },
      documents:{ used: docCount    || 0, limit: limits.documents  },
      queries:  { used: user?.queries_this_month || 0, limit: limits.queries },
    },
  });
}