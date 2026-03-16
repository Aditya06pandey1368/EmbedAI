// components/dashboard/Sidebar.tsx
"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
    LayoutDashboard,
    Bot,
    FileText,
    BarChart2,
    MessageSquare,
    Settings,
    Bot as BotIcon,
    Shield,
} from "lucide-react";

const navItems = [
    {
        label: "Overview",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        label: "My Bots",
        href: "/dashboard/bots",
        icon: Bot,
    },
    {
        label: "Documents",
        href: "/dashboard/documents",
        icon: FileText,
    },
    {
        label: "Analytics",
        href: "/dashboard/analytics",
        icon: BarChart2,
    },
    {
        label: "Chat History",
        href: "/dashboard/history",
        icon: MessageSquare,
    },
    {
        label: "Settings",
        href: "/dashboard/settings",
        icon: Settings,
    },
];

export default function Sidebar() {
    const pathname = usePathname(); // ← tells us which page we're currently on

    return (
        <aside className="w-64 min-h-screen bg-slate-900 border-r border-slate-800 flex flex-col">

            {/* Logo */}
            <div className="h-16 flex items-center gap-2 px-6 border-b border-slate-800">
                <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
                    <BotIcon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">EmbedAI</span>
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
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isActive
                                        ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                                    }`}
                            >
                                <item.icon className="w-5 h-5 flex-shrink-0" />
                                {item.label}

                                {/* Active indicator dot */}
                                {isActive && (
                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400" />
                                )}
                            </motion.div>
                        </Link>
                    );
                })}
            </nav>

            
            {/* Bottom section */}
            <div className="p-4 border-t border-slate-800 space-y-2">
                {/* Admin link — hardcoded for now, only you will see it */}
                <Link href="/admin">
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-2 hover:bg-red-500/20 transition-colors">
                        <Shield className="w-4 h-4 text-red-400" />
                        <p className="text-red-400 text-xs font-medium">Admin Panel</p>
                    </div>
                </Link>

                <div className="bg-slate-800 rounded-xl p-4 mt-3">
                    <p className="text-slate-400 text-xs mb-1">Current Plan</p>
                    <p className="text-white font-semibold text-sm">Starter — Free</p>
                    <Link
                        href="/dashboard/settings"
                        className="text-cyan-400 text-xs mt-2 block hover:text-cyan-300 transition-colors"
                    >
                        Upgrade to Pro →
                    </Link>
                </div>
            </div>
        </aside>
    );
}