// lib/gemini.ts

import { pipeline } from "@huggingface/transformers";

// ============================================
// CHAT — Groq API
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
    const errorText = await response.text();

    console.error(
      "[Groq] Chat generation failed:",
      response.status,
      errorText
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

  const content = data.choices?.[0]?.message?.content;

  if (typeof content !== "string" || !content.trim()) {
    throw new Error("Groq returned an empty response.");
  }

  return content;
}

// ============================================
// EMBEDDINGS — Local Transformers.js
// No hosted inference API or API token required.
// ============================================

const EMBEDDING_MODEL =
  "Xenova/all-MiniLM-L6-v2";

const EMBEDDING_DIMENSIONS = 384;

type EmbeddingOutput = {
  data: Float32Array | number[];
};

type EmbeddingExtractor = (
  text: string,
  options: {
    pooling: "mean";
    normalize: true;
  }
) => Promise<EmbeddingOutput>;

// Keep a single model-loading promise so concurrent
// requests don't initialize duplicate model instances.
let extractorPromise: Promise<EmbeddingExtractor> | null =
  null;

async function getEmbeddingExtractor(): Promise<EmbeddingExtractor> {
  if (!extractorPromise) {
    extractorPromise = (async () => {
      const extractor = await pipeline(
        "feature-extraction",
        EMBEDDING_MODEL,
        {
          dtype: "q8",
        }
      );

      return extractor as unknown as EmbeddingExtractor;
    })().catch((error: unknown) => {
      // Allow a later request to retry model loading.
      extractorPromise = null;

      console.error(
        "[Embeddings] Could not load local model:",
        error
      );

      throw new Error(
        "Failed to load the local embedding model."
      );
    });
  }

  return extractorPromise;
}

/**
 * Converts text into a normalized 384-dimensional vector.
 *
 * The optional second argument is retained for backward
 * compatibility with callers of the old function.
 */
export async function generateEmbedding(
  text: string,
  _retries = 3
): Promise<number[]> {
  if (typeof text !== "string" || !text.trim()) {
    throw new Error(
      "Cannot generate an embedding for empty text."
    );
  }

  try {
    const extractor = await getEmbeddingExtractor();

    const output = await extractor(text, {
      pooling: "mean",
      normalize: true,
    });

    const embedding = Array.from(output.data);

    if (embedding.length !== EMBEDDING_DIMENSIONS) {
      throw new Error(
        `Expected ${EMBEDDING_DIMENSIONS} embedding values, ` +
          `but received ${embedding.length}.`
      );
    }

    if (!embedding.every(Number.isFinite)) {
      throw new Error(
        "The embedding contains invalid numeric values."
      );
    }

    return embedding;
  } catch (error) {
    console.error(
      "[Embeddings] Local embedding generation failed:",
      error
    );

    throw new Error(
      "Local embedding generation failed. Check the server logs."
    );
  }
}