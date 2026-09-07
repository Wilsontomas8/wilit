import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
  {
    variants: {
      tone: {
        neutral: "bg-surface-sunken text-text-secondary",
        brand: "bg-brand-soft text-brand-text",
        accent: "bg-accent-soft text-accent-text",
        ok: "bg-ok-soft text-ok-strong",
        warn: "bg-warn-soft text-warn-strong",
        crit: "bg-crit-soft text-crit-strong",
        outline: "border border-line-strong text-text-secondary",
      },
    },
    defaultVariants: { tone: "neutral" },
  }
);

export function Badge({
  className,
  tone,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
