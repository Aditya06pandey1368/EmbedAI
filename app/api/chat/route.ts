// app/api/chat/route.ts

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { generateChatResponse } from "@/lib/gemini";
import { findRelevantChunks, buildPrompt } from "@/services/rag";

export async function POST(req: Request) {
  try {
    const { question, botId, sessionId } = await req.json();

    if (!question || !botId) {
      return NextResponse.json(
        { error: "question and botId are required" },
        { status: 400 }
      );
    }

    // Fetch bot details
    const { data: bot } = await supabaseAdmin
      .from("bots")
      .select("*")
      .eq("id", botId)
      .eq("is_active", true)
      .single();

    if (!bot) {
      return NextResponse.json({ error: "Bot not found" }, { status: 404 });
    }

    // Find relevant chunks using vector search
    const relevantChunks = await findRelevantChunks(question, botId);

    // Build prompt with context
    const prompt = buildPrompt(question, relevantChunks, bot.name);

    // Get or create session
    let currentSessionId = sessionId;
    if (!currentSessionId) {
      const { data: session } = await supabaseAdmin
        .from("chat_sessions")
        .insert({ bot_id: botId })
        .select()
        .single();
      currentSessionId = session?.id;
    }

    // Save user message
    await supabaseAdmin.from("chat_messages").insert({
      session_id: currentSessionId,
      bot_id: botId,
      role: "user",
      content: question,
    });

    // Generate AI response
    const responseText = await generateChatResponse(prompt);

    // Save assistant message
    await supabaseAdmin.from("chat_messages").insert({
      session_id: currentSessionId,
      bot_id: botId,
      role: "assistant",
      content: responseText,
    });

    // Update bot message count
    await supabaseAdmin
      .from("bots")
      .update({ total_messages: bot.total_messages + 1 })
      .eq("id", botId);

    // Return response
    return NextResponse.json({
      text: responseText,
      sessionId: currentSessionId,
    });

  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}