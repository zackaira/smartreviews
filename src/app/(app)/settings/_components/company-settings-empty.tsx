"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Building2Icon } from "lucide-react";
import { Button } from "@/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/card";
import { createFirstCompany } from "@/app/(app)/settings/actions";

export function CompanySettingsEmpty() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleCreate() {
    setPending(true);
    const result = await createFirstCompany();
    setPending(false);
    if (result.error) {
      return;
    }
    if (result.companyId) {
      router.push("/settings");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>No company yet</CardTitle>
        <CardDescription>
          Create your first company to manage its profile, contact details, and
          listing.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center gap-4 py-8">
          <div className="flex size-14 items-center justify-center rounded-full bg-muted">
            <Building2Icon className="size-7 text-muted-foreground" />
          </div>
          <Button onClick={handleCreate} disabled={pending}>
            {pending ? "Creating…" : "Create your first company"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
