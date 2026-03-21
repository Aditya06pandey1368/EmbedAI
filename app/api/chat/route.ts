// app/api/chat/route.ts

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { generateChatResponse } from "@/lib/gemini";
import { findRelevantChunks, buildPrompt } from "@/services/rag";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const PLAN_LIMITS = {
  starter:    { queries: 100      },
  pro:        { queries: 5000     },
  enterprise: { queries: Infinity },
};

export async function OPTIONS() {
  return new Response(null, { status: 200, headers: corsHeaders });
}

export async function POST(req: Request) {
  try {
    const { question, botId, sessionId } = await req.json();

    if (!question || !botId) {
      return NextResponse.json(
        { error: "question and botId are required" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Fetch bot
    const { data: bot } = await supabaseAdmin
      .from("bots")
      .select("*")
      .eq("id", botId)
      .eq("is_active", true)
      .single();

    if (!bot) {
      return NextResponse.json(
        { error: "Bot not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    // ============================================
    // RATE LIMITING — Check monthly query limit
    // ============================================
    const { data: botOwner } = await supabaseAdmin
      .from("users")
      .select("plan, queries_this_month, queries_reset_date")
      .eq("id", bot.user_id)
      .single();

    if (botOwner) {
      // Reset counter if 30 days passed
      const resetDate = new Date(botOwner.queries_reset_date || 0);
      const daysSinceReset = (Date.now() - resetDate.getTime()) / (1000 * 60 * 60 * 24);

      if (daysSinceReset >= 30) {
        await supabaseAdmin
          .from("users")
          .update({
            queries_this_month: 0,
            queries_reset_date: new Date().toISOString(),
          })
          .eq("id", bot.user_id);

        botOwner.queries_this_month = 0;
      }

      // Check if limit exceeded
      const plan = (botOwner.plan || "starter") as keyof typeof PLAN_LIMITS;
      const limit = PLAN_LIMITS[plan].queries;
      const currentUsage = botOwner.queries_this_month || 0;

      if (currentUsage >= limit) {
        return NextResponse.json(
          {
            error: "Monthly query limit reached. Please upgrade your plan.",
            limitReached: true,
          },
          { status: 429, headers: corsHeaders }
        );
      }

      // Increment query counter
      await supabaseAdmin
        .from("users")
        .update({ queries_this_month: currentUsage + 1 })
        .eq("id", bot.user_id);
    }

    // Find relevant chunks
    const relevantChunks = await findRelevantChunks(question, botId);
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

    return NextResponse.json(
      { text: responseText, sessionId: currentSessionId },
      { headers: corsHeaders }
    );

  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500, headers: corsHeaders }
    );
  }
}