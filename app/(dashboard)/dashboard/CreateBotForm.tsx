// components/dashboard/CreateBotForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bot, Loader2 } from "lucide-react";

// ShadCN Input and Label — install if not already there
// npx shadcn@latest add input label textarea

export default function CreateBotForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [name, setName] = useState("");
  const [welcomeMessage, setWelcomeMessage] = useState(
    "Hi! How can I help you today?"
  );
  const [primaryColor, setPrimaryColor] = useState("#0ea5e9");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); // prevent page reload on form submit
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/bots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          welcome_message: welcomeMessage,
          primary_color: primaryColor,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      // Redirect to the new bot's page after creation
      router.push(`/dashboard/bots/${data.bot.id}`);
      router.refresh(); // refresh server components

    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-6"
    >
      {/* Bot Name */}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-white font-medium">
          Bot Name *
        </Label>
        <Input
          id="name"
          placeholder="e.g. Support Bot, Sales Assistant..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-cyan-500"
          required
        />
        <p className="text-slate-500 text-xs">
          This is only visible to you in the dashboard.
        </p>
      </div>

      {/* Welcome Message */}
      <div className="space-y-2">
        <Label htmlFor="welcome" className="text-white font-medium">
          Welcome Message
        </Label>
        <Input
          id="welcome"
          placeholder="Hi! How can I help you today?"
          value={welcomeMessage}
          onChange={(e) => setWelcomeMessage(e.target.value)}
          className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-cyan-500"
        />
        <p className="text-slate-500 text-xs">
          First message visitors see when they open the chat.
        </p>
      </div>

      {/* Primary Color */}
      <div className="space-y-2">
        <Label htmlFor="color" className="text-white font-medium">
          Brand Color
        </Label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            id="color"
            value={primaryColor}
            onChange={(e) => setPrimaryColor(e.target.value)}
            className="w-12 h-12 rounded-lg border border-slate-700 bg-slate-800 cursor-pointer"
          />
          <Input
            value={primaryColor}
            onChange={(e) => setPrimaryColor(e.target.value)}
            className="bg-slate-800 border-slate-700 text-white w-36 font-mono"
          />
          {/* Live preview */}
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-medium"
            style={{ backgroundColor: primaryColor }}
          >
            <Bot className="w-4 h-4" />
            Preview
          </div>
        </div>
        <p className="text-slate-500 text-xs">
          This color will be used for the chat widget on your website.
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Submit */}
      <Button
        type="submit"
        disabled={loading || !name.trim()}
        className="w-full bg-cyan-500 hover:bg-cyan-600 text-white py-6 text-base font-semibold"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Creating bot...
          </>
        ) : (
          <>
            <Bot className="w-5 h-5 mr-2" />
            Create Bot
          </>
        )}
      </Button>
    </motion.form>
  );
}