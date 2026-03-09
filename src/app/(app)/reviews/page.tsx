import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Smart Reviews - Review Management",
  description: "Manage your reviews",
};

export default function ReviewManagementPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Review Management
      </h1>
      <p className="mt-2 text-muted-foreground">
        Manage your reviews. Placeholder content.
      </p>
    </div>
  );
}
