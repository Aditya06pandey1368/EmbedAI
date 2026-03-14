// components/dashboard/DashboardNavbar.tsx
"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardNavbar() {
  const { user } = useUser(); // ← gets current logged in user from Clerk

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6">

      {/* Left: Page greeting */}
      <div>
        <p className="text-white font-semibold">
          Welcome back, {user?.firstName ?? "there"} 👋
        </p>
        <p className="text-slate-400 text-xs">
          Here's what's happening with your bots today
        </p>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="text-slate-400 hover:text-white relative"
        >
          <Bell className="w-5 h-5" />
        </Button>
        <UserButton />
      </div>
    </header>
  );
}