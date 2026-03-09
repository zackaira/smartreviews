import type { Metadata } from "next";
import { Suspense } from "react";
import { getCurrentUser, getCurrentProfile } from "@/lib/supabase/user";
import { createClient } from "@/lib/supabase/server";
import { ConnectedPlatforms } from "./_components/connected-platforms";
import { ConnectPlatformsSection } from "./_components/connect-platforms-section";
import { PlatformsPageToast } from "@/app/(app)/platforms/_components/platforms-page-toast";

export const metadata: Metadata = {
  title: "Smart Reviews - Connect Platforms",
  description: "Connect your review platforms",
};

export default async function ConnectPlatformsPage() {
  const user = await getCurrentUser();
  let connectedPlatformIds: string[] = [];

  if (user) {
    const profile = await getCurrentProfile(user.id);
    const companyId = profile?.current_company_id ?? null;
    if (companyId) {
      const supabase = await createClient();
      const { data: connections } = await supabase
        .from("company_platform_connections")
        .select("platform")
        .eq("company_id", companyId)
        .eq("status", "connected");
      connectedPlatformIds = (connections ?? [])
        .map((c) => (c as { platform: string }).platform)
        .filter(Boolean);
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <Suspense fallback={null}>
        <PlatformsPageToast />
      </Suspense>
      <ConnectedPlatforms connectedPlatformIds={connectedPlatformIds} />
      <ConnectPlatformsSection connectedPlatformIds={connectedPlatformIds} />
    </div>
  );
}
