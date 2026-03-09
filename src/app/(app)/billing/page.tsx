import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Billing - Smart Reviews",
  description: "Manage your billing and subscription",
};

export default function BillingPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Billing
      </h1>
      <p className="mt-2 text-muted-foreground">
        Manage your billing and subscription. Placeholder content.
      </p>
    </div>
  );
}
