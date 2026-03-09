import Link from "next/link";
import { signIn } from "@/lib/auth/actions";
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

const URL_ERRORS: Record<string, string> = {
  "invalid-confirmation-link":
    "That confirmation link is invalid or has expired. Please sign in or sign up again.",
};

interface LoginFormProps {
  error?: string;
  fieldErrors?: { email?: string; password?: string };
  /** Safe relative path to redirect after login (e.g. from ?next=). */
  next?: string;
}

export function LoginForm({ error, fieldErrors, next }: LoginFormProps) {
  const displayError = error ? (URL_ERRORS[error] ?? error) : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Sign in</CardTitle>
        <CardDescription>
          Enter your email and password to sign in
        </CardDescription>
      </CardHeader>
      <form action={signIn}>
        {next && /^\/(?!\/)/.test(next) && (
          <input type="hidden" name="next" value={next} />
        )}
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
            validate="password"
            error={fieldErrors?.password}
            labelAction={
              <Link
                href="/forgot-password"
                className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
              >
                Forgot password?
              </Link>
            }
          />
          {displayError && (
            <p role="alert" className="text-sm text-destructive">
              {displayError}
            </p>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <SubmitButton className="w-full" pendingText="Signing in…">
            Sign in
          </SubmitButton>
          <p className="text-sm text-muted-foreground text-center">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="text-foreground underline underline-offset-4"
            >
              Sign up
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
