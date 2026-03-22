// components/marketing/HeroSection.tsx
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { ArrowRight, Bot, Sparkles } from "lucide-react";

export default function HeroSection() {
  const { isSignedIn } = useAuth();

  return (
    <section className="min-h-screen flex items-center justify-center px-4 pt-25">
      <div className="max-w-4xl mx-auto text-center">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-2 mb-8"
        >
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span className="text-cyan-400 text-sm font-medium">
            AI-powered customer support
          </span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6"
        >
          Turn your docs into a{" "}
          <span className="text-cyan-400">24/7 AI</span>
          {" "}support agent
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed"
        >
          Upload your PDFs, train an AI chatbot in minutes, and embed it
          anywhere on your website. No coding required.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          {/* ← Smart button: dashboard if logged in, signup if not */}
          <Link href={isSignedIn ? "/dashboard/bots/new" : "/sign-up"}>
            <Button
              size="lg"
              className="bg-cyan-500 hover:bg-cyan-600 text-white px-8 py-6 text-lg font-semibold group"
            >
              Create your AI bot
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>

          <Link href="#how-it-works">
            <Button
              size="lg"
              variant="outline"
              className="border-slate-700 text-slate-300 hover:bg-slate-800 px-8 py-6 text-lg"
            >
              See how it works
            </Button>
          </Link>
        </motion.div>

        {/* Social Proof */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-8 text-slate-500 text-sm"
        >
          Free to start · No credit card required · Setup in 3 minutes
        </motion.p>

        {/* Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="mt-16 rounded-2xl border border-slate-800 bg-slate-900 p-2 shadow-2xl shadow-cyan-500/5"
        >
          {/* Fake browser bar */}
          <div className="bg-slate-800 rounded-t-xl px-4 py-2 flex items-center gap-2 border-b border-slate-700">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <div className="w-3 h-3 rounded-full bg-green-500/70" />
            </div>
            <div className="flex-1 bg-slate-700 rounded-md px-3 py-1 text-slate-400 text-xs ml-2">
              embedai.vercel.app/dashboard
            </div>
          </div>

          {/* Fake dashboard content */}
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: "Total Bots", value: "3",    color: "text-cyan-400"   },
                { label: "Documents",  value: "12",   color: "text-purple-400" },
                { label: "Questions",  value: "1.2k", color: "text-green-400"  },
                { label: "This Week",  value: "234",  color: "text-yellow-400" },
              ].map((stat) => (
                <div key={stat.label} className="bg-slate-800 rounded-xl p-3">
                  <p className="text-slate-500 text-xs mb-1">{stat.label}</p>
                  <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { name: "Support Bot",     color: "#0ea5e9", messages: 423 },
                { name: "Sales Assistant", color: "#8b5cf6", messages: 287 },
                { name: "HR Bot",          color: "#10b981", messages: 156 },
              ].map((bot) => (
                <div key={bot.name} className="bg-slate-800 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: bot.color + "30" }}
                    >
                      <Bot className="w-4 h-4" style={{ color: bot.color }} />
                    </div>
                    <span className="text-white text-xs font-medium">{bot.name}</span>
                  </div>
                  <p className="text-slate-500 text-xs">{bot.messages} messages</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}