import { useMemo } from "react";
import { useClock } from "@/lib/clock";
import { decideDay } from "@/lib/decide";
import { LIFE } from "@/lib/life";
import { eventsOn, expandEvents } from "@/lib/recur";
import { tasksForDay, useDaymark } from "@/lib/store";
import {
  atLocal,
  formatDate,
  formatRemain,
  formatTime,
  localISO,
  remainingParts,
  weekContaining,
} from "@/lib/time";
import { cn } from "@/lib/utils";

export type AskKind = "week" | "today" | "advise" | "answer";

export function wantsAsk(query: string): AskKind {
  if (/this week|my week|the week look/.test(query.toLowerCase())) return "week";
  return "today";
}

export function Ahead() {
  const now = useClock();
  const debts = useDaymark((s) => s.debts);
  const gabriel = debts.find((d) => /gabriel/i.test(d.name) && d.paid < d.amount);
  const items = [
    { k: "Rent due", at: atLocal(LIFE.rentDue) },
    { k: "Anniversary with Joy", at: atLocal(LIFE.anniversary, "19:00") },
    gabriel ? { k: "Pay Gabriel", at: atLocal(localISO(now), "23:59") } : null,
    { k: "Civic oil change", at: atLocal(LIFE.oilDue) },
  ]
    .filter(Boolean)
    .map((item) => {
      const row = item as { k: string; at: Date };
      return { ...row, parts: remainingParts(row.at, now) };
    })
    .filter((item) => item.parts.days > 0);

  if (items.length === 0) return null;

  return (
    <div className="mt-10 grid gap-5 border-t border-rule pt-6 sm:grid-cols-2">
      {items.map((item, i) => (
        <div key={item.k} className="ask-day" style={{ animationDelay: `${280 + i * 40}ms` }}>
          <p className="kicker text-mark">{item.k}</p>
          <p className="mt-2 font-mono text-[12px] tabular-nums tracking-[0.06em] text-ink/80">
            {formatRemain(item.parts)}
          </p>
        </div>
      ))}
    </div>
  );
}

export function AdviseCard({
  verdict,
  reply,
}: {
  verdict: "do" | "dont" | "careful" | "";
  reply: string;
}) {
  const word =
    verdict === "do" ? "Yes." : verdict === "dont" ? "No." : verdict === "careful" ? "Easy." : "Listen.";
  const lines = reply.split(/\n+/).filter(Boolean);
  return (
    <div>
      <p className="kicker text-mark">Counsel</p>
      <p
        className={cn(
          "ask-day mt-4 font-sans text-5xl font-medium leading-[0.88] tracking-[-0.045em]",
          verdict === "dont" && "text-danger",
          verdict === "do" && "text-mark",
        )}
        style={{ animationDelay: "40ms" }}
      >
        {word}
      </p>
      {lines.length > 0 && (
        <div className="ask-day mt-8 max-w-xl space-y-5" style={{ animationDelay: "120ms" }}>
          {lines.map((line) => (
            <p key={line} className="text-[17px] font-light leading-[1.55] tracking-[-0.01em] text-ink/85">
              {line}
            </p>
          ))}
        </div>
      )}
      <Ahead />
    </div>
  );
}

export function AskBriefing({
  kind,
  today,
  first,
  why,
  answer,
  showAhead,
}: {
  kind: "week" | "today";
  today: string;
  first?: string;
  why?: string;
  answer?: string;
  showAhead?: boolean;
}) {
  const showStrip = showAhead !== false;
  const now = new Date();
  const events = useDaymark((s) => s.events);
  const tasks = useDaymark((s) => s.tasks);
  const completed = useDaymark((s) => s.completedTasks);
  const habits = useDaymark((s) => s.habits);
  const debts = useDaymark((s) => s.debts);
  const balance = useDaymark((s) => s.accountBalance);
  const closedDays = useDaymark((s) => s.closedDays);
  const move = decideDay({
    now,
    viewDate: today,
    tasks: tasks.filter((t) => !t.done),
    events,
    habits,
    debts,
    balance,
    closedDays,
  });

  const raw = (answer || "").trim();
  const head = (first || "").trim();
  let rest = raw;
  if (head && rest.toLowerCase().startsWith(head.toLowerCase())) {
    rest = rest.slice(head.length).replace(/^[\s.,;:!?—-]+/, "");
  }
  const lines = rest.split(/\n+/).map((line) => line.trim()).filter(Boolean);
  const headline = head || lines[0] || move.title;
  const support = (head ? lines : lines.slice(1)).filter((line) => line && line !== headline);

  const dayEvents = eventsOn(events, today).sort((a, b) =>
    (a.time || "").localeCompare(b.time || ""),
  );
  const dayTasks = tasksForDay({ tasks, completedTasks: completed }, today, today).filter(
    (t) => !t.done,
  );

  const week = weekContaining(today);
  const span = useMemo(
    () => expandEvents(events, week[0]!, week[6]!),
    [events, week],
  );

  if (kind === "week") {
    return (
      <div>
        <div className="space-y-5">
          {week.map((date, index) => {
            const ev = span
              .filter((e) => e.date === date)
              .sort((a, b) => (a.time || "").localeCompare(b.time || ""));
            const tk = tasksForDay(
              { tasks, completedTasks: completed },
              date,
              today,
            ).filter((t) => !t.done);
            return (
              <div
                key={date}
                className="ask-day grid grid-cols-[3.5rem_1fr] gap-4"
                style={{ animationDelay: `${80 + index * 40}ms` }}
              >
                <div>
                  <p className={cn("kicker", date === today && "text-mark")}>
                    {formatDate(date, "EEE")}
                  </p>
                  <p className="mt-1 font-display text-xl leading-none text-mist">
                    {date.slice(8)}
                  </p>
                </div>
                <div className="min-w-0 pt-0.5">
                  {ev.length + tk.length === 0 ? (
                    <p className="text-sm text-faint">Open</p>
                  ) : (
                    <ul className="space-y-2">
                      {ev.map((e) => (
                        <li key={`${e.id}-${e.date}`} className="text-sm">
                          {formatTime(e.time)} · {e.title}
                        </li>
                      ))}
                      {tk.map((t) => (
                        <li key={t.id} className="text-sm text-mist">
                          {t.name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {showStrip && <Ahead />}
      </div>
    );
  }

  return (
    <div>
      <div
        className="ask-day rounded-lg bg-raised px-6 py-7 text-center shadow-[var(--shadow-inset)]"
        style={{ animationDelay: "80ms" }}
      >
        <p className="kicker text-mark">Hey sir · {formatDate(today, "EEEE")}</p>
        <p className="mx-auto mt-4 max-w-xl font-display text-[1.85rem] leading-[1.15] tracking-[-0.03em]">
          {headline}
        </p>
        {support.length > 0 && (
          <div className="mx-auto mt-5 max-w-lg space-y-3">
            {support.map((line) => (
              <p
                key={line}
                className="text-[16px] font-light leading-[1.55] tracking-[-0.01em] text-mist"
              >
                {line}
              </p>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <section className="ask-day min-w-0" style={{ animationDelay: "160ms" }}>
          <p className="kicker">Events</p>
          {dayEvents.length === 0 ? (
            <p className="mt-4 text-sm text-faint">None on the clock</p>
          ) : (
            <ul className="mt-4">
              {dayEvents.map((event) => (
                <li
                  key={`${event.id}-${event.date}`}
                  className="grid grid-cols-[4.5rem_1fr] gap-3 border-t border-rule/80 py-3 first:border-t-0"
                >
                  <span className="pt-0.5 font-mono text-[11px] text-mark">
                    {formatTime(event.time)}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm">{event.title}</span>
                    <span className="mt-1 block font-mono text-[10px] text-mist">
                      {[event.location, event.endTime ? `until ${formatTime(event.endTime)}` : ""]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="ask-day min-w-0" style={{ animationDelay: "220ms" }}>
          <p className="kicker">Tasks</p>
          {dayTasks.length === 0 ? (
            <p className="mt-4 text-sm text-faint">Clear</p>
          ) : (
            <ul className="mt-4">
              {dayTasks.map((task) => (
                <li key={task.id} className="border-t border-rule/80 py-3 first:border-t-0">
                  <span className="block text-sm">{task.name}</span>
                  {(task.meta || task.due) && (
                    <span className="mt-1 block font-mono text-[10px] text-mist">
                      {task.due ? formatDate(task.due, "MMM d") : ""}
                      {task.due && task.meta ? " · " : ""}
                      {task.meta}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
      {showStrip && <Ahead />}
    </div>
  );
}
