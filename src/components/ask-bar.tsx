import { Link } from "@tanstack/react-router";

export function AskBar() {
  return (
    <Link
      to="/ask"
      className="flex h-11 w-full max-w-[520px] items-center justify-between rounded-full bg-raised px-4 text-sm text-mist shadow-[var(--shadow-border)] transition-colors hover:text-ink"
    >
      <span>Talk to Daymark</span>
      <span className="text-[10px] uppercase tracking-[0.16em] text-faint">Open</span>
    </Link>
  );
}
