// components/admin/AdminSettings.tsx
"use client";

import { motion } from "framer-motion";
import { Shield, Database, Key, Globe } from "lucide-react";

export default function AdminSettings() {
  const settings = [
    {
      icon: Shield,
      title: "Platform Security",
      desc: "Authentication and security settings",
      items: [
        { label: "Auth Provider", value: "Clerk" },
        { label: "Session Duration", value: "7 days" },
        { label: "2FA", value: "Enabled via Clerk" },
      ],
    },
    {
      icon: Database,
      title: "Database",
      desc: "Supabase configuration",
      items: [
        { label: "Provider", value: "Supabase (PostgreSQL)" },
        { label: "Vector DB", value: "pgvector (384 dimensions)" },
        { label: "Storage", value: "Supabase Storage" },
      ],
    },
    {
      icon: Key,
      title: "AI Services",
      desc: "LLM and embedding configuration",
      items: [
        { label: "Chat Model", value: "Groq — llama-3.1-8b-instant" },
        { label: "Embeddings", value: "HuggingFace — all-MiniLM-L6-v2" },
        { label: "Dimensions", value: "384" },
      ],
    },
    {
      icon: Globe,
      title: "Deployment",
      desc: "Hosting and infrastructure",
      items: [
        { label: "Platform", value: "Vercel" },
        { label: "Framework", value: "Next.js 16" },
        { label: "Region", value: "Auto (Global CDN)" },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Admin Settings</h1>
        <p className="text-slate-400 text-sm mt-1">
          Platform configuration and system info.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {settings.map((section, index) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center">
                <section.icon className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-white font-bold">{section.title}</h3>
                <p className="text-slate-500 text-xs">{section.desc}</p>
              </div>
            </div>

            <div className="space-y-3">
              {section.items.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0"
                >
                  <p className="text-slate-400 text-sm">{item.label}</p>
                  <p className="text-white text-sm font-medium">{item.value}</p>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}