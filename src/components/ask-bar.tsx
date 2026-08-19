import { Link } from "@tanstack/react-router";

export function AskBar() {
  return (
    <Link
      to="/ask"
      className="flex h-11 w-full max-w-[520px] items-center justify-between rounded-md bg-raised px-4 text-sm text-mist shadow-[var(--shadow-inset)] transition-colors hover:text-ink"
    >
      <span>Ask Daymark</span>
      <span className="kicker">Open</span>
    </Link>
  );
}
