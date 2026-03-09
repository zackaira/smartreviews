import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileDetailsCard } from "./_components/profile-details-card";
import { ChangePasswordCard } from "./_components/change-password-card";

export const metadata: Metadata = {
  title: "Profile - Smart Reviews",
  description: "Your profile settings",
};

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  type ProfileRow = {
    full_name: string | null;
    contact_number: string | null;
    website: string | null;
  };
  const { data } = await supabase
    .from("profiles")
    .select("full_name, contact_number, website")
    .eq("user_id", user.id)
    .maybeSingle();
  const profile = data as ProfileRow | null;

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Profile
        </h1>
        <p className="mt-2 text-muted-foreground">
          Manage your account and company details.
        </p>
      </div>

      <ProfileDetailsCard
        defaultEmail={user.email}
        pendingNewEmail={user.new_email ?? undefined}
        defaultValues={{
          email: user.new_email ?? user.email,
          fullName: profile?.full_name ?? undefined,
          contactNumber: profile?.contact_number ?? undefined,
          website: profile?.website ?? undefined,
        }}
      />

      <ChangePasswordCard />
    </div>
  );
}
