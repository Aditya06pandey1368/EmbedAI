// app/api/bots/route.ts

import {
  auth,
  clerkClient,
} from "@clerk/nextjs/server";

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// ============================================
// PLAN LIMITS
// ============================================

const PLAN_LIMITS = {
  starter: {
    bots: 1,
    documents: 5,
    queries: 100,
  },
  pro: {
    bots: 10,
    documents: 100,
    queries: 5000,
  },
  enterprise: {
    bots: Infinity,
    documents: Infinity,
    queries: Infinity,
  },
};

type Plan = keyof typeof PLAN_LIMITS;

// ============================================
// HELPERS
// ============================================

function errorResponse(
  message: string,
  status: number
) {
  return NextResponse.json(
    { error: message },
    { status }
  );
}

function getPlan(value: unknown): Plan {
  if (
    typeof value === "string" &&
    Object.prototype.hasOwnProperty.call(
      PLAN_LIMITS,
      value
    )
  ) {
    return value as Plan;
  }

  return "starter";
}

// ============================================
// ENSURE USER EXISTS IN SUPABASE
// ============================================

async function ensureUserExists(userId: string) {
  // First, check whether the user already exists.
  const {
    data: existingUser,
    error: lookupError,
  } = await supabaseAdmin
    .from("users")
    .select("id, plan")
    .eq("id", userId)
    .maybeSingle();

  if (lookupError) {
    console.error(
      "[Bots API] Supabase user lookup failed:",
      lookupError
    );

    return {
      user: null,
      error: "Unable to verify your account.",
    };
  }

  if (existingUser) {
    return {
      user: existingUser,
      error: null,
    };
  }

  // The Clerk account exists, but its corresponding
  // record is missing from Supabase.
  try {
    const clerk = await clerkClient();

    const clerkUser =
      await clerk.users.getUser(userId);

    const email =
      clerkUser.emailAddresses.find(
        (item) =>
          item.id ===
          clerkUser.primaryEmailAddressId
      )?.emailAddress ??
      clerkUser.emailAddresses[0]?.emailAddress ??
      "";

    const name = [
      clerkUser.firstName,
      clerkUser.lastName,
    ]
      .filter(Boolean)
      .join(" ")
      .trim();

    if (!email) {
      console.error(
        "[Bots API] Clerk user has no available email address.",
        { userId }
      );

      return {
        user: null,
        error:
          "Unable to initialize your account. Please contact support.",
      };
    }

    // Create the missing user without overwriting an
    // existing user's plan or administrator status.
    const {
      error: insertError,
    } = await supabaseAdmin
      .from("users")
      .upsert(
        {
          id: userId,
          email,
          name: name || "User",
          plan: "starter",
          is_admin: false,
        },
        {
          onConflict: "id",
          ignoreDuplicates: true,
        }
      );

    if (insertError) {
      console.error(
        "[Bots API] Failed to synchronize Clerk user:",
        insertError
      );

      return {
        user: null,
        error:
          "Unable to initialize your account. Please try again.",
      };
    }

    // Read the record again. This also handles a concurrent
    // request that created the user first.
    const {
      data: syncedUser,
      error: verifyError,
    } = await supabaseAdmin
      .from("users")
      .select("id, plan")
      .eq("id", userId)
      .maybeSingle();

    if (verifyError || !syncedUser) {
      console.error(
        "[Bots API] User verification failed:",
        verifyError ?? "No user record found"
      );

      return {
        user: null,
        error:
          "Unable to initialize your account. Please try again.",
      };
    }

    return {
      user: syncedUser,
      error: null,
    };
  } catch (error) {
    console.error(
      "[Bots API] Clerk user synchronization failed:",
      error
    );

    return {
      user: null,
      error:
        "Unable to initialize your account. Please try again.",
    };
  }
}

// ============================================
// GET — FETCH ALL BOTS FOR LOGGED-IN USER
// ============================================

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return errorResponse("Unauthorized", 401);
  }

  const {
    data,
    error,
  } = await supabaseAdmin
    .from("bots")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error(
      "[Bots API] Failed to fetch bots:",
      error
    );

    return errorResponse(
      "Unable to load your bots. Please try again.",
      500
    );
  }

  return NextResponse.json({
    bots: data,
  });
}

// ============================================
// POST — CREATE A NEW BOT
// ============================================

export async function POST(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return errorResponse("Unauthorized", 401);
  }

  // Parse and validate the request.
  let body: {
    name?: unknown;
    welcome_message?: unknown;
    primary_color?: unknown;
  };

  try {
    body = await req.json();
  } catch {
    return errorResponse(
      "Invalid request body.",
      400
    );
  }

  const name =
    typeof body.name === "string"
      ? body.name.trim()
      : "";

  if (!name) {
    return errorResponse(
      "Bot name is required.",
      400
    );
  }

  if (
    body.welcome_message !== undefined &&
    typeof body.welcome_message !== "string"
  ) {
    return errorResponse(
      "Welcome message must be text.",
      400
    );
  }

  if (
    body.primary_color !== undefined &&
    typeof body.primary_color !== "string"
  ) {
    return errorResponse(
      "Primary color must be text.",
      400
    );
  }

  const welcome_message =
    typeof body.welcome_message === "string"
      ? body.welcome_message
      : "Hi! How can I help you today?";

  const primary_color =
    typeof body.primary_color === "string" &&
    body.primary_color.trim()
      ? body.primary_color.trim()
      : "#0ea5e9";

  // STEP 1: Ensure the user exists in Supabase.
  // This fixes bots_user_id_fkey when the user's
  // Clerk account has not yet been synchronized.

  const {
    user,
    error: userError,
  } = await ensureUserExists(userId);

  if (userError || !user) {
    return errorResponse(
      userError ??
        "Unable to initialize your account.",
      500
    );
  }

  // STEP 2: Determine the user's plan.

  const plan = getPlan(user.plan);
  const limit = PLAN_LIMITS[plan].bots;

  // STEP 3: Count the user's existing bots.

  const {
    count: botCount,
    error: countError,
  } = await supabaseAdmin
    .from("bots")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("user_id", userId);

  if (countError) {
    console.error(
      "[Bots API] Failed to count bots:",
      countError
    );

    return errorResponse(
      "Unable to create your bot right now.",
      500
    );
  }

  if ((botCount ?? 0) >= limit) {
    return NextResponse.json(
      {
        error:
          `You have reached the ${plan} plan limit ` +
          `of ${limit} bot${limit === 1 ? "" : "s"}. ` +
          "Please upgrade to create more.",
        limitReached: true,
      },
      { status: 403 }
    );
  }

  // STEP 4: Insert the new bot.

  const {
    data: bot,
    error: insertError,
  } = await supabaseAdmin
    .from("bots")
    .insert({
      user_id: userId,
      name,
      welcome_message,
      primary_color,
    })
    .select()
    .single();

  if (insertError) {
    // Keep technical details in the server console.
    console.error(
      "[Bots API] Bot insert error:",
      insertError
    );

    return errorResponse(
      "Your bot could not be created. Please try again.",
      500
    );
  }

  return NextResponse.json(
    { bot },
    { status: 201 }
  );
}

// ============================================
// DELETE — DELETE A BOT OWNED BY THE USER
// ============================================

export async function DELETE(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return errorResponse("Unauthorized", 401);
  }

  const { searchParams } = new URL(req.url);
  const botId = searchParams.get("botId");

  if (!botId) {
    return errorResponse(
      "botId is required.",
      400
    );
  }

  // Verify ownership before deleting.
  const {
    data: bot,
    error: lookupError,
  } = await supabaseAdmin
    .from("bots")
    .select("id")
    .eq("id", botId)
    .eq("user_id", userId)
    .maybeSingle();

  if (lookupError) {
    console.error(
      "[Bots API] Bot lookup failed during deletion:",
      lookupError
    );

    return errorResponse(
      "Unable to delete this bot right now.",
      500
    );
  }

  if (!bot) {
    return errorResponse(
      "Bot not found.",
      404
    );
  }

  const {
    error: deleteError,
  } = await supabaseAdmin
    .from("bots")
    .delete()
    .eq("id", botId)
    .eq("user_id", userId);

  if (deleteError) {
    console.error(
      "[Bots API] Bot deletion failed:",
      deleteError
    );

    return errorResponse(
      "Unable to delete this bot right now.",
      500
    );
  }

  return NextResponse.json({
    success: true,
  });
}

// ============================================
// PATCH — UPDATE A BOT
// ============================================

export async function PATCH(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return errorResponse("Unauthorized", 401);
  }

  const { searchParams } = new URL(req.url);
  const botId = searchParams.get("botId");

  if (!botId) {
    return errorResponse(
      "botId is required.",
      400
    );
  }

  let body: {
    name?: unknown;
    welcome_message?: unknown;
    primary_color?: unknown;
    is_active?: unknown;
  };

  try {
    body = await req.json();
  } catch {
    return errorResponse(
      "Invalid request body.",
      400
    );
  }

  // Only update fields explicitly provided.
  const updates: {
    name?: string;
    welcome_message?: string;
    primary_color?: string;
    is_active?: boolean;
  } = {};

  if (body.name !== undefined) {
    if (
      typeof body.name !== "string" ||
      !body.name.trim()
    ) {
      return errorResponse(
        "Bot name cannot be empty.",
        400
      );
    }

    updates.name = body.name.trim();
  }

  if (body.welcome_message !== undefined) {
    if (
      typeof body.welcome_message !== "string"
    ) {
      return errorResponse(
        "Welcome message must be text.",
        400
      );
    }

    updates.welcome_message =
      body.welcome_message;
  }

  if (body.primary_color !== undefined) {
    if (
      typeof body.primary_color !== "string"
    ) {
      return errorResponse(
        "Primary color must be text.",
        400
      );
    }

    updates.primary_color =
      body.primary_color;
  }

  if (body.is_active !== undefined) {
    if (typeof body.is_active !== "boolean") {
      return errorResponse(
        "is_active must be true or false.",
        400
      );
    }

    updates.is_active = body.is_active;
  }

  if (Object.keys(updates).length === 0) {
    return errorResponse(
      "Provide at least one field to update.",
      400
    );
  }

  // Verify ownership.
  const {
    data: bot,
    error: lookupError,
  } = await supabaseAdmin
    .from("bots")
    .select("id")
    .eq("id", botId)
    .eq("user_id", userId)
    .maybeSingle();

  if (lookupError) {
    console.error(
      "[Bots API] Bot lookup failed during update:",
      lookupError
    );

    return errorResponse(
      "Unable to update this bot right now.",
      500
    );
  }

  if (!bot) {
    return errorResponse(
      "Bot not found.",
      404
    );
  }

  // Update only the authenticated user's bot.
  const {
    data: updatedBot,
    error: updateError,
  } = await supabaseAdmin
    .from("bots")
    .update(updates)
    .eq("id", botId)
    .eq("user_id", userId)
    .select()
    .single();

  if (updateError) {
    console.error(
      "[Bots API] Bot update failed:",
      updateError
    );

    return errorResponse(
      "Unable to update this bot right now.",
      500
    );
  }

  return NextResponse.json({
    bot: updatedBot,
  });
}