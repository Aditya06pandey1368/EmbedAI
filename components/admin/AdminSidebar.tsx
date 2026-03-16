// components/admin/AdminSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Bot,
  FileText,
  Settings,
  Shield,
} from "lucide-react";

const navItems = [
  { label: "Overview",   href: "/admin",          icon: LayoutDashboard },
  { label: "Users",      href: "/admin/users",     icon: Users           },
  { label: "All Bots",   href: "/admin/bots",      icon: Bot             },
  { label: "Documents",  href: "/admin/documents", icon: FileText        },
  { label: "Settings",   href: "/admin/settings",  icon: Settings        },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-slate-900 border-r border-slate-800 flex flex-col">

      {/* Logo + Admin Badge */}
      <div className="h-16 flex items-center gap-2 px-6 border-b border-slate-800">
        <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="text-lg font-bold text-white">EmbedAI</span>
          <span className="ml-2 text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-medium">
            Admin
          </span>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-red-500/10 text-red-400 border border-red-500/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {item.label}
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-red-400" />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Back to Dashboard */}
      <div className="p-4 border-t border-slate-800">
        <Link href="/dashboard">
          <div className="bg-slate-800 hover:bg-slate-700 transition-colors rounded-xl p-3 text-center cursor-pointer">
            <p className="text-slate-400 text-xs">← Back to Dashboard</p>
          </div>
        </Link>
      </div>
    </aside>
  );
}