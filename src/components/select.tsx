"use client";

import * as React from "react";
import {
  Select as SelectPrimitive,
  SelectContent as SelectContentPrimitive,
  SelectGroup as SelectGroupPrimitive,
  SelectItem as SelectItemPrimitive,
  SelectLabel as SelectLabelPrimitive,
  SelectSeparator as SelectSeparatorPrimitive,
  SelectTrigger as SelectTriggerPrimitive,
  SelectValue as SelectValuePrimitive,
} from "@/components/ui/select";
import { Label } from "@/components/label";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Pass-through re-exports for building custom select layouts
// ---------------------------------------------------------------------------

export const SelectRoot = SelectPrimitive;
export const SelectContent = SelectContentPrimitive;
export const SelectGroup = SelectGroupPrimitive;
export const SelectItem = SelectItemPrimitive;
export const SelectLabel = SelectLabelPrimitive;
export const SelectSeparator = SelectSeparatorPrimitive;
export const SelectTrigger = SelectTriggerPrimitive;
export const SelectValue = SelectValuePrimitive;

// ---------------------------------------------------------------------------
// SelectField — full form field: label + select + hidden input + error
// ---------------------------------------------------------------------------

export type SelectOption = {
  value: string;
  label: string;
};

export interface SelectFieldProps {
  id?: string;
  name?: string;
  label?: string;
  placeholder?: string;
  options: SelectOption[];
  defaultValue?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
  onValueChange?: (value: string) => void;
}

/**
 * Complete select field for server-action forms.
 * Syncs the selected value to a hidden input so the value is included in
 * FormData — Radix Select doesn't submit natively like a <select> element.
 */
export function SelectField({
  id,
  name,
  label,
  placeholder,
  options,
  defaultValue,
  error,
  disabled,
  className,
  onValueChange,
}: SelectFieldProps) {
  const [value, setValue] = React.useState(defaultValue ?? "");
  const triggerId = id ?? (name ? `${name}-select` : undefined);
  const isInvalid = !!error;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {label && <Label htmlFor={triggerId}>{label}</Label>}
      {name && (
        <input type="hidden" name={name} value={value} readOnly aria-hidden />
      )}
      <SelectPrimitive
        value={value}
        onValueChange={(v) => {
          setValue(v);
          onValueChange?.(v);
        }}
        disabled={disabled}
      >
        <SelectTriggerPrimitive
          id={triggerId}
          aria-invalid={isInvalid}
          aria-describedby={
            error && triggerId ? `${triggerId}-error` : undefined
          }
          aria-required
          className={cn(
            // !h-auto overrides data-[size=default]:h-9 (attribute selector has
            // higher specificity, so the important flag is required here)
            "w-full h-auto! py-[10px] text-[15px]",
            isInvalid &&
              "border-destructive ring-2 ring-destructive/20 focus-visible:border-destructive focus-visible:ring-destructive/20",
          )}
        >
          <SelectValuePrimitive placeholder={placeholder ?? "Select…"} />
        </SelectTriggerPrimitive>
        <SelectContentPrimitive>
          {options.map((opt) => (
            <SelectItemPrimitive key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItemPrimitive>
          ))}
        </SelectContentPrimitive>
      </SelectPrimitive>
      {error && (
        <p
          id={triggerId ? `${triggerId}-error` : undefined}
          role="alert"
          className="text-sm text-destructive"
        >
          {error}
        </p>
      )}
    </div>
  );
}
