import Link from "next/link";
import { PlusIcon } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/sidebar";
import { Button } from "@/components/button";
import { MountedOnly } from "@/components/mounted-only";
import { SiteSwitcher } from "@/app/(app)/_components/header/site-switcher";
import { SidebarNavItems } from "@/app/(app)/_components/sidebar-nav-items";
import type { SiteOption } from "@/app/(app)/_components/header/site-switcher";

type AppSidebarProps = {
  sites: SiteOption[];
  currentSiteId?: string | null;
};

export function AppSidebar({ sites, currentSiteId }: AppSidebarProps) {
  return (
    <Sidebar className="md:pt-16 md:px-2">
      <SidebarRail />
      <SidebarHeader>
        <div className="w-full [&_button]:w-full">
          {sites.length === 0 ? (
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-center gap-2 font-normal"
              asChild
            >
              <Link href="/settings">
                <PlusIcon className="size-4" />
                Add New Website
              </Link>
            </Button>
          ) : (
            // MountedOnly prevents SSR of SiteSwitcher. Base UI generates its own
            // auto-incrementing IDs that differ between the server render and client
            // hydration passes, causing a hydration mismatch. Rendering only after
            // mount avoids the mismatch entirely.
            <MountedOnly
              placeholder={
                <div
                  className="min-h-9 min-w-40 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                  aria-hidden
                />
              }
            >
              <SiteSwitcher sites={sites} currentSiteId={currentSiteId} />
            </MountedOnly>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="mt-5">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarNavItems />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
