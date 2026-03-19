// components/marketing/DemoSection.tsx
"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { MessageCircle, Sparkles } from "lucide-react";
import ChatWidget from "@/components/widget/ChatWidget";

// Replace with your actual demo bot ID
const DEMO_BOT_ID = "d564891f-f35b-4d49-a0c9-61f2a301ef9d";

export default function DemoSection() {
  const [showWidget, setShowWidget] = useState(false);

  return (
    <section id="demo" className="py-24 px-4 bg-slate-900/30">
      <div className="max-w-7xl mx-auto">

        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-2 mb-6"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-cyan-400 text-sm font-medium">
              Live Demo
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-extrabold text-white mb-4"
          >
            Try it yourself
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 text-xl max-w-2xl mx-auto"
          >
            This chatbot is trained on EmbedAI's own docs.
            Ask it anything about our product!
          </motion.p>
        </div>

        {/* Demo Area */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">

            {/* Fake browser bar */}
            <div className="bg-slate-800 px-4 py-3 flex items-center gap-2 border-b border-slate-700">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                <div className="w-3 h-3 rounded-full bg-green-500/70" />
              </div>
              <div className="flex-1 bg-slate-700 rounded-md px-3 py-1 text-slate-400 text-xs ml-2">
                https://yourcompany.com
              </div>
            </div>

            {/* Fake website content */}
            <div className="p-8 min-h-64 relative">
              <div className="space-y-4">
                <div className="h-6 bg-slate-800 rounded w-1/3" />
                <div className="h-4 bg-slate-800/60 rounded w-full" />
                <div className="h-4 bg-slate-800/60 rounded w-5/6" />
                <div className="h-4 bg-slate-800/60 rounded w-4/6" />
                <div className="mt-8 h-4 bg-slate-800/60 rounded w-full" />
                <div className="h-4 bg-slate-800/60 rounded w-3/4" />
              </div>

              {/* Chat trigger button */}
              {!showWidget && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowWidget(true)}
                  className="absolute bottom-6 right-6 flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white px-5 py-3 rounded-full font-semibold shadow-lg transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  Try the demo chatbot
                </motion.button>
              )}
            </div>
          </div>

          {/* Sample questions */}
          <div className="mt-6 flex flex-wrap gap-2 justify-center">
            <p className="text-slate-500 text-sm w-full text-center mb-2">
              Try asking:
            </p>
            {[
              "What is EmbedAI?",
              "How much does it cost?",
              "How do I embed the widget?",
              "Is my data secure?",
            ].map((q) => (
              <span
                key={q}
                className="bg-slate-800 border border-slate-700 text-slate-300 text-sm px-4 py-2 rounded-full cursor-pointer hover:border-cyan-500/50 hover:text-white transition-colors"
              >
                {q}
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Actual widget — only shown after button click */}
      {showWidget && (
        <ChatWidget
          botId={DEMO_BOT_ID}
          botName="EmbedAI Assistant"
          welcomeMessage="Hi! I'm the EmbedAI demo bot. Ask me anything about EmbedAI!"
          primaryColor="#0ea5e9"
        />
      )}
    </section>
  );
}