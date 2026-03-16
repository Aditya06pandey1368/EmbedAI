// components/dashboard/ChatHistory.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, ChevronDown, ChevronUp, Bot, User } from "lucide-react";

interface BotOption {
  id: string;
  name: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

interface Session {
  id: string;
  created_at: string;
  chat_messages: Message[];
}

export default function ChatHistory({ bots }: { bots: BotOption[] }) {
  const [selectedBotId, setSelectedBotId] = useState(bots[0]?.id ?? "");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedBotId) loadHistory(selectedBotId);
  }, [selectedBotId]);

  async function loadHistory(botId: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/history?botId=${botId}`);
      const data = await res.json();
      setSessions(data.sessions || []);
    } catch (err) {
      console.error("Failed to load history:", err);
    } finally {
      setLoading(false);
    }
  }

  function toggleSession(sessionId: string) {
    setExpandedSession((prev) => (prev === sessionId ? null : sessionId));
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white">Chat History</h1>
        <p className="text-slate-400 text-sm mt-1">
          Review all conversations visitors have had with your bot.
        </p>
      </div>

      {bots.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
          <MessageSquare className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-white font-semibold mb-1">No bots yet</p>
          <p className="text-slate-400 text-sm">Create a bot to see chat history.</p>
        </div>
      ) : (
        <>
          {/* Bot Selector */}
          <div className="flex items-center gap-3">
            <label className="text-slate-400 text-sm font-medium">
              Bot:
            </label>
            <select
              value={selectedBotId}
              onChange={(e) => {
                setSelectedBotId(e.target.value);
                setExpandedSession(null);
              }}
              className="bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-cyan-500"
            >
              {bots.map((bot) => (
                <option key={bot.id} value={bot.id}>{bot.name}</option>
              ))}
            </select>
          </div>

          {/* Sessions List */}
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-4 animate-pulse"
                >
                  <div className="h-4 bg-slate-700 rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
              <MessageSquare className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">
                No conversations yet. Share your bot to start getting chats!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-slate-500 text-sm">
                {sessions.length} conversation{sessions.length !== 1 ? "s" : ""} found
              </p>

              {sessions.map((session, index) => {
                const isExpanded = expandedSession === session.id;
                const messageCount = session.chat_messages?.length || 0;
                const firstUserMsg = session.chat_messages?.find(
                  (m) => m.role === "user"
                );

                return (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden"
                  >
                    {/* Session Header — click to expand */}
                    <button
                      onClick={() => toggleSession(session.id)}
                      className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="flex items-center gap-4 text-left">
                        <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                          <MessageSquare className="w-5 h-5 text-cyan-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">
                            {firstUserMsg
                              ? firstUserMsg.content.slice(0, 60) +
                                (firstUserMsg.content.length > 60 ? "..." : "")
                              : "Empty session"}
                          </p>
                          <p className="text-slate-500 text-xs mt-0.5">
                            {messageCount} message{messageCount !== 1 ? "s" : ""} ·{" "}
                            {new Date(session.created_at).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </p>
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-slate-400 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                      )}
                    </button>

                    {/* Expanded Messages */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="border-t border-slate-800 px-5 py-4 space-y-3 overflow-hidden"
                        >
                          {session.chat_messages?.map((message) => (
                            <div
                              key={message.id}
                              className={`flex gap-3 ${
                                message.role === "user"
                                  ? "justify-end"
                                  : "justify-start"
                              }`}
                            >
                              {/* Avatar */}
                              {message.role === "assistant" && (
                                <div className="w-7 h-7 bg-cyan-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                  <Bot className="w-4 h-4 text-cyan-400" />
                                </div>
                              )}

                              <div
                                className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                                  message.role === "user"
                                    ? "bg-cyan-500 text-white rounded-br-sm"
                                    : "bg-slate-800 text-slate-200 rounded-bl-sm"
                                }`}
                              >
                                <p className="leading-relaxed">{message.content}</p>
                                <p
                                  className={`text-xs mt-1 ${
                                    message.role === "user"
                                      ? "text-cyan-200"
                                      : "text-slate-500"
                                  }`}
                                >
                                  {new Date(message.created_at).toLocaleTimeString(
                                    "en-US",
                                    { hour: "2-digit", minute: "2-digit" }
                                  )}
                                </p>
                              </div>

                              {/* Avatar for user */}
                              {message.role === "user" && (
                                <div className="w-7 h-7 bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                  <User className="w-4 h-4 text-slate-300" />
                                </div>
                              )}
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}