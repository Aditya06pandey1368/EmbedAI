// app/api/documents/route.ts

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { processDocument } from "@/services/document-processor";

// GET — fetch all documents for a bot
export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const botId = searchParams.get("botId");

  if (!botId) {
    return NextResponse.json({ error: "botId is required" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("documents")
    .select("*")
    .eq("bot_id", botId)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ documents: data });
}

// POST — upload and process a document
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get the form data (file upload)
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const botId = formData.get("botId") as string;

    // Validate inputs
    if (!file || !botId) {
      return NextResponse.json(
        { error: "File and botId are required" },
        { status: 400 }
      );
    }

    if (!file.name.endsWith(".pdf")) {
      return NextResponse.json(
        { error: "Only PDF files are supported" },
        { status: 400 }
      );
    }

    // Max file size: 10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be under 10MB" },
        { status: 400 }
      );
    }

    // Verify the bot belongs to this user
    const { data: bot } = await supabaseAdmin
      .from("bots")
      .select("id")
      .eq("id", botId)
      .eq("user_id", userId)
      .single();

    if (!bot) {
      return NextResponse.json({ error: "Bot not found" }, { status: 404 });
    }

    // Convert file to buffer for processing
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload file to Supabase Storage
    const fileName = `${userId}/${botId}/${Date.now()}-${file.name}`;
    const { data: storageData, error: storageError } = await supabaseAdmin
      .storage
      .from("documents")
      .upload(fileName, buffer, { contentType: "application/pdf" });

    if (storageError) {
      console.error("Storage error:", storageError);
      return NextResponse.json(
        { error: "Failed to upload file" },
        { status: 500 }
      );
    }

    // Get the public URL
    const { data: { publicUrl } } = supabaseAdmin
      .storage
      .from("documents")
      .getPublicUrl(storageData.path);

    // Create document record in database
    const { data: document, error: dbError } = await supabaseAdmin
      .from("documents")
      .insert({
        user_id: userId,
        bot_id: botId,
        name: file.name,
        file_url: publicUrl,
        file_size: file.size,
        status: "pending",
      })
      .select()
      .single();

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    // Process document in background (don't await — return response immediately)
    // User gets instant response, processing happens behind the scenes
    processDocument(document.id, botId, buffer).catch(console.error);

    return NextResponse.json({ document }, { status: 201 });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}