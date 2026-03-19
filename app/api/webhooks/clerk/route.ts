import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("Missing CLERK_WEBHOOK_SECRET");
    return new Response("Missing webhook secret", { status: 400 });
  }

  // Get headers
  const headerPayload = await headers();
  const svix_id        = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  const body = await req.text();
  const wh   = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id":        svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return new Response("Invalid webhook signature", { status: 400 });
  }

  // Handle user.created
  if (evt.type === "user.created") {
    const { id, email_addresses, first_name, last_name } = evt.data;

    const email = email_addresses[0]?.email_address || "";
    const name  = `${first_name ?? ""} ${last_name ?? ""}`.trim();

    const { error } = await supabaseAdmin
      .from("users")
      .upsert(
        { id, email, name, plan: "starter", is_admin: false },
        { onConflict: "id" }
      );

    if (error) {
      console.error("Failed to insert user:", error);
      return new Response("Database error", { status: 500 });
    }

    console.log(`✅ New user synced: ${email}`);
  }

  // Handle user.deleted
  if (evt.type === "user.deleted") {
    const { id } = evt.data;

    await supabaseAdmin
      .from("users")
      .delete()
      .eq("id", id as string);

    console.log(`🗑️ User deleted: ${id}`);
  }

  return new Response("OK", { status: 200 });
}