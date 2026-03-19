// app/(dashboard)/dashboard/page.tsx

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import DashboardOverview from "@/components/dashboard/DashboardOverview";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // Check if admin → redirect directly to admin panel
  const { data: user } = await supabaseAdmin
    .from("users")
    .select("is_admin")
    .eq("id", userId)
    .single();

  if (user?.is_admin) {
    redirect("/admin");
  }

  return <DashboardOverview />;
}