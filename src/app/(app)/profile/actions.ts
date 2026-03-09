"use server";

import { revalidatePath } from "next/cache";
import { profileDetailsSchema, changePasswordSchema } from "@/lib/validation";
import { normalizePhone } from "@/lib/format-phone";
import { flattenZodErrors, getFormValues } from "@/lib/form";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";
import {
  type ProfileDetailsFormState,
  type ChangePasswordFormState,
  PROFILE_DETAILS_KEYS,
  CHANGE_PASSWORD_KEYS,
  initialProfileDetailsState,
  initialChangePasswordState,
} from "./profile-state";

function getSiteUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL;
  if (!url) throw new Error("NEXT_PUBLIC_SITE_URL is not set.");
  return url.replace(/\/$/, "");
}

export async function updateProfileDetails(
  _prevState: ProfileDetailsFormState,
  formData: FormData
): Promise<ProfileDetailsFormState> {
  const values = getFormValues(formData, PROFILE_DETAILS_KEYS);
  const result = profileDetailsSchema.safeParse(values);

  if (!result.success) {
    return {
      success: false,
      errors: flattenZodErrors(result.error.flatten().fieldErrors),
      values,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      errors: { email: "You must be signed in to update your profile." },
      values: result.data,
    };
  }

  const contactRaw = result.data.contactNumber?.trim();
  const profileInsert: Database["public"]["Tables"]["profiles"]["Insert"] = {
    user_id: user.id,
    full_name: result.data.fullName ?? null,
    contact_number: contactRaw ? normalizePhone(contactRaw) : null,
    website: result.data.website ?? null,
  };

  const profilesTable = supabase.from("profiles");
  // @ts-expect-error - Supabase client infers table ops as never; payload is profiles Insert
  const { error } = await profilesTable.upsert(profileInsert, { onConflict: "user_id" });

  if (error) {
    return {
      success: false,
      errors: { email: "Failed to save profile. Please try again." },
      values: result.data,
    };
  }

  // Email change: Supabase sends a verification email to the *new* address;
  // the account email is only updated after the user clicks that link.
  const newEmail = result.data.email?.trim();
  const isAlreadyPending = newEmail && newEmail === user.new_email?.trim();
  if (newEmail && newEmail !== user.email && !isAlreadyPending) {
    const { error: emailError } = await supabase.auth.updateUser(
      { email: newEmail },
      {
        emailRedirectTo: `${getSiteUrl()}/auth/confirm?next=/profile`,
      }
    );
    if (emailError) {
      return {
        success: false,
        errors: { email: emailError.message },
        values: result.data,
      };
    }
    revalidatePath("/profile");
    return {
      ...initialProfileDetailsState,
      values: result.data,
      message: `A verification email has been sent to ${newEmail}. Open it and click the link to verify — your address will update only after you confirm.`,
    };
  }

  revalidatePath("/profile");
  return {
    ...initialProfileDetailsState,
    values: result.data,
    message: "Details saved successfully.",
  };
}

export async function changePassword(
  _prevState: ChangePasswordFormState,
  formData: FormData
): Promise<ChangePasswordFormState> {
  const values = getFormValues(formData, CHANGE_PASSWORD_KEYS);
  const result = changePasswordSchema.safeParse(values);

  if (!result.success) {
    return {
      success: false,
      errors: flattenZodErrors(result.error.flatten().fieldErrors),
      // Never echo passwords back — the user must re-enter them
      values: {},
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return {
      success: false,
      errors: { currentPassword: "Unable to verify your identity. Please sign in again." },
      values: {},
    };
  }

  // Re-authenticate with the current password to verify it is correct
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: values.currentPassword!,
  });

  if (signInError) {
    return {
      success: false,
      errors: { currentPassword: "Current password is incorrect." },
      values: {},
    };
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: values.newPassword!,
  });

  if (updateError) {
    return {
      success: false,
      errors: { newPassword: updateError.message },
      values: {},
    };
  }

  return { ...initialChangePasswordState, message: "Password changed successfully." };
}
