"use server";

import { createClient } from "@/lib/supabase/server";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Sets the user's current company in the database (profiles.current_company_id).
 * The next request will read this from the DB and show the selected company.
 * Silently rejects if the value is not a valid UUID or the user doesn't own the company.
 */
export async function setSitePreference(siteId: string): Promise<void> {
  if (!UUID_REGEX.test(siteId)) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { data: owned } = await supabase
    .from("companies")
    .select("id")
    .eq("id", siteId)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!owned) return;

  // @ts-expect-error - Supabase client infers table ops as never; payload is profiles Insert
  await supabase.from("profiles").upsert(
    { user_id: user.id, current_company_id: siteId },
    { onConflict: "user_id" },
  );
}
