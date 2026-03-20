// components/dashboard/EditBotForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bot, Loader2, Check, Trash2 } from "lucide-react";

interface BotData {
  id: string;
  name: string;
  welcome_message: string;
  primary_color: string;
  is_active: boolean;
}

export default function EditBotForm({ bot }: { bot: BotData }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState(bot.name);
  const [welcomeMessage, setWelcomeMessage] = useState(bot.welcome_message);
  const [primaryColor, setPrimaryColor] = useState(bot.primary_color);
  const [isActive, setIsActive] = useState(bot.is_active);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/bots?botId=${bot.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          welcome_message: welcomeMessage,
          primary_color: primaryColor,
          is_active: isActive,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      // Show saved confirmation
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      router.refresh();

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
      className="space-y-6"
    >
      {/* Bot Name */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-white font-bold">Basic Info</h3>

        <div className="space-y-2">
          <Label htmlFor="name" className="text-slate-400 text-sm">
            Bot Name
          </Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-slate-800 border-slate-700 text-white focus:border-cyan-500"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="welcome" className="text-slate-400 text-sm">
            Welcome Message
          </Label>
          <Input
            id="welcome"
            value={welcomeMessage}
            onChange={(e) => setWelcomeMessage(e.target.value)}
            className="bg-slate-800 border-slate-700 text-white focus:border-cyan-500"
          />
          <p className="text-slate-500 text-xs">
            First message visitors see when they open the chat.
          </p>
        </div>
      </div>

      {/* Appearance */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-white font-bold">Appearance</h3>

        <div className="space-y-2">
          <Label htmlFor="color" className="text-slate-400 text-sm">
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
        </div>
      </div>

      {/* Status */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h3 className="text-white font-bold mb-4">Bot Status</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white text-sm font-medium">
              {isActive ? "Active" : "Inactive"}
            </p>
            <p className="text-slate-500 text-xs mt-0.5">
              {isActive
                ? "Your bot is live and accepting chats"
                : "Your bot is paused and won't accept chats"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsActive(!isActive)}
            className={`w-12 h-6 rounded-full relative transition-colors duration-200 ${
              isActive ? "bg-cyan-500" : "bg-slate-700"
            }`}
          >
            <div
              className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform duration-200 ${
                isActive ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button
          type="submit"
          disabled={loading || !name.trim()}
          className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white py-6 text-base font-semibold"
        >
          {loading ? (
            <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Saving...</>
          ) : saved ? (
            <><Check className="w-5 h-5 mr-2" /> Saved!</>
          ) : (
            "Save Changes"
          )}
        </Button>

        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push(`/dashboard/bots/${bot.id}`)}
          className="text-slate-400 hover:text-white px-6 py-6"
        >
          Cancel
        </Button>
      </div>
    </motion.form>
  );
}