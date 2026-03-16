// app/(dashboard)/dashboard/analytics/page.tsx

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import AnalyticsDashboard from "@/components/dashboard/AnalyticsDashboard";

export default async function AnalyticsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { data: bots } = await supabaseAdmin
    .from("bots")
    .select("id, name")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return <AnalyticsDashboard bots={bots ?? []} />;
}