// components/admin/AdminOverview.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Bot, FileText, MessageSquare, TrendingUp } from "lucide-react";

interface Stats {
  totalUsers: number;
  totalBots: number;
  totalDocuments: number;
  totalMessages: number;
  newUsersThisWeek: number;
}

export default function AdminOverview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/admin/stats");
      const data = await res.json();
      setStats(data.stats);
      setLoading(false);
    }
    load();
  }, []);

  const cards = stats
    ? [
        { label: "Total Users",        value: stats.totalUsers,       icon: Users,        color: "text-cyan-400",   bg: "bg-cyan-400/10"   },
        { label: "Total Bots",         value: stats.totalBots,        icon: Bot,          color: "text-purple-400", bg: "bg-purple-400/10" },
        { label: "Total Documents",    value: stats.totalDocuments,   icon: FileText,     color: "text-green-400",  bg: "bg-green-400/10"  },
        { label: "Total Questions",    value: stats.totalMessages,    icon: MessageSquare,color: "text-yellow-400", bg: "bg-yellow-400/10" },
        { label: "New Users (7 days)", value: stats.newUsersThisWeek, icon: TrendingUp,   color: "text-red-400",    bg: "bg-red-400/10"    },
      ]
    : [];

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-2xl font-extrabold text-white">Platform Overview</h1>
        <p className="text-slate-400 text-sm mt-1">
          Everything happening across EmbedAI.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading
          ? [...Array(5)].map((_, i) => (
              <div
                key={i}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 animate-pulse"
              >
                <div className="h-4 bg-slate-700 rounded mb-4 w-2/3" />
                <div className="h-8 bg-slate-700 rounded w-1/3" />
              </div>
            ))
          : cards.map((card, index) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <p className="text-slate-400 text-sm">{card.label}</p>
                  <div className={`w-10 h-10 ${card.bg} rounded-xl flex items-center justify-center`}>
                    <card.icon className={`w-5 h-5 ${card.color}`} />
                  </div>
                </div>
                <p className="text-3xl font-extrabold text-white">{card.value}</p>
              </motion.div>
            ))}
      </div>
    </div>
  );
}