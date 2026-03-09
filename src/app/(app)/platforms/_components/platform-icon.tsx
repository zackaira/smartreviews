import type { ReviewPlatformId } from "@/lib/review-platforms";
import { Star } from "lucide-react";

const PLATFORM_ICONS: Record<
  ReviewPlatformId,
  React.ComponentType<{ className?: string }>
> = {
  google: Star,
  // Add more when you add platforms, e.g.:
  // facebook: MessageCircle,
  // hellopeter: Star,
};

interface PlatformIconProps {
  iconId: ReviewPlatformId;
  className?: string;
}

export function PlatformIcon({ iconId, className }: PlatformIconProps) {
  const Icon = PLATFORM_ICONS[iconId] ?? Star;
  return <Icon className={className} aria-hidden />;
}
