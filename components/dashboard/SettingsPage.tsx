// components/dashboard/SettingsPage.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, User, CreditCard, Bell, Loader2 } from "lucide-react";

interface UserData {
  id: string;
  email: string;
  name: string;
  plan: string;
}

interface Usage {
  bots:      { used: number; limit: number };
  documents: { used: number; limit: number };
  queries:   { used: number; limit: number };
}

export default function SettingsPage({ user }: { user: UserData | null }) {
  const { user: clerkUser } = useUser();
  const [saved, setSaved] = useState(false);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [usageLoading, setUsageLoading] = useState(true);

  const [notifications, setNotifications] = useState({
    weeklyReport:  true,
    botAlerts:     true,
    announcements: false,
  });

  // Fetch real usage data
  useEffect(() => {
    async function loadUsage() {
      try {
        const res = await fetch("/api/user/usage");
        const data = await res.json();
        setUsage(data.usage);
      } catch {
        console.error("Failed to load usage");
      } finally {
        setUsageLoading(false);
      }
    }
    loadUsage();
  }, []);

  

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function toggleNotification(key: keyof typeof notifications) {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  const notificationItems = [
    { key: "weeklyReport"  as const, label: "Weekly usage report",         desc: "Get a summary every Monday"                   },
    { key: "botAlerts"     as const, label: "Bot error alerts",             desc: "Know when your bot fails to respond"           },
    { key: "announcements" as const, label: "New feature announcements",    desc: "Be the first to know about updates"            },
  ];

  // Usage items with real data
  const usageItems = usage
    ? [
        { label: "Bots",       used: usage.bots.used,      limit: usage.bots.limit      },
        { label: "Documents",  used: usage.documents.used,  limit: usage.documents.limit  },
        { label: "Queries/mo", used: usage.queries.used,    limit: usage.queries.limit    },
      ]
    : [];

  return (
    <div className="w-full space-y-6 pb-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Settings</h1>
        <p className="text-slate-400 text-sm sm:text-base mt-1">
          Manage your account and preferences.
        </p>
      </div>

      {/* Profile Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-4 w-full"
      >
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-cyan-400" />
          <h2 className="text-white font-bold">Profile</h2>
        </div>

        <div className="space-y-4">
          <div className="space-y-2 w-full max-w-3xl">
            <Label className="text-slate-400 text-sm">Full Name</Label>
            <Input
              defaultValue={clerkUser?.fullName || user?.name || ""}
              disabled
              className="bg-slate-800 border-slate-700 text-white disabled:opacity-60 w-full"
            />
          </div>
          <div className="space-y-2 w-full max-w-3xl">
            <Label className="text-slate-400 text-sm">Email</Label>
            <Input
              defaultValue={clerkUser?.primaryEmailAddress?.emailAddress || user?.email || ""}
              disabled
              className="bg-slate-800 border-slate-700 text-white disabled:opacity-60 w-full"
            />
          </div>
          <p className="text-slate-500 text-xs sm:text-sm">
            Profile information is managed through your authentication provider.
            Contact support to update your details.
          </p>
        </div>
      </motion.div>

      {/* Plan Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 w-full"
      >
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="w-5 h-5 text-cyan-400" />
          <h2 className="text-white font-bold">Monthly Usage</h2>
        </div>

        

        {/* Real Usage Stats */}
        <div className="mt-6 pt-6 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {usageLoading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2 animate-pulse">
                <div className="h-3 bg-slate-700 rounded w-1/2" />
                <div className="h-5 bg-slate-700 rounded w-1/3" />
                <div className="h-1.5 bg-slate-700 rounded-full w-full" />
              </div>
            ))
          ) : (
            usageItems.map((item) => {
              const percentage = item.limit === Infinity
                ? 0
                : Math.min((item.used / item.limit) * 100, 100);

              const isNearLimit = percentage >= 80;
              const isAtLimit   = percentage >= 100;

              return (
                <div key={item.label} className="w-full">
                  <p className="text-slate-400 text-xs mb-1">{item.label}</p>
                  <p className="text-white font-bold text-sm">
                    {item.used}
                    <span className="text-slate-500 font-normal">
                      {" "}/ {item.limit === Infinity ? "∞" : item.limit}
                    </span>
                  </p>
                  <div className="mt-2 h-1.5 bg-slate-700 rounded-full overflow-hidden w-full">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isAtLimit
                          ? "bg-red-500"
                          : isNearLimit
                          ? "bg-yellow-500"
                          : "bg-cyan-500"
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  {isAtLimit && (
                    <p className="text-red-400 text-xs mt-1">Limit reached!</p>
                  )}
                  {isNearLimit && !isAtLimit && (
                    <p className="text-yellow-400 text-xs mt-1">Almost at limit</p>
                  )}
                </div>
              );
            })
          )}
        </div>
      </motion.div>

      {/* Notifications Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 w-full"
      >
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-cyan-400" />
          <h2 className="text-white font-bold">Notifications</h2>
        </div>

        <div className="space-y-4 max-w-4xl">
          {notificationItems.map((item) => {
            const isOn = notifications[item.key];
            return (
              <div key={item.key} className="flex items-center justify-between py-2 gap-4">
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">{item.label}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{item.desc}</p>
                </div>
                <button
                  onClick={() => toggleNotification(item.key)}
                  className={`w-11 h-6 rounded-full relative transition-colors duration-200 flex-shrink-0 ${
                    isOn ? "bg-cyan-500" : "bg-slate-700"
                  }`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform duration-200 ${
                    isOn ? "translate-x-5" : "translate-x-1"
                  }`} />
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-6 border-t border-slate-800">
          <Button
            onClick={handleSave}
            className="w-full sm:w-auto bg-cyan-500 hover:bg-cyan-600 text-white gap-2"
          >
            {saved ? (
              <><Check className="w-4 h-4" /> Saved!</>
            ) : (
              "Save preferences"
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}