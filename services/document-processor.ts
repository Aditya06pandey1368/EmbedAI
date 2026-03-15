// services/document-processor.ts

import { extractText } from "unpdf";
import { generateEmbedding } from "@/lib/gemini";
import { supabaseAdmin } from "@/lib/supabase";

// ============================================
// STEP 1: Extract text from PDF buffer
// ============================================
export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  // unpdf expects Uint8Array not Buffer
  const uint8Array = new Uint8Array(buffer);
  const { text } = await extractText(uint8Array, { mergePages: true });
  return text;
}

// ============================================
// STEP 2: Split text into chunks
// ============================================
export function splitIntoChunks(
  text: string,
  chunkSize: number = 500,
  overlap: number = 50
): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = start + chunkSize;
    const chunk = text.slice(start, end).trim();

    if (chunk.length > 20) {
      chunks.push(chunk);
    }

    start += chunkSize - overlap;
  }

  return chunks;
}

// ============================================
// STEP 3: Full pipeline
// ============================================
export async function processDocument(
  documentId: string,
  botId: string,
  fileBuffer: Buffer
): Promise<void> {
  try {
    await supabaseAdmin
      .from("documents")
      .update({ status: "processing" })
      .eq("id", documentId);

    const text = await extractTextFromPDF(fileBuffer);

    if (!text || text.trim().length === 0) {
      throw new Error("No text found in PDF");
    }

    const chunks = splitIntoChunks(text);
    console.log(`📄 Document split into ${chunks.length} chunks`);

    const batchSize = 5;
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);

      const embeddingPromises = batch.map(async (chunk, index) => {
        const embedding = await generateEmbedding(chunk);
        return {
          document_id: documentId,
          bot_id: botId,
          content: chunk,
          embedding,
          chunk_index: i + index,
        };
      });

      const chunkData = await Promise.all(embeddingPromises);

      const { error } = await supabaseAdmin
        .from("document_chunks")
        .insert(chunkData);

      if (error) throw error;

      console.log(`✅ Processed chunks ${i + 1} to ${i + batch.length}`);
    }

    await supabaseAdmin
      .from("documents")
      .update({ status: "done", chunk_count: chunks.length })
      .eq("id", documentId);

    console.log(`🎉 Document ${documentId} processed successfully!`);

  } catch (error) {
    console.error("Document processing failed:", error);

    await supabaseAdmin
      .from("documents")
      .update({ status: "failed" })
      .eq("id", documentId);

    throw error;
  }
}