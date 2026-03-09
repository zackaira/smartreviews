import type { Metadata } from "next";
import Link from "next/link";
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
  title: "Check your email",
};

export default function VerifyEmailPage() {
  return (
    <Card className="text-center">
      <CardHeader>
        <CardTitle className="text-2xl">Check your email</CardTitle>
        <CardDescription>
          We&apos;ve sent a confirmation link to your email address. Click the
          link to activate your account.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground space-y-2">
        <p>
          Didn&apos;t receive an email? Check your spam folder, or{" "}
          <Link
            href="/signup"
            className="text-foreground underline underline-offset-4"
          >
            try signing up again
          </Link>
          .
        </p>
        {process.env.NODE_ENV === "development" && (
          <p>
            <strong>Local dev:</strong> View test emails in{" "}
            <a
              href="http://127.0.0.1:54324"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground underline underline-offset-4"
            >
              Mailpit
            </a>{" "}
            (http://127.0.0.1:54324).
          </p>
        )}
      </CardContent>
      <CardFooter className="justify-center">
        <Button variant="outline" asChild>
          <Link href="/login">Back to sign in</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
