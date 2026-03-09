import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, getCurrentProfile } from "@/lib/supabase/user";
import type { Database } from "@/lib/supabase/types";
import { ProfileSettingsForm } from "@/app/(app)/settings/_components/profile-settings-form";
import { CompanySettingsEmpty } from "@/app/(app)/settings/_components/company-settings-empty";

type CompanyFormRow = Pick<
  Database["public"]["Tables"]["companies"]["Row"],
  | "name"
  | "short_description"
  | "industry"
  | "contact_number"
  | "whatsapp_number"
  | "website"
  | "logo_url"
  | "categories"
  | "tags"
  | "facebook"
  | "instagram"
  | "twitter"
  | "tiktok"
  | "youtube"
  | "vimeo"
  | "linkedin"
  | "pinterest"
>;
type CompanyImageItem = Pick<
  Database["public"]["Tables"]["company_images"]["Row"],
  "id" | "url" | "sort_order"
>;

export const metadata: Metadata = {
  title: "Smart Reviews - Company Settings",
  description: "Company settings",
};

/** Accepts only plausible UUIDs; rejects anything obviously malformed. */
function safeUuid(value: string | undefined): string | null {
  if (!value) return null;
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      value,
    )
  )
    return null;
  return value;
}

export default async function CompanySettingsPage() {
  // getCurrentUser is React-cached — shares the single getUser() network call
  // already made by the layout, so no extra round-trip to Supabase Auth.
  const user = await getCurrentUser();

  // Layout redirects unauthenticated requests, but guard here too for type safety
  if (!user) {
    redirect("/login");
  }

  const supabase = await createClient();
  const profile = await getCurrentProfile(user.id);
  const preferredId = safeUuid(profile?.current_company_id ?? undefined);

  // Use the profile's current company if it's set and valid; otherwise fall back
  // to the user's first company so the page still renders correctly.
  let candidateId: string | null = preferredId;
  if (!candidateId) {
    const { data: firstCompany } = await supabase
      .from("companies")
      .select("id")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    candidateId = firstCompany ? (firstCompany as { id: string }).id : null;
  }

  if (candidateId) {
    // Fetch company and its images in parallel. The explicit owner_id filter
    // is defense-in-depth alongside RLS — a tampered cookie value can never
    // surface another user's data even if RLS were ever misconfigured.
    const [{ data: company }, { data: images }] = await Promise.all([
      supabase
        .from("companies")
        .select(
          "name, short_description, industry, contact_number, whatsapp_number, website, logo_url, categories, tags, facebook, instagram, twitter, tiktok, youtube, vimeo, linkedin, pinterest",
        )
        .eq("id", candidateId)
        .eq("owner_id", user.id)
        .maybeSingle(),
      supabase
        .from("company_images")
        .select("id, url, sort_order")
        .eq("company_id", candidateId)
        .order("sort_order", { ascending: true }),
    ]);

    const companyRow = company as CompanyFormRow | null;

    if (companyRow) {
      const defaultValues = {
        companyName: companyRow.name,
        shortDescription: companyRow.short_description ?? "",
        industry: companyRow.industry ?? "",
        contactNumber: companyRow.contact_number ?? "",
        whatsappNumber: companyRow.whatsapp_number ?? "",
        website: companyRow.website ?? "",
        facebook: companyRow.facebook ?? "",
        instagram: companyRow.instagram ?? "",
        twitter: companyRow.twitter ?? "",
        tiktok: companyRow.tiktok ?? "",
        youtube: companyRow.youtube ?? "",
        vimeo: companyRow.vimeo ?? "",
        linkedin: companyRow.linkedin ?? "",
        pinterest: companyRow.pinterest ?? "",
        categories: companyRow.categories ?? [],
        tags: companyRow.tags ?? [],
      };

      const imagesList = (images ?? []) as CompanyImageItem[];
      const defaultImages = imagesList.map((img) => ({
        id: img.id,
        url: img.url,
      }));

      return (
        <div className="mx-auto max-w-7xl space-y-8">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Company Settings
            </h1>
            <p className="mt-2 text-muted-foreground">
              Manage your company profile and preferences.
            </p>
          </div>
          <ProfileSettingsForm
            companyId={candidateId}
            currentLogoUrl={companyRow.logo_url ?? null}
            defaultValues={defaultValues}
            defaultImages={defaultImages}
          />
        </div>
      );
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Company Settings
        </h1>
        <p className="mt-2 text-muted-foreground">
          Manage your company profile and preferences.
        </p>
      </div>
      <CompanySettingsEmpty />
    </div>
  );
}
