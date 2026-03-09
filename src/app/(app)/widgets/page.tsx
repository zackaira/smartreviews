import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Smart Reviews - Website Widgets",
  description: "Website widgets",
};

export default function WebsiteWidgetsPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Website Widgets
      </h1>
      <p className="mt-2 text-muted-foreground">
        Website widgets. Placeholder content.
      </p>
    </div>
  );
}
