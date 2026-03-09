import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { getCurrentUser } from "@/lib/supabase/user";
import { ConnectGoogleForm } from "./_components/connect-google-form";
import { ConnectGoogleErrorBanner } from "@/app/(app)/platforms/connect/google/_components/connect-google-error-banner";

export const metadata: Metadata = {
  title: "Smart Reviews - Connect Google Business Profile",
  description: "Connect your Google Business Profile to Smart Reviews",
};

type PageProps = {
  searchParams: Promise<{ error?: string }> | { error?: string };
};

function safeDecodeError(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export default async function ConnectGooglePage({ searchParams }: PageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const params =
    typeof (searchParams as Promise<unknown>)?.then === "function"
      ? await (searchParams as Promise<{ error?: string }>)
      : (searchParams as { error?: string }) ?? {};
  const errorParam = params?.error;

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <Link
          href="/platforms"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeftIcon className="size-3.5" />
          Back to Connect Platforms
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Connect Google Business Profile
        </h1>
        <p className="mt-2 text-muted-foreground">
          Enter your Google Business Profile name to find and connect it.
        </p>
      </div>

      {errorParam && (
        <ConnectGoogleErrorBanner message={safeDecodeError(errorParam)} />
      )}

      <ConnectGoogleForm />
    </div>
  );
}
