/**
 * Review platform configuration.
 * Add a new platform by adding an entry to REVIEW_PLATFORMS and, if needed,
 * registering its icon in the connect-platforms PlatformIcon component.
 */

export type ReviewPlatformId = "google";

export interface ReviewPlatformConfig {
  id: ReviewPlatformId;
  name: string;
  description: string;
  /** Used to pick the icon in the UI; add new ids when adding platforms. */
  iconId: ReviewPlatformId;
}

export const REVIEW_PLATFORMS: ReviewPlatformConfig[] = [
  {
    id: "google",
    name: "Google",
    description:
      "Connect your Google Business Profile to collect and manage Google reviews in one place.",
    iconId: "google",
  },
];
