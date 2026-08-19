import {
  addDays as dfAddDays,
  format,
  parseISO,
  startOfWeek,
  differenceInCalendarDays,
} from "date-fns";

export function dateOnly(value: string, fallback = ""): string {
  const match = String(value || "").match(/\d{4}-\d{2}-\d{2}/);
  return match?.[0] ?? (fallback || localISO());
}

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
  const wrapped = ((total % 1440) + 1440) % 1440;
  const hours = Math.floor(wrapped / 60);
  const minutes = wrapped % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function daysBetween(from: string, to: string): number {
  return differenceInCalendarDays(parseDate(to), parseDate(from));
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

export function remainingParts(target: Date, now: Date) {
  const ms = Math.max(0, target.getTime() - now.getTime());
  const total = Math.floor(ms / 1000);
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

export function atLocal(iso: string, time = "00:00"): Date {
  return new Date(`${iso}T${time}:00`);
}

export function formatRemain(parts: ReturnType<typeof remainingParts>): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${parts.days}d  ${pad(parts.hours)}h  ${pad(parts.minutes)}m  ${pad(parts.seconds)}s`;
}

export const CAL_START_HOUR = 0;
export const CAL_END_HOUR = 24;
export const CAL_HOUR_PX = 56;
export const CAL_SNAP = 15;

export function snapMinutes(mins: number, snap = CAL_SNAP): number {
  return Math.round(mins / snap) * snap;
}

export function clampCalendarMinutes(mins: number): number {
  const start = CAL_START_HOUR * 60;
  const end = CAL_END_HOUR * 60;
  return Math.min(end, Math.max(start, mins));
}

export function eventTop(time: string): number {
  return ((minutesFromMidnight(time) - CAL_START_HOUR * 60) / 60) * CAL_HOUR_PX;
}

export function eventHeight(start: string, end: string): number {
  const span = Math.max(
    CAL_SNAP,
    minutesFromMidnight(end) - minutesFromMidnight(start),
  );
  return (span / 60) * CAL_HOUR_PX;
}

export function lastNDates(n: number, from = new Date()): string[] {
  return Array.from({ length: n }, (_, i) => addDays(-(n - 1 - i), from));
}

export function habitStreak(history: string[], today = localISO()): number {
  const set = new Set(history);
  let date = parseDate(today);
  if (!set.has(today)) date = dfAddDays(date, -1);
  let streak = 0;
  while (set.has(localISO(date))) {
    streak += 1;
    date = dfAddDays(date, -1);
  }
  return streak;
}

export function pct(part: number, whole: number): number {
  if (!whole) return 0;
  return Math.min(100, Math.round((part / whole) * 100));
}
