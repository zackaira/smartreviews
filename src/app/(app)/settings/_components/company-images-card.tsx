"use client";

import { GalleryUpload } from "@/components/gallery-upload";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/card";

interface CompanyImagesCardProps {
  errors: Record<string, string>;
  defaultImages?: { id: string; url: string }[];
  onStagedFilesChange?: (files: File[]) => void;
  onKeptGalleryImageIdsChange?: (ids: string[]) => void;
}

export function CompanyImagesCard({
  errors,
  defaultImages = [],
  onStagedFilesChange,
  onKeptGalleryImageIdsChange,
}: CompanyImagesCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Company Images</CardTitle>
        <CardDescription>
          Upload images to showcase your business in your listing.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <GalleryUpload
          name="images"
          error={errors.images}
          initialImages={defaultImages}
          onStagedFilesChange={onStagedFilesChange}
          onKeptGalleryImageIdsChange={onKeptGalleryImageIdsChange}
        />
      </CardContent>
    </Card>
  );
}
