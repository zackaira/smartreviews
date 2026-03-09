"use client";

import * as React from "react";
import { UploadCloudIcon, XIcon } from "lucide-react";
import { Label } from "@/components/label";
import { cn } from "@/lib/utils";
import {
  IMAGE_UPLOAD_ACCEPTED_TYPES,
  IMAGE_UPLOAD_ACCEPTED_EXTENSIONS,
  IMAGE_UPLOAD_MAX_BYTES,
} from "@/lib/image-upload";

export {
  IMAGE_UPLOAD_ACCEPTED_TYPES,
  IMAGE_UPLOAD_ACCEPTED_EXTENSIONS,
  IMAGE_UPLOAD_MAX_BYTES,
};

function validateImageFile(file: File): string | null {
  if (!(IMAGE_UPLOAD_ACCEPTED_TYPES as readonly string[]).includes(file.type)) {
    return "Only .jpg and .png images are allowed";
  }
  if (file.size > IMAGE_UPLOAD_MAX_BYTES) {
    return "Image must be smaller than 5 MB";
  }
  return null;
}

export interface ImageUploadProps {
  id?: string;
  name?: string;
  label?: string;
  /** Previously saved image URL — shown as initial preview. */
  defaultSrc?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
  /** Fires whenever the preview URL changes (or becomes null on removal). */
  onPreviewChange?: (url: string | null) => void;
}

/**
 * Click-or-drag image upload field.
 * Submits a File via a hidden <input type="file"> so FormData includes it.
 * Validates type (.jpg/.png) and size (≤ 5 MB) both client-side and server-side.
 */
export function ImageUpload({
  id,
  name,
  label,
  defaultSrc,
  error,
  disabled = false,
  className,
  onPreviewChange,
}: ImageUploadProps) {
  const [preview, setPreview] = React.useState<string | null>(
    defaultSrc ?? null
  );
  const [dragOver, setDragOver] = React.useState(false);
  const [clientError, setClientError] = React.useState<string | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  // Track object URLs so we can revoke them to avoid memory leaks
  const objectUrlRef = React.useRef<string | null>(null);

  const fieldError = error ?? clientError;
  const inputId = id ?? (name ? `${name}-image-upload` : undefined);

  function applyFile(file: File) {
    const validationError = validateImageFile(file);
    if (validationError) {
      setClientError(validationError);
      return;
    }
    setClientError(null);
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    setPreview(url);
    onPreviewChange?.(url);
  }

  function handleRemove() {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setPreview(null);
    setClientError(null);
    onPreviewChange?.(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  // Revoke object URL on unmount
  React.useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (disabled) return;
    const file = e.dataTransfer.files[0];
    if (!file) return;
    // Assign the dropped file to the hidden input so it's included in FormData
    try {
      const dt = new DataTransfer();
      dt.items.add(file);
      if (fileInputRef.current) fileInputRef.current.files = dt.files;
    } catch {
      // DataTransfer API not available in some environments — fall back silently
    }
    applyFile(file);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) applyFile(file);
  }

  function handleDropZoneKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (!disabled) fileInputRef.current?.click();
    }
  }

  const isInvalid = !!fieldError;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {label && <Label htmlFor={inputId}>{label}</Label>}

      {/* Hidden file input — the real form submission mechanism */}
      <input
        ref={fileInputRef}
        id={inputId}
        type="file"
        name={name}
        accept={IMAGE_UPLOAD_ACCEPTED_EXTENSIONS}
        disabled={disabled}
        onChange={handleInputChange}
        className="sr-only"
        aria-invalid={isInvalid}
        aria-describedby={isInvalid && inputId ? `${inputId}-error` : undefined}
      />

      {preview ? (
        <div className="relative w-full overflow-hidden rounded-md border border-input">
          {/* eslint-disable-next-line @next/next/no-img-element -- blob/object URLs from URL.createObjectURL are not compatible with next/image */}
          <img
            src={preview}
            alt="Upload preview"
            className="h-48 w-full object-cover"
          />
          {!disabled && (
            <button
              type="button"
              onClick={handleRemove}
              aria-label="Remove image"
              className="absolute top-2 right-2 flex size-7 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition-colors hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <XIcon className="size-4" />
            </button>
          )}
        </div>
      ) : (
        <div
          onClick={() => !disabled && fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            if (!disabled) setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onKeyDown={handleDropZoneKey}
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-controls={inputId}
          aria-label="Upload image"
          className={cn(
            "flex h-40 w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-md border-2 border-dashed transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
            dragOver
              ? "border-primary bg-primary/5"
              : isInvalid
                ? "border-destructive bg-destructive/5"
                : "border-input hover:border-primary/60 hover:bg-muted/30",
            disabled && "cursor-not-allowed opacity-50"
          )}
        >
          <UploadCloudIcon
            className={cn(
              "size-8",
              dragOver
                ? "text-primary"
                : isInvalid
                  ? "text-destructive"
                  : "text-muted-foreground"
            )}
          />
          <div className="text-center">
            <p className="text-sm font-medium">
              {dragOver ? "Drop image here" : "Click or drag to upload"}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              JPG or PNG · max 5 MB
            </p>
          </div>
        </div>
      )}

      {fieldError && (
        <p
          id={inputId ? `${inputId}-error` : undefined}
          role="alert"
          className="text-sm text-destructive"
        >
          {fieldError}
        </p>
      )}
    </div>
  );
}
