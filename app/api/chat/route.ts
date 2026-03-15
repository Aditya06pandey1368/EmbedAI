// app/api/chat/route.ts

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { chatModel } from "@/lib/gemini";
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

    // Fetch bot details (name, welcome message etc.)
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

    // Build the prompt with context
    const prompt = buildPrompt(question, relevantChunks, bot.name);

    // Get or create a chat session
    let currentSessionId = sessionId;
    if (!currentSessionId) {
      const { data: session } = await supabaseAdmin
        .from("chat_sessions")
        .insert({ bot_id: botId })
        .select()
        .single();
      currentSessionId = session?.id;
    }

    // Save user message to database
    await supabaseAdmin.from("chat_messages").insert({
      session_id: currentSessionId,
      bot_id: botId,
      role: "user",
      content: question,
    });

    // Stream the AI response token by token
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        let fullResponse = "";

        try {
          // generateContentStream = streams tokens as they are generated
          const result = await chatModel.generateContentStream(prompt);

          for await (const chunk of result.stream) {
            const text = chunk.text();
            fullResponse += text;

            // Send each token to the client immediately
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ text })}\n\n`)
            );
          }

          // Save complete AI response to database
          await supabaseAdmin.from("chat_messages").insert({
            session_id: currentSessionId,
            bot_id: botId,
            role: "assistant",
            content: fullResponse,
          });

          // Update bot message count
          await supabaseAdmin
            .from("bots")
            .update({ total_messages: bot.total_messages + 1 })
            .eq("id", botId);

          // Signal stream is complete
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();

        } catch (error) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: "AI response failed" })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    // Return as Server-Sent Events
    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });

  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}