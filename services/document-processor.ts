// services/document-processor.ts

import pdf from "pdf-parse";
import { generateEmbedding } from "@/lib/gemini";
import { supabaseAdmin } from "@/lib/supabase";

// ============================================
// STEP 1: Extract text from PDF buffer
// ============================================
export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  const data = await pdf(buffer);
  return data.text;
}

// ============================================
// STEP 2: Split text into chunks
// Why? Because AI models have token limits.
// We can't send an entire 100-page PDF at once.
// We split it into small overlapping pieces.
// ============================================
export function splitIntoChunks(
  text: string,
  chunkSize: number = 500,    // each chunk = ~500 characters
  overlap: number = 50        // last 50 chars of prev chunk included in next
): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = start + chunkSize;
    const chunk = text.slice(start, end).trim();

    // Only add chunks that have actual content
    if (chunk.length > 20) {
      chunks.push(chunk);
    }

    // Move forward but keep overlap for context continuity
    start += chunkSize - overlap;
  }

  return chunks;
}

// ============================================
// STEP 3: Full pipeline — process entire document
// ============================================
export async function processDocument(
  documentId: string,
  botId: string,
  fileBuffer: Buffer
): Promise<void> {

  try {
    // Mark document as "processing"
    await supabaseAdmin
      .from("documents")
      .update({ status: "processing" })
      .eq("id", documentId);

    // Step 1: Extract text
    const text = await extractTextFromPDF(fileBuffer);

    if (!text || text.trim().length === 0) {
      throw new Error("No text found in PDF");
    }

    // Step 2: Split into chunks
    const chunks = splitIntoChunks(text);
    console.log(`📄 Document split into ${chunks.length} chunks`);

    // Step 3: Generate embeddings and store
    // We process in batches of 5 to avoid rate limits
    const batchSize = 5;
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);

      // Generate embeddings for this batch in parallel
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

      // Store batch in Supabase
      const { error } = await supabaseAdmin
        .from("document_chunks")
        .insert(chunkData);

      if (error) throw error;

      console.log(`✅ Processed chunks ${i + 1} to ${i + batch.length}`);
    }

    // Mark document as "done"
    await supabaseAdmin
      .from("documents")
      .update({
        status: "done",
        chunk_count: chunks.length,
      })
      .eq("id", documentId);

    console.log(`🎉 Document ${documentId} processed successfully!`);

  } catch (error) {
    console.error("Document processing failed:", error);

    // Mark document as "failed"
    await supabaseAdmin
      .from("documents")
      .update({ status: "failed" })
      .eq("id", documentId);

    throw error;
  }
}