import type * as React from "react";
import { Input as InputPrimitive } from "@/components/ui/input";
import { Label } from "@/components/label";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Validation rules
// Each rule maps to a set of HTML constraint attributes. Explicit props
// passed alongside `validate` always win (spread order: validate < props).
// ---------------------------------------------------------------------------

export type ValidationRule =
  | "required" // required only
  | "email" // type=email · autoComplete=email · required
  | "password" // type=password · autoComplete=current-password · required
  | "new-password" // type=password · autoComplete=new-password · minLength=8 · required
  | "url" // type=url · required
  | "tel" // type=tel · required
  | "number"; // type=number · required

type InputPrimitiveProps = React.ComponentProps<typeof InputPrimitive>;

const VALIDATION_ATTRS: Record<ValidationRule, Partial<InputPrimitiveProps>> = {
  required: { required: true },
  email: { type: "email", autoComplete: "email", required: true },
  password: {
    type: "password",
    autoComplete: "current-password",
    required: true,
  },
  "new-password": {
    type: "password",
    autoComplete: "new-password",
    required: true,
    minLength: 8,
  },
  url: { type: "url", required: true },
  tel: { type: "tel", required: true },
  number: { type: "number", required: true },
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface InputProps extends InputPrimitiveProps {
  /** Renders a <Label> above the input. Requires `id` for proper association. */
  label?: string;
  /** Optional node rendered to the right of the label (e.g. "Forgot password?" link). */
  labelAction?: React.ReactNode;
  /** Per-field error message. Sets aria-invalid and renders an error hint. */
  error?: string;
  /** Shorthand for common HTML constraint attributes. Explicit props take precedence. */
  validate?: ValidationRule;
  /** Optional node rendered inside the input on the right (e.g. a toggle button). */
  addonRight?: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Input({
  id,
  label,
  labelAction,
  error,
  validate,
  addonRight,
  className,
  ...props
}: InputProps) {
  const validationAttrs = validate ? VALIDATION_ATTRS[validate] : {};
  const isField = label ?? error;

  const inputEl = (
    <InputPrimitive
      id={id}
      className={cn(
        // Override ShadCN's fixed h-9, py-1, and responsive text-sm defaults
        "h-auto py-[10px] text-[15px] md:text-[15px]",
        addonRight && "pr-10",
        error &&
          "border-destructive ring-2 ring-destructive/20 focus-visible:border-destructive focus-visible:ring-destructive/20",
        className,
      )}
      aria-invalid={isField ? !!error : undefined}
      aria-describedby={error && id ? `${id}-error` : undefined}
      {...validationAttrs}
      {...props}
    />
  );

  const input = addonRight ? (
    <div className="relative">
      {inputEl}
      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
        {addonRight}
      </div>
    </div>
  ) : (
    inputEl
  );

  if (!isField) return input;

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <div
          className={cn("flex items-center", labelAction && "justify-between")}
        >
          <Label htmlFor={id}>{label}</Label>
          {labelAction}
        </div>
      )}
      {input}
      {error && (
        <p
          id={id ? `${id}-error` : undefined}
          role="alert"
          className="text-sm text-destructive"
        >
          {error}
        </p>
      )}
    </div>
  );
}
