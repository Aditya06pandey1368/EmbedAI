// app/(dashboard)/dashboard/bots/new/page.tsx

import CreateBotForm from "../../../../../components/dashboard/CreateBotForm";

export default function NewBotPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-white">Create a new bot</h1>
        <p className="text-slate-400 mt-1 text-sm">
          Set up your AI chatbot in under a minute.
        </p>
      </div>
      <CreateBotForm />
    </div>
  );
}