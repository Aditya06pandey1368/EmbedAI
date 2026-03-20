// components/shared/PageLoader.tsx
"use client";

import { motion } from "framer-motion";
import { Bot } from "lucide-react";

export default function PageLoader() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center gap-4"
      >
        {/* Animated logo */}
        <motion.div
          animate={{
            boxShadow: [
              "0 0 0 0 rgba(14, 165, 233, 0)",
              "0 0 0 20px rgba(14, 165, 233, 0.1)",
              "0 0 0 0 rgba(14, 165, 233, 0)",
            ],
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-16 h-16 bg-cyan-500 rounded-2xl flex items-center justify-center"
        >
          <Bot className="w-8 h-8 text-white" />
        </motion.div>

        {/* Animated dots */}
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.15,
              }}
              className="w-2 h-2 bg-cyan-400 rounded-full"
            />
          ))}
        </div>

        <p className="text-slate-500 text-sm">Loading EmbedAI...</p>
      </motion.div>
    </div>
  );
}