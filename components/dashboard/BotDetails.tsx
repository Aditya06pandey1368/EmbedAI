// components/dashboard/BotDetails.tsx
"use client";

import { motion } from "framer-motion";
import { Bot, Copy, Check, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { Edit } from "lucide-react";

interface BotDetailsProps {
  bot: {
    id: string;
    name: string;
    welcome_message: string;
    primary_color: string;
    is_active: boolean;
    created_at: string;
  };
}

export default function BotDetails({ bot }: BotDetailsProps) {
  const [copied, setCopied] = useState(false);

  const embedCode = `<script src="${process.env.NEXT_PUBLIC_APP_URL}/widget.js" data-bot-id="${bot.id}"></script>`;

  async function copyEmbedCode() {
    await navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // reset after 2 seconds
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: bot.primary_color + "20" }}
          >
            <Bot className="w-6 h-6" style={{ color: bot.primary_color }} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white">{bot.name}</h1>
            <p className="text-slate-400 text-sm">
              Created {new Date(bot.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Active status badge */}
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${bot.is_active
          ? "bg-green-500/10 text-green-400 border border-green-500/20"
          : "bg-slate-500/10 text-slate-400 border border-slate-500/20"
          }`}>
          {bot.is_active ? "● Active" : "○ Inactive"}
        </div>
        <Link href={`/dashboard/bots/${bot.id}/chat`}>
          <Button
            className="bg-cyan-500 hover:bg-cyan-600 text-white gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            Test Bot
          </Button>
        </Link>
      </div>
      <Link href={`/dashboard/bots/${bot.id}/edit`}>
        <Button
          variant="outline"
          className="border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 gap-2 mb-3"
        >
          <Edit className="w-4 h-4" />
          Edit Bot
        </Button>
      </Link>

      {/* Bot Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
        >
          <h3 className="text-slate-400 text-sm mb-2">Welcome Message</h3>
          <p className="text-white font-medium">"{bot.welcome_message}"</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
        >
          <h3 className="text-slate-400 text-sm mb-2">Brand Color</h3>
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg border border-slate-700"
              style={{ backgroundColor: bot.primary_color }}
            />
            <span className="text-white font-mono font-medium">
              {bot.primary_color}
            </span>
          </div>
        </motion.div>
      </div>

      {/* Embed Code Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Code className="w-5 h-5 text-cyan-400" />
          <h3 className="text-white font-bold">Embed Code</h3>
        </div>
        <p className="text-slate-400 text-sm mb-4">
          Paste this script tag before the closing{" "}
          <code className="text-cyan-400 bg-slate-800 px-1 rounded">
            &lt;/body&gt;
          </code>{" "}
          tag on your website.
        </p>
        <div className="bg-slate-800 rounded-xl p-4 font-mono text-sm text-slate-300 mb-4 break-all">
          {embedCode}
        </div>
        <Button
          onClick={copyEmbedCode}
          className="bg-cyan-500 hover:bg-cyan-600 text-white gap-2"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy embed code
            </>
          )}
        </Button>
      </motion.div>

      {/* Next Step: Upload Documents */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-cyan-500/5 border border-cyan-500/20 border-dashed rounded-2xl p-6 text-center"
      >
        <h3 className="text-white font-bold mb-2">
          Next step: Upload documents
        </h3>
        <p className="text-slate-400 text-sm mb-4">
          Your bot needs documents to learn from. Upload PDFs to train it.
        </p>
        <Link href={`/dashboard/documents?botId=${bot.id}`}>
          <Button className="bg-cyan-500 hover:bg-cyan-600 text-white">
            Upload documents
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}