import { redirect } from "next/navigation";

/**
 * Redirect old email links to the public invite page so they work without auth.
 */
export default async function AcceptGoogleConnectPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
  if (token?.trim()) {
    redirect(`${baseUrl}/invite/connect-google?token=${encodeURIComponent(token)}`);
  }
  redirect(`${baseUrl}/invite/connect-google`);
}
