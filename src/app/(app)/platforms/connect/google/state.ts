import { type FormState, initialFormState } from "@/lib/form";

export type ConnectGoogleValues = {
  query?: string;
  owner_email?: string;
};

export type ConnectGoogleFormState = FormState<ConnectGoogleValues>;
export const initialConnectGoogleState =
  initialFormState<ConnectGoogleValues>();
