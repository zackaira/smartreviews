import { REVIEW_PLATFORMS } from "@/lib/review-platforms";
import { PlatformCard } from "./platform-card";

export function ConnectPlatformsSection({
  connectedPlatformIds,
}: {
  connectedPlatformIds: string[];
}) {
  const available = REVIEW_PLATFORMS.filter(
    (p) => !connectedPlatformIds.includes(p.id),
  );

  if (available.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          Review Platforms
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Connect your review platforms to collect and manage reviews in one
          place.
        </p>
      </div>
      <ul className="flex flex-col gap-4">
        {available.map((platform) => (
          <li key={platform.id}>
            <PlatformCard
              platform={platform}
              connectHref={
                platform.id === "google"
                  ? "/platforms/connect/google"
                  : undefined
              }
            />
          </li>
        ))}
      </ul>
      <p className="text-center text-lg text-muted-foreground/60 pt-10">
        More review platforms coming soon.
      </p>
    </section>
  );
}
