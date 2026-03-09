"use client";

import { useActionState, useState } from "react";
import type { FormState, FormValue } from "@/lib/form";

/**
 * Thin wrapper around useActionState that provides:
 *
 * - `errors` and `values` — safe defaults when state is undefined on first render.
 * - `isPending` — true while the action is in flight.
 * - `formKey` — increments on every state change. Pass as `key={formKey}` to the
 *   `<form>` element so it remounts after each submission, ensuring `defaultValue`
 *   props are always re-applied from the latest action state.
 */
export function useFormAction<
  TValues extends Record<string, FormValue>,
>(
  action: (
    prevState: FormState<TValues>,
    formData: FormData
  ) => Promise<FormState<TValues>>,
  initialState: FormState<TValues>
) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  // React's setState-during-render pattern for derived state:
  // when `state` changes (action returned a new response), increment `formKey`
  // so the form remounts and picks up the latest defaultValues.
  // React throws away the current render and immediately re-renders with the
  // updated values, so there is no extra visible paint.
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  const [formKey, setFormKey] = useState(0);
  const [prevActionState, setPrevActionState] = useState(state);

  if (prevActionState !== state) {
    setPrevActionState(state);
    setFormKey((k) => k + 1);
  }

  return {
    state,
    formAction,
    isPending,
    errors: state?.errors ?? {},
    values: state?.values ?? initialState.values,
    /** Non-null after a successful submission; null otherwise. */
    message: state?.message ?? null,
    /** Increment-per-submit key — use as `<form key={formKey}>`. */
    formKey,
  };
}
