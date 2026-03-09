"use client";

import { useEffect, useRef, useState } from "react";
import { Lock, LockOpen } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/input";
import { PhoneInput } from "@/components/phone-input";
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
import { updateProfileDetails } from "@/app/(app)/profile/actions";
import {
  type ProfileDetailsFormState,
  type ProfileDetailsValues,
  initialProfileDetailsState,
} from "@/app/(app)/profile/profile-state";

interface ProfileDetailsCardProps {
  defaultEmail?: string;
  /** When set, user has requested an email change; verification is pending. Display this email and show a badge. */
  pendingNewEmail?: string;
  defaultValues?: Partial<ProfileDetailsValues>;
}

export function ProfileDetailsCard({
  defaultEmail,
  pendingNewEmail,
  defaultValues: defaultValuesProp,
}: ProfileDetailsCardProps) {
  const initialState: ProfileDetailsFormState = {
    ...initialProfileDetailsState,
    values: {
      email: defaultValuesProp?.email ?? defaultEmail,
      fullName: defaultValuesProp?.fullName,
      contactNumber: defaultValuesProp?.contactNumber,
      website: defaultValuesProp?.website,
    },
  };
  const { formAction, formKey, errors, values, message, state } = useFormAction(
    updateProfileDetails,
    initialState,
  );
  const lastToastedKeyRef = useRef(-1);
  const [emailLocked, setEmailLocked] = useState(true);

  useEffect(() => {
    if (formKey === lastToastedKeyRef.current || formKey === 0) return;
    lastToastedKeyRef.current = formKey;

    if (message) {
      toast.success(message);
      setEmailLocked(true);
      return;
    }
    if (state?.success === false && errors && Object.keys(errors).length > 0) {
      toast.error(Object.values(errors)[0]);
    }
  }, [formKey, message, state?.success, errors]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Details</CardTitle>
        <CardDescription>Your personal account information.</CardDescription>
      </CardHeader>
      <form action={formAction} noValidate key={formKey}>
        <CardContent className="flex flex-col gap-6 pb-6">
          {emailLocked && (
            <input
              type="hidden"
              name="email"
              value={
                values?.email ?? defaultValuesProp?.email ?? defaultEmail ?? ""
              }
              readOnly
              aria-hidden
            />
          )}
          <Input
            id="full-name"
            name="fullName"
            label="Full name"
            placeholder="Jane Smith"
            type="text"
            autoComplete="name"
            defaultValue={values?.fullName}
            error={errors.fullName}
            aria-required
          />
          <Input
            id="email"
            name="email"
            label="Email address"
            placeholder="you@example.com"
            validate="email"
            defaultValue={values?.email ?? defaultEmail}
            error={errors.email}
            disabled={emailLocked}
            addonRight={
              <span className="flex items-center gap-1.5">
                {pendingNewEmail && (
                  <span
                    className="text-primary text-xs whitespace-nowrap"
                    title="Verify within 20 seconds"
                  >
                    Verification pending
                  </span>
                )}
                {!pendingNewEmail && (
                  <button
                    type="button"
                    onClick={() => setEmailLocked((v) => !v)}
                    aria-label={emailLocked ? "Unlock email" : "Lock email"}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {emailLocked ? (
                      <Lock className="size-4" />
                    ) : (
                      <LockOpen className="size-4" />
                    )}
                  </button>
                )}
              </span>
            }
          />
          <PhoneInput
            id="contact-number"
            name="contactNumber"
            label="Contact number"
            placeholder="082 453 2805"
            defaultValue={values?.contactNumber}
            error={errors.contactNumber}
            aria-required
          />
          <Input
            id="website"
            name="website"
            label="Website URL"
            placeholder="https://example.com"
            type="url"
            autoComplete="url"
            defaultValue={values?.website}
            error={errors.website}
            aria-required
          />
        </CardContent>
        <CardFooter className="border-t border-border flex justify-end pt-6">
          <SubmitButton pendingText="Saving…">Save</SubmitButton>
        </CardFooter>
      </form>
    </Card>
  );
}
