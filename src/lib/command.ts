import { addDays, dateOnly, formatTime, localISO, timeFromMinutes } from "./time";

export type AskCommand =
  | { type: "add-task"; name: string; due?: string; meta?: string }
  | { type: "add-event"; title: string; date: string; time: string; endTime: string }
  | { type: "move-event"; query: string; date?: string; time?: string; endTime?: string }
  | { type: "delete-event"; query: string }
  | { type: "complete-task"; query: string }
  | { type: "reopen-task"; query: string }
  | { type: "delete-task"; query: string }
  | { type: "toggle-habit"; query: string }
  | { type: "income"; amount: number; name: string }
  | { type: "pay-debt"; query: string; amount?: number }
  | { type: "add-note"; title: string; text: string }
  | { type: "patch-settings"; name?: string; place?: string; sound?: boolean; theme?: "darkwood" | "parchment" }
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

function parseClear(lower: string): AskCommand | null {
  const queryFrom = (raw: string) =>
    raw
      .replace(/\b(out|already|too|today|him|it|with|please|can you|uncheck|undo)\b/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  if (/\b(uncheck|undo|reopen|put back|didn'?t|did not|not done|don'?t mark)\b/.test(lower)) {
    let query = "";
    if (/trash/.test(lower)) query = "trash";
    else {
      const named = lower.match(
        /(?:uncheck|undo|reopen)\s+(?:the\s+)?(.+)$|(?:didn'?t|did not)\s+(?:take |do |finish )?(.+)$/,
      );
      query = queryFrom(named?.[1] || named?.[2] || "");
    }
    if (query) return { type: "reopen-task", query };
  }

  if (/^(can|should|could|may|what|when|do i|how|why)\b/.test(lower)) return null;
  const money = /\b(paid|payed)\b/.test(lower) && !/got paid|paycheck/.test(lower);
  const done =
    /\b(took|finished|completed|cleared|handled|already did|is done|is out|took care)\b/.test(
      lower,
    );
  if (!money && !done) return null;

  const named =
    lower.match(
      /(?:paid|finished with|took care of|cleared|did|took|finished|completed|handled)\s+(?:off\s+)?(?:the\s+)?(.+?)(?:\s+out)?(?:\s+already)?$/,
    ) ?? lower.match(/(.+?)\s+(?:is|was)\s+(?:done|out|finished|paid)/);
  let query = queryFrom(named?.[1] ?? "");
  if (/trash/.test(lower)) query = "trash";
  if (/gabe|gabriel/.test(query) || /gabe|gabriel/.test(lower)) query = "gabriel";
  if (!query) return null;

  if (money || (/gabriel|gabe|rent/.test(query) && !/trash/.test(query))) {
    return { type: "pay-debt", query };
  }
  return { type: "complete-task", query };
}

function parseNeed(lower: string, now: Date): AskCommand | null {
  const asksToCreate =
    /\b(add|put|schedule|remind me|create|set(?: up)?|block off|pencil in|write down)\b/.test(
      lower,
    ) ||
    /\b(i need to|i have to|i gotta|need to|have to|don'?t forget to)\b/.test(lower);
  if (!asksToCreate) return null;
  if (/^(can i|should i|could i|may i|what|when|do i|how|why)\b/.test(lower)) return null;

  const wantsEvent =
    /\b(event|block|shift|on my (week|calendar)|on the (week|calendar))\b/.test(lower);

  let rest = lower
    .replace(/^(hey |so |please |ok |okay |can you |could you )+/, "")
    .replace(
      /^(add|put|schedule|create|set(?: up)?|block off|pencil in|write down|remind me to|i need to|i have to|i gotta|need to|have to|don'?t forget to)\s+/,
      "",
    )
    .replace(/^(this |a |an |the |to )+/, "")
    .replace(/\b(to my (list|tasks|day|week|calendar)|on my (list|tasks|day|week|calendar)|on the (week|calendar))\b/g, "")
    .trim();

  const due =
    /\btomorrow\b/.test(lower)
      ? addDays(1, now)
      : parseDay(
          lower.match(
            /\b(today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/,
          )?.[1] ?? "",
          now,
        ) || localISO(now);

  const timeRaw = rest.match(
    /\bat\s+(\d{1,2}(?::\d{2})?\s*(?:a\.?m\.?|p\.?m\.?)?)|(\d{1,2}(?::\d{2})?\s*(?:a\.?m\.?|p\.?m\.?))/,
  );
  const stamp = (timeRaw?.[1] || timeRaw?.[2] || "").replace(/\s+/g, "").replace(/\./g, "");
  const time = stamp ? parseTimeish(stamp) : null;
  rest = rest
    .replace(/\bat\s+\d{1,2}(?::\d{2})?\s*(?:a\.?m\.?|p\.?m\.?)?/gi, "")
    .replace(/\b\d{1,2}(?::\d{2})?\s*(?:a\.?m\.?|p\.?m\.?)/gi, "")
    .replace(/\b(today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/g, "")
    .replace(/\b(task|event|block)\b/g, "")
    .replace(/[?.!]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!rest || rest.length < 2) return null;
  const name = rest.charAt(0).toUpperCase() + rest.slice(1);

  if (wantsEvent && time) {
    const [h, m] = time.split(":").map(Number);
    return {
      type: "add-event",
      title: name,
      date: due,
      time,
      endTime: timeFromMinutes((h ?? 12) * 60 + (m ?? 0) + 60),
    };
  }

  return {
    type: "add-task",
    name,
    due,
    meta: time ? formatTime(time) : "",
  };
}

export function normalizeAction(raw: unknown, now = new Date()): AskCommand | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const type = String(row.type ?? "")
    .toLowerCase()
    .replace(/_/g, "-");
  const str = (key: string) => {
    const value = row[key];
    return typeof value === "string" ? value.trim() : "";
  };
  if (type === "add-task" || type === "create-task") {
    const name = str("name") || str("title") || str("task");
    if (!name) return null;
    const time = parseTimeish(str("time").replace(/\s+/g, "")) || parseTimeish(str("meta").replace(/\s+/g, ""));
    return {
      type: "add-task",
      name,
      due: parseDay(str("due") || str("date"), now) || localISO(now),
      meta: time ? formatTime(time) : str("meta"),
    };
  }
  if (type === "add-event" || type === "create-event") {
    const title = str("title") || str("name");
    if (!title) return null;
    const time =
      parseTimeish(str("time").replace(/\s+/g, "")) ||
      parseTimeish(str("start").replace(/\s+/g, "")) ||
      "12:00";
    const [h, m] = time.split(":").map(Number);
    const end =
      parseTimeish(str("endTime").replace(/\s+/g, "")) ||
      parseTimeish(str("end").replace(/\s+/g, "")) ||
      timeFromMinutes((h ?? 12) * 60 + (m ?? 0) + 60);
    return {
      type: "add-event",
      title,
      date: dateOnly(parseDay(str("date"), now) || localISO(now)),
      time,
      endTime: end,
    };
  }
  if (type === "complete-task" || type === "reopen-task" || type === "delete-task" || type === "pay-debt" || type === "toggle-habit" || type === "delete-event" || type === "move-event") {
    return row as AskCommand;
  }
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

  const clear = parseClear(lower);
  if (clear) return clear;

  const need = parseNeed(lower, now);
  if (need) return need;

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

  const move = q.match(
    /(?:can i |could i |please )?(?:move|put|shift|reschedule)\s+(?:the\s+)?(.+?)\s+(?:to|for|on)\s+(.+)$/i,
  );
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
    case "delete-event":
      return `Delete event · ${command.query}`;
    case "delete-task":
      return `Delete task · ${command.query}`;
    case "add-note":
      return `Journal · ${command.title}`;
    case "patch-settings":
      return "Update settings";
    case "complete-task":
      return `Complete · ${command.query}`;
    case "reopen-task":
      return `Reopen · ${command.query}`;
    case "toggle-habit":
      return `Mark · ${command.query}`;
    case "income":
      return `Log ${command.amount} in`;
    case "pay-debt":
      return `Pay ${command.query} ${command.amount ?? ""}`.trim();
    default:
      return "Search";
  }
}

export function matchName<T extends { name?: string; title?: string }>(
  items: T[],
  query: string,
): T | undefined {
  const q = query.toLowerCase();
  const tokens = q.split(/\s+/).filter((token) => token.length > 3);
  return (
    items.find((item) => (item.name ?? item.title ?? "").toLowerCase() === q) ??
    items.find((item) => (item.name ?? item.title ?? "").toLowerCase().includes(q)) ??
    items.find((item) => {
      const name = (item.name ?? item.title ?? "").toLowerCase();
      return tokens.some((token) => name.includes(token));
    })
  );
}
