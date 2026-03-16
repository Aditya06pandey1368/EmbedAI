// lib/admin.ts

import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";

// Call this in any admin page or API route
// Returns userId if admin, redirects if not
export async function requireAdmin(): Promise<string> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Check if user is admin in our database
  const { data: user } = await supabaseAdmin
    .from("users")
    .select("is_admin")
    .eq("id", userId)
    .single();

  if (!user?.is_admin) {
    throw new Error("Forbidden — Admin only");
  }

  return userId;
}