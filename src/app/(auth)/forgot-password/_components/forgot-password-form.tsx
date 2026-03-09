import Link from "next/link";
import { forgotPassword } from "@/lib/auth/actions";
import { Input } from "@/components/input";
import { SubmitButton } from "@/components/submit-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/card";

interface ForgotPasswordFormProps {
  error?: string;
  fieldErrors?: { email?: string };
}

export function ForgotPasswordForm({ error, fieldErrors }: ForgotPasswordFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Forgot password</CardTitle>
        <CardDescription>
          Enter your email and we&apos;ll send you a reset link
        </CardDescription>
      </CardHeader>
      <form action={forgotPassword}>
        <CardContent className="flex flex-col gap-4">
          <Input
            id="email"
            name="email"
            label="Email"
            placeholder="you@example.com"
            validate="email"
            error={fieldErrors?.email}
          />
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <SubmitButton className="w-full" pendingText="Sending reset link…">
            Send reset link
          </SubmitButton>
          <p className="text-sm text-muted-foreground text-center">
            Remember your password?{" "}
            <Link
              href="/login"
              className="text-foreground underline underline-offset-4"
            >
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
