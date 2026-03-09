import { Input } from "@/components/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/card";
import type { CompanySettingsValues } from "@/app/(app)/settings/profile-settings-state";

const SOCIAL_LINKS = [
  { key: "facebook" as const, label: "Facebook", placeholder: "https://facebook.com/yourpage" },
  { key: "instagram" as const, label: "Instagram", placeholder: "https://instagram.com/yourhandle" },
  { key: "twitter" as const, label: "X / Twitter", placeholder: "https://x.com/yourhandle" },
  { key: "tiktok" as const, label: "TikTok", placeholder: "https://tiktok.com/@yourhandle" },
  { key: "youtube" as const, label: "YouTube", placeholder: "https://youtube.com/@yourchannel" },
  { key: "vimeo" as const, label: "Vimeo", placeholder: "https://vimeo.com/yourchannel" },
  { key: "linkedin" as const, label: "LinkedIn", placeholder: "https://linkedin.com/company/yourcompany" },
  { key: "pinterest" as const, label: "Pinterest", placeholder: "https://pinterest.com/yourprofile" },
] as const;

interface SocialLinksCardProps {
  errors: Record<string, string>;
  defaultValues: CompanySettingsValues;
}

export function SocialLinksCard({ errors, defaultValues }: SocialLinksCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Social Links</CardTitle>
        <CardDescription>
          Connect your social media profiles to your listing.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {SOCIAL_LINKS.map(({ key, label, placeholder }) => (
            <Input
              key={key}
              id={key}
              name={key}
              label={label}
              placeholder={placeholder}
              type="url"
              autoComplete="url"
              defaultValue={defaultValues?.[key]}
              error={errors[key]}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
