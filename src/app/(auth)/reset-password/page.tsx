import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { ResetPasswordForm } from "./_components/reset-password-form";

export const metadata: Metadata = {
  title: "Set new password",
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
    passwordError?: string;
    confirm_passwordError?: string;
  }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const cookieStore = await cookies();
  const isRecoveryFlow = cookieStore.has("sb-recovery-active");

  if (!user || !isRecoveryFlow) {
    redirect(
      "/forgot-password?error=Your+reset+link+has+expired.+Please+request+a+new+one."
    );
  }

  const { error, passwordError, confirm_passwordError } = await searchParams;
  return (
    <ResetPasswordForm
      error={error}
      fieldErrors={{
        password: passwordError,
        confirm_password: confirm_passwordError,
      }}
    />
  );
}
