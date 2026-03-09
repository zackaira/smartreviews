import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

/**
 * Returns the authenticated Supabase user for the current request.
 *
 * Wrapped in React's `cache()` so that multiple Server Components in the
 * same render tree (e.g. layout + page) share a single network call to the
 * Supabase Auth server rather than each making their own.
 */
export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

/**
 * Returns the profile row for the given user id (current user's profile).
 * Cached per request so layout and other callers share one fetch.
 */
export const getCurrentProfile = cache(async (userId: string): Promise<ProfileRow | null> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select()
    .eq("user_id", userId)
    .maybeSingle();
  return data as ProfileRow | null;
});
