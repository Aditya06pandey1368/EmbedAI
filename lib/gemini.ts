// lib/gemini.ts

import { pipeline } from "@xenova/transformers";

// ============================================
// CHAT — Groq API (Free, very fast)
// ============================================
export async function generateChatResponse(prompt: string): Promise<string> {
  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant", // free, very fast
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1024,
        temperature: 0.7,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Groq API error: ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// ============================================
// EMBEDDINGS — Local Transformers.js
// ============================================
let pipelinePromise: Promise<any> | null = null;

async function getEmbeddingPipeline() {
  if (!pipelinePromise) {
    console.log("⏳ Loading embedding model (first time only)...");
    pipelinePromise = pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2"
    );
  }
  return pipelinePromise;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const extractor = await getEmbeddingPipeline();
  const output = await extractor(text, {
    pooling: "mean",
    normalize: true,
  });
  return Array.from(output.data) as number[];
}