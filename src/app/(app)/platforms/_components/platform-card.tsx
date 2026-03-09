import Link from "next/link";
import type { ReviewPlatformConfig } from "@/lib/review-platforms";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/card";
import { Button } from "@/components/button";
import { ConnectButton } from "./connect-button";
import { PlatformIcon } from "./platform-icon";

interface PlatformCardProps {
  platform: ReviewPlatformConfig;
  /** Button label; defaults to "Connect" for available platforms. */
  actionLabel?: React.ReactNode;
  /** Button variant; use "destructive" for Disconnect. */
  actionVariant?: "default" | "destructive";
  /** When set, render a Link to this href instead of ConnectButton (for Connect flow). */
  connectHref?: string;
}

export function PlatformCard({
  platform,
  actionLabel = "Connect",
  actionVariant = "default",
  connectHref,
}: PlatformCardProps) {
  const action = connectHref ? (
    <Button variant={actionVariant} asChild>
      <Link href={connectHref}>{actionLabel}</Link>
    </Button>
  ) : (
    <ConnectButton platformId={platform.id} variant={actionVariant}>
      {actionLabel}
    </ConnectButton>
  );

  return (
    <Card>
      <CardHeader className="flex-row items-center gap-4">
        <div className="col-start-1 row-span-2 flex min-w-0 flex-1 items-center gap-4">
          <div
            className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground"
            aria-hidden
          >
            <PlatformIcon iconId={platform.iconId} className="size-6" />
          </div>

          <div className="min-w-0 flex-1">
            <CardTitle>{platform.name}</CardTitle>
            <CardDescription>{platform.description}</CardDescription>
          </div>

          {action}
        </div>
      </CardHeader>
    </Card>
  );
}
