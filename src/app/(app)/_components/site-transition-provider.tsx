"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { Loader2Icon } from "lucide-react";

type SiteTransitionContextType = {
  isSwitching: boolean;
  startSwitching: () => void;
};

const SiteTransitionContext = createContext<SiteTransitionContextType>({
  isSwitching: false,
  startSwitching: () => {},
});

export function SiteTransitionProvider({ children }: { children: ReactNode }) {
  const [isSwitching, setIsSwitching] = useState(false);

  return (
    <SiteTransitionContext.Provider
      value={{ isSwitching, startSwitching: () => setIsSwitching(true) }}
    >
      {children}
    </SiteTransitionContext.Provider>
  );
}

export function useSiteTransition() {
  return useContext(SiteTransitionContext);
}

/**
 * Full content-area overlay shown while a site switch is in progress.
 * Sits inside SidebarInset (position:relative) so it covers the main
 * column only — the sidebar stays visible and interactive.
 */
export function SiteTransitionOverlay() {
  const { isSwitching } = useSiteTransition();
  if (!isSwitching) return null;

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center bg-background/90 backdrop-blur-sm pt-16 gap-4">
      <Loader2Icon className="size-10 animate-spin text-foreground/40" />
      <div className="flex flex-col items-center gap-1 text-center">
        <p className="text-sm font-semibold text-foreground">
          Switching company
        </p>
        <p className="text-xs text-muted-foreground">Loading your workspace…</p>
      </div>
    </div>
  );
}
