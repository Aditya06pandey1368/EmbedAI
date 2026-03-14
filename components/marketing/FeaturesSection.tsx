// components/marketing/FeaturesSection.tsx
"use client";

import { motion } from "framer-motion";
import { Upload, Brain, Code, Zap, Shield, BarChart } from "lucide-react";

const features = [
  {
    icon: Upload,
    title: "Upload any document",
    description: "Support for PDFs, Word docs, and text files. Drag and drop to get started instantly.",
    color: "text-cyan-400",
    bg: "bg-cyan-400/10",
  },
  {
    icon: Brain,
    title: "AI learns your content",
    description: "Our RAG pipeline extracts, chunks, and embeds your documents for precise answers.",
    color: "text-purple-400",
    bg: "bg-purple-400/10",
  },
  {
    icon: Code,
    title: "Embed anywhere",
    description: "One line of code. Paste the script tag into any website, CMS, or web app.",
    color: "text-green-400",
    bg: "bg-green-400/10",
  },
  {
    icon: Zap,
    title: "Instant answers",
    description: "Streaming AI responses so visitors get answers in real-time, not after a long wait.",
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
  },
  {
    icon: Shield,
    title: "Your data stays private",
    description: "Documents are stored securely. Each bot only knows what you teach it.",
    color: "text-red-400",
    bg: "bg-red-400/10",
  },
  {
    icon: BarChart,
    title: "Analytics dashboard",
    description: "See what your customers are asking. Improve your docs based on real questions.",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-24 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-extrabold text-white mb-4"
          >
            Everything you need
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-slate-400 text-xl max-w-2xl mx-auto"
          >
            From document upload to deployed chatbot in under 3 minutes.
          </motion.p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-600 transition-colors"
            >
              <div className={`w-12 h-12 ${feature.bg} rounded-xl flex items-center justify-center mb-4`}>
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">{feature.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}