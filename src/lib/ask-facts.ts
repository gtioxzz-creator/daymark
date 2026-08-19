import { expandEvents } from "./recur";
import type { CalendarEvent } from "./types";
import { addDays, formatDate, formatTime, localISO, minutesFromMidnight } from "./time";

const WEEKDAYS: Record<string, number> = {
  sunday: 0,
  sun: 0,
  monday: 1,
  mon: 1,
  tuesday: 2,
  tue: 2,
  tues: 2,
  wednesday: 3,
  wed: 3,
  thursday: 4,
  thu: 4,
  thur: 4,
  thurs: 4,
  friday: 5,
  fri: 5,
  saturday: 6,
  sat: 6,
};

export function foldAsk(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/tom+o+r+o+w/g, "tomorrow")
    .replace(/\b(tmrw|tmw|tomrw|tomorow|tommorow)\b/g, "tomorrow")
    .replace(/\btonite\b/g, "tonight")
    .replace(/\bthur+s?day\b/g, "thursday")
    .replace(/\bwensday\b/g, "wednesday")
    .replace(/\s+/g, " ")
    .trim();
}

export function dayFromAsk(message: string, now = new Date()): string | null {
  const text = foldAsk(message);
  if (/\btoday\b|\btonight\b|\bthis morning\b/.test(text)) return localISO(now);
  if (/\btomorrow\b/.test(text)) return addDays(1, now);
  const next = /\bnext\b/.test(text);
  for (const [name, want] of Object.entries(WEEKDAYS)) {
    if (!new RegExp(`\\b${name}\\b`).test(text)) continue;
    const date = new Date(now);
    let delta = (want - date.getDay() + 7) % 7;
    if (delta === 0) delta = next ? 7 : 0;
    else if (next) delta += 7;
    return addDays(delta, now);
  }
  return null;
}

export function resolveDate(
  message: string,
  now = new Date(),
  previous?: string,
): string {
  return dayFromAsk(message, now) || previous || localISO(now);
}

export function isDayBoard(message: string): boolean {
  const text = foldAsk(message);
  if (/\b(can i|should i|could i|move|uncheck)\b/.test(text)) return false;
  return /on my plate|what('s|s)? on|what do i have|have to do|my day|agenda|what about|how about/.test(
    text,
  );
}

function onDate(events: CalendarEvent[], date: string) {
  return expandEvents(events, date, date).sort((a, b) =>
    (a.time || "").localeCompare(b.time || ""),
  );
}

function isWork(event: CalendarEvent) {
  return event.category === "Work" || /bulla|shift|runner|busser/i.test(event.title);
}

function askedMinutes(text: string): number | null {
  const mer = text.match(/\b(\d{1,2})(?::(\d{2}))\s*(am|pm)\b|\b(\d{1,2})\s*(am|pm)\b/);
  if (!mer) return null;
  if (mer[1]) {
    let hours = Number(mer[1]);
    const minutes = Number(mer[2] ?? 0);
    const suffix = mer[3];
    if (suffix === "pm" && hours < 12) hours += 12;
    if (suffix === "am" && hours === 12) hours = 0;
    return hours * 60 + minutes;
  }
  let hours = Number(mer[4]);
  const suffix = mer[5];
  if (suffix === "pm" && hours < 12) hours += 12;
  if (suffix === "am" && hours === 12) hours = 0;
  return hours * 60;
}

export function workAnswer(
  message: string,
  events: CalendarEvent[],
  now = new Date(),
): string | null {
  const date = dayFromAsk(message, now);
  if (!date) return null;
  const work = onDate(events, date).filter(isWork);
  const label = formatDate(date, "EEEE");
  if (!/work|shift|bulla|off/.test(foldAsk(message))) return null;
  if (work.length === 0) return `No. You’re off ${label}.`;
  const first = work[0]!;
  return `Yes. ${first.title} ${formatTime(first.time)}–${formatTime(first.endTime)}.`;
}

export function moveCounsel(targetDate: string, events: CalendarEvent[]): string {
  const day = onDate(events, targetDate);
  const label = formatDate(targetDate, "EEEE");
  const work = day.find(isWork);
  if (work) return `${label} has ${work.title} at ${formatTime(work.time)}. Keep it off the shift.`;
  if (day.length === 0) return `${label} is open.`;
  return `${label} already has ${day.length} on it.`;
}

export type LocalCounsel = {
  date: string;
  first: string;
  reply: string;
};

export function liveCounsel(
  message: string,
  events: CalendarEvent[],
  now = new Date(),
  date: string,
): LocalCounsel {
  const text = foldAsk(message);
  const day = onDate(events, date);
  const work = day.find(isWork);
  const label = formatDate(date, "EEEE");
  const clock = askedMinutes(text);
  const list = day.map((event) => `${event.title} at ${formatTime(event.time)}`).join(", ");

  if (/can i|should i|could i|take .+ out|see (her|joy)|eat|burger|girl|party|date/.test(text)) {
    if (work) {
      const start = minutesFromMidnight(work.time);
      const overlaps =
        clock != null && clock >= start - 45 && clock < minutesFromMidnight(work.endTime);
      if (overlaps) {
        return {
          date,
          first: `No. ${label} is ${formatTime(work.time)}.`,
          reply: `No, sir. Not at that hour. ${work.title} runs ${formatTime(work.time)} to ${formatTime(work.endTime)}. See her after, or another time.`,
        };
      }
      if (clock != null && clock < start - 45) {
        return {
          date,
          first: `Yes, then Bulla.`,
          reply: `Yes, sir. That hour is free. ${work.title} is at ${formatTime(work.time)}. Leave in time. You may stay the night after.`,
        };
      }
      return {
        date,
        first: `After ${formatTime(work.time)}.`,
        reply: `Yes, sir — after the shift. ${work.title} is ${formatTime(work.time)} to ${formatTime(work.endTime)}. Go to her when it ends. Stay the night if you wish.`,
      };
    }
    return {
      date,
      first: `${label} is open.`,
      reply: list
        ? `Yes, sir. ${label} only has ${list}. Keep it inexpensive. Rent remains the hill.`
        : `Yes, sir. ${label} is clear. Go. Keep it inexpensive.`,
    };
  }

  if (/do i work|am i (working|off)|have a shift/.test(text)) {
    if (!work) return { date, first: `You’re off ${label}.`, reply: `No shift on the books ${label}.` };
    return {
      date,
      first: `Yes. ${formatTime(work.time)}–${formatTime(work.endTime)}.`,
      reply: `${work.title}, ${formatTime(work.time)} to ${formatTime(work.endTime)}.`,
    };
  }

  if (day.length === 0) {
    return { date, first: `${label} is open.`, reply: `Nothing on the clock ${label}.` };
  }

  return { date, first: day[0]!.title, reply: `${label}: ${list}.` };
}
