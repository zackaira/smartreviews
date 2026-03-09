"use client";

import { Button } from "@/components/button";

interface ConnectButtonProps {
  platformId: string;
  children?: React.ReactNode;
  variant?: "default" | "destructive";
}

/**
 * Client-only Connect/Disconnect button for a review platform.
 * Connection logic (OAuth, etc.) will be wired here when implemented.
 */
export function ConnectButton({
  platformId,
  children,
  variant = "default",
}: ConnectButtonProps) {
  return (
    <Button variant={variant} type="button" data-platform={platformId}>
      {children ?? "Connect"}
    </Button>
  );
}
