import { resetPassword } from "@/lib/auth/actions";
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

interface ResetPasswordFormProps {
  error?: string;
  fieldErrors?: { password?: string; confirm_password?: string };
}

export function ResetPasswordForm({ error, fieldErrors }: ResetPasswordFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Set new password</CardTitle>
        <CardDescription>Enter and confirm your new password</CardDescription>
      </CardHeader>
      <form action={resetPassword}>
        <CardContent className="flex flex-col gap-4">
          <Input
            id="password"
            name="password"
            label="New password"
            placeholder="Min. 8 characters"
            validate="new-password"
            error={fieldErrors?.password}
          />
          <Input
            id="confirm_password"
            name="confirm_password"
            label="Confirm new password"
            placeholder="Repeat your new password"
            validate="new-password"
            error={fieldErrors?.confirm_password}
          />
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
        </CardContent>
        <CardFooter>
          <SubmitButton className="w-full" pendingText="Updating password…">
            Update password
          </SubmitButton>
        </CardFooter>
      </form>
    </Card>
  );
}
