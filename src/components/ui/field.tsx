import * as React from "react";
import { cn } from "@/lib/utils";

const controlBase =
  "w-full rounded-[--radius-control] border border-line-strong bg-surface-card px-3 py-2 text-[0.9375rem] text-text-primary placeholder:text-text-muted transition-colors disabled:cursor-not-allowed disabled:opacity-60 aria-[invalid=true]:border-crit";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input ref={ref} className={cn(controlBase, "h-10", className)} {...props} />
));
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(controlBase, "min-h-24 resize-y", className)}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, ...props }, ref) => (
  <select ref={ref} className={cn(controlBase, "h-10", className)} {...props} />
));
Select.displayName = "Select";

export function Label({
  className,
  required,
  children,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement> & { required?: boolean }) {
  return (
    <label
      className={cn(
        "block text-sm font-semibold text-text-primary",
        className
      )}
      {...props}
    >
      {children}
      {required && (
        <span className="ml-0.5 text-crit" aria-hidden="true">
          *
        </span>
      )}
    </label>
  );
}

export function Hint({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm text-text-muted", className)} {...props} />
  );
}

export function FieldError({
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  if (!children) return null;
  return (
    <p className="text-sm font-medium text-crit" role="alert" {...props}>
      {children}
    </p>
  );
}

/** Agrupa rótulo, controlo, dica e erro com espaçamento consistente. */
export function Field({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-1.5", className)} {...props} />;
}
