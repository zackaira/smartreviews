import type * as React from "react";
import { Textarea as TextareaPrimitive } from "@/components/ui/textarea";
import { Label } from "@/components/label";
import { cn } from "@/lib/utils";

type TextareaPrimitiveProps = React.ComponentProps<typeof TextareaPrimitive>;

export interface TextareaProps extends TextareaPrimitiveProps {
  /** Renders a <Label> above the textarea. Requires `id` for proper association. */
  label?: string;
  /** Per-field error message. Sets aria-invalid and renders an error hint. */
  error?: string;
}

export function Textarea({
  id,
  label,
  error,
  className,
  rows,
  ...props
}: TextareaProps) {
  const isField = !!label || !!error;

  const textarea = (
    <TextareaPrimitive
      id={id}
      rows={rows}
      className={cn(
        // Override ShadCN's py-2 and responsive text-sm defaults
        "py-[10px] text-[15px] md:text-[15px]",
        // field-sizing-content (set by ShadCN) ignores the `rows` attribute.
        // Override to field-sizing-fixed whenever rows is explicitly provided.
        rows !== undefined && "field-sizing-fixed",
        error &&
          "border-destructive ring-2 ring-destructive/20 focus-visible:border-destructive focus-visible:ring-destructive/20",
        className,
      )}
      aria-invalid={isField ? !!error : undefined}
      aria-describedby={error && id ? `${id}-error` : undefined}
      {...props}
    />
  );

  if (!isField) return textarea;

  return (
    <div className="flex flex-col gap-2">
      {label && <Label htmlFor={id}>{label}</Label>}
      {textarea}
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
