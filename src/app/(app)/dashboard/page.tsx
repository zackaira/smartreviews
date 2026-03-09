import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Smart Reviews -Dashboard",
  description: "Your Smart Reviews dashboard",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="mx-auto max-w-7xl">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Dashboard
      </h1>
      <p className="mt-2 text-muted-foreground">
        Welcome back{user?.email ? `, ${user.email}` : ""}. This page is only
        visible when you&apos;re logged in.
      </p>
    </div>
  );
}
