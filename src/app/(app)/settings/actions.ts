"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { companySettingsSchema } from "@/lib/validation";
import {
  flattenZodErrors,
  getFormValues,
  getFormMultiValues,
  getFormFile,
  getFormFiles,
} from "@/lib/form";
import {
  IMAGE_UPLOAD_ACCEPTED_TYPES,
  IMAGE_UPLOAD_MAX_BYTES,
} from "@/lib/image-upload";
import { normalizePhone } from "@/lib/format-phone";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";
import {
  type CompanySettingsFormState,
  COMPANY_SETTINGS_STRING_KEYS,
  initialCompanySettingsState,
} from "./profile-settings-state";

type CompanyUpdate = Database["public"]["Tables"]["companies"]["Update"];
type CompanyImageInsert =
  Database["public"]["Tables"]["company_images"]["Insert"];
type CompanyInsert = Database["public"]["Tables"]["companies"]["Insert"];

const LOGO_BUCKET = "company-logos";
const IMAGES_BUCKET = "company-images";
const MAX_GALLERY_IMAGES = 10;

/** Derive storage path from a company_images public URL for deletion. */
function storagePathFromPublicUrl(url: string): string | null {
  const match = url.match(new RegExp(`${IMAGES_BUCKET}/(.+)`));
  return match ? match[1] : null;
}

/** Coerce empty or whitespace-only strings to null for optional DB fields. */
function emptyToNull(s: string | undefined | null): string | null {
  if (s == null || (typeof s === "string" && s.trim() === "")) return null;
  return s;
}

export async function updateCompanySettings(
  _prevState: CompanySettingsFormState,
  formData: FormData,
): Promise<CompanySettingsFormState> {
  const companyId = formData.get("companyId");
  if (typeof companyId !== "string" || !companyId.trim()) {
    return {
      success: false,
      errors: {
        companyName:
          "No company selected. Please select a company from the sidebar.",
      },
      values: {} as CompanySettingsFormState["values"],
    };
  }

  const values = getFormValues(formData, COMPANY_SETTINGS_STRING_KEYS);
  const categories = getFormMultiValues(formData, "categories");
  const tags = getFormMultiValues(formData, "tags");
  const logoFile = getFormFile(formData, "logo");
  const imageFiles = getFormFiles(formData, "images");
  const keptGalleryImageIds = getFormMultiValues(formData, "keptGalleryImageIds");
  const currentLogoUrl = formData.get("currentLogoUrl");

  const fileErrors: Record<string, string> = {};

  if (logoFile) {
    const err = validateImage(logoFile);
    if (err) fileErrors.logo = err;
  }

  if (imageFiles.length > MAX_GALLERY_IMAGES) {
    fileErrors.images = `You can upload at most ${MAX_GALLERY_IMAGES} images at a time.`;
  } else if (keptGalleryImageIds.length + imageFiles.length > MAX_GALLERY_IMAGES) {
    fileErrors.images = `Total images cannot exceed ${MAX_GALLERY_IMAGES}. Remove some existing images to add more.`;
  } else {
    for (const file of imageFiles) {
      const err = validateImage(file);
      if (err) {
        fileErrors.images = err;
        break;
      }
    }
  }

  const result = companySettingsSchema.safeParse({
    ...values,
    categories,
    tags,
  });

  if (!result.success || Object.keys(fileErrors).length > 0) {
    return {
      success: false,
      errors: {
        ...flattenZodErrors(
          result.success ? {} : result.error.flatten().fieldErrors,
        ),
        ...fileErrors,
      },
      values: { ...values, categories, tags },
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      errors: {
        companyName: "You must be signed in to update company settings.",
      },
      values: result.data,
    };
  }

  // Verify ownership BEFORE performing any side-effectful operations
  // (RLS handles it at the DB level, but we check here to fail fast and
  // avoid wasting storage quota on uploads that would be orphaned)
  const { data: ownedCompany } = await supabase
    .from("companies")
    .select("id")
    .eq("id", companyId)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!ownedCompany) {
    return {
      success: false,
      errors: {
        companyName: "Company not found or you do not have access to it.",
      },
      values: result.data,
    };
  }

  const data = result.data;
  const ownerId = user.id;
  const pathPrefixLogo = `${ownerId}/${companyId}`;
  const pathPrefixImages = `${ownerId}/${companyId}`;

  // ── Logo upload ────────────────────────────────────────────────────────────
  let logoUrl: string | null = null;

  if (logoFile) {
    // Remove any existing logo objects first so stale files are not orphaned
    const { data: existingLogoFiles } = await supabase.storage
      .from(LOGO_BUCKET)
      .list(pathPrefixLogo);
    if (existingLogoFiles?.length) {
      await supabase.storage
        .from(LOGO_BUCKET)
        .remove(existingLogoFiles.map((f) => `${pathPrefixLogo}/${f.name}`));
    }

    const ext = logoFile.type === "image/png" ? "png" : "jpg";
    const path = `${pathPrefixLogo}/logo.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from(LOGO_BUCKET)
      .upload(path, logoFile);

    if (uploadError) {
      return {
        success: false,
        errors: { logo: "Failed to upload logo. Please try again." },
        values: { ...data, categories: data.categories, tags: data.tags },
      };
    }

    const { data: urlData } = supabase.storage
      .from(LOGO_BUCKET)
      .getPublicUrl(path);
    logoUrl = urlData.publicUrl;
  }

  // Use the logo URL passed from the form rather than querying the DB again
  const finalLogoUrl =
    logoUrl ??
    (typeof currentLogoUrl === "string" && currentLogoUrl
      ? currentLogoUrl
      : null);

  // ── Gallery: upload new files (additive) and remove images not in kept list ─
  const imageUrls: string[] = [];
  const uploadedGalleryPaths: string[] = [];

  if (imageFiles.length > 0) {
    const uploadResults = await Promise.all(
      imageFiles.map(async (file) => {
        const ext = file.type === "image/png" ? "png" : "jpg";
        const path = `${pathPrefixImages}/${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage
          .from(IMAGES_BUCKET)
          .upload(path, file, { upsert: false });
        if (error) return { path, error };
        const { data: urlData } = supabase.storage
          .from(IMAGES_BUCKET)
          .getPublicUrl(path);
        return { path, url: urlData.publicUrl, error: null };
      }),
    );

    const failedUpload = uploadResults.find((r) => r.error);
    if (failedUpload) {
      const uploadedPaths = uploadResults
        .filter((r) => !r.error)
        .map((r) => r.path);
      if (uploadedPaths.length > 0) {
        await supabase.storage.from(IMAGES_BUCKET).remove(uploadedPaths);
      }
      return {
        success: false,
        errors: {
          images: "Failed to upload one or more images. Please try again.",
        },
        values: { ...data, categories: data.categories, tags: data.tags },
      };
    }

    for (const r of uploadResults) {
      if (r.url) {
        imageUrls.push(r.url);
        if (r.path) uploadedGalleryPaths.push(r.path);
      }
    }
  }

  // ── Company update ─────────────────────────────────────────────────────────
  // Normalize optional fields: empty string from form -> null in DB
  const updatePayload: CompanyUpdate = {
    name: data.companyName.trim(),
    short_description: emptyToNull(data.shortDescription),
    industry: emptyToNull(data.industry),
    contact_number: emptyToNull(normalizePhone(data.contactNumber ?? "")),
    whatsapp_number: emptyToNull(normalizePhone(data.whatsappNumber ?? "")),
    website: emptyToNull(data.website),
    logo_url: finalLogoUrl,
    categories: Array.isArray(data.categories) ? data.categories : [],
    tags: Array.isArray(data.tags) ? data.tags : [],
    facebook: emptyToNull(data.facebook),
    instagram: emptyToNull(data.instagram),
    twitter: emptyToNull(data.twitter),
    tiktok: emptyToNull(data.tiktok),
    youtube: emptyToNull(data.youtube),
    vimeo: emptyToNull(data.vimeo),
    linkedin: emptyToNull(data.linkedin),
    pinterest: emptyToNull(data.pinterest),
  };

  const { error: updateCompanyError } = await supabase
    .from("companies")
    // @ts-expect-error - Supabase client from @supabase/ssr infers table ops as never; payload is typed as CompanyUpdate
    .update(updatePayload)
    .eq("id", companyId)
    .eq("owner_id", user.id); // defence-in-depth alongside RLS

  if (updateCompanyError) {
    return {
      success: false,
      errors: {
        companyName: "Failed to save company. Please try again.",
      },
      values: { ...data, categories: data.categories, tags: data.tags },
    };
  }

  // ── Gallery: insert new rows (additive) then delete rows not in kept list ───
  let newlyInsertedImageIds: string[] = [];
  if (imageUrls.length > 0) {
    const { data: maxSort } = await supabase
      .from("company_images")
      .select("sort_order")
      .eq("company_id", companyId)
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    const nextSort =
      ((maxSort as { sort_order: number } | null)?.sort_order ?? -1) + 1;
    const inserts: CompanyImageInsert[] = imageUrls.map((url, i) => ({
      company_id: companyId,
      url,
      sort_order: nextSort + i,
    }));
    const { data: insertedRows, error: insertImagesError } = await supabase
      .from("company_images")
      // @ts-expect-error - Supabase client infers table ops as never; payload is CompanyImageInsert[]
      .insert(inserts)
      .select("id");

    if (insertImagesError) {
      if (uploadedGalleryPaths.length > 0) {
        await supabase.storage.from(IMAGES_BUCKET).remove(uploadedGalleryPaths);
      }
      return {
        success: false,
        errors: {
          images:
            "Images were uploaded but could not be saved. Please try again.",
        },
        values: { ...data, categories: data.categories, tags: data.tags },
      };
    }
    newlyInsertedImageIds = (insertedRows ?? []).map(
      (row: { id: string }) => row.id,
    );
  }

  // Remove gallery images that are no longer in the kept list (and their storage).
  // Include newly inserted ids so we never delete rows we just added (keptGalleryImageIds
  // is empty when the user only added new images and had no existing ones).
  const keptSet = new Set([
    ...keptGalleryImageIds,
    ...newlyInsertedImageIds,
  ]);
  const { data: toDelete } = await supabase
    .from("company_images")
    .select("id, url")
    .eq("company_id", companyId);
  const rows = (toDelete ?? []) as { id: string; url: string }[];
  const idsToRemove = rows.filter((r) => !keptSet.has(r.id)).map((r) => r.id);
  const pathsToRemove: string[] = [];
  for (const r of rows) {
    if (!keptSet.has(r.id)) {
      const path = storagePathFromPublicUrl(r.url);
      if (path) pathsToRemove.push(path);
    }
  }
  if (idsToRemove.length > 0) {
    await supabase.from("company_images").delete().in("id", idsToRemove);
    if (pathsToRemove.length > 0) {
      await supabase.storage.from(IMAGES_BUCKET).remove(pathsToRemove);
    }
  }

  // Persist display order: keptGalleryImageIds (order from form) then newly inserted.
  const finalOrder = [...keptGalleryImageIds, ...newlyInsertedImageIds];
  for (let i = 0; i < finalOrder.length; i++) {
    await supabase
      .from("company_images")
      // @ts-expect-error - Supabase client infers table ops as never
      .update({ sort_order: i })
      .eq("id", finalOrder[i])
      .eq("company_id", companyId);
  }

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return {
    ...initialCompanySettingsState,
    values: {
      ...data,
      categories: data.categories ?? [],
      tags: data.tags ?? [],
    },
    message: "Settings saved.",
  };
}

export async function createFirstCompany(): Promise<{
  error?: string;
  companyId?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in to create a company." };
  }

  const { data: existing } = await supabase
    .from("companies")
    .select("id")
    .eq("owner_id", user.id)
    .limit(1)
    .maybeSingle();

  if (existing) {
    return { companyId: (existing as { id: string }).id };
  }

  const insertPayload: CompanyInsert = {
    owner_id: user.id,
    name: "",
    short_description: "",
    industry: "other",
    contact_number: "",
    website: "",
  };

  const { data: company, error } = await supabase
    .from("companies")
    // @ts-expect-error - Supabase client infers table ops as never; payload is CompanyInsert
    .insert(insertPayload)
    .select("id")
    .single();

  if (error || !company) {
    return { error: "Failed to create company. Please try again." };
  }

  const companyId = (company as { id: string }).id;

  // Set the new company as the user's current company in the DB.
  await supabase
    .from("profiles")
    // @ts-expect-error - Supabase client infers table ops as never; payload is profiles Insert
    .upsert(
      { user_id: user.id, current_company_id: companyId },
      { onConflict: "user_id" },
    );

  return { companyId };
}

export async function deleteCompany(
  companyId: string,
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in to delete a company." };
  }

  // Verify ownership before any side-effectful work
  const { data: company } = await supabase
    .from("companies")
    .select("id")
    .eq("id", companyId)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!company) {
    return { error: "Company not found or you do not have access." };
  }

  const pathPrefix = `${user.id}/${companyId}`;

  // Remove storage objects (best-effort — don't block delete on storage errors)
  const [{ data: logoFiles }, { data: imageFiles }] = await Promise.all([
    supabase.storage.from(LOGO_BUCKET).list(pathPrefix),
    supabase.storage.from(IMAGES_BUCKET).list(pathPrefix),
  ]);

  await Promise.all([
    logoFiles?.length
      ? supabase.storage
          .from(LOGO_BUCKET)
          .remove(logoFiles.map((f) => `${pathPrefix}/${f.name}`))
      : Promise.resolve(),
    imageFiles?.length
      ? supabase.storage
          .from(IMAGES_BUCKET)
          .remove(imageFiles.map((f) => `${pathPrefix}/${f.name}`))
      : Promise.resolve(),
  ]);

  // Delete related rows first in case there is no DB-level cascade
  await supabase.from("company_images").delete().eq("company_id", companyId);

  const { error: deleteError } = await supabase
    .from("companies")
    .delete()
    .eq("id", companyId)
    .eq("owner_id", user.id);

  if (deleteError) {
    return { error: "Failed to delete company. Please try again." };
  }

  // Clear the user's active company if it was the deleted one
  await supabase
    .from("profiles")
    // @ts-expect-error - Supabase client infers table ops as never; payload is profiles Update
    .update({ current_company_id: null })
    .eq("user_id", user.id)
    .eq("current_company_id", companyId);

  revalidatePath("/settings");
  redirect("/settings");
}

function validateImage(file: File): string | null {
  if (!(IMAGE_UPLOAD_ACCEPTED_TYPES as readonly string[]).includes(file.type)) {
    return "Only .jpg and .png images are allowed";
  }
  if (file.size > IMAGE_UPLOAD_MAX_BYTES) {
    return "Image must be smaller than 5 MB";
  }
  return null;
}
