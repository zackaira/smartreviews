/**
 * Email abstraction. Only this module imports from the provider (Resend).
 * Swap the provider here without touching callers.
 */

import { Resend } from "resend";

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  /** Optional from override; defaults to env RESEND_FROM or no-op if unset. */
  from?: string;
}

let client: Resend | null = null;

function getClient(): Resend | null {
  if (client !== null) return client;
  const key = process.env.RESEND_API_KEY;
  if (!key?.trim()) return null;
  client = new Resend(key);
  return client;
}

/**
 * Send a single email. No-ops if RESEND_API_KEY is not set (e.g. dev without provider).
 * Returns { ok: true, id } on success, { ok: false, error } on failure or when disabled.
 */
export async function sendEmail(
  options: SendEmailOptions
): Promise<{ ok: true; id?: string } | { ok: false; error: string }> {
  const resend = getClient();
  if (!resend) {
    return { ok: false, error: "Email not configured (RESEND_API_KEY missing)" };
  }

  const from =
    options.from ??
    process.env.RESEND_FROM ??
    "Smart Reviews <onboarding@resend.dev>";

  const { data, error } = await resend.emails.send({
    from,
    to: options.to,
    subject: options.subject,
    html: options.html,
  });

  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true, id: data?.id };
}

/**
 * Build HTML and send the "SmartReviews connection request" email to a profile owner.
 * acceptUrl should be the full URL to the accept page (e.g. with token).
 */
export function buildConnectionRequestHtml(acceptUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 560px; margin: 0 auto; padding: 24px;">
  <p>Someone has requested to connect their Google Business Profile to Smart Reviews.</p>
  <p>To allow this connection, click the button below and sign in with the Google account that manages the business profile. You can revoke access at any time from your Google Account.</p>
  <p style="margin: 28px 0;">
    <a href="${acceptUrl}" style="display: inline-block; background: #1a1a1a; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600;">Connect with Google</a>
  </p>
  <p style="font-size: 14px; color: #666;">If you didn't expect this email, you can ignore it.</p>
</body>
</html>
`.trim();
}

export async function sendConnectionRequestEmail(
  to: string,
  acceptUrl: string
): Promise<{ ok: true; id?: string } | { ok: false; error: string }> {
  return sendEmail({
    to,
    subject: "Connect your Google Business Profile to Smart Reviews",
    html: buildConnectionRequestHtml(acceptUrl),
  });
}
