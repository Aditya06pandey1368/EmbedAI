// components/marketing/Footer.tsx
import Link from "next/link";
import { Bot } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-8">

          {/* Logo + description */}
          <div className="max-w-xs">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">EmbedAI</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Turn your documents into a 24/7 AI support agent in minutes.
            </p>
          </div>

          {/* Quick Links — only real pages */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="#features" className="text-slate-400 hover:text-white text-sm transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#how-it-works" className="text-slate-400 hover:text-white text-sm transition-colors">
                  How it works
                </Link>
              </li>
              <li>
                <Link href="#demo" className="text-slate-400 hover:text-white text-sm transition-colors">
                  Demo
                </Link>
              </li>
              <li>
                <Link href="#pricing" className="text-slate-400 hover:text-white text-sm transition-colors">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-white font-semibold mb-4">Account</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/sign-up" className="text-slate-400 hover:text-white text-sm transition-colors">
                  Get Started Free
                </Link>
              </li>
              <li>
                <Link href="/sign-in" className="text-slate-400 hover:text-white text-sm transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-slate-400 hover:text-white text-sm transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-slate-800 pt-8 text-center">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} EmbedAI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}