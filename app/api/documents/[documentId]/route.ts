// app/api/documents/[documentId]/route.ts

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ documentId: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { documentId } = await params;

  // Verify document belongs to this user before deleting
  const { data: doc } = await supabaseAdmin
    .from("documents")
    .select("id, file_url")
    .eq("id", documentId)
    .eq("user_id", userId)
    .single();

  if (!doc) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  // Delete all chunks first (cascades automatically but being explicit)
  await supabaseAdmin
    .from("document_chunks")
    .delete()
    .eq("document_id", documentId);

  // Delete the document record
  await supabaseAdmin
    .from("documents")
    .delete()
    .eq("id", documentId);

  return NextResponse.json({ success: true });
}