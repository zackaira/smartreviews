import { type FormState, initialFormState } from "@/lib/form";

export type CreateCompanyValues = { name?: string };
export type CreateCompanyFormState = FormState<CreateCompanyValues>;
export const initialCreateCompanyState =
  initialFormState<CreateCompanyValues>();
