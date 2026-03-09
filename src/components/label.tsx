import type * as React from "react";
import { Label as LabelPrimitive } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type LabelProps = React.ComponentProps<typeof LabelPrimitive>;

export type { LabelProps };

export function Label({ className, ...props }: LabelProps) {
  // Add global label overrides here — they apply to every Label in the app
  return <LabelPrimitive className={cn(className)} {...props} />;
}
