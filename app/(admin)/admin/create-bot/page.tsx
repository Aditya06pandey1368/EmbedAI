// app/(admin)/admin/create-bot/page.tsx

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import CreateBotForm from "@/components/dashboard/CreateBotForm";

export default async function AdminCreateBotPage() {
  try { await requireAdmin(); } catch { redirect("/dashboard"); }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-white">
          Create Company Bot
        </h1>
        <p className="text-slate-400 mt-1 text-sm">
          Create a bot for EmbedAI's own website and demo.
        </p>
      </div>
      <CreateBotForm isAdmin />
    </div>
  );
}