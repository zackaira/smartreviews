"use client";

import { useState } from "react";
import {
  Building2Icon,
  PhoneIcon,
  GlobeIcon,
  MessageCircleIcon,
} from "lucide-react";
import { Input } from "@/components/input";
import { PhoneInput } from "@/components/phone-input";
import { Textarea } from "@/components/textarea";
import { SelectField } from "@/components/select";
import { TagInput } from "@/components/tag-input";
import { ImageUpload } from "@/components/image-upload";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/card";
import { formatPhone } from "@/lib/format-phone";
import type { CompanySettingsValues } from "@/app/(app)/settings/profile-settings-state";

const INDUSTRY_OPTIONS = [
  { value: "retail", label: "Retail" },
  { value: "hospitality", label: "Hospitality" },
  { value: "healthcare", label: "Healthcare" },
  { value: "technology", label: "Technology" },
  { value: "professional_services", label: "Professional Services" },
  { value: "construction", label: "Construction" },
  { value: "education", label: "Education" },
  { value: "finance", label: "Finance" },
  { value: "other", label: "Other" },
];

interface CompanyInfoCardProps {
  errors: Record<string, string>;
  defaultValues: CompanySettingsValues;
  /** Saved logo URL from server — shown as initial preview in ImageUpload and preview card. */
  currentLogoUrl?: string | null;
}

function prettyUrl(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

export function CompanyInfoCard({
  errors,
  defaultValues,
  currentLogoUrl = null,
}: CompanyInfoCardProps) {
  const [preview, setPreview] = useState({
    name: defaultValues?.companyName ?? "",
    description: defaultValues?.shortDescription ?? "",
    industry: defaultValues?.industry ?? "",
    contact: defaultValues?.contactNumber ?? "",
    whatsapp: defaultValues?.whatsappNumber ?? "",
    website: defaultValues?.website ?? "",
    logoUrl: currentLogoUrl ?? null,
  });

  const industryLabel = INDUSTRY_OPTIONS.find(
    (o) => o.value === preview.industry,
  )?.label;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Company Settings</CardTitle>
        <CardDescription>
          Your company profile and contact details.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* ── Left: form fields ─────────────────────────────────────── */}
          <div className="flex flex-col gap-6">
            <ImageUpload
              id="logo"
              name="logo"
              label="Company logo"
              defaultSrc={currentLogoUrl ?? undefined}
              error={errors.logo}
              onPreviewChange={(url) =>
                setPreview((prev) => ({ ...prev, logoUrl: url }))
              }
            />
            <Input
              id="company-name"
              name="companyName"
              label="Company name"
              placeholder="Your company name"
              type="text"
              defaultValue={defaultValues?.companyName}
              error={errors.companyName}
              aria-required
              onChange={(e) =>
                setPreview((prev) => ({ ...prev, name: e.target.value }))
              }
            />
            <PhoneInput
              id="contact-number"
              name="contactNumber"
              label="Contact number"
              placeholder="082 453 2805"
              defaultValue={defaultValues?.contactNumber}
              error={errors.contactNumber}
              aria-required
              onChange={(e) =>
                setPreview((prev) => ({ ...prev, contact: e.target.value }))
              }
            />
            <PhoneInput
              id="whatsapp-number"
              name="whatsappNumber"
              label="WhatsApp number"
              placeholder="082 453 2805"
              defaultValue={defaultValues?.whatsappNumber}
              error={errors.whatsappNumber}
              onChange={(e) =>
                setPreview((prev) => ({ ...prev, whatsapp: e.target.value }))
              }
            />
            <Input
              id="website"
              name="website"
              label="Website"
              placeholder="https://example.com"
              type="url"
              autoComplete="url"
              defaultValue={defaultValues?.website}
              error={errors.website}
              aria-required
              onChange={(e) =>
                setPreview((prev) => ({ ...prev, website: e.target.value }))
              }
            />
            <Textarea
              id="short-description"
              name="shortDescription"
              label="Short description"
              placeholder="Tell customers about your business…"
              rows={5}
              defaultValue={defaultValues?.shortDescription}
              error={errors.shortDescription}
              aria-required
              onChange={(e) =>
                setPreview((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
            />
            <SelectField
              id="industry"
              name="industry"
              label="Industry"
              placeholder="Select your industry…"
              options={INDUSTRY_OPTIONS}
              defaultValue={defaultValues?.industry}
              error={errors.industry}
              onValueChange={(v) =>
                setPreview((prev) => ({ ...prev, industry: v }))
              }
            />
            <TagInput
              id="categories"
              name="categories"
              label="Categories"
              placeholder="Add a category and press Enter…"
              defaultValue={defaultValues?.categories ?? []}
              max={20}
              error={errors.categories}
            />
            <TagInput
              id="tags"
              name="tags"
              label="Tags"
              placeholder="Add a tag and press Enter…"
              defaultValue={defaultValues?.tags ?? []}
              max={30}
              error={errors.tags}
            />
          </div>

          {/* ── Right: live preview ────────────────────────────────────── */}
          <div className="self-start lg:sticky lg:top-6">
            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
              {/* Preview header bar */}
              <div className="border-b border-border bg-muted/40 px-4 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Listing preview
                </p>
              </div>

              <div className="p-5">
                {/* Logo + name row */}
                <div className="mb-4 flex items-center gap-4">
                  <div className="shrink-0">
                    {preview.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element -- blob/object URLs are not compatible with next/image
                      <img
                        src={preview.logoUrl}
                        alt="Company logo"
                        className="size-16 rounded-full border border-border object-cover"
                      />
                    ) : (
                      <div className="flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
                        <Building2Icon className="size-7" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    {preview.name ? (
                      <p className="truncate text-lg font-semibold leading-tight">
                        {preview.name}
                      </p>
                    ) : (
                      <p className="text-lg font-semibold text-muted-foreground/50">
                        Company name
                      </p>
                    )}
                    {industryLabel && (
                      <span className="mt-1 inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                        {industryLabel}
                      </span>
                    )}
                  </div>
                </div>

                {/* Description */}
                {preview.description ? (
                  <p className="mb-4 line-clamp-4 text-sm text-muted-foreground">
                    {preview.description}
                  </p>
                ) : (
                  <p className="mb-4 text-sm italic text-muted-foreground/40">
                    Short description will appear here…
                  </p>
                )}

                {/* Contact details */}
                {(preview.contact || preview.whatsapp || preview.website) && (
                  <div className="space-y-2 border-t border-border pt-4">
                    {preview.contact && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <PhoneIcon className="size-3.5 shrink-0" />
                        <span>{formatPhone(preview.contact)}</span>
                      </div>
                    )}
                    {preview.whatsapp && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MessageCircleIcon className="size-3.5 shrink-0" />
                        <span>{formatPhone(preview.whatsapp)}</span>
                      </div>
                    )}
                    {preview.website && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <GlobeIcon className="size-3.5 shrink-0" />
                        <span className="truncate">
                          {prettyUrl(preview.website)}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
