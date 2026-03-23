// components/dashboard/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, Bot, FileText,
  BarChart2, MessageSquare, Settings,
  Bot as BotIcon, Shield, X,
} from "lucide-react";

const navItems = [
  { label: "Overview",     href: "/dashboard",           icon: LayoutDashboard },
  { label: "My Bots",      href: "/dashboard/bots",      icon: Bot             },
  { label: "Documents",    href: "/dashboard/documents", icon: FileText        },
  { label: "Analytics",    href: "/dashboard/analytics", icon: BarChart2       },
  { label: "Chat History", href: "/dashboard/history",   icon: MessageSquare   },
  { label: "Settings",     href: "/dashboard/settings",  icon: Settings        },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function checkAdmin() {
      try {
        const res  = await fetch("/api/user/me");
        const data = await res.json();
        setIsAdmin(data.is_admin || false);
      } catch {
        setIsAdmin(false);
      }
    }
    checkAdmin();
  }, []);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    onClose();
  }, [pathname]);

  const sidebarContent = (
    <aside className="w-64 min-h-screen bg-slate-900 border-r border-slate-800 flex flex-col">

      {/* Logo */}
      <Link href="/">
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
              <BotIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">EmbedAI</span>
          </div>
          {/* Close button — mobile only */}
          <button
            onClick={onClose}
            className="md:hidden text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </Link>

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
                    ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {item.label}
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400" />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Admin Panel */}
      {isAdmin && (
        <div className="p-4 border-t border-slate-800">
          <Link href="/admin">
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-2 hover:bg-red-500/20 transition-colors">
              <Shield className="w-4 h-4 text-red-400" />
              <p className="text-red-400 text-xs font-medium">Admin Panel</p>
            </div>
          </Link>
        </div>
      )}
    </aside>
  );

  return (
    <>
      {/* Desktop — always visible */}
      <div className="hidden md:flex">
        {sidebarContent}
      </div>

      {/* Mobile — slide in/out */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onClose}
              className="md:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
            />

            {/* Sidebar drawer */}
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="md:hidden fixed left-0 top-0 bottom-0 z-50 flex"
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}