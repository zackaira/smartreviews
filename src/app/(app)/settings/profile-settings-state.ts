import { type FormState, initialFormState } from "@/lib/form";

export const COMPANY_SETTINGS_STRING_KEYS = [
  "companyName",
  "contactNumber",
  "whatsappNumber",
  "website",
  "shortDescription",
  "industry",
  "facebook",
  "instagram",
  "twitter",
  "tiktok",
  "youtube",
  "vimeo",
  "linkedin",
  "pinterest",
] as const;

export type CompanySettingsValues = {
  [K in (typeof COMPANY_SETTINGS_STRING_KEYS)[number]]?: string;
} & {
  categories?: string[];
  tags?: string[];
};

export type CompanySettingsFormState = FormState<CompanySettingsValues>;

export const initialCompanySettingsState =
  initialFormState<CompanySettingsValues>();
