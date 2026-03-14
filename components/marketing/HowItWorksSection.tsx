// components/marketing/HowItWorksSection.tsx
"use client";

import { motion } from "framer-motion";
import { Upload, Cpu, Globe } from "lucide-react";

const steps = [
  {
    step: "01",
    icon: Upload,
    title: "Upload your documents",
    description: "Upload your PDFs, FAQs, manuals, or any text content. We support multiple files at once.",
  },
  {
    step: "02",
    icon: Cpu,
    title: "AI trains on your content",
    description: "Our pipeline extracts text, creates embeddings, and stores them in a vector database automatically.",
  },
  {
    step: "03",
    icon: Globe,
    title: "Embed on your website",
    description: "Copy one script tag and paste it into your website. Your AI chatbot goes live instantly.",
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 px-4 bg-slate-900/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-extrabold text-white mb-4"
          >
            How it works
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-slate-400 text-xl"
          >
            Three steps. Three minutes. One powerful chatbot.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connecting line between steps (desktop only) */}
          <div className="hidden md:block absolute top-12 left-1/4 right-1/4 h-px bg-gradient-to-r from-cyan-500/50 via-cyan-500 to-cyan-500/50" />

          {steps.map((step, index) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="relative flex flex-col items-center text-center"
            >
              {/* Step circle */}
              <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-cyan-500 flex items-center justify-center mb-6 z-10">
                <step.icon className="w-10 h-10 text-cyan-400" />
              </div>

              <span className="text-cyan-500 font-bold text-sm mb-2">
                STEP {step.step}
              </span>
              <h3 className="text-white font-bold text-xl mb-3">{step.title}</h3>
              <p className="text-slate-400 leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}