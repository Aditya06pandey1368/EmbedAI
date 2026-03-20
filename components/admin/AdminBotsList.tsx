// components/admin/AdminBotsList.tsx
"use client";

import { motion } from "framer-motion";
import { Bot, Check, X } from "lucide-react";

interface AdminBot {
  id: string;
  name: string;
  is_active: boolean;
  total_messages: number;
  created_at: string;
  users: { email: string; name: string } | null;
}

export default function AdminBotsList({ bots }: { bots: AdminBot[] }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white">All Bots</h1>
        <p className="text-slate-400 text-sm mt-1">
          {bots.length} bots across all users
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-5 gap-4 px-6 py-3 border-b border-slate-800 text-slate-400 text-xs font-medium uppercase tracking-wider">
          <div className="col-span-2">Bot</div>
          <div>Owner</div>
          <div>Messages</div>
          <div>Status</div>
        </div>

        {bots.length === 0 ? (
          <div className="p-12 text-center">
            <Bot className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No bots yet</p>
          </div>
        ) : (
          bots.map((bot, index) => (
            <motion.div
              key={bot.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              className="grid grid-cols-5 gap-4 px-6 py-4 border-b border-slate-800/50 items-center hover:bg-slate-800/30 transition-colors"
            >
              <div className="col-span-2 flex items-center gap-3">
                <div className="w-9 h-9 bg-cyan-500/10 rounded-xl flex items-center justify-center">
                  <Bot className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{bot.name}</p>
                  <p className="text-slate-500 text-xs">
                    {new Date(bot.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-slate-300 text-sm">
                  {bot.users?.name || "Unknown"}
                </p>
                <p className="text-slate-500 text-xs">{bot.users?.email}</p>
              </div>

              <div>
                <p className="text-white text-sm">{bot.total_messages}</p>
              </div>

              <div>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                  bot.is_active
                    ? "bg-green-500/10 text-green-400"
                    : "bg-slate-500/10 text-slate-400"
                }`}>
                  {bot.is_active
                    ? <><Check className="w-3 h-3" /> Active</>
                    : <><X className="w-3 h-3" /> Inactive</>
                  }
                </span>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}