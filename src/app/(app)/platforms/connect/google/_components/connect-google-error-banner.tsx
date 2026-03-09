"use client";

import { useRouter } from "next/navigation";
import { AlertCircleIcon, XIcon } from "lucide-react";
import { Button } from "@/components/button";

export function ConnectGoogleErrorBanner({ message }: { message: string }) {
  const router = useRouter();

  const dismiss = () => {
    router.replace("/platforms/connect/google");
  };

  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-3 text-sm text-destructive"
    >
      <AlertCircleIcon className="size-5 shrink-0 mt-0.5" />
      <p className="min-w-0 flex-1">{message}</p>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="shrink-0 text-destructive hover:bg-destructive/20 hover:text-destructive"
        onClick={dismiss}
        aria-label="Dismiss"
      >
        <XIcon className="size-4" />
      </Button>
    </div>
  );
}
