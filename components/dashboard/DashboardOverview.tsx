// components/dashboard/DashboardOverview.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bot, FileText, MessageSquare, TrendingUp, Plus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Stats {
  totalBots: number;
  totalDocuments: number;
  totalMessages: number;
  messagesThisWeek: number;
}

export default function DashboardOverview() {
  const [stats, setStats] = useState<Stats>({
    totalBots: 0,
    totalDocuments: 0,
    totalMessages: 0,
    messagesThisWeek: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const res = await fetch("/api/overview");
      const data = await res.json();
      setStats(data.stats);
    } catch (err) {
      console.error("Failed to load stats:", err);
    } finally {
      setLoading(false);
    }
  }

  const statCards = [
    {
      label: "Total Bots",
      value: stats.totalBots,
      icon: Bot,
      color: "text-cyan-400",
      bg: "bg-cyan-400/10",
      change: "Active chatbots",
    },
    {
      label: "Documents Uploaded",
      value: stats.totalDocuments,
      icon: FileText,
      color: "text-purple-400",
      bg: "bg-purple-400/10",
      change: "Trained documents",
    },
    {
      label: "Questions Answered",
      value: stats.totalMessages,
      icon: MessageSquare,
      color: "text-green-400",
      bg: "bg-green-400/10",
      change: "Total questions",
    },
    {
      label: "This Week",
      value: stats.messagesThisWeek,
      icon: TrendingUp,
      color: "text-yellow-400",
      bg: "bg-yellow-400/10",
      change: "Questions this week",
    },
  ];

  return (
    <div className="space-y-8">

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Overview</h1>
          <p className="text-slate-400 text-sm mt-1">
            Your EmbedAI dashboard at a glance
          </p>
        </div>
        <Link href="/dashboard/bots/new">
          <Button className="bg-cyan-500 hover:bg-cyan-600 text-white gap-2">
            <Plus className="w-4 h-4" />
            Create Bot
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-slate-400 text-sm">{stat.label}</p>
              <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
            {loading ? (
              <div className="h-8 bg-slate-700 rounded animate-pulse w-1/3" />
            ) : (
              <p className="text-3xl font-extrabold text-white">{stat.value}</p>
            )}
            <p className="text-slate-500 text-xs mt-1">{stat.change}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: "Create a bot", desc: "Set up a new AI chatbot", href: "/dashboard/bots/new", color: "border-cyan-500/20 hover:border-cyan-500/50" },
          { title: "Upload documents", desc: "Add PDFs to train your bot", href: "/dashboard/documents", color: "border-purple-500/20 hover:border-purple-500/50" },
          { title: "View analytics", desc: "See how your bot is performing", href: "/dashboard/analytics", color: "border-green-500/20 hover:border-green-500/50" },
        ].map((action, index) => (
          <motion.div
            key={action.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
          >
            <Link href={action.href}>
              <div className={`bg-slate-900 border ${action.color} rounded-2xl p-6 cursor-pointer transition-colors group`}>
                <h4 className="text-white font-semibold mb-1 group-hover:text-cyan-400 transition-colors">
                  {action.title}
                </h4>
                <p className="text-slate-400 text-sm">{action.desc}</p>
                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 mt-3 transition-colors group-hover:translate-x-1 transform duration-200" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}