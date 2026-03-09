"use client";

import { Building2Icon } from "lucide-react";
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
import { createCompany } from "@/app/(app)/dashboard/sites/actions";
import { initialCreateCompanyState } from "@/app/(app)/dashboard/sites/state";

export function NewCompanyForm() {
  const { formAction, formKey, errors } = useFormAction(
    createCompany,
    initialCreateCompanyState,
  );

  return (
    <Card>
      <CardHeader>
        <div className="mb-2 flex size-10 items-center justify-center rounded-full bg-muted">
          <Building2Icon className="size-5 text-muted-foreground" />
        </div>
        <CardTitle>Company details</CardTitle>
        <CardDescription>
          Give your company a name to get started. You can fill in the full
          profile from the company settings page afterwards.
        </CardDescription>
      </CardHeader>
      <form action={formAction} noValidate key={formKey}>
        <CardContent>
          <Input
            id="name"
            name="name"
            label="Company name"
            placeholder="Acme Corp"
            type="text"
            autoComplete="organization"
            error={errors.name}
            aria-required
          />
        </CardContent>
        <CardFooter className="border-t border-border pt-6">
          <SubmitButton pendingText="Creating…" className="w-full sm:w-auto">
            Create company
          </SubmitButton>
        </CardFooter>
      </form>
    </Card>
  );
}
