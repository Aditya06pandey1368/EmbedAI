// components/admin/AdminUsers.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Shield, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface User {
  id: string;
  email: string;
  name: string;
  plan: string;
  is_admin: boolean;
  created_at: string;
  bots: { count: number }[];
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    setUsers(data.users || []);
    setLoading(false);
  }

  async function updatePlan(userId: string, plan: string) {
    setUpdating(userId);
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, plan }),
    });
    await loadUsers();
    setUpdating(null);
  }

  const planColors: Record<string, string> = {
    starter:    "bg-slate-400/10 text-slate-400",
    pro:        "bg-cyan-400/10 text-cyan-400",
    enterprise: "bg-purple-400/10 text-purple-400",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Users</h1>
        <p className="text-slate-400 text-sm mt-1">
          All registered users on the platform.
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 animate-pulse">
              <div className="h-4 bg-slate-700 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">

          {/* Table Header */}
          <div className="grid grid-cols-5 gap-4 px-6 py-3 border-b border-slate-800 text-slate-400 text-xs font-medium uppercase tracking-wider">
            <div className="col-span-2">User</div>
            <div>Plan</div>
            <div>Bots</div>
          </div>

          {/* Table Rows */}
          {users.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              className="grid grid-cols-5 gap-4 px-6 py-4 border-b border-slate-800/50 items-center hover:bg-slate-800/30 transition-colors"
            >
              {/* User info */}
              <div className="col-span-2 flex items-center gap-3">
                <div className="w-9 h-9 bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0">
                  {user.is_admin ? (
                    <Shield className="w-4 h-4 text-red-400" />
                  ) : (
                    <Users className="w-4 h-4 text-slate-400" />
                  )}
                </div>
                <div>
                  <p className="text-white text-sm font-medium">
                    {user.name || "No name"}
                    {user.is_admin && (
                      <span className="ml-2 text-xs bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded">
                        Admin
                      </span>
                    )}
                  </p>
                  <p className="text-slate-500 text-xs">{user.email}</p>
                </div>
              </div>

              {/* Plan badge */}
              <div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${planColors[user.plan] || planColors.starter}`}>
                  {user.plan}
                </span>
              </div>

              {/* Bot count */}
              <div className="text-slate-300 text-sm">
                {user.bots?.[0]?.count ?? 0} bots
              </div>

              
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}