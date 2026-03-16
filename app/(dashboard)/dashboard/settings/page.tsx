// app/(dashboard)/dashboard/settings/page.tsx

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import SettingsPage from "../../../../components/dashboard/SettingsPage";

export default async function Settings() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { data: user } = await supabaseAdmin
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  return <SettingsPage user={user} />;
}