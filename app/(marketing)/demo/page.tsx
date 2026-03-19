// app/(marketing)/demo/page.tsx

import ChatWidget from "@/components/widget/ChatWidget";

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold text-white mb-4">
          Live Widget Demo
        </h1>
        <p className="text-slate-400 mb-8">
          This is exactly how your widget looks on any website.
          Click the bubble in the bottom right!
        </p>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 max-w-2xl">
          <p className="text-slate-500">← Your website content here →</p>
        </div>
      </div>

      {/* Real widget — same origin, no CORS needed */}
      <ChatWidget
        botId="0b63533e-3d08-44d3-9f50-8fe4a8b9a274"
        botName="Aditya"
        welcomeMessage="Hi! How can I help you today?"
        primaryColor="#0ea5e9"
      />
    </div>
  );
}