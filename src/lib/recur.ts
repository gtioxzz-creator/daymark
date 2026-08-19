import type { CalendarEvent, Recurrence } from "./types";
import { addDays, daysBetween, parseDate } from "./time";

export function inferRecur(title: string, existing?: Recurrence): Recurrence {
  if (existing && existing !== "none") return existing;
  const t = title.toLowerCase();
  if (t.includes("bulla") || t.includes("food runner")) return "weekly";
  if (t.includes("chemistry")) return "weekdays";
  if (t.includes("evening with joy")) return "weekly";
  return existing ?? "none";
}

export function expandEvents(
  events: CalendarEvent[],
  from: string,
  to: string,
): CalendarEvent[] {
  const out: CalendarEvent[] = [];
  const span = Math.max(0, daysBetween(from, to));
  for (const event of events) {
    const recur = event.recur ?? "none";
    if (recur === "none") {
      if (event.date >= from && event.date <= to) out.push(event);
      continue;
    }
    const weekday = parseDate(event.date).getDay();
    for (let i = 0; i <= span; i += 1) {
      const date = addDays(i, parseDate(from));
      const day = parseDate(date).getDay();
      const match =
        recur === "weekly"
          ? day === weekday
          : day >= 1 && day <= 5;
      if (match) out.push({ ...event, date });
    }
  }
  return out.sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
}

export function eventsOn(events: CalendarEvent[], date: string): CalendarEvent[] {
  return expandEvents(events, date, date);
}
