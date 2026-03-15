// lib/gemini.ts

import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Model for CHAT (generating answers)
export const chatModel = genAI.getGenerativeModel({
  model: "gemini-1.5-flash", // free, fast, generous limits
});

// Model for EMBEDDINGS (converting text to vectors)
export const embeddingModel = genAI.getGenerativeModel({
  model: "text-embedding-004", // free, 768 dimensions
});

// Helper function: convert any text to a vector (array of numbers)
export async function generateEmbedding(text: string): Promise<number[]> {
  const result = await embeddingModel.embedContent(text);
  return result.embedding.values;
}