import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { NewCompanyForm } from "./_components/new-company-form";

export const metadata: Metadata = {
  title: "Smart Reviews - Add Company",
  description: "Add a new company to your account",
};

export default async function NewSitePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <Link
          href="/dashboard"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeftIcon className="size-3.5" />
          Back to dashboard
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Add a new company
        </h1>
        <p className="mt-2 text-muted-foreground">
          Each company gets its own profile, settings, and review listings.
        </p>
      </div>

      <NewCompanyForm />
    </div>
  );
}
