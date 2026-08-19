import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { UserButton } from "@/lib/auth/gates";
import { Link } from "@tanstack/react-router";
import { useDaymark } from "@/lib/store";

export function AccountMenu() {
  const { user, isPending } = useCurrentUserState();
  const initials = useDaymark((s) => s.settings.initials);
  const mark = initials || (user?.displayName?.[0] ?? "?").toUpperCase();
  if (isPending) {
    return <div className="size-9 animate-pulse rounded-full bg-raised" />;
  }
  if (user) {
    return (
      <div className="[&_img]:size-9 [&_span.grid]:size-9 [&_span.grid]:bg-ink [&_span.grid]:text-paper">
        <UserButton />
      </div>
    );
  }
  return (
    <Link
      to="/login"
      className="grid size-9 place-items-center rounded-full bg-ink font-mono text-[10px] font-medium text-paper"
      aria-label="Sign in"
    >
      {mark}
    </Link>
  );
}