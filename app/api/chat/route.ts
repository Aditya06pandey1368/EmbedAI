// app/api/chat/route.ts

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { generateChatResponse } from "@/lib/gemini";
import {
  findRelevantChunks,
  buildPrompt,
  type ConversationMessage,
} from "@/services/rag";

export const runtime = "nodejs";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const PLAN_LIMITS = {
  starter: { queries: 100 },
  pro: { queries: 5000 },
  enterprise: { queries: Infinity },
};

type Plan = keyof typeof PLAN_LIMITS;

function errorResponse(
  message: string,
  status: number
) {
  return NextResponse.json(
    { error: message },
    {
      status,
      headers: corsHeaders,
    }
  );
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
}

export async function POST(req: Request) {
  try {
    // ============================================
    // STEP 1: VALIDATE REQUEST
    // ============================================

    const body = await req.json();

    const question =
      typeof body.question === "string"
        ? body.question.trim()
        : "";

    const botId =
      typeof body.botId === "string"
        ? body.botId.trim()
        : "";

    const suppliedSessionId =
      typeof body.sessionId === "string"
        ? body.sessionId.trim()
        : "";

    if (!question || !botId) {
      return errorResponse(
        "question and botId are required",
        400
      );
    }

    // ============================================
    // STEP 2: FETCH ACTIVE BOT
    // ============================================

    const {
      data: bot,
      error: botError,
    } = await supabaseAdmin
      .from("bots")
      .select("*")
      .eq("id", botId)
      .eq("is_active", true)
      .maybeSingle();

    if (botError) {
      console.error(
        "[Chat API] Bot lookup failed:",
        botError
      );

      return errorResponse(
        "Unable to process your request right now.",
        500
      );
    }

    if (!bot) {
      return errorResponse(
        "This chatbot is unavailable.",
        404
      );
    }

    // ============================================
    // STEP 3: RATE LIMITING
    // ============================================

    const {
      data: botOwner,
      error: ownerError,
    } = await supabaseAdmin
      .from("users")
      .select(
        "plan, queries_this_month, queries_reset_date"
      )
      .eq("id", bot.user_id)
      .maybeSingle();

    if (ownerError) {
      console.error(
        "[Chat API] Owner lookup failed:",
        ownerError
      );

      return errorResponse(
        "Unable to process your request right now.",
        500
      );
    }

    if (botOwner) {
      const plan: Plan =
        typeof botOwner.plan === "string" &&
        Object.prototype.hasOwnProperty.call(
          PLAN_LIMITS,
          botOwner.plan
        )
          ? (botOwner.plan as Plan)
          : "starter";

      const limit = PLAN_LIMITS[plan].queries;

      let currentUsage = Number(
        botOwner.queries_this_month ?? 0
      );

      const resetTime = botOwner.queries_reset_date
        ? Date.parse(botOwner.queries_reset_date)
        : 0;

      const resetRequired =
        !Number.isFinite(resetTime) ||
        Date.now() - resetTime >=
          30 * 24 * 60 * 60 * 1000;

      if (resetRequired) {
        const {
          error: resetError,
        } = await supabaseAdmin
          .from("users")
          .update({
            queries_this_month: 0,
            queries_reset_date:
              new Date().toISOString(),
          })
          .eq("id", bot.user_id);

        if (resetError) {
          console.error(
            "[Chat API] Usage reset failed:",
            resetError
          );

          return errorResponse(
            "Unable to process your request right now.",
            500
          );
        }

        currentUsage = 0;
      }

      if (currentUsage >= limit) {
        return NextResponse.json(
          {
            error:
              "Monthly query limit reached. Please upgrade your plan.",
            limitReached: true,
          },
          {
            status: 429,
            headers: corsHeaders,
          }
        );
      }

      const {
        error: usageError,
      } = await supabaseAdmin
        .from("users")
        .update({
          queries_this_month: currentUsage + 1,
        })
        .eq("id", bot.user_id);

      if (usageError) {
        console.error(
          "[Chat API] Usage increment failed:",
          usageError
        );

        return errorResponse(
          "Unable to process your request right now.",
          500
        );
      }
    }

    // ============================================
    // STEP 4: GET OR CREATE CHAT SESSION
    // ============================================

    let currentSessionId: string | undefined;

    // Verify that an existing session belongs to this bot.
    if (suppliedSessionId) {
      const {
        data: existingSession,
        error: sessionCheckError,
      } = await supabaseAdmin
        .from("chat_sessions")
        .select("id")
        .eq("id", suppliedSessionId)
        .eq("bot_id", botId)
        .maybeSingle();

      if (sessionCheckError) {
        console.error(
          "[Chat API] Session verification failed:",
          sessionCheckError
        );

        return errorResponse(
          "Unable to continue this conversation.",
          500
        );
      }

      if (existingSession) {
        currentSessionId = existingSession.id;
      }
    }

    // Create a session if this is a new conversation
    // or the supplied session no longer exists.
    if (!currentSessionId) {
      const {
        data: session,
        error: sessionError,
      } = await supabaseAdmin
        .from("chat_sessions")
        .insert({
          bot_id: botId,
        })
        .select("id")
        .single();

      if (sessionError || !session) {
        console.error(
          "[Chat API] Session creation failed:",
          sessionError
        );

        return errorResponse(
          "Unable to start a conversation.",
          500
        );
      }

      currentSessionId = session.id;
    }

    // ============================================
    // STEP 5: FETCH PREVIOUS MESSAGES
    // ============================================

    // Important: this query runs before the current
    // question is inserted into chat_messages.
    const {
      data: historyRows,
      error: historyError,
    } = await supabaseAdmin
      .from("chat_messages")
      .select("role, content, created_at")
      .eq("session_id", currentSessionId)
      .eq("bot_id", botId)
      .order("created_at", {
        ascending: false,
      })
      .limit(10);

    if (historyError) {
      console.error(
        "[Chat API] History retrieval failed:",
        historyError
      );

      return errorResponse(
        "Unable to retrieve conversation history.",
        500
      );
    }

    // Convert newest-first database results into
    // chronological messages for the language model.
    const conversationHistory: ConversationMessage[] =
      (historyRows ?? [])
        .filter(
          (message) =>
            (
              message.role === "user" ||
              message.role === "assistant"
            ) &&
            typeof message.content === "string"
        )
        .reverse()
        .map((message) => ({
          role: message.role as
            | "user"
            | "assistant",
          content: message.content,
        }));

    // ============================================
    // STEP 6: RETRIEVE DOCUMENT CONTEXT
    // ============================================

    const relevantChunks = await findRelevantChunks(
      question,
      botId
    );

    // Include both the retrieved documents
    // and the earlier conversation messages.
    const prompt = buildPrompt(
      question,
      relevantChunks,
      bot.name,
      conversationHistory
    );

    // ============================================
    // STEP 7: SAVE CURRENT USER MESSAGE
    // ============================================

    const {
      error: userMessageError,
    } = await supabaseAdmin
      .from("chat_messages")
      .insert({
        session_id: currentSessionId,
        bot_id: botId,
        role: "user",
        content: question,
      });

    if (userMessageError) {
      console.error(
        "[Chat API] User message save failed:",
        userMessageError
      );

      return errorResponse(
        "Unable to save your message.",
        500
      );
    }

    // ============================================
    // STEP 8: GENERATE AI RESPONSE
    // ============================================

    const responseText =
      await generateChatResponse(prompt);

    // ============================================
    // STEP 9: SAVE ASSISTANT RESPONSE
    // ============================================

    const {
      error: assistantMessageError,
    } = await supabaseAdmin
      .from("chat_messages")
      .insert({
        session_id: currentSessionId,
        bot_id: botId,
        role: "assistant",
        content: responseText,
      });

    if (assistantMessageError) {
      console.error(
        "[Chat API] Assistant message save failed:",
        assistantMessageError
      );

      return errorResponse(
        "The response was generated but could not be saved.",
        500
      );
    }

    // ============================================
    // STEP 10: UPDATE BOT MESSAGE COUNT
    // ============================================

    const {
      error: countError,
    } = await supabaseAdmin
      .from("bots")
      .update({
        total_messages:
          (bot.total_messages ?? 0) + 1,
      })
      .eq("id", botId);

    if (countError) {
      // Do not discard an otherwise successful chat
      // response just because analytics failed.
      console.error(
        "[Chat API] Message count update failed:",
        countError
      );
    }

    // ============================================
    // STEP 11: RETURN RESPONSE AND SESSION ID
    // ============================================

    return NextResponse.json(
      {
        text: responseText,
        sessionId: currentSessionId,
      },
      {
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error("[Chat API] Unexpected error:", error);

    return errorResponse(
      "Something went wrong. Please try again.",
      500
    );
  }
}