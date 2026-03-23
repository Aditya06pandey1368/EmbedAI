// components/dashboard/DashboardNavbar.tsx
"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import { Menu, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface DashboardNavbarProps {
  onMenuClick: () => void;
}

export default function DashboardNavbar({ onMenuClick }: DashboardNavbarProps) {
  const { user } = useUser();

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 sm:px-6">

      {/* Left: Burger + Logo + Greeting */}
      <div className="flex items-center gap-3">

        {/* Burger menu — mobile only */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="md:hidden text-slate-400 hover:text-white"
        >
          <Menu className="w-5 h-5" />
        </Button>

        {/* Logo — mobile only (hidden on desktop since sidebar shows it) */}
        <Link
          href="https://embed-ai-nu.vercel.app/"
          target="_blank"
          rel="noreferrer"
          className="md:hidden flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="w-7 h-7 bg-cyan-500 rounded-lg flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-bold text-sm">EmbedAI</span>
        </Link>

        {/* Greeting — hidden on small mobile, visible from sm */}
        <div className="hidden sm:block">
          <p className="text-white font-semibold text-sm">
            Welcome back, {user?.firstName ?? "there"} 👋
          </p>
          <p className="text-slate-400 text-xs">
            Here's what's happening with your bots today
          </p>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        <UserButton />
      </div>
    </header>
  );
}