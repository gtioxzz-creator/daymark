export type ThemeName = "darkwood" | "parchment";

export type TaskCategory =
  | "Personal"
  | "Work"
  | "Money"
  | "Home"
  | "School"
  | "Health"
  | "Errand"
  | "Faith";

export type EventCategory =
  | "Personal"
  | "Work"
  | "Family"
  | "School"
  | "Health"
  | "Home"
  | "Travel"
  | "Faith"
  | "Other";

export type NoteColor = "sage" | "ink" | "clay" | "dusk";

export type TransactionType = "income" | "expense";

export type Task = {
  id: number;
  name: string;
  meta: string;
  category: TaskCategory;
  done: boolean;
  completedAt: string | null;
  due: string | null;
};

export type Recurrence = "none" | "weekly" | "weekdays";

export type CalendarEvent = {
  id: number;
  title: string;
  date: string;
  time: string;
  endTime: string;
  category: EventCategory;
  location: string;
  recur?: Recurrence;
};

export type Note = {
  id: number;
  title: string;
  text: string;
  dateLabel: string;
  createdAt: string;
  color: NoteColor;
};

export type Habit = {
  id: number;
  name: string;
  icon: "cross" | "sun" | "move" | "book" | "water" | "moon" | "leaf";
  history: string[];
};

export type Debt = {
  id: number;
  name: string;
  amount: number;
  paid: number;
  rate: string;
};

export type LedgerEntry = {
  id: number;
  name: string;
  amount: number;
  type: TransactionType;
  category: string;
  source: string;
  at: string;
};

export type Settings = {
  sound: boolean;
  theme: ThemeName;
  name: string;
  initials: string;
  place: string;
};

export type DaymarkState = {
  profileVersion: number;
  tasks: Task[];
  completedTasks: Task[];
  events: CalendarEvent[];
  notes: Note[];
  habits: Habit[];
  debts: Debt[];
  transactions: LedgerEntry[];
  accountBalance: number;
  settings: Settings;
  quickNote: string;
  closedDays: string[];
};

export type ModalKind =
  | { type: "none" }
  | { type: "task"; id?: number; initial?: string; date?: string }
  | { type: "event"; id?: number; date?: string; time?: string; endTime?: string }
  | { type: "note"; id?: number }
  | { type: "habit"; id?: number }
  | { type: "transaction" }
  | { type: "payment"; debtId?: number }
  | { type: "history" }
  | { type: "settled" }
  | { type: "settings" }
  | { type: "profile" }
  | { type: "search" }
  | { type: "completed" };

export const TASK_CATEGORIES: TaskCategory[] = [
  "Personal",
  "Work",
  "Money",
  "Home",
  "School",
  "Health",
  "Errand",
  "Faith",
];

export const EVENT_CATEGORIES: EventCategory[] = [
  "Personal",
  "Work",
  "Family",
  "School",
  "Health",
  "Home",
  "Travel",
  "Faith",
  "Other",
];

export const TRANSACTION_CATEGORIES = [
  "Work",
  "Food",
  "Home",
  "Transport",
  "Health",
  "Debt payment",
  "Gift",
  "Other",
] as const;

export const HABIT_ICONS = [
  "cross",
  "sun",
  "move",
  "book",
  "water",
  "moon",
  "leaf",
] as const;
