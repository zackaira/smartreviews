"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
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
import { useFormAction } from "@/lib/use-form-action";
import { changePassword } from "@/app/(app)/profile/actions";
import { initialChangePasswordState } from "@/app/(app)/profile/profile-state";

export function ChangePasswordCard() {
  const { formAction, formKey, errors, message, state } = useFormAction(
    changePassword,
    initialChangePasswordState,
  );
  const lastToastedKeyRef = useRef(-1);

  useEffect(() => {
    if (formKey === lastToastedKeyRef.current || formKey === 0) return;
    lastToastedKeyRef.current = formKey;

    if (message) {
      toast.success(message);
      return;
    }
    if (state?.success === false && errors && Object.keys(errors).length > 0) {
      toast.error(Object.values(errors)[0]);
    }
  }, [formKey, message, state?.success, errors]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change Password</CardTitle>
        <CardDescription>
          Choose a strong password you don&apos;t use elsewhere.
        </CardDescription>
      </CardHeader>
      <form action={formAction} noValidate key={formKey}>
        <CardContent className="flex flex-col gap-6 pb-6">
          <Input
            id="current-password"
            name="currentPassword"
            label="Current password"
            validate="password"
            autoComplete="current-password"
            error={errors.currentPassword}
          />
          <Input
            id="new-password"
            name="newPassword"
            label="New password"
            validate="new-password"
            autoComplete="new-password"
            error={errors.newPassword}
          />
          <Input
            id="confirm-password"
            name="confirmPassword"
            label="Confirm new password"
            type="password"
            autoComplete="new-password"
            required
            defaultValue=""
            error={errors.confirmPassword}
          />
        </CardContent>
        <CardFooter className="border-t border-border flex justify-end pt-6">
          <SubmitButton pendingText="Updating…">Change password</SubmitButton>
        </CardFooter>
      </form>
    </Card>
  );
}
