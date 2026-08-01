import { createClient } from "@supabase/supabase-js";

// ── Server-side ADMIN Supabase client ──
// Uses service_role key for full CRUD access (bypasses RLS).
// This file MUST NEVER be imported in client components.
//
// Usage: import { supabaseAdmin } from "@/lib/supabase-admin";
//        Only in Server Components, API Routes, or server actions.

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn(
    "[supabase-admin] SUPABASE_SERVICE_ROLE_KEY is not set. " +
    "Admin operations will fail. Add it to .env.local."
  );
}

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
