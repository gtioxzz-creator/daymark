import { useEffect, useMemo, useRef, useState } from "react";
import type { CalendarEvent } from "@/lib/types";
import {
  CAL_END_HOUR,
  CAL_HOUR_PX,
  CAL_SNAP,
  CAL_START_HOUR,
  clampCalendarMinutes,
  eventHeight,
  eventTop,
  formatTimeSpan,
  localISO,
  minutesFromMidnight,
  snapMinutes,
  timeFromMinutes,
} from "@/lib/time";
import { cn } from "@/lib/utils";

const HOURS = Array.from(
  { length: CAL_END_HOUR - CAL_START_HOUR },
  (_, i) => CAL_START_HOUR + i,
);

type DragMode = "move" | "resize-start" | "resize-end";

type DragState = {
  id: number;
  mode: DragMode;
  originY: number;
  startMins: number;
  endMins: number;
  date: string;
  moved: boolean;
};

type Draft = {
  id: number;
  date: string;
  time: string;
  endTime: string;
};

function categoryTone(category: string) {
  const key = category.toLowerCase();
  if (key.includes("school")) return "school";
  if (key.includes("family") || key.includes("health")) return "warm";
  if (key.includes("work")) return "work";
  return "calm";
}

function overlaps(a: CalendarEvent, b: CalendarEvent) {
  if (a.date !== b.date) return false;
  const as = minutesFromMidnight(a.time);
  const ae = minutesFromMidnight(a.endTime);
  const bs = minutesFromMidnight(b.time);
  const be = minutesFromMidnight(b.endTime);
  return as < be && bs < ae;
}

function layoutDay(events: CalendarEvent[]) {
  const sorted = [...events].sort(
    (a, b) => minutesFromMidnight(a.time) - minutesFromMidnight(b.time),
  );
  const columns: CalendarEvent[][] = [];
  const colOf = new Map<number, number>();
  for (const event of sorted) {
    let col = 0;
    while (columns[col]?.some((other) => overlaps(other, event))) col += 1;
    if (!columns[col]) columns[col] = [];
    columns[col].push(event);
    colOf.set(event.id, col);
  }
  const clusterWidth = new Map<number, number>();
  for (const event of sorted) {
    const cluster = sorted.filter((other) => overlaps(event, other) || other.id === event.id);
    const maxCol = Math.max(...cluster.map((item) => colOf.get(item.id) ?? 0));
    clusterWidth.set(event.id, maxCol + 1);
  }
  return { colOf, clusterWidth };
}

function hoursLabel(hour: number) {
  const suffix = hour >= 12 ? "PM" : "AM";
  const h = hour % 12 || 12;
  return `${h} ${suffix}`;
}

export function WeekCalendar({
  dates,
  events,
  now,
  onMove,
  onSelect,
  onCreate,
}: {
  dates: string[];
  events: CalendarEvent[];
  now: Date;
  onMove: (id: number, date: string, time: string, endTime: string) => void;
  onSelect: (id: number) => void;
  onCreate: (date: string, time: string) => void;
}) {
  const today = localISO(now);
  const boardRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const draftRef = useRef<Draft | null>(null);
  const ignoreClickRef = useRef(false);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);

  const nowTop = useMemo(() => {
    const mins = now.getHours() * 60 + now.getMinutes();
    return eventTop(timeFromMinutes(mins));
  }, [now]);

  function dateFromClientX(clientX: number): string | null {
    const root = boardRef.current;
    if (!root) return null;
    const days = [...root.querySelectorAll<HTMLElement>("[data-cal-day]")];
    if (!days.length) return null;
    let nearest = days[0]!;
    let nearestDist = Infinity;
    for (const day of days) {
      const box = day.getBoundingClientRect();
      if (clientX >= box.left && clientX <= box.right) return day.dataset.calDay ?? null;
      const dist = Math.min(Math.abs(clientX - box.left), Math.abs(clientX - box.right));
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = day;
      }
    }
    return nearest.dataset.calDay ?? null;
  }

  function applyDraft(next: Draft) {
    draftRef.current = next;
    setDraft(next);
  }

  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;
    const hour = Math.max(CAL_START_HOUR, Math.min(now.getHours(), CAL_END_HOUR - 3));
    root.scrollTop = Math.max(0, (hour - CAL_START_HOUR) * CAL_HOUR_PX - 16);
  }, [dates[0], now.getHours()]);

  useEffect(() => {
    dragRef.current = drag;
  }, [drag]);

  useEffect(() => {
    if (!drag) return;

    const onMovePtr = (event: PointerEvent) => {
      const current = dragRef.current;
      if (!current) return;
      const deltaMins = snapMinutes(
        ((event.clientY - current.originY) / CAL_HOUR_PX) * 60,
        CAL_SNAP,
      );
      const nextDate =
        current.mode === "move" ? (dateFromClientX(event.clientX) ?? current.date) : current.date;

      if (current.mode === "move") {
        const duration = current.endMins - current.startMins;
        const start = clampCalendarMinutes(snapMinutes(current.startMins + deltaMins));
        const end = Math.min(CAL_END_HOUR * 60, start + duration);
        applyDraft({
          id: current.id,
          date: nextDate,
          time: timeFromMinutes(start),
          endTime: timeFromMinutes(Math.max(start + CAL_SNAP, end)),
        });
      } else if (current.mode === "resize-end") {
        const end = clampCalendarMinutes(
          snapMinutes(Math.max(current.startMins + CAL_SNAP, current.endMins + deltaMins)),
        );
        applyDraft({
          id: current.id,
          date: current.date,
          time: timeFromMinutes(current.startMins),
          endTime: timeFromMinutes(end),
        });
      } else {
        const start = clampCalendarMinutes(
          snapMinutes(Math.min(current.endMins - CAL_SNAP, current.startMins + deltaMins)),
        );
        applyDraft({
          id: current.id,
          date: current.date,
          time: timeFromMinutes(start),
          endTime: timeFromMinutes(current.endMins),
        });
      }

      if (!current.moved) {
        const next = { ...current, moved: true };
        dragRef.current = next;
        setDrag(next);
      }
    };

    const onUp = () => {
      const current = dragRef.current;
      const live = draftRef.current;
      if (current?.moved && live) {
        ignoreClickRef.current = true;
        onMove(live.id, live.date, live.time, live.endTime);
      }
      dragRef.current = null;
      draftRef.current = null;
      setDrag(null);
      setDraft(null);
    };

    window.addEventListener("pointermove", onMovePtr);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMovePtr);
      window.removeEventListener("pointerup", onUp);
    };
  }, [drag, onMove]);

  function beginDrag(
    event: React.PointerEvent,
    item: CalendarEvent,
    mode: DragMode,
  ) {
    event.stopPropagation();
    event.preventDefault();
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    const next: DragState = {
      id: item.id,
      mode,
      originY: event.clientY,
      startMins: minutesFromMidnight(item.time),
      endMins: minutesFromMidnight(item.endTime),
      date: item.date,
      moved: false,
    };
    const live: Draft = {
      id: item.id,
      date: item.date,
      time: item.time,
      endTime: item.endTime,
    };
    dragRef.current = next;
    draftRef.current = live;
    setDrag(next);
    setDraft(live);
  }

  const liveEvents = events.map((event) =>
    draft && draft.id === event.id ? { ...event, ...draft } : event,
  );

  return (
    <div ref={boardRef} className="relative min-w-[860px]">
      {draft && drag?.moved && (
        <div className="pointer-events-none absolute top-3 left-1/2 z-40 -translate-x-1/2">
          <span className="rounded-full bg-ink px-3 py-1 font-mono text-[11px] tracking-wide text-paper shadow-[var(--shadow-lift)]">
            {formatTimeSpan(draft.time, draft.endTime)}
          </span>
        </div>
      )}
      <div ref={scrollRef} className="max-h-[680px] overflow-y-auto">
        <div className="sticky top-0 z-30 grid grid-cols-[64px_repeat(7,minmax(0,1fr))] border-b border-rule/80 bg-card/90 backdrop-blur-md">
          <div />
          {dates.map((date) => {
            const isToday = date === today;
            return (
              <div
                key={date}
                className={cn("border-l border-rule/80 px-3 py-3", isToday && "bg-mark/10")}
              >
                <p className="kicker">
                  {new Date(`${date}T12:00:00`).toLocaleDateString("en-US", {
                    weekday: "short",
                  })}
                </p>
                <p
                  className={cn(
                    "mt-1 font-display text-2xl leading-none",
                    isToday && "text-mark",
                  )}
                >
                  {new Date(`${date}T12:00:00`).getDate()}
                </p>
              </div>
            );
          })}
        </div>

        <div className="relative grid grid-cols-[64px_repeat(7,minmax(0,1fr))]">
          <div>
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="relative border-t border-rule pr-2 text-right"
                style={{ height: CAL_HOUR_PX }}
              >
                <span className="kicker relative -top-2 text-faint">{hoursLabel(hour)}</span>
              </div>
            ))}
          </div>

          {dates.map((date) => {
            const dayEvents = liveEvents.filter((event) => event.date === date);
            const { colOf, clusterWidth } = layoutDay(dayEvents);
            return (
              <div
                key={date}
                data-cal-day={date}
                className={cn("relative border-l border-rule/80", date === today && "bg-mark/5")}
                style={{ height: HOURS.length * CAL_HOUR_PX }}
                onDoubleClick={(event) => {
                  const box = (event.currentTarget as HTMLElement).getBoundingClientRect();
                  const mins = clampCalendarMinutes(
                    snapMinutes(
                      CAL_START_HOUR * 60 + ((event.clientY - box.top) / CAL_HOUR_PX) * 60,
                    ),
                  );
                  onCreate(date, timeFromMinutes(mins));
                }}
                onClick={(event) => {
                  if (event.target !== event.currentTarget) return;
                  if (ignoreClickRef.current) {
                    ignoreClickRef.current = false;
                    return;
                  }
                  const box = event.currentTarget.getBoundingClientRect();
                  const mins = clampCalendarMinutes(
                    snapMinutes(
                      CAL_START_HOUR * 60 + ((event.clientY - box.top) / CAL_HOUR_PX) * 60,
                    ),
                  );
                  onCreate(date, timeFromMinutes(mins));
                }}
              >
                {HOURS.map((hour) => (
                  <div
                    key={hour}
                    className="pointer-events-none border-t border-rule/80"
                    style={{ height: CAL_HOUR_PX }}
                  />
                ))}
                {date === today && nowTop >= 0 && nowTop <= HOURS.length * CAL_HOUR_PX && (
                  <div
                    className="pointer-events-none absolute right-0 left-0 z-20 flex items-center"
                    style={{ top: nowTop }}
                  >
                    <span className="size-2 -ml-1 rounded-full bg-mark" />
                    <span className="h-px flex-1 bg-mark" />
                  </div>
                )}
                {dayEvents.map((event) => {
                  const col = colOf.get(event.id) ?? 0;
                  const cols = clusterWidth.get(event.id) ?? 1;
                  const width = 100 / cols;
                  const left = col * width;
                  const dragging = drag?.id === event.id;
                  return (
                    <button
                      key={`${event.id}-${date}`}
                      type="button"
                      onClick={(ev) => {
                        ev.stopPropagation();
                        if (ignoreClickRef.current) {
                          ignoreClickRef.current = false;
                          return;
                        }
                        onSelect(event.id);
                      }}
                      onPointerDown={(ev) => beginDrag(ev, event, "move")}
                      className={cn(
                        "group cal-chip absolute z-10 touch-none overflow-hidden rounded-sm px-2 py-1.5 text-left shadow-[var(--shadow-border)]",
                        "cursor-grab active:cursor-grabbing hover:brightness-110",
                        dragging && "z-30 cursor-grabbing brightness-110",
                        categoryTone(event.category) === "school" && "cal-chip-school",
                        categoryTone(event.category) === "warm" && "cal-chip-warm",
                        categoryTone(event.category) === "work" && "cal-chip-work",
                      )}
                      style={{
                        top: eventTop(event.time),
                        height: eventHeight(event.time, event.endTime),
                        left: `calc(${left}% + 4px)`,
                        width: `calc(${width}% - 8px)`,
                      }}
                    >
                      <span
                        onPointerDown={(ev) => beginDrag(ev, event, "resize-start")}
                        className="absolute inset-x-0 top-0 z-10 flex h-2.5 cursor-ns-resize items-start justify-center"
                      >
                        <i className="mt-0.5 h-0.5 w-7 rounded-full bg-ink/0 transition-colors group-hover:bg-ink/35" />
                      </span>
                      <span className="block truncate pr-0.5 font-medium text-[12px] leading-tight">
                        {event.title}
                      </span>
                      {eventHeight(event.time, event.endTime) >= 44 && (
                        <span className="mt-0.5 block font-mono text-[10px] leading-none text-mist">
                          {formatTimeSpan(event.time, event.endTime)}
                        </span>
                      )}
                      <span
                        onPointerDown={(ev) => beginDrag(ev, event, "resize-end")}
                        className="absolute inset-x-0 bottom-0 z-10 flex h-2.5 cursor-ns-resize items-end justify-center"
                      >
                        <i className="mb-0.5 h-0.5 w-7 rounded-full bg-ink/0 transition-colors group-hover:bg-ink/35" />
                      </span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
