import type { Metadata } from "next";
import { SignupForm } from "./_components/signup-form";

export const metadata: Metadata = {
  title: "Create an account",
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
    emailError?: string;
    passwordError?: string;
    confirm_passwordError?: string;
  }>;
}) {
  const { error, emailError, passwordError, confirm_passwordError } =
    await searchParams;
  return (
    <SignupForm
      error={error}
      fieldErrors={{
        email: emailError,
        password: passwordError,
        confirm_password: confirm_passwordError,
      }}
    />
  );
}
