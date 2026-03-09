"use server";

import { randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import { z } from "@/lib/validation";
import { flattenZodErrors, getFormValues } from "@/lib/form";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";
import { parseSingleInputToIdentifier, resolveToPlaceId } from "./_lib";
import { sendConnectionRequestEmail } from "@/lib/email";
import type { ConnectGoogleFormState } from "./state";

const MAX_PENDING_REQUESTS_PER_COMPANY = 5;
const REQUEST_EXPIRY_HOURS = 72;

function getSiteUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL;
  if (!url) throw new Error("NEXT_PUBLIC_SITE_URL is not set.");
  return url.replace(/\/$/, "");
}

const connectGoogleSchema = z.object({
  query: z
    .string()
    .trim()
    .min(1, "Enter your Google Business Profile name, location, Place ID or Google Maps URL"),
  owner_email: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || z.string().email().safeParse(v).success, {
      message: "Enter a valid email address",
    }),
});

export async function submitConnectGoogle(
  _prevState: ConnectGoogleFormState,
  formData: FormData
): Promise<ConnectGoogleFormState> {
  const keys = ["query", "owner_email"] as const;
  const values = getFormValues(formData, keys);
  const result = connectGoogleSchema.safeParse(values);

  if (!result.success) {
    return {
      success: false,
      errors: flattenZodErrors(result.error.flatten().fieldErrors),
      values,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      errors: { query: "You must be signed in to connect a profile." },
      values: result.data,
    };
  }

  const profile = await supabase
    .from("profiles")
    .select("current_company_id")
    .eq("user_id", user.id)
    .maybeSingle();

  const companyId = (profile.data as { current_company_id: string | null } | null)
    ?.current_company_id;

  if (!companyId) {
    return {
      success: false,
      errors: {
        query:
          "Please select a company first (use the site switcher or add a company).",
      },
      values: result.data,
    };
  }

  const identifier = parseSingleInputToIdentifier(result.data.query);
  if (!identifier) {
    return {
      success: false,
      errors: { query: "Could not determine the business to connect." },
      values: result.data,
    };
  }

  const resolved = await resolveToPlaceId(
    identifier,
    process.env.GOOGLE_PLACES_API_KEY
  );

  if (!resolved) {
    return {
      success: false,
      errors: {
        query:
          "Could not find this place. Try entering the Place ID or Google Maps URL directly, or check the name and location.",
      },
      values: result.data,
    };
  }

  const placeId = resolved.placeId;
  const ownerEmail = result.data.owner_email?.trim() || null;

  if (ownerEmail) {
    const { data: pending } = await supabase
      .from("google_connection_requests")
      .select("id")
      .eq("company_id", companyId)
      .eq("status", "pending");

    if ((pending?.length ?? 0) >= MAX_PENDING_REQUESTS_PER_COMPANY) {
      return {
        success: false,
        errors: {
          owner_email:
            "You have too many pending requests. Wait for one to be accepted or expire.",
        },
        values: result.data,
      };
    }

    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + REQUEST_EXPIRY_HOURS);

    type Insert = Database["public"]["Tables"]["google_connection_requests"]["Insert"];
    const insertPayload: Insert = {
      company_id: companyId,
      place_id: placeId,
      invitee_email: ownerEmail,
      token,
      expires_at: expiresAt.toISOString(),
      status: "pending",
    };

    const { error: insertError } = await supabase
      .from("google_connection_requests")
      // @ts-expect-error - Supabase client infer
      .insert(insertPayload);

    if (insertError) {
      return {
        success: false,
        errors: {
          owner_email: "Failed to create the connection request. Please try again.",
        },
        values: result.data,
      };
    }

    const acceptUrl = `${getSiteUrl()}/invite/connect-google?token=${encodeURIComponent(token)}`;
    const emailResult = await sendConnectionRequestEmail(ownerEmail, acceptUrl);

    if (!emailResult.ok) {
      return {
        success: false,
        errors: {
          owner_email:
            "We created the request but could not send the email. You can try again or ask the owner to go to Connect Platforms and connect with Google directly.",
        },
        values: result.data,
      };
    }

    return {
      success: true,
      errors: {},
      values: result.data,
      message:
        "We've sent an email to the profile owner with a link to connect their Google Business Profile. They'll need to sign in with Google to complete the connection.",
    };
  }

  const siteUrl = getSiteUrl();
  const oauthUrl = new URL("/platforms/connect/google/oauth", siteUrl);
  oauthUrl.searchParams.set("company_id", companyId);
  oauthUrl.searchParams.set("place_id", placeId);
  redirect(oauthUrl.toString());
}
