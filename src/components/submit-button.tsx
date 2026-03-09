"use client";

import { useFormStatus } from "react-dom";
import { Button, type ButtonProps } from "@/components/button";

interface SubmitButtonProps extends Omit<ButtonProps, "type" | "disabled"> {
  pendingText?: string;
}

export function SubmitButton({
  children,
  pendingText,
  ...props
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} {...props}>
      {pending ? (pendingText ?? children) : children}
    </Button>
  );
}
