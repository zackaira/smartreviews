"use client";

import { useState, useCallback } from "react";
import { Input } from "@/components/input";
import { formatPhone } from "@/lib/format-phone";
import type { InputProps } from "@/components/input";

export interface PhoneInputProps extends Omit<
  InputProps,
  "value" | "defaultValue" | "onChange" | "type"
> {
  /** Initial value (will be formatted on mount). */
  defaultValue?: string;
  /** Called with the formatted value on change. */
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Tel input that formats as the user types:
 * - + → +27 82 4532805
 * - 0 → 082 453 2805
 */
export function PhoneInput({
  defaultValue = "",
  onChange,
  ...props
}: PhoneInputProps) {
  const [value, setValue] = useState(() => formatPhone(defaultValue));

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatPhone(e.target.value);
      setValue(formatted);
      if (onChange) {
        e.target.value = formatted;
        onChange(e);
      }
    },
    [onChange],
  );

  return (
    <Input
      {...props}
      type="tel"
      autoComplete="tel"
      value={value}
      onChange={handleChange}
    />
  );
}
