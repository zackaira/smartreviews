"use client";

import { startTransition, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useFormAction } from "@/lib/use-form-action";
import { SubmitButton } from "@/components/submit-button";
import { Button } from "@/components/button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { CompanyInfoCard } from "./company-info-card";
import { CompanyImagesCard } from "./company-images-card";
import { SocialLinksCard } from "./social-links-card";
import { LocationsCard } from "./locations-card";
import {
  updateCompanySettings,
  deleteCompany,
} from "@/app/(app)/settings/actions";
import {
  initialCompanySettingsState,
  type CompanySettingsValues,
  type CompanySettingsFormState,
} from "@/app/(app)/settings/profile-settings-state";

function scrollToTop() {
  const main = document.querySelector("main");
  if (main) main.scrollTo({ top: 0, behavior: "smooth" });
  else window.scrollTo({ top: 0, behavior: "smooth" });
}

interface ProfileSettingsFormProps {
  companyId: string;
  currentLogoUrl?: string | null;
  defaultValues?: Partial<CompanySettingsValues>;
  defaultImages?: { id: string; url: string }[];
}

export function ProfileSettingsForm({
  companyId,
  currentLogoUrl,
  defaultValues,
  defaultImages = [],
}: ProfileSettingsFormProps) {
  const initialState: CompanySettingsFormState = {
    ...initialCompanySettingsState,
    values: (defaultValues ?? {}) as CompanySettingsValues,
  };
  const { formAction, formKey, errors, values, message, state } = useFormAction(
    updateCompanySettings,
    initialState
  );
  const router = useRouter();
  const lastToastedKeyRef = useRef(-1);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, startDelete] = useTransition();
  const [stagedGalleryFiles, setStagedGalleryFiles] = useState<File[]>([]);
  const [keptGalleryImageIds, setKeptGalleryImageIds] = useState<string[]>(
    () => defaultImages?.map((img) => img.id) ?? []
  );

  function handleDelete() {
    startDelete(async () => {
      const result = await deleteCompany(companyId);
      if (result?.error) {
        toast.error(result.error);
        setDeleteOpen(false);
      }
    });
  }

  useEffect(() => {
    if (formKey === lastToastedKeyRef.current || formKey === 0) return;
    lastToastedKeyRef.current = formKey;
    scrollToTop();

    if (message) {
      toast.success(message);
      router.refresh();
      return;
    }
    if (state?.success === false && errors && Object.keys(errors).length > 0) {
      const firstError = Object.values(errors)[0];
      toast.error(firstError);
    }
  }, [formKey, message, state?.success, errors, router]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.delete("images");
    for (const file of stagedGalleryFiles) fd.append("images", file);
    fd.delete("keptGalleryImageIds");
    for (const id of keptGalleryImageIds) fd.append("keptGalleryImageIds", id);
    startTransition(() => {
      formAction(fd);
    });
  }

  return (
    <form
      action={formAction}
      onSubmit={handleSubmit}
      className="flex flex-col gap-6"
      noValidate
      key={formKey}
    >
      <input type="hidden" name="companyId" value={companyId} />
      {currentLogoUrl && (
        <input type="hidden" name="currentLogoUrl" value={currentLogoUrl} />
      )}
      <CompanyInfoCard
        errors={errors}
        defaultValues={values ?? defaultValues ?? {}}
        currentLogoUrl={currentLogoUrl}
      />
      <CompanyImagesCard
        errors={errors}
        defaultImages={defaultImages}
        onStagedFilesChange={setStagedGalleryFiles}
        onKeptGalleryImageIdsChange={setKeptGalleryImageIds}
      />
      <SocialLinksCard errors={errors} defaultValues={values ?? defaultValues ?? {}} />
      <LocationsCard />

      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => setDeleteOpen(true)}
        >
          <Trash2 />
          Delete company
        </Button>
        <SubmitButton pendingText="Saving…">Save changes</SubmitButton>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete company"
        description="Are you sure you want to delete this company? All settings, images, and data will be permanently removed and cannot be recovered."
        confirmLabel="Delete company"
        destructive
        onConfirm={handleDelete}
        isPending={isDeleting}
      />
    </form>
  );
}
