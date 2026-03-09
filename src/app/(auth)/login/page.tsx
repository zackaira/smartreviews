import type { Metadata } from "next";
import { LoginForm } from "./_components/login-form";

export const metadata: Metadata = {
  title: "Sign in",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
    emailError?: string;
    passwordError?: string;
    next?: string;
  }>;
}) {
  const { error, emailError, passwordError, next } = await searchParams;
  return (
    <LoginForm
      error={error}
      fieldErrors={{ email: emailError, password: passwordError }}
      next={next}
    />
  );
}
