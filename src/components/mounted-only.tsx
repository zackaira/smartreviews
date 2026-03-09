"use client";

import { useSyncExternalStore } from "react";

/**
 * Renders children only after the component has mounted on the client.
 * Use to avoid hydration mismatches when children use auto-generated IDs
 * (e.g. Radix UI, Base UI) that differ between server and client.
 *
 * Optional placeholder is shown during SSR and initial paint to preserve layout.
 */
export function MountedOnly({
  children,
  placeholder = null,
}: {
  children: React.ReactNode;
  placeholder?: React.ReactNode;
}) {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  if (!mounted) return <>{placeholder}</>;
  return <>{children}</>;
}
