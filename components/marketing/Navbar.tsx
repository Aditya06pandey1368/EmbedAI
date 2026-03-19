// components/marketing/Navbar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth, UserButton } from "@clerk/nextjs";
import { Menu, X, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { isSignedIn } = useAuth();  // ← this replaces SignedIn/SignedOut

  return (
    <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">EmbedAI</span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-slate-400 hover:text-white transition-colors text-sm">
              Features
            </Link>
            <Link href="#how-it-works" className="text-slate-400 hover:text-white transition-colors text-sm">
              How it works
            </Link>
            <Link href="#pricing" className="text-slate-400 hover:text-white transition-colors text-sm">
              Pricing
            </Link>
            // Find the desktop nav links section and add:
            <Link href="#demo" className="text-slate-400 hover:text-white transition-colors text-sm">
              Demo
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {/* Not logged in */}
            {!isSignedIn ? (
              <>
                <Link href="/sign-in">
                  <Button variant="ghost" className="text-slate-300 hover:text-white">
                    Sign in
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button className="bg-cyan-500 hover:bg-cyan-600 text-white">
                    Get started free
                  </Button>
                </Link>
              </>
            ) : (
              /* Logged in */
              <>
                <Link href="/dashboard">
                  <Button variant="ghost" className="text-slate-300 hover:text-white">
                    Dashboard
                  </Button>
                </Link>
                <UserButton />
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-slate-400"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-slate-900 border-t border-slate-800 px-4 py-4 flex flex-col gap-4"
        >
          <Link href="#features" className="text-slate-400 hover:text-white text-sm">Features</Link>
          <Link href="#how-it-works" className="text-slate-400 hover:text-white text-sm">How it works</Link>
          <Link href="#pricing" className="text-slate-400 hover:text-white text-sm">Pricing</Link>

          {!isSignedIn ? (
            <>
              <Link href="/sign-in">
                <Button variant="ghost" className="w-full text-slate-300">Sign in</Button>
              </Link>
              <Link href="/sign-up">
                <Button className="w-full bg-cyan-500 hover:bg-cyan-600">Get started free</Button>
              </Link>
            </>
          ) : (
            <Link href="/dashboard">
              <Button variant="ghost" className="w-full text-slate-300">Dashboard</Button>
            </Link>
          )}
        </motion.div>
      )}
    </nav>
  );
}