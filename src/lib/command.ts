import { addDays, localISO, timeFromMinutes } from "./time";

export type AskCommand =
  | { type: "add-task"; name: string; due?: string }
  | { type: "add-event"; title: string; date: string; time: string; endTime: string }
  | { type: "move-event"; query: string; date?: string; time?: string }
  | { type: "complete-task"; query: string }
  | { type: "toggle-habit"; query: string }
  | { type: "income"; amount: number; name: string }
  | { type: "pay-debt"; query: string; amount: number }
  | { type: "search"; query: string };

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

function nextWeekday(name: string, from = new Date()): string {
  const want = WEEKDAYS[name.toLowerCase()];
  if (want == null) return localISO(from);
  const date = new Date(from);
  const delta = (want - date.getDay() + 7) % 7;
  return addDays(delta === 0 ? 0 : delta, date);
}

export function parseTimeish(raw: string): string | null {
  const text = raw.trim().toLowerCase().replace(/\s+/g, "");
  const mer = text.match(/^(\d{1,2})(?::(\d{2}))?(am|pm)$/);
  if (mer) {
    let hours = Number(mer[1]);
    const minutes = Number(mer[2] ?? 0);
    const suffix = mer[3];
    if (suffix === "pm" && hours < 12) hours += 12;
    if (suffix === "am" && hours === 12) hours = 0;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  }
  const clock = text.match(/^(\d{1,2}):(\d{2})$/);
  if (clock) {
    return `${String(Number(clock[1])).padStart(2, "0")}:${clock[2]}`;
  }
  const hourOnly = text.match(/^(\d{1,2})$/);
  if (hourOnly) {
    let hours = Number(hourOnly[1]);
    if (hours <= 7) hours += 12;
    return `${String(hours).padStart(2, "0")}:00`;
  }
  return null;
}

function parseDay(raw: string, now = new Date()): string | null {
  const text = raw.trim().toLowerCase();
  if (text === "today") return localISO(now);
  if (text === "tomorrow") return addDays(1, now);
  if (text === "yesterday") return addDays(-1, now);
  if (WEEKDAYS[text] != null) return nextWeekday(text, now);
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  return null;
}

export function parseCommand(input: string, now = new Date()): AskCommand {
  const q = input.trim();
  const lower = q.toLowerCase();

  const paid = lower.match(
    /^(?:i\s+)?(?:got\s+)?paid\s+\$?\s*(\d+(?:\.\d{1,2})?)|^paycheck\s+\$?\s*(\d+(?:\.\d{1,2})?)/,
  );
  if (paid) {
    return { type: "income", amount: Number(paid[1] || paid[2]), name: "Paycheck" };
  }

  const pay = lower.match(/^pay\s+([a-z]+)\s+\$?\s*(\d+(?:\.\d{1,2})?)/);
  if (pay) {
    return { type: "pay-debt", query: pay[1]!, amount: Number(pay[2]) };
  }

  const addTask = q.match(/^(?:add|new)\s+task\s+(.+)/i);
  if (addTask) return { type: "add-task", name: addTask[1]!.trim(), due: localISO(now) };

  const addEvent = q.match(/^(?:add|new)\s+(?:event|block)\s+(.+?)(?:\s+(?:at|@)\s+(.+))?$/i);
  if (addEvent) {
    const time = parseTimeish(addEvent[2] ?? "10") ?? "10:00";
    const [h, m] = time.split(":").map(Number);
    return {
      type: "add-event",
      title: addEvent[1]!.trim(),
      date: localISO(now),
      time,
      endTime: timeFromMinutes((h ?? 10) * 60 + (m ?? 0) + 60),
    };
  }

  const move = q.match(/^(?:move|put|shift)\s+(.+?)\s+to\s+(.+)$/i);
  if (move) {
    const rest = move[2]!.trim();
    const parts = rest.split(/\s+/);
    let date: string | undefined;
    let time: string | undefined;
    for (const part of parts) {
      date = parseDay(part, now) ?? date;
      time = parseTimeish(part) ?? time;
    }
    return { type: "move-event", query: move[1]!.trim(), date, time };
  }

  if (/^trash is done$/i.test(q)) {
    return { type: "complete-task", query: "trash" };
  }

  const done = q.match(/^(?:complete|done|finish|check off)\s+(.+)$/i);
  if (done) return { type: "complete-task", query: done[1]!.trim() };

  const habit = q.match(/^(?:mark|did)\s+(.+)$/i);
  if (habit) return { type: "toggle-habit", query: habit[1]!.trim() };

  return { type: "search", query: q };
}

export function commandLabel(command: AskCommand): string {
  switch (command.type) {
    case "add-task":
      return `Add task · ${command.name}`;
    case "add-event":
      return `Add event · ${command.title}`;
    case "move-event":
      return `Move ${command.query}`;
    case "complete-task":
      return `Complete · ${command.query}`;
    case "toggle-habit":
      return `Mark · ${command.query}`;
    case "income":
      return `Log ${command.amount} in`;
    case "pay-debt":
      return `Pay ${command.query} ${command.amount}`;
    default:
      return "Search";
  }
}

export function matchName<T extends { name?: string; title?: string }>(
  items: T[],
  query: string,
): T | undefined {
  const q = query.toLowerCase();
  return (
    items.find((item) => (item.name ?? item.title ?? "").toLowerCase() === q) ??
    items.find((item) => (item.name ?? item.title ?? "").toLowerCase().includes(q))
  );
}
