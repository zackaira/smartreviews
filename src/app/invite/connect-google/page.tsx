import type { Metadata } from "next";
import Link from "next/link";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { Button } from "@/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/card";

export const metadata: Metadata = {
  title: "Smart Reviews - Connect Google Business Profile",
  description: "Accept an invitation to connect your Google Business Profile",
};

export default async function InviteConnectGooglePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token?.trim()) {
    return (
      <div className="mx-auto max-w-md space-y-4 p-6">
        <Card>
          <CardHeader>
            <CardTitle>Invalid link</CardTitle>
            <CardDescription>
              This connection link is missing or invalid. Please use the link
              from the email we sent you.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="outline" asChild>
              <Link href="/login">Go to Smart Reviews</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const admin = createServiceRoleClient();
  if (!admin) {
    return (
      <div className="mx-auto max-w-md space-y-4 p-6">
        <Card>
          <CardHeader>
            <CardTitle>Something went wrong</CardTitle>
            <CardDescription>
              We could not verify this link. Please try again later.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="outline" asChild>
              <Link href="/login">Go to Smart Reviews</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const { data: reqRow } = await admin
    .from("google_connection_requests")
    .select("company_id, place_id, status, expires_at")
    .eq("token", token)
    .maybeSingle();

  const row = reqRow as
    | { company_id: string; place_id: string; status: string; expires_at: string }
    | null;

  if (
    !row ||
    row.status !== "pending" ||
    new Date(row.expires_at) < new Date()
  ) {
    return (
      <div className="mx-auto max-w-md space-y-4 p-6">
        <Card>
          <CardHeader>
            <CardTitle>Link expired or invalid</CardTitle>
            <CardDescription>
              This connection link has expired or has already been used. Ask the
              person who requested the connection to send a new invitation.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="outline" asChild>
              <Link href="/login">Go to Smart Reviews</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const { data: companyRow } = await admin
    .from("companies")
    .select("name")
    .eq("id", row.company_id)
    .maybeSingle();

  const companyName = (companyRow as { name?: string } | null)?.name ?? "a company";

  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
  const oauthUrl = new URL("/platforms/connect/google/oauth", baseUrl);
  oauthUrl.searchParams.set("company_id", row.company_id);
  oauthUrl.searchParams.set("place_id", row.place_id);
  oauthUrl.searchParams.set("token", token);

  return (
    <div className="mx-auto max-w-md space-y-4 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Connect your Google Business Profile</CardTitle>
          <CardDescription>
            You&apos;re connecting your Google Business Profile to Smart
            Reviews for <strong>{companyName}</strong>. Click the button below
            and sign in with the Google account that manages the business
            profile. You can revoke access at any time from your Google Account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <Link href={oauthUrl.toString()}>Connect with Google</Link>
          </Button>
        </CardContent>
        <CardFooter className="text-sm text-muted-foreground">
          If you didn&apos;t expect this email, you can safely ignore it.
        </CardFooter>
      </Card>
    </div>
  );
}
