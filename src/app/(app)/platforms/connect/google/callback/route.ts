import { type NextRequest, NextResponse } from "next/server";
import {
  createClient,
  createServiceRoleClient,
} from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const ACCOUNT_MGMT_BASE = "https://mybusinessaccountmanagement.googleapis.com/v1";
const BUSINESS_INFO_BASE = "https://mybusinessbusinessinformation.googleapis.com/v1";

function getSiteUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL;
  if (!url) throw new Error("NEXT_PUBLIC_SITE_URL is not set.");
  return url.replace(/\/$/, "");
}

interface OAuthState {
  c: string;
  p: string;
  r?: string;
}

async function exchangeCodeForTokens(
  code: string,
  redirectUri: string
): Promise<{ access_token: string } | null> {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  if (!clientId?.trim() || !clientSecret?.trim()) return null;

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    }),
  });

  if (!res.ok) return null;
  const data = (await res.json()) as { access_token?: string };
  return data.access_token ? { access_token: data.access_token } : null;
}

async function listAccountIds(accessToken: string): Promise<string[]> {
  const res = await fetch(`${ACCOUNT_MGMT_BASE}/accounts`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return [];
  const data = (await res.json()) as { accounts?: Array<{ name: string }> };
  if (!data.accounts?.length) return [];
  return data.accounts
    .map((a) => {
      const m = a.name?.match(/^accounts\/(.+)$/);
      return m ? m[1] : null;
    })
    .filter((id): id is string => !!id);
}

async function listLocationsForAccount(
  accessToken: string,
  accountId: string
): Promise<Array<{ name: string; metadata?: { placeId?: string } }>> {
  const res = await fetch(
    `${BUSINESS_INFO_BASE}/accounts/${accountId}/locations?readMask=name,metadata`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!res.ok) return [];
  const data = (await res.json()) as {
    locations?: Array<{ name?: string; metadata?: { placeId?: string } }>;
  };
  return (data.locations ?? []).map((loc) => ({
    name: loc.name ?? "",
    metadata: loc.metadata,
  }));
}

/** Find a location whose Place ID or location name matches the given placeId. */
function findMatchingLocation(
  locations: Array<{ name: string; metadata?: { placeId?: string } }>,
  placeId: string
): { name: string } | null {
  for (const loc of locations) {
    if (loc.metadata?.placeId === placeId) return { name: loc.name };
    const locId = loc.name.replace(/^.*\/locations\//, "");
    if (locId === placeId) return { name: loc.name };
  }
  return null;
}

/**
 * GET /platforms/connect/google/callback?code=...&state=...
 * Exchanges code for tokens, lists GBP locations, matches by place_id, creates connection.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const stateEnc = searchParams.get("state");
  const errorParam = searchParams.get("error");

  const baseUrl = getSiteUrl();
  const redirectSuccess = () =>
    NextResponse.redirect(new URL("/platforms?connected=google", baseUrl));
  const redirectError = (message: string) =>
    NextResponse.redirect(
      new URL("/platforms?error=" + encodeURIComponent(message), baseUrl)
    );

  if (errorParam) {
    return redirectError(
      errorParam === "access_denied"
        ? "Google sign-in was cancelled or denied."
        : "Google sign-in failed. Please try again."
    );
  }

  if (!code?.trim() || !stateEnc?.trim()) {
    return redirectError("Missing code or state from Google.");
  }

  let state: OAuthState;
  try {
    state = JSON.parse(
      Buffer.from(stateEnc, "base64url").toString("utf-8")
    ) as OAuthState;
  } catch {
    return redirectError("Invalid state.");
  }

  const companyId = state.c?.trim();
  const placeId = state.p?.trim();
  const requestToken = state.r?.trim();

  if (!companyId || !placeId) {
    return redirectError("Invalid state (missing company or place).");
  }

  const redirectUri = `${baseUrl}/platforms/connect/google/callback`;
  const tokens = await exchangeCodeForTokens(code, redirectUri);
  if (!tokens) {
    return redirectError("Could not complete Google sign-in. Please try again.");
  }

  const accountIds = await listAccountIds(tokens.access_token);
  let matched: { name: string } | null = null;

  for (const accountId of accountIds) {
    const locations = await listLocationsForAccount(
      tokens.access_token,
      accountId
    );
    matched = findMatchingLocation(locations, placeId);
    if (matched) break;
  }

  if (!matched) {
    return redirectError(
      "We could not find this business in your Google Business Profile. Make sure you have access to the profile for this place."
    );
  }

  const supabase = await createClient();

  if (requestToken) {
    const admin = createServiceRoleClient();
    if (!admin) {
      return redirectError("Server configuration error. Please try again later.");
    }

    const { data: reqRow } = await admin
      .from("google_connection_requests")
      .select("id, company_id, status, expires_at")
      .eq("token", requestToken)
      .maybeSingle();

    const row = reqRow as
      | { id: string; company_id: string; status: string; expires_at: string }
      | null;
    if (
      !row ||
      row.status !== "pending" ||
      new Date(row.expires_at) < new Date() ||
      row.company_id !== companyId
    ) {
      return redirectError("This connection link is invalid or has expired.");
    }

    type ConnInsert =
      Database["public"]["Tables"]["company_platform_connections"]["Insert"];
    const insertPayload: ConnInsert = {
      company_id: companyId,
      platform: "google",
      place_id: placeId,
      external_id: matched.name,
      status: "connected",
    };

    await admin
      .from("company_platform_connections")
      // @ts-expect-error - Supabase client infer
      .insert(insertPayload);

    await admin
      .from("google_connection_requests")
      // @ts-expect-error - Supabase client infer
      .update({ status: "accepted", updated_at: new Date().toISOString() })
      .eq("token", requestToken);
  } else {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return redirectError("You must be signed in to connect your profile.");
    }

    const { data: company } = await supabase
      .from("companies")
      .select("id")
      .eq("id", companyId)
      .eq("owner_id", user.id)
      .maybeSingle();

    if (!company) {
      return redirectError("You do not have permission to link to this company.");
    }

    type ConnInsert =
      Database["public"]["Tables"]["company_platform_connections"]["Insert"];
    const insertPayload: ConnInsert = {
      company_id: companyId,
      platform: "google",
      place_id: placeId,
      external_id: matched.name,
      status: "connected",
    };

    await supabase
      .from("company_platform_connections")
      // @ts-expect-error - Supabase client infer
      .insert(insertPayload);
  }

  return redirectSuccess();
}
