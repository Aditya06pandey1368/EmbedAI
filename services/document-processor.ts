
 // services/document-processor.ts

import { extractText } from "unpdf";
import { generateEmbedding } from "@/lib/gemini";
import { supabaseAdmin } from "@/lib/supabase";

// ============================================
// UNICODE SANITIZATION
// ============================================

function sanitizeUnicode(text: string): string {
  let result = "";

  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);

    // PostgreSQL text cannot contain a NUL character.
    if (code === 0) {
      continue;
    }

    // A high surrogate must be followed by a low surrogate.
    if (code >= 0xd800 && code <= 0xdbff) {
      const next = text.charCodeAt(i + 1);

      if (next >= 0xdc00 && next <= 0xdfff) {
        result += text[i] + text[i + 1];
        i++;
      } else {
        result += "\uFFFD";
      }
    } else if (code >= 0xdc00 && code <= 0xdfff) {
      // Replace a low surrogate without its high surrogate.
      result += "\uFFFD";
    } else {
      result += text[i];
    }
  }

  return result;
}

// ============================================
// STEP 1: EXTRACT TEXT FROM PDF
// ============================================

export async function extractTextFromPDF(
  buffer: Buffer
): Promise<string> {
  const uint8Array = new Uint8Array(buffer);

  const { text } = await extractText(uint8Array, {
    mergePages: true,
  });

  return sanitizeUnicode(text);
}

// ============================================
// STEP 2: SPLIT TEXT INTO CHUNKS
// ============================================

export function splitIntoChunks(
  text: string,
  chunkSize: number = 500,
  overlap: number = 50
): string[] {
  if (
    !Number.isInteger(chunkSize) ||
    !Number.isInteger(overlap) ||
    chunkSize <= 0 ||
    overlap < 0 ||
    overlap >= chunkSize
  ) {
    throw new Error(
      "Invalid chunk settings: chunkSize must be positive, " +
      "and overlap must be between 0 and chunkSize - 1."
    );
  }

  // Array.from preserves complete Unicode code points,
  // preventing chunk boundaries from splitting surrogate pairs.
  const characters = Array.from(
    sanitizeUnicode(text)
  );

  const chunks: string[] = [];
  const step = chunkSize - overlap;

  for (
    let start = 0;
    start < characters.length;
    start += step
  ) {
    const chunk = sanitizeUnicode(
      characters.slice(start, start + chunkSize).join("")
    ).trim();

    if (chunk.length > 20) {
      chunks.push(chunk);
    }
  }

  return chunks;
}

// ============================================
// STEP 3: PROCESS A DOCUMENT
// ============================================

export async function processDocument(
  documentId: string,
  botId: string,
  fileBuffer: Buffer
): Promise<void> {
  // True once existing chunks have been replaced.
  // Allows cleanup if inserting the new chunks fails.
  let replacingChunks = false;

  try {
    // 1. Mark the document as processing.
    const {
      error: processingStatusError,
    } = await supabaseAdmin
      .from("documents")
      .update({ status: "processing" })
      .eq("id", documentId)
      .eq("bot_id", botId);

    if (processingStatusError) {
      throw processingStatusError;
    }

    // 2. Extract and sanitize PDF text.
    const text = await extractTextFromPDF(fileBuffer);

    if (!text.trim()) {
      throw new Error(
        "No extractable text was found in the PDF."
      );
    }

    // 3. Split the document.
    const chunks = splitIntoChunks(text);

    if (chunks.length === 0) {
      throw new Error(
        "The PDF did not produce any usable text chunks."
      );
    }

    console.log(
      `[Document Processor] ${documentId}: ` +
      `split into ${chunks.length} chunks.`
    );

    // 4. Generate embeddings with Gemini Embedding 2.
    //
    // Prepare all new embeddings before deleting the old chunks.
    // If embedding generation fails, existing rows remain available
    // rather than being removed prematurely.
    const newChunkRows: Array<{
      document_id: string;
      bot_id: string;
      content: string;
      embedding: number[];
      chunk_index: number;
    }> = [];

    const embeddingBatchSize = 3;

    for (
      let start = 0;
      start < chunks.length;
      start += embeddingBatchSize
    ) {
      const batch = chunks.slice(
        start,
        start + embeddingBatchSize
      );

      const embeddedBatch = await Promise.all(
        batch.map(async (chunk, batchIndex) => {
          const embedding = await generateEmbedding(
            chunk,
            "document"
          );

          return {
            document_id: documentId,
            bot_id: botId,
            content: sanitizeUnicode(chunk),
            embedding,
            chunk_index: start + batchIndex,
          };
        })
      );

      newChunkRows.push(...embeddedBatch);

      console.log(
        `[Document Processor] Generated embeddings ` +
        `for chunks ${start + 1} to ${start + batch.length}.`
      );
    }

    // 5. Replace the old vectors.
    //
    // Important: this prevents duplicate rows when reprocessing
    // a document or switching embedding models.
    const {
      error: deleteError,
    } = await supabaseAdmin
      .from("document_chunks")
      .delete()
      .eq("document_id", documentId)
      .eq("bot_id", botId);

    if (deleteError) {
      throw deleteError;
    }

    replacingChunks = true;

    // 6. Insert the newly embedded chunks in small database batches.
    const insertBatchSize = 25;

    for (
      let start = 0;
      start < newChunkRows.length;
      start += insertBatchSize
    ) {
      const batch = newChunkRows.slice(
        start,
        start + insertBatchSize
      );

      const {
        error: insertError,
      } = await supabaseAdmin
        .from("document_chunks")
        .insert(batch);

      if (insertError) {
        console.error(
          "[Document Processor] Chunk insertion failed:",
          {
            documentId,
            firstChunk: start,
            error: insertError,
          }
        );

        throw insertError;
      }

      console.log(
        `[Document Processor] Saved chunks ` +
        `${start + 1} to ${start + batch.length}.`
      );
    }

    // 7. Mark the document as completed.
    const {
      error: completedStatusError,
    } = await supabaseAdmin
      .from("documents")
      .update({
        status: "done",
        chunk_count: chunks.length,
      })
      .eq("id", documentId)
      .eq("bot_id", botId);

    if (completedStatusError) {
      throw completedStatusError;
    }

    console.log(
      `[Document Processor] Document ${documentId} processed successfully.`
    );
  } catch (error) {
    console.error(
      "[Document Processor] Processing failed:",
      {
        documentId,
        error,
      }
    );

    // If replacement had started, remove partial new vectors.
    // This prevents subsequent searches from using incomplete chunks.
    if (replacingChunks) {
      const {
        error: cleanupError,
      } = await supabaseAdmin
        .from("document_chunks")
        .delete()
        .eq("document_id", documentId)
        .eq("bot_id", botId);

      if (cleanupError) {
        console.error(
          "[Document Processor] Failed to clean up partial chunks:",
          cleanupError
        );
      }
    }

    const {
      error: failedStatusError,
    } = await supabaseAdmin
      .from("documents")
      .update({ status: "failed" })
      .eq("id", documentId)
      .eq("bot_id", botId);

    if (failedStatusError) {
      console.error(
        "[Document Processor] Failed to update document status:",
        failedStatusError
      );
    }

    throw error;
  }
}
