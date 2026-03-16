// components/dashboard/AnalyticsDashboard.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from "recharts";
import {
  MessageSquare, Users, FileText,
  TrendingUp, Bot
} from "lucide-react";

interface BotOption {
  id: string;
  name: string;
}

interface Stats {
  totalMessages: number;
  totalSessions: number;
  totalDocuments: number;
  messagesThisWeek: number;
}

interface ChartData {
  date: string;
  messages: number;
}

export default function AnalyticsDashboard({ bots }: { bots: BotOption[] }) {
  const [selectedBotId, setSelectedBotId] = useState(bots[0]?.id ?? "");
  const [stats, setStats] = useState<Stats | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedBotId) loadAnalytics(selectedBotId);
  }, [selectedBotId]);

  async function loadAnalytics(botId: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/analytics?botId=${botId}`);
      const data = await res.json();
      setStats(data.stats);
      setChartData(data.chartData);
    } catch (err) {
      console.error("Failed to load analytics:", err);
    } finally {
      setLoading(false);
    }
  }

  const statCards = stats
    ? [
        {
          label: "Total Questions Asked",
          value: stats.totalMessages,
          icon: MessageSquare,
          color: "text-cyan-400",
          bg: "bg-cyan-400/10",
        },
        {
          label: "Total Sessions",
          value: stats.totalSessions,
          icon: Users,
          color: "text-purple-400",
          bg: "bg-purple-400/10",
        },
        {
          label: "Trained Documents",
          value: stats.totalDocuments,
          icon: FileText,
          color: "text-green-400",
          bg: "bg-green-400/10",
        },
        {
          label: "Questions This Week",
          value: stats.messagesThisWeek,
          icon: TrendingUp,
          color: "text-yellow-400",
          bg: "bg-yellow-400/10",
        },
      ]
    : [];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white">Analytics</h1>
        <p className="text-slate-400 text-sm mt-1">
          Track how your chatbot is performing.
        </p>
      </div>

      {/* No bots state */}
      {bots.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
          <Bot className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-white font-semibold mb-1">No bots yet</p>
          <p className="text-slate-400 text-sm">
            Create a bot first to see analytics.
          </p>
        </div>
      ) : (
        <>
          {/* Bot Selector */}
          <div className="flex items-center gap-3">
            <label className="text-slate-400 text-sm font-medium">
              Viewing bot:
            </label>
            <select
              value={selectedBotId}
              onChange={(e) => setSelectedBotId(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-cyan-500"
            >
              {bots.map((bot) => (
                <option key={bot.id} value={bot.id}>
                  {bot.name}
                </option>
              ))}
            </select>
          </div>

          {/* Stats Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-6 animate-pulse"
                >
                  <div className="h-4 bg-slate-700 rounded mb-4 w-2/3" />
                  <div className="h-8 bg-slate-700 rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {statCards.map((card, index) => (
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
                  <p className="text-3xl font-extrabold text-white">
                    {card.value}
                  </p>
                </motion.div>
              ))}
            </div>
          )}

          {/* Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
          >
            <h2 className="text-white font-bold text-lg mb-6">
              Messages — Last 7 Days
            </h2>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#1e293b"
                  />
                  <XAxis
                    dataKey="date"
                    stroke="#475569"
                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                  />
                  <YAxis
                    stroke="#475569"
                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "1px solid #1e293b",
                      borderRadius: "12px",
                      color: "#f1f5f9",
                    }}
                  />
                  <Bar
                    dataKey="messages"
                    fill="#0ea5e9"
                    radius={[6, 6, 0, 0]}
                    name="Questions"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center">
                <p className="text-slate-500 text-sm">
                  No data yet — start chatting with your bot!
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </div>
  );
}