"use client";

import { useRef } from "react";
import Link from "next/link";
import { PlusIcon } from "lucide-react";
import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxSeparator,
} from "@/components/combobox";
import { cn } from "@/lib/utils";
import { setSitePreference } from "@/app/(app)/actions";
import { useSiteTransition } from "@/app/(app)/_components/site-transition-provider";

export type SiteOption = { id: string; name: string };

type SiteSwitcherProps = {
  sites: SiteOption[];
  currentSiteId?: string | null;
};

export function SiteSwitcher({ sites, currentSiteId }: SiteSwitcherProps) {
  const { isSwitching, startSwitching } = useSiteTransition();
  const inputAnchorRef = useRef<HTMLDivElement>(null);
  const selectedSite =
    sites.find((s) => s.id === (currentSiteId ?? sites[0]?.id)) ?? sites[0];
  const value = selectedSite ?? null;

  return (
    <div className="min-w-40 w-full">
      <Combobox<SiteOption>
        value={value}
        onValueChange={(site) => {
          if (!site || isSwitching) return;
          const path = window.location.pathname;
          const url = path.startsWith("/settings")
            ? "/settings"
            : path.startsWith("/dashboard")
              ? "/dashboard"
              : path;

          // Show the full content-area overlay immediately, then run the
          // server action and a 4-second minimum delay in parallel.
          // Navigation only happens once both are done so the loader is
          // always visible long enough to feel intentional.
          // window.location.assign does a full page load, bypassing the
          // Next.js Router Cache — every server component re-fetches with
          // the updated cookie so all company details update correctly.
          startSwitching();
          void Promise.all([
            setSitePreference(site.id),
            new Promise<void>((resolve) => setTimeout(resolve, 800)),
          ]).then(() => {
            window.location.assign(url);
          });
        }}
        items={sites}
        itemToStringLabel={(site) => site.name}
        isItemEqualToValue={(a, b) => a?.id === b?.id}
      >
        <div ref={inputAnchorRef} className="min-w-40 w-full">
          <ComboboxInput
            placeholder="Select site"
            className={cn(!value && "text-muted-foreground")}
            showClear={false}
            loading={isSwitching}
            disabled={isSwitching}
          />
        </div>
        <ComboboxContent
          anchor={inputAnchorRef}
          className="w-(--anchor-width) min-w-(--anchor-width)"
        >
          <ComboboxList>
            {(item: SiteOption) => (
              <ComboboxItem key={item.id} value={item}>
                {item.name}
              </ComboboxItem>
            )}
          </ComboboxList>
          <ComboboxSeparator />
          <div className="p-1">
            <Link
              href="/dashboard/sites/new"
              className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
            >
              <PlusIcon className="size-4" />
              Add New
            </Link>
          </div>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}
