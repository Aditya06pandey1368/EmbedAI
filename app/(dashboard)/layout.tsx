// app/(dashboard)/layout.tsx

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import Sidebar from "@/components/dashboard/Sidebar";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import PageTransition from "@/components/shared/PageTransition";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // Check admin in LAYOUT — before sidebar or navbar renders
  const { data: user } = await supabaseAdmin
    .from("users")
    .select("is_admin")
    .eq("id", userId)
    .single();

  // Redirect admin BEFORE any dashboard UI renders
  if (user?.is_admin) {
    redirect("/admin");
  }

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <DashboardNavbar />
        <main className="flex-1 p-6 overflow-auto">
          <PageTransition>
            {children}
          </PageTransition>
        </main>
      </div>
    </div>
  );
}