// components/marketing/PricingSection.tsx
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "Free",
    period: "",
    description: "Perfect for trying out EmbedAI",
    features: [
      "1 chatbot",
      "5 documents",
      "100 AI queries/month",
      "Basic analytics",
      "EmbedAI branding",
    ],
    cta: "Get started free",
    href: "/sign-up",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    description: "For growing businesses",
    features: [
      "10 chatbots",
      "100 documents",
      "5,000 AI queries/month",
      "Advanced analytics",
      "Remove branding",
      "Priority support",
    ],
    cta: "Start Pro",
    href: "/sign-up",
    highlighted: true,  // this makes it stand out
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large scale deployments",
    features: [
      "Unlimited chatbots",
      "Unlimited documents",
      "Unlimited AI queries",
      "Custom analytics",
      "White label",
      "Dedicated support",
      "SLA guarantee",
    ],
    cta: "Contact us",
    href: "/contact",
    highlighted: false,
  },
];

export default function PricingSection() {
  return (
    <section id="pricing" className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-extrabold text-white mb-4"
          >
            Simple pricing
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-slate-400 text-xl"
          >
            Start free. Scale as you grow.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className={`rounded-2xl p-8 border ${
                plan.highlighted
                  ? "bg-cyan-500 border-cyan-400 scale-105"  // Pro plan is bigger
                  : "bg-slate-900 border-slate-800"
              }`}
            >
              <h3 className={`font-bold text-xl mb-2 ${plan.highlighted ? "text-white" : "text-white"}`}>
                {plan.name}
              </h3>
              <p className={`text-sm mb-6 ${plan.highlighted ? "text-cyan-100" : "text-slate-400"}`}>
                {plan.description}
              </p>
              <div className="mb-8">
                <span className="text-5xl font-extrabold text-white">{plan.price}</span>
                <span className={plan.highlighted ? "text-cyan-100" : "text-slate-400"}>
                  {plan.period}
                </span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <Check className={`w-4 h-4 flex-shrink-0 ${plan.highlighted ? "text-white" : "text-cyan-400"}`} />
                    <span className={`text-sm ${plan.highlighted ? "text-white" : "text-slate-300"}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Link href={plan.href}>
                <Button
                  className={`w-full ${
                    plan.highlighted
                      ? "bg-white text-cyan-600 hover:bg-cyan-50"
                      : "bg-slate-800 text-white hover:bg-slate-700 border border-slate-700"
                  }`}
                >
                  {plan.cta}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}