"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { safeRelativePath } from "@/lib/auth/safe-redirect";
import { createClient } from "@/lib/supabase/server";
import {
  loginSchema,
  signupSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  buildFieldErrorUrl,
} from "@/lib/validation";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getSiteUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL;
  if (!url) throw new Error("NEXT_PUBLIC_SITE_URL is not set.");
  return url.replace(/\/$/, "");
}

function isNetworkError(e: unknown): boolean {
  if (e instanceof TypeError && e.message === "fetch failed") return true;
  if (e instanceof Error && /fetch|network|ECONNREFUSED|ENOTFOUND/i.test(e.message)) return true;
  return false;
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export async function signIn(formData: FormData) {
  const result = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!result.success) {
    redirect(buildFieldErrorUrl("/login", result.error.flatten().fieldErrors));
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword(result.data);

    if (error) {
      redirect(`/login?error=${encodeURIComponent(error.message)}`);
    }

    const nextRaw = formData.get("next");
    const nextPath =
      typeof nextRaw === "string" ? nextRaw : null;
    redirect(safeRelativePath(nextPath));
  } catch (e) {
    if (isNetworkError(e)) {
      redirect(
        "/login?error=" +
          encodeURIComponent(
            "Could not reach Supabase. If using local Supabase, run: npm run supabase:start — then npm run supabase:status for API keys."
          )
      );
    }
    throw e;
  }
}

export async function signUp(formData: FormData) {
  const result = signupSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    confirm_password: formData.get("confirm_password"),
  });

  if (!result.success) {
    redirect(buildFieldErrorUrl("/signup", result.error.flatten().fieldErrors));
  }

  try {
    const supabase = await createClient();
    const { confirm_password: _, ...credentials } = result.data;
    const { error } = await supabase.auth.signUp({
      ...credentials,
      options: {
        emailRedirectTo: `${getSiteUrl()}/auth/confirm`,
      },
    });

    if (error) {
      redirect(`/signup?error=${encodeURIComponent(error.message)}`);
    }

    redirect("/verify-email");
  } catch (e) {
    if (isNetworkError(e)) {
      redirect(
        "/signup?error=" +
          encodeURIComponent(
            "Could not reach Supabase. If using local Supabase, run: npm run supabase:start — then npm run supabase:status for API keys."
          )
      );
    }
    throw e;
  }
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function forgotPassword(formData: FormData) {
  const result = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!result.success) {
    redirect(
      buildFieldErrorUrl("/forgot-password", result.error.flatten().fieldErrors)
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(result.data.email, {
    redirectTo: `${getSiteUrl()}/auth/confirm?next=/reset-password`,
  });

  if (error) {
    redirect(`/forgot-password?error=${encodeURIComponent(error.message)}`);
  }

  // Always show the same confirmation — don't reveal whether the email exists
  redirect("/forgot-password?sent=true");
}

export async function resetPassword(formData: FormData) {
  const result = resetPasswordSchema.safeParse({
    password: formData.get("password"),
    confirm_password: formData.get("confirm_password"),
  });

  if (!result.success) {
    redirect(
      buildFieldErrorUrl("/reset-password", result.error.flatten().fieldErrors)
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: result.data.password,
  });

  // Clear the recovery cookie whether or not the update succeeded
  const cookieStore = await cookies();
  cookieStore.delete("sb-recovery-active");

  if (error) {
    redirect(`/reset-password?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/");
}
