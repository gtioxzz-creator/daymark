import { LIFE } from "./life";

export type Desk = {
  today: string;
  tomorrow: string;
  focus: string;
  now: string;
  balance: number;
  tasks: { name: string; due: string | null }[];
  done: string[];
  events: { label: string; title: string; start: string; end: string }[];
  debts: { name: string; left: number }[];
  memories: string[];
  thread: string;
};

export const FILE_NAMES = ["today", "week", "tasks", "money", "people", "memory"] as const;
export type FileName = (typeof FILE_NAMES)[number];

export function isFileName(value: string): value is FileName {
  return (FILE_NAMES as readonly string[]).includes(value);
}

export function readDesk(name: FileName, ctx: Desk): string {
  switch (name) {
    case "today": {
      const iso = ctx.focus.slice(0, 10);
      const rows = ctx.events
        .filter((event) => event.label.startsWith(iso))
        .map((event) => `- ${event.start}–${event.end} ${event.title}`);
      const tasks = ctx.tasks
        .filter((task) => !task.due || task.due === iso)
        .map((task) => `- ${task.name}${task.due ? ` · ${task.due}` : ""}`);
      return `# Today\n${ctx.focus}\n\n## Events\n${rows.join("\n") || "None."}\n\n## Tasks\n${tasks.join("\n") || "None."}`;
    }
    case "week":
      return `# Week\nToday: ${ctx.today}\nTomorrow: ${ctx.tomorrow}\n\n${ctx.events.map((event) => `- ${event.label} ${event.start}–${event.end} ${event.title}`).join("\n") || "Nothing on the week."}`;
    case "tasks":
      return `# Tasks\nOpen:\n${ctx.tasks.map((task) => `- ${task.name}${task.due ? ` · due ${task.due}` : ""}`).join("\n") || "None."}\n\nDone:\n${ctx.done.map((name) => `- ${name}`).join("\n") || "None."}`;
    case "money":
      return `# Money\nBalance: ${ctx.balance}\n\nDebts:\n${ctx.debts.map((debt) => `- ${debt.name}: ${debt.left} left`).join("\n") || "None."}\n\nRent ${LIFE.rentTarget} due ${LIFE.rentDue}.`;
    case "people":
      return `# People\nJavier. Home ${LIFE.home}. Works ${LIFE.role} at ${LIFE.work} in ${LIFE.workCity}. Drive about ${LIFE.driveMinutes} minutes.\nJoy — girlfriend. Anniversary ${LIFE.anniversary}.\nKathy — sister. Gabriel — Kathy's boyfriend.\nMom lives in Tampa.`;
    case "memory":
      return `# Memory\n${ctx.memories.map((line) => `- ${line}`).join("\n") || "Empty."}${ctx.thread ? `\n\nRecent:\n${ctx.thread}` : ""}`;
    default:
      return "Unknown file.";
  }
}
