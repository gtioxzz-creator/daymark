import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-md bg-paper px-3 text-sm text-ink shadow-[inset_0_0_0_1px_var(--color-rule)] outline-none transition-[box-shadow] placeholder:text-faint focus:shadow-[inset_0_0_0_1px_var(--color-mark)]",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-32 w-full resize-y rounded-md bg-paper px-3 py-3 text-sm leading-relaxed text-ink shadow-[inset_0_0_0_1px_var(--color-rule)] outline-none transition-[box-shadow] placeholder:text-faint focus:shadow-[inset_0_0_0_1px_var(--color-mark)]",
        className,
      )}
      {...props}
    />
  );
}
