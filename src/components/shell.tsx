import { Link, useRouterState } from "@tanstack/react-router";
import {
  BookOpen,
  CalendarDays,
  CircleDollarSign,
  ListChecks,
  Settings,
  Sun,
  SunMedium,
} from "lucide-react";
import { useEffect } from "react";
import { AccountMenu } from "./account-menu";
import { AskBar } from "./ask-bar";
import { DaymarkLockup } from "./mark";
import { useDaymark } from "@/lib/store";
import { tzAbbrev } from "@/lib/time";
import { useClock } from "@/lib/clock";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Today", icon: SunMedium, match: (p: string) => p === "/" },
  { to: "/week", label: "Week", icon: CalendarDays, match: (p: string) => p.startsWith("/week") },
  { to: "/tasks", label: "Tasks", icon: ListChecks, match: (p: string) => p.startsWith("/tasks") },
  { to: "/journal", label: "Journal", icon: BookOpen, match: (p: string) => p.startsWith("/journal") },
  { to: "/habits", label: "Habits", icon: Sun, match: (p: string) => p.startsWith("/habits") },
  { to: "/money", label: "Ledger", icon: CircleDollarSign, match: (p: string) => p.startsWith("/money") },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const theme = useDaymark((s) => s.settings.theme);
  const openModal = useDaymark((s) => s.openModal);
  const taskCount = useDaymark((s) => s.tasks.length);
  const place = useDaymark((s) => s.settings.place);
  const now = useClock();
  const headerDay = now.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const zone = tzAbbrev(now);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return (
    <div className="min-h-dvh bg-paper text-ink">
      <div className="flex min-h-dvh">
        <aside className="sticky top-0 hidden h-dvh w-[248px] shrink-0 flex-col border-r border-rule px-5 py-7 md:flex">
          <Link to="/" className="mb-12 block px-2">
            <DaymarkLockup />
          </Link>
          <nav className="flex flex-1 flex-col gap-1">
            {NAV.map((item) => {
              const Icon = item.icon;
              const active = item.match(pathname);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex h-11 items-center gap-3 rounded-md px-3 text-sm text-mist transition-colors hover:bg-raised/80 hover:text-ink",
                    active && "bg-raised text-ink",
                  )}
                >
                  <Icon className={cn("size-4", active && "text-mark")} />
                  <span>{item.label}</span>
                  {item.to === "/tasks" && taskCount > 0 && (
                    <span className="ml-auto font-mono text-[10px] text-mist">
                      {taskCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto border-t border-rule pt-4">
            <button
              type="button"
              onClick={() => openModal({ type: "settings" })}
              className="flex h-11 w-full items-center gap-3 rounded-md px-3 text-sm text-mist transition-colors hover:bg-raised hover:text-ink"
            >
              <Settings className="size-4" />
              Settings
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-[64px] items-center gap-2 border-b border-rule px-3 md:grid md:h-[72px] md:grid-cols-[1fr_minmax(200px,520px)_1fr] md:gap-3 md:px-8">
            <p className="kicker hidden min-w-0 truncate md:block">
              {place || "Daymark"}
              <span className="mx-3 text-rule">/</span>
              <span className="text-mark">{headerDay}</span>
              <span className="mx-3 text-rule">/</span>
              {zone}
            </p>
            <Link to="/" className="shrink-0 md:hidden">
              <DaymarkLockup compact />
            </Link>
            <div className="min-w-0 flex-1 md:contents">
              <AskBar />
            </div>
            <div className="flex justify-end">
              <AccountMenu />
            </div>
          </header>
          <main className="mx-auto w-full max-w-[1320px] flex-1 px-3 pb-28 md:px-8 md:pb-16">
            {children}
          </main>
        </div>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-rule bg-paper/95 px-1 py-1.5 pb-[max(0.4rem,env(safe-area-inset-bottom))] backdrop-blur-md md:hidden">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = item.match(pathname);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex min-h-11 flex-1 flex-col items-center justify-center gap-1 text-[10px] text-mist",
                active && "text-ink",
              )}
            >
              <Icon className={cn("size-4", active && "text-mark")} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
