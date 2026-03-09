"use client";

import * as React from "react";
import { XIcon } from "lucide-react";
import { Label } from "@/components/label";
import { cn } from "@/lib/utils";

export interface TagInputProps {
  id?: string;
  name?: string;
  label?: string;
  placeholder?: string;
  defaultValue?: string[];
  /** Maximum number of tags allowed. */
  max?: number;
  error?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Tag input for server-action forms.
 * Each tag is submitted as a separate hidden input with the given `name` so
 * FormData contains multiple values for that key — read with `formData.getAll()`.
 *
 * Add a tag:  Enter, comma, or Tab
 * Remove a tag: click ×, or Backspace when the text input is empty
 */
export function TagInput({
  id,
  name,
  label,
  placeholder = "Add a tag…",
  defaultValue = [],
  max,
  error,
  disabled = false,
  className,
}: TagInputProps) {
  const [tags, setTags] = React.useState<string[]>(defaultValue);
  const [inputValue, setInputValue] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);
  const isInvalid = !!error;
  const containerId = id ?? (name ? `${name}-tag-input` : undefined);
  const inputId = containerId ? `${containerId}-text` : undefined;

  function addTag(raw: string) {
    const tag = raw.trim().replace(/,+$/, "").trim();
    if (!tag) return;
    if (tags.includes(tag)) {
      setInputValue("");
      return;
    }
    if (max !== undefined && tags.length >= max) return;
    setTags((prev) => [...prev, tag]);
    setInputValue("");
  }

  function removeTag(index: number) {
    setTags((prev) => prev.filter((_, i) => i !== index));
    inputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === "," || e.key === "Tab") {
      if (e.key !== "Tab" || inputValue.trim()) {
        e.preventDefault();
        addTag(inputValue);
      }
    } else if (e.key === "Backspace" && inputValue === "" && tags.length > 0) {
      setTags((prev) => prev.slice(0, -1));
    }
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {label && <Label htmlFor={inputId}>{label}</Label>}

      {/* Hidden inputs — one per tag, submitted with FormData.getAll(name) */}
      {name &&
        tags.map((tag, i) => (
          <input
            key={i}
            type="hidden"
            name={name}
            value={tag}
            readOnly
            aria-hidden
          />
        ))}
      {/* Emit a sentinel so the action knows the field was submitted even when empty */}
      {name && tags.length === 0 && (
        <input type="hidden" name={name} value="" readOnly aria-hidden />
      )}

      {/* Visible tag container */}
      <div
        id={containerId}
        aria-invalid={isInvalid}
        aria-describedby={
          error && containerId ? `${containerId}-error` : undefined
        }
        onClick={() => !disabled && inputRef.current?.focus()}
        className={cn(
          "flex w-full flex-wrap items-center gap-1.5 rounded-md border bg-transparent px-3 py-[10px] text-[15px] shadow-xs transition-[color,box-shadow]",
          "focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50",
          isInvalid &&
            "border-destructive ring-2 ring-destructive/20 focus-within:border-destructive focus-within:ring-destructive/20",
          !isInvalid && "border-input",
          disabled && "cursor-not-allowed opacity-50",
          "cursor-text",
        )}
      >
        {tags.map((tag, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 rounded-[5px] bg-primary px-[10px] py-[3px] text-xs font-medium text-primary-foreground"
          >
            {tag}
            {!disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeTag(i);
                }}
                aria-label={`Remove ${tag}`}
                className="rounded-full p-0.5 hover:bg-primary-foreground/20 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-foreground"
              >
                <XIcon className="size-3" />
              </button>
            )}
          </span>
        ))}

        <input
          ref={inputRef}
          id={inputId}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => addTag(inputValue)}
          placeholder={tags.length === 0 ? placeholder : ""}
          disabled={disabled || (max !== undefined && tags.length >= max)}
          className="min-w-24 flex-1 bg-transparent outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
          aria-required
        />
      </div>

      {error && (
        <p
          id={containerId ? `${containerId}-error` : undefined}
          role="alert"
          className="text-sm text-destructive"
        >
          {error}
        </p>
      )}
    </div>
  );
}
