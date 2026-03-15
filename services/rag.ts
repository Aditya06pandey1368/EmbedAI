// services/rag.ts

import { generateEmbedding } from "@/lib/gemini";
import { supabaseAdmin } from "@/lib/supabase";

interface MatchedChunk {
  id: string;
  content: string;
  similarity: number;
}

// Find the most relevant chunks for a given question
export async function findRelevantChunks(
  question: string,
  botId: string,
  matchCount: number = 5
): Promise<MatchedChunk[]> {

  // Step 1: Convert the question to a vector
  const questionEmbedding = await generateEmbedding(question);

  // Step 2: Search Supabase for similar chunks
  const { data, error } = await supabaseAdmin.rpc("match_chunks", {
    query_embedding: questionEmbedding,
    match_bot_id: botId,
    match_count: matchCount,
  });

  if (error) {
    console.error("Vector search error:", error);
    return [];
  }

  return data || [];
}

// Build a prompt with the retrieved context
export function buildPrompt(
  question: string,
  chunks: MatchedChunk[],
  botName: string
): string {
  const context = chunks
    .map((chunk, i) => `[${i + 1}] ${chunk.content}`)
    .join("\n\n");

  return `You are ${botName}, a helpful AI assistant. Answer questions based ONLY on the context provided below. If the answer is not in the context, say "I don't have information about that in my knowledge base."

CONTEXT:
${context}

QUESTION: ${question}

ANSWER:`;
}