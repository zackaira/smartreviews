import type * as React from "react";
import {
  Card as CardPrimitive,
  CardHeader as CardHeaderPrimitive,
  CardFooter as CardFooterPrimitive,
  CardTitle as CardTitlePrimitive,
  CardAction as CardActionPrimitive,
  CardDescription as CardDescriptionPrimitive,
  CardContent as CardContentPrimitive,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type CardProps = React.ComponentProps<typeof CardPrimitive>;
type CardHeaderProps = React.ComponentProps<typeof CardHeaderPrimitive>;
type CardFooterProps = React.ComponentProps<typeof CardFooterPrimitive>;
type CardTitleProps = React.ComponentProps<typeof CardTitlePrimitive>;
type CardActionProps = React.ComponentProps<typeof CardActionPrimitive>;
type CardDescriptionProps = React.ComponentProps<typeof CardDescriptionPrimitive>;
type CardContentProps = React.ComponentProps<typeof CardContentPrimitive>;

export type {
  CardProps,
  CardHeaderProps,
  CardFooterProps,
  CardTitleProps,
  CardActionProps,
  CardDescriptionProps,
  CardContentProps,
};

// Add global card overrides below — they apply to every instance in the app

export function Card({ className, ...props }: CardProps) {
  return <CardPrimitive className={cn(className)} {...props} />;
}

export function CardHeader({ className, ...props }: CardHeaderProps) {
  return <CardHeaderPrimitive className={cn(className)} {...props} />;
}

export function CardTitle({ className, ...props }: CardTitleProps) {
  return <CardTitlePrimitive className={cn(className)} {...props} />;
}

export function CardDescription({ className, ...props }: CardDescriptionProps) {
  return <CardDescriptionPrimitive className={cn(className)} {...props} />;
}

export function CardAction({ className, ...props }: CardActionProps) {
  return <CardActionPrimitive className={cn(className)} {...props} />;
}

export function CardContent({ className, ...props }: CardContentProps) {
  return <CardContentPrimitive className={cn(className)} {...props} />;
}

export function CardFooter({ className, ...props }: CardFooterProps) {
  return <CardFooterPrimitive className={cn(className)} {...props} />;
}
