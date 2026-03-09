import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, getCurrentProfile } from "@/lib/supabase/user";
import type { Database } from "@/lib/supabase/types";
import { signOut } from "@/lib/auth/actions";
import { AppHeader } from "@/app/(app)/_components/header";
import { AppSidebar } from "@/app/(app)/_components/app-sidebar";
import {
  SiteTransitionOverlay,
  SiteTransitionProvider,
} from "@/app/(app)/_components/site-transition-provider";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/sidebar";

/**
 * Layout for all authenticated-only routes (under the (app) group).
 * Redirects to /login if there is no session. Add new protected pages
 * under (app)/ and add their path prefix to PROTECTED_ROUTES in middleware.
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const userName =
    (user.user_metadata?.full_name as string | undefined) ??
    user.email ??
    "User";

  const supabase = await createClient();
  const [companiesResult, profile] = await Promise.all([
    supabase
      .from("companies")
      .select("id, name")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: true }),
    getCurrentProfile(user.id),
  ]);

  type CompanyListItem = Pick<Database["public"]["Tables"]["companies"]["Row"], "id" | "name">;
  const sites = ((companiesResult.data ?? []) as CompanyListItem[]).map((c) => ({ id: c.id, name: c.name }));

  const preferredId = profile?.current_company_id ?? null;
  const currentSiteId =
    preferredId && sites.some((s) => s.id === preferredId)
      ? preferredId
      : sites[0]?.id ?? null;

  return (
    <SidebarProvider>
      <SiteTransitionProvider>
        <div
          className="layout-header-above flex min-h-svh w-full flex-col"
          data-layout="header-above"
        >
          <AppHeader
            userName={userName}
            signOut={signOut}
            leading={<SidebarTrigger className="md:hidden" />}
          />
          <div className="flex min-h-0 flex-1 overflow-hidden">
            <AppSidebar sites={sites} currentSiteId={currentSiteId} />
            {/* relative so SiteTransitionOverlay can fill this column only */}
            <SidebarInset className="relative min-h-0">
              <SiteTransitionOverlay />
              <main className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6">
                {children}
              </main>
            </SidebarInset>
          </div>
        </div>
      </SiteTransitionProvider>
    </SidebarProvider>
  );
}
