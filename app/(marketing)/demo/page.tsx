// app/(marketing)/demo/page.tsx

import ChatWidget from "../../../components/widget/ChatWidget";

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center px-4">
        <h1 className="text-4xl font-extrabold text-white mb-4">
          Live Widget Demo
        </h1>
        <p className="text-slate-400 mb-8">
          Click the bubble in the bottom right corner!
        </p>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 max-w-2xl mx-auto">
          <p className="text-slate-500">← Your website content here →</p>
        </div>
      </div>

      <ChatWidget
        botId="3f2bf30b-a319-4687-be8c-eb0c2c1d5bee"
        botName="EmbedAI"
        welcomeMessage="Hi! How can I help you today?"
        primaryColor="#0ea5e9"
      />
    </div>
  );
}