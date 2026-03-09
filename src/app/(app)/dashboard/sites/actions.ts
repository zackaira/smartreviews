"use server";

import { redirect } from "next/navigation";
import { z } from "@/lib/validation";
import { flattenZodErrors, getFormValues } from "@/lib/form";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";
import type { CreateCompanyFormState } from "@/app/(app)/dashboard/sites/state";

const createCompanySchema = z.object({
  name: z
    .string()
    .min(1, "Company name is required")
    .max(200, "Company name must be 200 characters or fewer"),
});

type CompanyInsert = Database["public"]["Tables"]["companies"]["Insert"];

export async function createCompany(
  _prevState: CreateCompanyFormState,
  formData: FormData,
): Promise<CreateCompanyFormState> {
  const values = getFormValues(formData, ["name"] as const);
  const result = createCompanySchema.safeParse(values);

  if (!result.success) {
    return {
      success: false,
      errors: flattenZodErrors(result.error.flatten().fieldErrors),
      values,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      errors: { name: "You must be signed in to create a company." },
      values: result.data,
    };
  }

  const insertPayload: CompanyInsert = {
    owner_id: user.id,
    name: result.data.name,
  };

  const { data: company, error } = await supabase
    .from("companies")
    // @ts-expect-error - Supabase client infers table ops as never; payload is CompanyInsert
    .insert(insertPayload)
    .select("id")
    .single();

  if (error || !company) {
    return {
      success: false,
      errors: { name: "Failed to create company. Please try again." },
      values: result.data,
    };
  }

  const companyId = (company as { id: string }).id;

  // Set the new company as the user's current company in the DB so the layout
  // and all pages show it after the redirect.
  // @ts-expect-error - Supabase client infers table ops as never; payload is profiles Insert
  await supabase.from("profiles").upsert(
    { user_id: user.id, current_company_id: companyId },
    { onConflict: "user_id" },
  );

  redirect("/settings");
}
