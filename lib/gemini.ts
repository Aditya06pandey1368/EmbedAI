// lib/gemini.ts

// ============================================
// CHAT — Groq API
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
        model: "llama-3.1-8b-instant",
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
// EMBEDDINGS — HuggingFace REST API
// Works in both local and Vercel production
// ============================================
export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await fetch(
    "https://router.huggingface.co/hf-inference/models/sentence-transformers/all-MiniLM-L6-v2/pipeline/feature-extraction",
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: text }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("HuggingFace error:", errorText);
    throw new Error(`Embedding failed: ${errorText}`);
  }

  const data = await response.json();

  // Response can be nested array or flat array
  if (Array.isArray(data[0])) {
    return data[0] as number[];
  }
  return data as number[];
}