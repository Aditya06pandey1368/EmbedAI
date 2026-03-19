// components/dashboard/BotsList.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Bot, Plus, ArrowRight, Trash2, Loader2 } from "lucide-react";

interface BotType {
  id: string;
  name: string;
  primary_color: string;
  is_active: boolean;
  total_messages: number;
  created_at: string;
}

export default function BotsList({ bots: initialBots }: { bots: BotType[] }) {
  const [bots, setBots] = useState<BotType[]>(initialBots);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function deleteBot(botId: string, botName: string) {
    if (!confirm(`Delete "${botName}"? This will remove all documents and chat history permanently.`)) return;

    setDeleting(botId);
    try {
      const res = await fetch(`/api/bots?botId=${botId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        // Remove from list without page reload
        setBots((prev) => prev.filter((b) => b.id !== botId));
      } else {
        alert("Failed to delete bot");
      }
    } catch {
      alert("Something went wrong");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white">My Bots</h1>
          <p className="text-slate-400 text-sm mt-1">
            {bots.length} bot{bots.length !== 1 ? "s" : ""} created
          </p>
        </div>
        <Link href="/dashboard/bots/new">
          <Button className="bg-cyan-500 hover:bg-cyan-600 text-white gap-2">
            <Plus className="w-4 h-4" />
            New Bot
          </Button>
        </Link>
      </div>

      {/* Empty state */}
      {bots.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 border-dashed rounded-2xl p-12 text-center">
          <div className="w-16 h-16 bg-cyan-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Bot className="w-8 h-8 text-cyan-400" />
          </div>
          <h3 className="text-white font-bold text-xl mb-2">No bots yet</h3>
          <p className="text-slate-400 text-sm mb-6">
            Create your first AI chatbot to get started.
          </p>
          <Link href="/dashboard/bots/new">
            <Button className="bg-cyan-500 hover:bg-cyan-600 text-white">
              Create your first bot
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bots.map((bot, index) => (
            <motion.div
              key={bot.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="bg-slate-900 border border-slate-800 hover:border-slate-600 rounded-2xl p-6 transition-colors group relative">

                {/* Delete button — top right */}
                <button
                  onClick={() => deleteBot(bot.id, bot.name)}
                  disabled={deleting === bot.id}
                  className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-400/10 transition-colors z-10"
                >
                  {deleting === bot.id ? (
                    <Loader2 className="w-4 h-4 animate-spin text-red-400" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>

                <Link href={`/dashboard/bots/${bot.id}`}>
                  <div className="cursor-pointer">
                    {/* Bot icon + status */}
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: bot.primary_color + "20" }}
                      >
                        <Bot className="w-6 h-6" style={{ color: bot.primary_color }} />
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full mr-6 ${
                        bot.is_active
                          ? "bg-green-500/10 text-green-400"
                          : "bg-slate-500/10 text-slate-400"
                      }`}>
                        {bot.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <h3 className="text-white font-bold text-lg mb-1 group-hover:text-cyan-400 transition-colors">
                      {bot.name}
                    </h3>
                    <p className="text-slate-500 text-xs mb-4">
                      {bot.total_messages} messages · Created{" "}
                      {new Date(bot.created_at).toLocaleDateString()}
                    </p>

                    <div className="flex items-center text-cyan-400 text-sm font-medium">
                      View details
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}