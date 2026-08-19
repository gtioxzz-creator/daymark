import { ArrowUpRight, Check, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { verseFor } from "@/lib/seed";
import { decideDay } from "@/lib/decide";
import { eventsOn } from "@/lib/recur";
import { debtTotal, tasksForDay, useDaymark } from "@/lib/store";
import {
  addDays,
  formatTime,
  greeting,
  localISO,
  money,
  parseDate,
  relativeDay,
  tzAbbrev,
  weekContaining,
  weekdayTiny,
  wholeMoney,
} from "@/lib/time";
import { useClock } from "@/lib/clock";
import { cn } from "@/lib/utils";

export function TodayView() {
  const now = useClock();
  const today = localISO(now);
  const [viewDate, setViewDate] = useState(today);
  const followToday = useRef(true);
  const tasks = useDaymark((s) => s.tasks);
  const completed = useDaymark((s) => s.completedTasks);
  const events = useDaymark((s) => s.events);
  const habits = useDaymark((s) => s.habits);
  const notes = useDaymark((s) => s.notes);
  const debts = useDaymark((s) => s.debts);
  const balance = useDaymark((s) => s.accountBalance);
  const quickNote = useDaymark((s) => s.quickNote);
  const setQuickNote = useDaymark((s) => s.setQuickNote);
  const toggleTask = useDaymark((s) => s.toggleTask);
  const toggleHabit = useDaymark((s) => s.toggleHabit);
  const openModal = useDaymark((s) => s.openModal);
  const closedDays = useDaymark((s) => s.closedDays);
  const closeDay = useDaymark((s) => s.closeDay);
  const profileName = useDaymark((s) => s.settings.name);
  const place = useDaymark((s) => s.settings.place);

  useEffect(() => {
    if (followToday.current) setViewDate(today);
  }, [today]);

  function selectDate(date: string) {
    followToday.current = date === today;
    setViewDate(date);
  }

  const view = parseDate(viewDate);
  const isToday = viewDate === today;
  const [verse, ref] = verseFor(viewDate);
  const dayEvents = eventsOn(events, viewDate);
  const list = tasksForDay({ tasks, completedTasks: completed }, viewDate, today);
  const openTasks = list.filter((task) => !task.done);
  const progress = ((now.getHours() * 60 + now.getMinutes()) / 1440) * 100;
  const week = weekContaining(viewDate);
  const habitDone = habits.filter((h) => h.history.includes(viewDate)).length;
  const zone = tzAbbrev(now);
  const move = decideDay({
    now,
    viewDate,
    tasks: openTasks,
    events,
    habits,
    debts,
    balance,
    closedDays,
  });

  const upcoming = isToday
    ? (dayEvents.find((event) => event.endTime > `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`) ?? null)
    : (dayEvents[0] ?? null);

  const clock = useMemo(
    () =>
      now.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
    [now],
  );

  const kicker = isToday
    ? profileName
      ? `${greeting(now.getHours())}, ${profileName}`
      : greeting(now.getHours())
    : relativeDay(viewDate, today);

  return (
    <div className="pt-5 md:pt-8">
      <a
        href="/Daymark-complete.zip"
        download="Daymark-complete.zip"
        className="mb-4 flex items-center justify-between gap-4 rounded-xl bg-ink px-5 py-4 text-paper"
      >
        <span>
          <span className="kicker text-mark">Download</span>
          <span className="mt-1 block font-display text-xl">Daymark-complete.zip</span>
        </span>
        <span className="shrink-0 text-sm text-mark">Click here →</span>
      </a>
      <section className="panel grid gap-8 rounded-xl px-5 py-6 md:px-8 md:py-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.95fr)] lg:gap-16">
        <div className="min-w-0">
          <p className="kicker">{kicker}</p>
          <h1 className="mt-3 font-display text-5xl leading-[0.92] tracking-tight md:text-display">
            {view.toLocaleDateString("en-US", { weekday: "long" })}
            <span className="text-mist">.</span>
          </h1>
          <p className="mt-4 text-base text-mist">
            {view.toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
            {isToday ? ". Keep the day simple." : "."}
          </p>
          {!isToday && (
            <button
              type="button"
              onClick={() => selectDate(today)}
              className="mt-3 kicker text-mark hover:text-ink"
            >
              Return to today
            </button>
          )}
          <blockquote className="mt-8 border-l border-mark/70 pl-5">
            <p className="font-display text-lg leading-snug text-ink/90 italic md:text-xl">
              {verse}
            </p>
            <cite className="kicker mt-3 block not-italic">{ref}</cite>
          </blockquote>

          <button
            type="button"
            onClick={() => {
              if (move.kind === "faith" && move.habitId) toggleHabit(move.habitId, viewDate);
              else if (move.kind === "task" && move.taskId) toggleTask(move.taskId);
              else if (move.kind === "event" || move.kind === "leave") {
                openModal({ type: "event", id: move.eventId });
              } else if (move.kind === "money") openModal({ type: "payment", debtId: move.debtId });
              else if (move.kind === "close") {
                openModal({ type: "note" });
                closeDay(today);
              } else if (move.kind === "mark") openModal({ type: "event", date: "2026-08-26" });
            }}
            className="mt-8 max-w-sm rounded-lg bg-raised px-4 py-4 text-left shadow-[var(--shadow-inset)]"
          >
            <p className="kicker text-mark">{move.kicker}</p>
            <p className="mt-2 font-display text-xl leading-snug">{move.title}</p>
            <p className="mt-2 text-xs leading-relaxed text-mist">{move.detail}</p>
          </button>
        </div>

        <div className="flex min-h-[260px] flex-col justify-between rounded-lg bg-raised px-6 py-6 shadow-[var(--shadow-inset)]">
          <div className="flex items-center justify-between">
            <span className="kicker">{isToday ? "Local time" : "This hour"}</span>
            <span className="flex items-center gap-2 kicker text-mark">
              <i className="live-dot size-1.5 rounded-full bg-mark" />
              {zone}
            </span>
          </div>
          <p className="mt-8 font-display text-6xl leading-none tracking-tight tabular-nums md:text-7xl">
            {clock}
          </p>
          <div className="mt-8">
            <div className="flex justify-between font-mono text-[10px] text-mist">
              <span>{place || "Local"}</span>
              <span>
                {isToday
                  ? `${Math.round(progress)}% of day`
                  : `${dayEvents.length} on the day`}
              </span>
            </div>
            <div className="mt-3 h-px overflow-hidden bg-rule">
              <div
                className="h-full bg-mark transition-[width] duration-500"
                style={{ width: `${isToday ? progress : 100}%` }}
              />
            </div>
            <div className="mt-6 flex items-end justify-between gap-4">
              <div className="min-w-0">
                <p className="kicker">
                  {upcoming
                    ? viewDate < today
                      ? "On the day"
                      : "Next on the day"
                    : "The board"}
                </p>
                <p className="mt-1.5 truncate font-display text-lg leading-snug">
                  {upcoming
                    ? `${formatTime(upcoming.time)} · ${upcoming.title}`
                    : `${openTasks.length} open · ${dayEvents.length} events`}
                </p>
              </div>
              <span className="shrink-0 font-mono text-[10px] text-mist">
                {habitDone}/{habits.length} habits
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-2 flex items-center gap-1">
        <button
          type="button"
          aria-label="Previous week"
          onClick={() => selectDate(addDays(-7, view))}
          className="grid size-10 shrink-0 place-items-center text-mist hover:text-ink"
        >
          <ChevronLeft className="size-4" />
        </button>
        <div className="flex min-w-0 flex-1 gap-1 overflow-x-auto py-3">
          {week.map((date) => {
            const d = new Date(`${date}T12:00:00`);
            const has = events.some((event) => event.date === date);
            const selected = date === viewDate;
            const thisIsToday = date === today;
            return (
              <button
                key={date}
                type="button"
                onClick={() => selectDate(date)}
                className="flex min-w-12 flex-1 flex-col items-center gap-2 py-2"
              >
                <span className="kicker">{weekdayTiny(date)}</span>
                <span
                  className={cn(
                    "grid size-10 place-items-center rounded-full text-sm transition-colors",
                    selected && "bg-ink text-paper",
                    !selected && thisIsToday && "shadow-[inset_0_0_0_1px_var(--color-mark)]",
                    !selected && !thisIsToday && has && "shadow-[inset_0_-2px_0_var(--color-mark)]",
                  )}
                >
                  {d.getDate()}
                </span>
              </button>
            );
          })}
        </div>
        <button
          type="button"
          aria-label="Next week"
          onClick={() => selectDate(addDays(7, view))}
          className="grid size-10 shrink-0 place-items-center text-mist hover:text-ink"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.85fr)]">
        <section className="panel rounded-xl p-6 md:p-7">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="kicker">Up next</p>
              <h2 className="mt-2 font-display text-3xl">
                {openTasks.length === 0 ? "Clear" : `${openTasks.length} to do`}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => openModal({ type: "task", date: viewDate })}
              className="kicker text-mist hover:text-ink"
            >
              Add task
            </button>
          </div>
          <div className="mt-6">
            {list.length === 0 ? (
              <p className="rounded-md border border-dashed border-rule px-4 py-10 text-center text-sm text-mist">
                {viewDate < today
                  ? "Nothing was listed for this day."
                  : "Nothing is listed for this day."}
              </p>
            ) : (
              list.slice(0, 8).map((task) => (
                <div
                  key={task.id}
                  className={cn(
                    "flex items-center gap-3 border-t border-rule/80 py-4",
                    task.done && "opacity-50",
                  )}
                >
                  <button
                    type="button"
                    aria-label={task.done ? "Reopen task" : "Complete task"}
                    onClick={() => toggleTask(task.id)}
                    className={cn(
                      "grid size-6 shrink-0 place-items-center rounded-full shadow-[inset_0_0_0_1px_var(--color-rule)]",
                      task.done && "bg-mark text-mark-ink shadow-none",
                    )}
                  >
                    {task.done && <Check className="size-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => openModal({ type: "task", id: task.id })}
                    className="min-w-0 flex-1 text-left"
                  >
                    <span className={cn("block text-sm", task.done && "line-through")}>
                      {task.name}
                    </span>
                    <span className="mt-0.5 block text-xs text-mist">
                      {task.category}
                      {task.meta ? ` · ${task.meta}` : ""}
                    </span>
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="mt-10 flex items-end justify-between border-t border-rule/80 pt-8">
            <div>
              <p className="kicker">On the calendar</p>
              <h3 className="mt-2 font-display text-3xl">The day</h3>
            </div>
            <button
              type="button"
              onClick={() => openModal({ type: "event", date: viewDate })}
              className="kicker text-mist hover:text-ink"
            >
              Add event
            </button>
          </div>
          <div className="mt-4">
            {dayEvents.length === 0 ? (
              <p className="rounded-md border border-dashed border-rule px-4 py-10 text-center text-sm text-mist">
                {viewDate < today
                  ? "Nothing was on the calendar."
                  : "Nothing is on the calendar."}
              </p>
            ) : (
              dayEvents.map((event) => (
                <button
                  key={event.id}
                  type="button"
                  onClick={() => openModal({ type: "event", id: event.id })}
                  className="flex w-full items-center gap-4 border-t border-rule/80 py-5 text-left transition-colors hover:bg-raised/40"
                >
                  <span className="w-16 shrink-0 font-mono text-xs text-mark">
                    {formatTime(event.time)}
                  </span>
                  <span className="size-1.5 rounded-full bg-mark" />
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-lg leading-snug">
                      {event.title}
                    </span>
                    <span className="mt-1 block text-xs text-mist">
                      {event.category}
                      {event.location ? ` · ${event.location}` : ""}
                      {event.endTime
                        ? ` · ${formatTime(event.time)}–${formatTime(event.endTime)}`
                        : ""}
                    </span>
                  </span>
                  <ArrowUpRight className="size-4 text-faint" />
                </button>
              ))
            )}
          </div>
        </section>

        <div className="flex flex-col gap-4">
          <section className="panel rounded-xl p-6">
            <div className="flex items-end justify-between">
              <div>
                <p className="kicker">Habits</p>
                <h2 className="mt-2 font-display text-2xl">
                  {habitDone} of {habits.length}
                </h2>
              </div>
              <Link to="/habits" className="kicker text-mist hover:text-ink">
                All
              </Link>
            </div>
            <div className="mt-5 space-y-1">
              {habits.map((habit) => {
                const done = habit.history.includes(viewDate);
                return (
                  <button
                    key={habit.id}
                    type="button"
                    onClick={() => toggleHabit(habit.id, viewDate)}
                    className="flex w-full items-center gap-3 rounded-md py-2 text-left hover:bg-raised"
                  >
                    <span
                      className={cn(
                        "grid size-6 place-items-center rounded-full shadow-[inset_0_0_0_1px_var(--color-rule)]",
                        done && "bg-ink text-paper shadow-none",
                      )}
                    >
                      {done && <Check className="size-3.5" />}
                    </span>
                    <span className="text-sm">{habit.name}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="panel-moss rounded-xl p-6">
            <p className="kicker">Ledger</p>
            <p className="mt-3 font-display text-4xl tracking-tight tabular-nums">
              {money(balance)}
            </p>
            <p className="mt-1 text-xs text-mist">
              {wholeMoney(debtTotal(debts))} still owed
            </p>
            <div className="mt-5 flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                className="flex-1"
                onClick={() => openModal({ type: "transaction" })}
              >
                <Plus className="size-3.5" />
                Transaction
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => openModal({ type: "payment" })}
              >
                Pay debt
              </Button>
            </div>
          </section>

          <section className="panel-sun rounded-xl p-6">
            <div className="flex items-end justify-between">
              <p className="kicker">Scratch</p>
              <Link to="/journal" className="kicker text-mist hover:text-ink">
                Journal
              </Link>
            </div>
            <textarea
              value={quickNote}
              onChange={(event) => setQuickNote(event.target.value)}
              placeholder="A line for later…"
              className="mt-4 min-h-24 w-full resize-none bg-transparent font-display text-lg leading-relaxed outline-none placeholder:text-faint"
            />
            {notes[0] && (
              <button
                type="button"
                onClick={() => openModal({ type: "note", id: notes[0]!.id })}
                className="mt-2 w-full border-t border-rule pt-4 text-left"
              >
                <span className="block text-sm">{notes[0].title}</span>
                <span className="mt-1 block line-clamp-2 text-xs text-mist">
                  {notes[0].text}
                </span>
              </button>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
