// app/(dashboard)/dashboard/page.tsx

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import DashboardOverview from "@/components/dashboard/DashboardOverview";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { data: user } = await supabaseAdmin
    .from("users")
    .select("is_admin")
    .eq("id", userId)
    .single();

  // Server-side redirect — happens before ANY HTML is sent to browser
  if (user?.is_admin) {
    redirect("/admin");
  }

  return <DashboardOverview />;
}