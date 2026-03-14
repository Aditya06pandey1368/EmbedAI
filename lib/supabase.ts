// lib/supabase.ts

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Regular client — uses anon key, respects Row Level Security
// Use this on the frontend or in normal API calls
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client — uses service role key, BYPASSES Row Level Security
// Use this ONLY in server-side code like webhooks or admin operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);