import { cn } from "@/lib/utils";

export function DaymarkLockup({
  className,
  compact,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <DaymarkSeal className={compact ? "h-5 w-3.5" : "h-[22px] w-4"} />
      <span
        className={cn(
          "font-display leading-none tracking-[-0.04em]",
          compact ? "text-[1.35rem]" : "text-[1.95rem]",
        )}
      >
        Daymark
      </span>
    </span>
  );
}

export function DaymarkSeal({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 28"
      className={cn("shrink-0 text-mark", className)}
      aria-hidden="true"
    >
      <path
        d="M2 1.25h12v21.2L8 18.7 2 22.45V1.25Z"
        fill="currentColor"
      />
    </svg>
  );
}
