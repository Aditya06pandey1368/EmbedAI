// app/(dashboard)/dashboard/page.tsx

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import DashboardOverview from "@/components/dashboard/DashboardOverview";

export default async function DashboardPage() {
  const { userId } = await auth();

  // Extra protection — if somehow not logged in, redirect
  if (!userId) redirect("/sign-in");

  return <DashboardOverview />;
}