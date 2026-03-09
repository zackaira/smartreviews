import type * as React from "react";
import {
  Button as ButtonPrimitive,
  buttonVariants,
} from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ButtonProps = React.ComponentProps<typeof ButtonPrimitive>;

export { buttonVariants };
export type { ButtonProps };

export function Button({ className, ...props }: ButtonProps) {
  // Add global button overrides here — they apply to every Button in the app
  return <ButtonPrimitive className={cn(className)} {...props} />;
}
