import { type NextRequest, NextResponse } from "next/server";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const SCOPE = "https://www.googleapis.com/auth/business.manage";

function getSiteUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL;
  if (!url) throw new Error("NEXT_PUBLIC_SITE_URL is not set.");
  return url.replace(/\/$/, "");
}

/**
 * GET /platforms/connect/google/oauth?company_id=...&place_id=...[&token=...]
 * Builds Google OAuth URL with state (company_id, place_id, optional request token) and redirects.
 */
export function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("company_id");
  const placeId = searchParams.get("place_id");
  const requestToken = searchParams.get("token") ?? undefined;

  const baseUrl = getSiteUrl();
  const redirectToConnectWithError = (message: string) =>
    NextResponse.redirect(
      new URL(
        "/platforms/connect/google?error=" + encodeURIComponent(message),
        baseUrl
      )
    );

  if (!companyId?.trim() || !placeId?.trim()) {
    return redirectToConnectWithError("Missing company or place.");
  }

  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  if (!clientId?.trim()) {
    return redirectToConnectWithError(
      "Google sign-in is not configured. Add GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET to your environment and set up the OAuth consent screen in Google Cloud Console."
    );
  }

  const redirectUri = `${baseUrl}/platforms/connect/google/callback`;
  const statePayload = {
    c: companyId.trim(),
    p: placeId.trim(),
    ...(requestToken && { r: requestToken }),
  };
  const state = Buffer.from(JSON.stringify(statePayload), "utf-8").toString(
    "base64url"
  );

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: SCOPE,
    state,
    access_type: "offline",
    prompt: "consent",
  });

  const authUrl = `${GOOGLE_AUTH_URL}?${params.toString()}`;
  return NextResponse.redirect(authUrl);
}
