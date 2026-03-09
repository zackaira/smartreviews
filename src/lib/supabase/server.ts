import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { cache } from "react";
import type { Database } from "./types";

/**
 * Cached per request so layout and page (and multiple components) share the
 * same Supabase client and avoid duplicate auth calls within a single request.
 */
export const createClient = cache(async () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "Missing Supabase env vars. Copy .env.example to .env.local and set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
        "Local: run `npm run supabase:start` then `npm run supabase:status` for keys. " +
        "Remote: https://supabase.com/dashboard/project/_/settings/api"
    );
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(
    url,
    anonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component — proxy handles session refresh
          }
        },
      },
    }
  );
});

/**
 * Service-role client for server-only flows that must bypass RLS (e.g. accepting
 * a connection request when the actor has no Supabase session).
 * Use only in route handlers or server actions; never expose to client or NEXT_PUBLIC_.
 */
export function createServiceRoleClient(): ReturnType<typeof createSupabaseClient<Database>> | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url?.trim() || !key?.trim()) return null;
  return createSupabaseClient<Database>(url, key, {
    auth: { persistSession: false },
  });
}
