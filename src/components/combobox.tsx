import * as React from "react";
import { Combobox as ComboboxPrimitive } from "@base-ui/react";
import { Loader2Icon, XIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxSeparator,
  ComboboxTrigger,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";

type ComboboxInputProps = ComboboxPrimitive.Input.Props & {
  showTrigger?: boolean;
  showClear?: boolean;
  loading?: boolean;
};

function ComboboxInput({
  className,
  children,
  disabled = false,
  showTrigger = true,
  showClear = false,
  loading = false,
  ...props
}: ComboboxInputProps) {
  const isDisabled = disabled || loading;

  return (
    <InputGroup className={cn("w-auto", className)} aria-busy={loading}>
      <ComboboxPrimitive.Input
        render={
          <InputGroupInput
            disabled={isDisabled}
            className={cn(
              loading &&
                "text-transparent caret-transparent selection:bg-transparent",
            )}
          />
        }
        disabled={isDisabled}
        {...props}
      />
      {loading && (
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
          <Loader2Icon className="size-4 animate-spin text-muted-foreground" />
        </span>
      )}
      <InputGroupAddon align="inline-end">
        {showTrigger && (
          <InputGroupButton
            size="icon-xs"
            variant="ghost"
            asChild
            data-slot="input-group-button"
            className="group-has-data-[slot=combobox-clear]/input-group:hidden data-pressed:bg-transparent"
            disabled={isDisabled}
          >
            <ComboboxTrigger />
          </InputGroupButton>
        )}
        {showClear && !loading && (
          <ComboboxPrimitive.Clear
            data-slot="combobox-clear"
            render={<InputGroupButton variant="ghost" size="icon-xs" />}
            disabled={isDisabled}
          >
            <XIcon className="pointer-events-none" />
          </ComboboxPrimitive.Clear>
        )}
      </InputGroupAddon>
      {children}
    </InputGroup>
  );
}

export {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxSeparator,
  ComboboxTrigger,
  ComboboxValue,
  useComboboxAnchor,
};
