import type { CalendarEvent, Recurrence } from "./types";
import { addDays, dateOnly, daysBetween, parseDate } from "./time";

export function inferRecur(title: string, existing?: Recurrence): Recurrence {
  if (existing && existing !== "none") return existing;
  const t = title.toLowerCase();
  if (t.includes("bulla") || t.includes("food runner")) return "weekly";
  if (t.includes("chemistry")) return "weekly";
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
    if (!event?.date) continue;
    const stamp = dateOnly(event.date);
    const time = event.time || "09:00";
    const endTime = event.endTime || time;
    const recur = event.recur ?? "none";
    if (recur === "none") {
      if (stamp >= from && stamp <= to) out.push({ ...event, date: stamp, time, endTime });
      continue;
    }
    const weekday = parseDate(stamp).getDay();
    for (let i = 0; i <= span; i += 1) {
      const date = addDays(i, parseDate(from));
      const day = parseDate(date).getDay();
      const match =
        recur === "weekly"
          ? day === weekday
          : day >= 1 && day <= 5;
      if (match) out.push({ ...event, date, time, endTime });
    }
  }
  return out.sort(
    (a, b) =>
      (a.date || "").localeCompare(b.date || "") ||
      (a.time || "").localeCompare(b.time || ""),
  );
}

export function eventsOn(events: CalendarEvent[], date: string): CalendarEvent[] {
  return expandEvents(events, date, date);
}
