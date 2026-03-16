// components/admin/AdminNavbar.tsx
"use client";

import { UserButton } from "@clerk/nextjs";
import { Shield } from "lucide-react";

export default function AdminNavbar() {
  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6">
      <div className="flex items-center gap-2">
        <Shield className="w-5 h-5 text-red-400" />
        <p className="text-white font-semibold">Admin Panel</p>
        <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">
          Super Admin
        </span>
      </div>
      <UserButton />
    </header>
  );
}