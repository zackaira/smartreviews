import { REVIEW_PLATFORMS } from "@/lib/review-platforms";
import { PlatformCard } from "./platform-card";

export function ConnectedPlatforms({
  connectedPlatformIds,
}: {
  connectedPlatformIds: string[];
}) {
  const connected = REVIEW_PLATFORMS.filter((p) =>
    connectedPlatformIds.includes(p.id)
  );

  if (connected.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          Connected Platforms
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Platforms you have connected to Smart Reviews.
        </p>
      </div>
      <ul className="flex flex-col gap-4">
        {connected.map((platform) => (
          <li key={platform.id}>
            <PlatformCard
              platform={platform}
              actionLabel="Disconnect"
              actionVariant="destructive"
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
