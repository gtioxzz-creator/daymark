import {
  addDays as dfAddDays,
  format,
  parseISO,
  startOfWeek,
  differenceInCalendarDays,
} from "date-fns";

export function localISO(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function addDays(amount: number, date: Date = new Date()): string {
  return localISO(dfAddDays(date, amount));
}

export function parseDate(value: string): Date {
  return parseISO(`${value}T12:00:00`);
}

export function formatDate(
  value: string,
  pattern = "EEE, MMM d",
): string {
  return format(parseDate(value), pattern);
}

export function formatTime(value?: string): string {
  if (!value) return "";
  const [hours, minutes] = value.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return value;
  const suffix = hours >= 12 ? "PM" : "AM";
  const hour = hours % 12 || 12;
  return `${hour}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

export function formatTimeCompact(value?: string): string {
  if (!value) return "";
  const [hours, minutes] = value.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return value;
  const hour = hours % 12 || 12;
  return minutes === 0 ? `${hour}` : `${hour}:${String(minutes).padStart(2, "0")}`;
}

export function formatTimeSpan(start: string, end: string): string {
  return `${formatTimeCompact(start)}–${formatTimeCompact(end)}`;
}

export function weekdayTiny(iso: string): string {
  return ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"][parseDate(iso).getDay()] ?? "";
}

export function minutesFromMidnight(value: string): number {
  const [hours, minutes] = value.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return 0;
  return hours * 60 + minutes;
}

export function timeFromMinutes(total: number): string {
  const clamped = Math.max(0, Math.min(24 * 60 - 1, total));
  const hours = Math.floor(clamped / 60);
  const minutes = clamped % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function snapMinutes(total: number, step = 15): number {
  return Math.round(total / step) * step;
}

export function greeting(hour: number): string {
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 17) return "Good afternoon";
  if (hour >= 17 && hour < 21) return "Good evening";
  return "Good night";
}

export function tzAbbrev(date: Date = new Date()): string {
  const part = new Intl.DateTimeFormat("en-US", { timeZoneName: "short" })
    .formatToParts(date)
    .find((item) => item.type === "timeZoneName");
  return part?.value ?? "";
}

export function weekDates(offset = 0, now = new Date()): string[] {
  return weekContaining(addDays(offset * 7, now));
}

export function weekContaining(iso: string): string[] {
  const base = startOfWeek(parseDate(iso), { weekStartsOn: 0 });
  return Array.from({ length: 7 }, (_, i) => localISO(dfAddDays(base, i)));
}

export function relativeDay(iso: string, today = localISO()): string {
  const diff = daysBetween(today, iso);
  if (diff === 0) return "Today";
  if (diff === -1) return "Yesterday";
  if (diff === 1) return "Tomorrow";
  if (diff < 0) return `${Math.abs(diff)} days ago`;
  return `In ${diff} days`;
}

export function money(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value || 0);
}

export function wholeMoney(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export function pct(part: number, whole: number): number {
  return whole > 0 ? Math.round((part / whole) * 100) : 0;
}

export function lastNDates(n: number, end = new Date()): string[] {
  return Array.from({ length: n }, (_, i) => addDays(-(n - 1 - i), end));
}

export function habitStreak(history: string[], today = localISO()): number {
  const set = new Set(history);
  let cursor = today;
  if (!set.has(cursor)) {
    cursor = addDays(-1, parseDate(today));
  }
  let n = 0;
  while (set.has(cursor)) {
    n += 1;
    cursor = addDays(-1, parseDate(cursor));
  }
  return n;
}

export function daysBetween(a: string, b: string): number {
  return differenceInCalendarDays(parseDate(b), parseDate(a));
}

export const CAL_START_HOUR = 0;
export const CAL_END_HOUR = 24;
export const CAL_HOUR_PX = 64;
export const CAL_SNAP = 15;

export function eventTop(time: string): number {
  return ((minutesFromMidnight(time) - CAL_START_HOUR * 60) / 60) * CAL_HOUR_PX;
}

export function eventHeight(time: string, endTime: string): number {
  const start = minutesFromMidnight(time);
  const end = Math.max(start + CAL_SNAP, minutesFromMidnight(endTime));
  return Math.max(((end - start) / 60) * CAL_HOUR_PX, 22);
}

export function clampCalendarMinutes(mins: number): number {
  const min = CAL_START_HOUR * 60;
  const max = CAL_END_HOUR * 60;
  return Math.max(min, Math.min(max, mins));
}
