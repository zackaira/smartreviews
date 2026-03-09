import Link from "next/link";
import { signUp } from "@/lib/auth/actions";
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

interface SignupFormProps {
  error?: string;
  fieldErrors?: { email?: string; password?: string; confirm_password?: string };
}

export function SignupForm({ error, fieldErrors }: SignupFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Create an account</CardTitle>
        <CardDescription>
          Enter your email below to create your account
        </CardDescription>
      </CardHeader>
      <form action={signUp}>
        <CardContent className="flex flex-col gap-4">
          <Input
            id="email"
            name="email"
            label="Email"
            placeholder="you@example.com"
            validate="email"
            error={fieldErrors?.email}
          />
          <Input
            id="password"
            name="password"
            label="Password"
            placeholder="Min. 8 characters"
            validate="new-password"
            error={fieldErrors?.password}
          />
          <Input
            id="confirm_password"
            name="confirm_password"
            label="Confirm password"
            placeholder="Repeat your password"
            validate="new-password"
            error={fieldErrors?.confirm_password}
          />
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <SubmitButton className="w-full" pendingText="Creating account…">
            Create account
          </SubmitButton>
          <p className="text-sm text-muted-foreground text-center">
            Already have an account?{" "}
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
