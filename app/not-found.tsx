// app/not-found.tsx
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Bot, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="text-center max-w-md mx-auto">

        {/* Animated bot icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="flex justify-center mb-8"
        >
          <div className="relative">
            <div className="w-24 h-24 bg-cyan-500/10 rounded-3xl flex items-center justify-center border border-cyan-500/20">
              <Bot className="w-12 h-12 text-cyan-400" />
            </div>
            {/* Floating 404 badge */}
            <motion.div
              animate={{ y: [-4, 4, -4] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-3 -right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg"
            >
              404
            </motion.div>
          </div>
        </motion.div>

        {/* Text */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-4xl font-extrabold text-white mb-3"
        >
          Page not found
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-slate-400 text-lg mb-2"
        >
          Oops! This page doesn't exist.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-slate-500 text-sm mb-8"
        >
          The page you're looking for might have been moved,
          deleted, or never existed.
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Link href="/">
            <Button className="bg-cyan-500 hover:bg-cyan-600 text-white gap-2 px-6">
              <Home className="w-4 h-4" />
              Go home
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 gap-2 px-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Go back
          </Button>
        </motion.div>

        {/* EmbedAI branding */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-12 flex items-center justify-center gap-2"
        >
          <div className="w-6 h-6 bg-cyan-500 rounded-lg flex items-center justify-center">
            <Bot className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-slate-600 text-sm">EmbedAI</span>
        </motion.div>
      </div>
    </div>
  );
}