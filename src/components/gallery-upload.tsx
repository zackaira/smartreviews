"use client";

import * as React from "react";
import { useDragAndDrop } from "@formkit/drag-and-drop/react";
import { PlusIcon, XIcon, UploadCloudIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  IMAGE_UPLOAD_ACCEPTED_TYPES,
  IMAGE_UPLOAD_ACCEPTED_EXTENSIONS,
  IMAGE_UPLOAD_MAX_BYTES,
} from "@/lib/image-upload";

export const GALLERY_MAX_IMAGES = 10;

type ExistingItem = { type: "existing"; id: string; url: string };
type StagedItem = { type: "staged"; id: string; url: string; file: File };
type GalleryItem = ExistingItem | StagedItem;

function isStaged(item: GalleryItem): item is StagedItem {
  return item.type === "staged";
}

export interface GalleryUploadProps {
  name?: string;
  error?: string;
  disabled?: boolean;
  maxImages?: number;
  className?: string;
  /**
   * Images already saved to the server. Shown alongside staged (new) uploads.
   * New uploads are additive; total cannot exceed maxImages. User can delete
   * existing images to free slots.
   */
  initialImages?: { id: string; url: string }[];
  /**
   * Called whenever the list of staged (new) files changes. Use in the form's
   * onSubmit to append these files to FormData.
   */
  onStagedFilesChange?: (files: File[]) => void;
  /**
   * Called whenever the list of existing image ids to keep changes (user deleted
   * some). Submit these as keptGalleryImageIds so the server removes the rest.
   */
  onKeptGalleryImageIdsChange?: (ids: string[]) => void;
}

/**
 * Multi-image gallery upload. New uploads are additive; total images (existing
 * + new) cannot exceed maxImages. User can delete existing images to free slots.
 */
export function GalleryUpload({
  name = "images",
  error,
  disabled = false,
  maxImages = GALLERY_MAX_IMAGES,
  className,
  initialImages,
  onStagedFilesChange,
  onKeptGalleryImageIdsChange,
}: GalleryUploadProps) {
  const initialList = React.useMemo(
    () =>
      (initialImages ?? []).map((img) =>
        Object.freeze({
          type: "existing" as const,
          id: img.id,
          url: img.url,
        }),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: only use initialImages on first mount
    [],
  );

  const [sortableParentRef, items, setItems] = useDragAndDrop<
    HTMLDivElement,
    GalleryItem
  >(initialList, {
    draggable: (el) => !disabled && !el.closest("button"),
    dragImage: (_data, draggedNodes) => {
      const node = draggedNodes[0];
      if (!node?.el) return document.createElement("div");
      const clone = node.el.cloneNode(true) as HTMLElement;
      clone.style.pointerEvents = "none";
      clone.style.transform = "scale(0.85) rotate(-8deg)";
      clone.style.opacity = "0.92";
      clone.style.boxSizing = "border-box";
      clone.style.width = `${node.el.getBoundingClientRect().width}px`;
      clone.style.height = `${node.el.getBoundingClientRect().height}px`;
      clone.style.position = "absolute";
      clone.style.left = "-9999px";
      clone.style.zIndex = "9999";
      document.body.appendChild(clone);
      return clone;
    },
  });

  const [clientError, setClientError] = React.useState<string | null>(null);
  const [dragOver, setDragOver] = React.useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const objectUrlsRef = React.useRef<string[]>([]);

  const initialImageIdsSignature = (initialImages ?? [])
    .map((i) => i.id)
    .sort()
    .join(",");

  React.useEffect(() => {
    setItems((prev) => {
      const existing = (initialImages ?? []).map((img) => ({
        type: "existing" as const,
        id: img.id,
        url: img.url,
      }));
      const staged = prev.filter(isStaged);
      return [...existing, ...staged];
    });
    // Sync when initial images change; we use initialImageIdsSignature to avoid
    // re-running when parent passes a new array reference with same contents.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: initialImageIdsSignature is the source of truth
  }, [initialImageIdsSignature]);

  const totalCount = items.length;
  const canAdd = !disabled && totalCount < maxImages;

  React.useEffect(() => {
    onStagedFilesChange?.(items.filter(isStaged).map((item) => item.file));
  }, [items, onStagedFilesChange]);

  React.useEffect(() => {
    onKeptGalleryImageIdsChange?.(
      items.filter((x) => x.type === "existing").map((x) => x.id),
    );
  }, [items, onKeptGalleryImageIdsChange]);

  React.useEffect(() => {
    const staged = items.filter(isStaged);
    syncFileInput(staged);
  }, [items]);

  const fieldError = error ?? clientError;

  function syncFileInput(stagedItems: StagedItem[]) {
    if (!fileInputRef.current) return;
    try {
      const dt = new DataTransfer();
      for (const item of stagedItems) dt.items.add(item.file);
      fileInputRef.current.files = dt.files;
    } catch {
      // DataTransfer not supported in very old browsers — graceful degradation
    }
  }

  function addFiles(files: FileList | File[]) {
    setClientError(null);
    const fileArray = Array.from(files);
    const added: StagedItem[] = [];

    for (const file of fileArray) {
      if (totalCount + added.length >= maxImages) {
        setClientError(
          `Maximum ${maxImages} images total. Delete some to add more.`,
        );
        break;
      }
      if (
        !(IMAGE_UPLOAD_ACCEPTED_TYPES as readonly string[]).includes(file.type)
      ) {
        setClientError("Only .jpg and .png images are allowed");
        continue;
      }
      if (file.size > IMAGE_UPLOAD_MAX_BYTES) {
        setClientError("One or more images exceed the 5 MB limit");
        continue;
      }
      const url = URL.createObjectURL(file);
      objectUrlsRef.current.push(url);
      added.push({
        type: "staged",
        id: crypto.randomUUID(),
        url,
        file,
      });
    }

    if (added.length > 0) {
      setItems((prev) => [...prev, ...added]);
    }
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (disabled || !e.dataTransfer.files.length) return;
    addFiles(e.dataTransfer.files);
  }

  React.useEffect(() => {
    const urls = objectUrlsRef.current;
    return () => {
      for (const url of urls) URL.revokeObjectURL(url);
    };
  }, []);

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {/* Hidden file input — holds the final file list via DataTransfer */}
      <input
        ref={fileInputRef}
        type="file"
        name={name}
        accept={IMAGE_UPLOAD_ACCEPTED_EXTENSIONS}
        multiple
        disabled={disabled}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(e) => {
          if (e.target.files?.length) addFiles(e.target.files);
          e.target.value = "";
        }}
      />

      <div
        className={"grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5"}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <div ref={sortableParentRef} className="contents">
          {items.map((item) => (
            <div
              key={item.id}
              data-label={item.id}
              className="group relative aspect-square overflow-hidden rounded-lg border border-input bg-muted cursor-grab active:cursor-grabbing"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.url}
                alt=""
                className="h-full w-full object-cover pointer-events-none"
                draggable={false}
              />
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  aria-label="Remove image"
                  className="absolute top-2 right-2 flex size-7 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition-colors hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <XIcon className="size-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>

        {canAdd && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Add images"
            className={cn(
              "flex aspect-square flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed transition-colors text-muted-foreground",
              dragOver
                ? "border-primary text-primary bg-primary/5"
                : fieldError
                  ? "border-destructive text-destructive"
                  : "border-input hover:border-primary/60 hover:text-primary",
            )}
          >
            {totalCount === 0 ? (
              <>
                <UploadCloudIcon className="size-6" />
                <span className="text-xs font-medium">Upload images</span>
              </>
            ) : (
              <PlusIcon className="size-6" />
            )}
          </button>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        {items.length > 0 ? "Drag images to reorder · " : ""}
        JPG or PNG · max 5 MB each · {totalCount}/{maxImages} images
      </p>

      {fieldError && (
        <p role="alert" className="text-sm text-destructive">
          {fieldError}
        </p>
      )}
    </div>
  );
}
