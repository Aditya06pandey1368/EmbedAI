
/**
 * lib/gemini.ts
 *
 * Chat generation: Groq
 * Text embeddings: Gemini Embedding 2 API
 * Vector dimension: 384
 */

type EmbeddingPurpose = "query" | "document";

// ============================================
// CHAT GENERATION — GROQ
// ============================================

export async function generateChatResponse(
  prompt: string
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured.");
  }

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-20b",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 1024,
        temperature: 0.7,
      }),
    }
  );

  if (!response.ok) {
    const details = await response.text();

    console.error(
      "[Groq] Chat request failed:",
      response.status,
      details
    );

    throw new Error("Failed to generate the AI response.");
  }

  const data = (await response.json()) as {
    choices?: Array<{
      message?: {
        content?: string | null;
      };
    }>;
  };

  const answer = data.choices?.[0]?.message?.content;

  if (typeof answer !== "string" || !answer.trim()) {
    throw new Error("Groq returned an empty response.");
  }

  return answer;
}

// ============================================
// EMBEDDINGS — GEMINI EMBEDDING 2 API
// No local ONNX Runtime or native Sharp dependency.
// ============================================

const EMBEDDING_DIMENSIONS = 384;

export async function generateEmbedding(
  text: string,
  purposeOrLegacyRetries: EmbeddingPurpose | number = "query"
): Promise<number[]> {
  if (typeof text !== "string" || !text.trim()) {
    throw new Error(
      "Cannot generate an embedding for empty text."
    );
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  // Support older calls that supplied a numeric retry argument.
  // Update document-processing calls to pass "document" explicitly.
  const purpose: EmbeddingPurpose =
    typeof purposeOrLegacyRetries === "string"
      ? purposeOrLegacyRetries
      : "query";

  // Use the same embedding model for documents and queries,
  // with the appropriate text format for each task.
  const formattedText =
    purpose === "document"
      ? `title: none | text: ${text.trim()}`
      : `task: search result | query: ${text.trim()}`;

  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2:embedContent",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        content: {
          parts: [{ text: formattedText }],
        },
        output_dimensionality: EMBEDDING_DIMENSIONS,
      }),
    }
  );

  if (!response.ok) {
    const details = await response.text();

    console.error(
      "[Gemini Embeddings] Request failed:",
      response.status,
      details
    );

    throw new Error(
      "Text embedding failed. Check server logs."
    );
  }

  const data = (await response.json()) as {
    embedding?: {
      values?: number[];
    };
  };

  const embedding = data.embedding?.values;

  if (
    !Array.isArray(embedding) ||
    embedding.length !== EMBEDDING_DIMENSIONS ||
    !embedding.every(Number.isFinite)
  ) {
    console.error(
      "[Gemini Embeddings] Invalid response dimensions:",
      embedding?.length
    );

    throw new Error("Invalid embedding response.");
  }

  return embedding;
}
