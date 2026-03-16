// components/dashboard/SettingsPage.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, User, CreditCard, Bell } from "lucide-react";

interface UserData {
  id: string;
  email: string;
  name: string;
  plan: string;
}

export default function SettingsPage({ user }: { user: UserData | null }) {
  const { user: clerkUser } = useUser();
  const [saved, setSaved] = useState(false);

  // Fix 3: Each toggle has its own state
  const [notifications, setNotifications] = useState({
    weeklyReport: true,
    botAlerts: true,
    announcements: false,
  });

  const planDetails = {
    starter: { label: "Starter", color: "text-slate-400", bg: "bg-slate-400/10", desc: "Free forever" },
    pro: { label: "Pro", color: "text-cyan-400", bg: "bg-cyan-400/10", desc: "$29/month" },
    enterprise: { label: "Enterprise", color: "text-purple-400", bg: "bg-purple-400/10", desc: "Custom pricing" },
  };

  const plan = planDetails[user?.plan as keyof typeof planDetails] || planDetails.starter;

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function toggleNotification(key: keyof typeof notifications) {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  const notificationItems = [
    {
      key: "weeklyReport" as const,
      label: "Weekly usage report",
      desc: "Get a summary every Monday",
    },
    {
      key: "botAlerts" as const,
      label: "Bot error alerts",
      desc: "Know when your bot fails to respond",
    },
    {
      key: "announcements" as const,
      label: "New feature announcements",
      desc: "Be the first to know about updates",
    },
  ];

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

          {/* Fix 1: Removed broken Clerk link, replaced with helpful note */}
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
          <h2 className="text-white font-bold">Plan & Billing</h2>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${plan.bg} ${plan.color}`}>
                {plan.label}
              </span>
            </div>
            <p className="text-slate-400 text-sm">{plan.desc}</p>
          </div>

          {/* Fix 2: Show "Coming Soon" instead of a broken upgrade button */}
          <div className="flex flex-col items-start sm:items-end gap-1">
            <Button
              disabled
              className="w-full sm:w-auto bg-slate-700 text-slate-400 cursor-not-allowed gap-2"
            >
              Upgrade Plan — Coming Soon
            </Button>
            <p className="text-slate-600 text-xs">
              Paid plans will be available soon.
            </p>
          </div>
        </div>

        {/* Plan limits */}
        <div className="mt-6 pt-6 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
          {[
            { label: "Bots", used: 1, limit: user?.plan === "pro" ? 10 : 1 },
            { label: "Documents", used: 2, limit: user?.plan === "pro" ? 100 : 5 },
            { label: "Queries/mo", used: 12, limit: user?.plan === "pro" ? 5000 : 100 },
          ].map((item) => (
            <div key={item.label} className="w-full">
              <p className="text-slate-400 text-xs mb-1">{item.label}</p>
              <p className="text-white font-bold text-sm">
                {item.used}
                <span className="text-slate-500 font-normal"> / {item.limit}</span>
              </p>
              <div className="mt-2 h-1.5 bg-slate-700 rounded-full overflow-hidden w-full">
                <div
                  className="h-full bg-cyan-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((item.used / item.limit) * 100, 100)}%` }}
                />
              </div>
            </div>
          ))}
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
              <div
                key={item.key}
                className="flex items-center justify-between py-2 gap-4"
              >
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">{item.label}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{item.desc}</p>
                </div>

                {/* Fix 3: Working toggle button */}
                <button
                  onClick={() => toggleNotification(item.key)}
                  className={`w-11 h-6 rounded-full relative transition-colors duration-200 flex-shrink-0 ${
                    isOn ? "bg-cyan-500" : "bg-slate-700"
                  }`}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform duration-200 ${
                      isOn ? "translate-x-5" : "translate-x-1"
                    }`}
                  />
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