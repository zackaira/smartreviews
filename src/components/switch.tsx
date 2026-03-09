"use client";

import * as React from "react";
import { Switch as SwitchPrimitive } from "@/components/ui/switch";
import { Label } from "@/components/label";
import { cn } from "@/lib/utils";

type SwitchProps = React.ComponentProps<typeof SwitchPrimitive>;

/** Re-export for use outside forms. Use SwitchField when the value must be submitted with a form. */
export function Switch({ className, ...props }: SwitchProps) {
  return <SwitchPrimitive className={cn(className)} {...props} />;
}

export interface SwitchFieldProps extends Omit<SwitchProps, "checked"> {
  id?: string;
  label?: string;
  name?: string;
  defaultChecked?: boolean;
  valueWhenChecked?: string;
  valueWhenUnchecked?: string;
  /** Per-field error message. */
  error?: string;
}

/** Switch with optional label and hidden input for form submission. Use in server-rendered forms. */
export function SwitchField({
  id,
  label,
  name,
  defaultChecked = false,
  valueWhenChecked = "on",
  valueWhenUnchecked = "off",
  error,
  className,
  ...props
}: SwitchFieldProps) {
  const [checked, setChecked] = React.useState(defaultChecked);
  const inputId = id ?? (name ? `${name}-switch` : undefined);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        {name && (
          <input
            type="hidden"
            name={name}
            value={checked ? valueWhenChecked : valueWhenUnchecked}
            readOnly
            aria-hidden
          />
        )}
        <SwitchPrimitive
          id={inputId}
          checked={checked}
          onCheckedChange={setChecked}
          aria-invalid={!!error}
          className={cn(
            error && "ring-2 ring-destructive ring-offset-2 ring-offset-background",
            className
          )}
          {...props}
        />
        {label && (
          <Label htmlFor={inputId} className="cursor-pointer font-normal">
            {label}
          </Label>
        )}
      </div>
      {error && (
        <p
          id={inputId ? `${inputId}-error` : undefined}
          role="alert"
          className="text-sm text-destructive"
        >
          {error}
        </p>
      )}
    </div>
  );
}
