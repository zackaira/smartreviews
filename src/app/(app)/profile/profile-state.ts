import { type FormState, initialFormState } from "@/lib/form";

// ---------------------------------------------------------------------------
// Company details
// ---------------------------------------------------------------------------

export const PROFILE_DETAILS_KEYS = [
  "fullName",
  "email",
  "contactNumber",
  "website",
] as const;

export type ProfileDetailsValues = {
  [K in (typeof PROFILE_DETAILS_KEYS)[number]]?: string;
};

export type ProfileDetailsFormState = FormState<ProfileDetailsValues>;

export const initialProfileDetailsState =
  initialFormState<ProfileDetailsValues>();

// ---------------------------------------------------------------------------
// Change password
// ---------------------------------------------------------------------------

export const CHANGE_PASSWORD_KEYS = [
  "currentPassword",
  "newPassword",
  "confirmPassword",
] as const;

export type ChangePasswordValues = {
  [K in (typeof CHANGE_PASSWORD_KEYS)[number]]?: string;
};

export type ChangePasswordFormState = FormState<ChangePasswordValues>;

export const initialChangePasswordState =
  initialFormState<ChangePasswordValues>();
