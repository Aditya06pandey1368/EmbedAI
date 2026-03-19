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
// EMBEDDINGS — HuggingFace with retry
// ============================================
export async function generateEmbedding(
  text: string,
  retries: number = 3
): Promise<number[]> {
  for (let i = 0; i < retries; i++) {
    try {
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

      // If model is loading — wait and retry
      if (response.status === 503) {
        console.log(`⏳ HuggingFace model loading, retry ${i + 1}/${retries}...`);
        await new Promise((resolve) => setTimeout(resolve, 5000));
        continue;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HuggingFace error: ${errorText}`);
      }

      const data = await response.json();

      if (Array.isArray(data[0])) {
        return data[0] as number[];
      }
      return data as number[];

    } catch (err) {
      if (i === retries - 1) throw err;
      console.log(`Retry ${i + 1}/${retries}...`);
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }

  throw new Error("Embedding failed after all retries");
}