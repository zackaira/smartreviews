import type { Metadata } from "next";
import Link from "next/link";
import { ForgotPasswordForm } from "./_components/forgot-password-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/card";
import { Button } from "@/components/button";

export const metadata: Metadata = {
  title: "Forgot password",
};

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
    sent?: string;
    emailError?: string;
  }>;
}) {
  const { error, sent, emailError } = await searchParams;

  if (sent) {
    return (
      <Card className="text-center">
        <CardHeader>
          <CardTitle className="text-2xl">Check your email</CardTitle>
          <CardDescription>
            If an account exists for that email, you&apos;ll receive a password
            reset link shortly.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>
            Didn&apos;t receive an email? Check your spam folder, or{" "}
            <Link
              href="/forgot-password"
              className="text-foreground underline underline-offset-4"
            >
              try again
            </Link>
            .
          </p>
        </CardContent>
        <CardFooter className="justify-center">
          <Button variant="outline" asChild>
            <Link href="/login">Back to sign in</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <ForgotPasswordForm
      error={error}
      fieldErrors={{ email: emailError }}
    />
  );
}
