"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

/**
 * Shows a toast when redirected back with ?connected=google or ?error=...
 */
export function PlatformsPageToast() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const connected = searchParams.get("connected");
    const error = searchParams.get("error");
    if (connected === "google") {
      toast.success("Google Business Profile connected successfully.");
    }
    if (error) {
      toast.error(decodeURIComponent(error));
    }
  }, [searchParams]);

  return null;
}
