// Single import point for the validation library.
// If Zod is ever swapped for another library, only this file changes.
import { z } from "zod";

export { z };
export type { ZodSchema, ZodError } from "zod";

// ---------------------------------------------------------------------------
// Reusable field schemas
// ---------------------------------------------------------------------------

export const emailField = z
  .string({ error: "Email is required" })
  .min(1, "Email is required")
  .email("Enter a valid email address");

export const passwordField = z
  .string({ error: "Password is required" })
  .min(8, "Password must be at least 8 characters");

// ---------------------------------------------------------------------------
// Form schemas
// ---------------------------------------------------------------------------

export const loginSchema = z.object({
  email: emailField,
  // Login doesn't enforce min-length — just check the field is present
  password: z
    .string({ error: "Password is required" })
    .min(1, "Password is required"),
});

export const signupSchema = z
  .object({
    email: emailField,
    password: passwordField,
    confirm_password: z
      .string({ error: "Please confirm your password" })
      .min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

export const forgotPasswordSchema = z.object({
  email: emailField,
});

export const resetPasswordSchema = z
  .object({
    password: passwordField,
    confirm_password: z
      .string({ error: "Please confirm your password" })
      .min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

// ---------------------------------------------------------------------------
// Profile — company details + change password
// ---------------------------------------------------------------------------

export const profileDetailsSchema = z.object({
  fullName: z
    .string()
    .min(1, "Full name is required")
    .max(200, "Full name must be 200 characters or fewer"),
  email: emailField,
  contactNumber: z
    .string()
    .min(1, "Contact number is required")
    .max(30, "Contact number is too long"),
  website: z
    .string()
    .min(1, "Website is required")
    .url("Enter a valid URL")
    .refine(
      (v) => /^https?:\/\//i.test(v),
      "Must be an http:// or https:// URL"
    ),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordField,
    confirmPassword: z
      .string()
      .min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// ---------------------------------------------------------------------------
// Company settings
// ---------------------------------------------------------------------------

/** Optional URL — blank is allowed; if present must be http(s). */
const optionalUrl = z
  .string()
  .optional()
  .refine(
    (v) =>
      !v ||
      v.trim() === "" ||
      (/^https?:\/\//i.test(v.trim()) &&
        z.string().url().safeParse(v.trim()).success),
    "Enter a valid URL starting with http:// or https://"
  );

export const companySettingsSchema = z.object({
  companyName: z
    .string()
    .min(1, "Company name is required")
    .max(200, "Company name must be 200 characters or fewer"),
  contactNumber: z
    .string()
    .min(1, "Contact number is required")
    .max(30, "Contact number is too long"),
  whatsappNumber: z
    .string()
    .optional()
    .refine((v) => !v || v.length <= 30, "WhatsApp number is too long"),
  website: z
    .string()
    .min(1, "Website is required")
    .url("Enter a valid URL")
    .refine(
      (v) => /^https?:\/\//i.test(v),
      "Must be an http:// or https:// URL"
    ),
  shortDescription: z
    .string()
    .min(1, "Short description is required")
    .max(500, "Description must be 500 characters or fewer"),
  industry: z.string().min(1, "Please select an industry"),
  categories: z.array(z.string().min(1).max(50)).optional(),
  tags: z.array(z.string().min(1).max(50)).optional(),
  facebook: optionalUrl,
  instagram: optionalUrl,
  twitter: optionalUrl,
  tiktok: optionalUrl,
  youtube: optionalUrl,
  vimeo: optionalUrl,
  linkedin: optionalUrl,
  pinterest: optionalUrl,
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Converts a Zod fieldErrors map into a redirect URL with per-field
 * error query params in the form `?{fieldName}Error=<message>`.
 */
export function buildFieldErrorUrl(
  path: string,
  fieldErrors: Record<string, string[] | undefined>
): string {
  const params = new URLSearchParams();
  for (const [field, messages] of Object.entries(fieldErrors)) {
    if (messages?.[0]) params.set(`${field}Error`, messages[0]);
  }
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}
