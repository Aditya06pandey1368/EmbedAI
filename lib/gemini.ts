// lib/gemini.ts

import { GoogleGenerativeAI } from "@google/generative-ai";
import { pipeline } from "@xenova/transformers";

// Gemini for CHAT
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const chatModel = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

// Singleton promise — ensures model loads ONCE even if called simultaneously
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