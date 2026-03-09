// Shared types and utilities for server actions used with useActionState.
// Import from here; never build action state shapes ad-hoc in individual actions.

/** Allowed value types within a FormState values map. */
export type FormValue = string | string[] | undefined;

/**
 * Standard return type for server actions consumed by useActionState.
 *
 * TValues is the set of echoed-back field names so the form can repopulate
 * after a failed submission. Defaults to a loose map so actions that don't
 * need precise typing work without specifying a generic.
 */
export type FormState<
  TValues extends Record<string, FormValue> = Record<string, FormValue>,
> = {
  /** True on initial render and after a successful submission. */
  success: boolean;
  /** Per-field error messages, keyed by field name. */
  errors: Record<string, string>;
  /** Submitted values echoed back so the form can repopulate on failure. */
  values: TValues;
  /** Optional success message shown after a successful submission. */
  message?: string;
};

/** Returns a clean initial FormState. */
export function initialFormState<
  TValues extends Record<string, FormValue> = Record<string, FormValue>,
>(): FormState<TValues> {
  return { success: true, errors: {}, values: {} as TValues };
}

/**
 * Converts a Zod `flatten().fieldErrors` map into a flat `Record<string, string>`
 * by taking the first message per field.
 */
export function flattenZodErrors(
  fieldErrors: Record<string, string[] | undefined>
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const [key, messages] of Object.entries(fieldErrors)) {
    if (messages?.[0]) errors[key] = messages[0];
  }
  return errors;
}

/**
 * Extracts named string values from a FormData instance.
 * Returns `undefined` for any key whose value is not a plain string
 * (e.g. file inputs), satisfying the "never cast FormData to string" rule.
 */
export function getFormValues<K extends string>(
  formData: FormData,
  keys: readonly K[]
): Record<K, string | undefined> {
  return Object.fromEntries(
    keys.map((k) => {
      const v = formData.get(k);
      return [k, typeof v === "string" ? v : undefined];
    })
  ) as Record<K, string | undefined>;
}

/**
 * Extracts multiple values for a single key using `FormData.getAll()`.
 * Use for repeated inputs such as tag inputs that submit the same name N times.
 * Returns only the plain-string entries — files are filtered out.
 */
export function getFormMultiValues(
  formData: FormData,
  key: string
): string[] {
  return formData
    .getAll(key)
    .filter((v): v is string => typeof v === "string" && v.length > 0);
}

/**
 * Extracts all Files from FormData for a given key (e.g. a multi-file input).
 * Filters out empty/absent entries — never casts.
 */
export function getFormFiles(formData: FormData, key: string): File[] {
  return formData
    .getAll(key)
    .filter((v): v is File => v instanceof File && v.size > 0);
}

/**
 * Extracts a File from FormData for a given key.
 * Returns `null` when the field is absent, empty (no file selected), or not a File.
 * Never casts — satisfies the "never cast FormData to string" security rule.
 */
export function getFormFile(formData: FormData, key: string): File | null {
  const value = formData.get(key);
  if (!(value instanceof File)) return null;
  // An empty file input always produces a zero-byte File regardless of name
  if (value.size === 0) return null;
  return value;
}
