import type { DaymarkState } from "./types";
import { addDays, localISO } from "./time";

const today = localISO();

export const verses: [string, string][] = [
  [
    "The Lord is my strength and my shield; my heart trusted in him, and I am helped.",
    "Psalm 28:7",
  ],
  [
    "I can do all things through Christ which strengtheneth me.",
    "Philippians 4:13",
  ],
  [
    "Commit thy works unto the Lord, and thy thoughts shall be established.",
    "Proverbs 16:3",
  ],
  ["The Lord shall fight for you, and ye shall hold your peace.", "Exodus 14:14"],
  [
    "Trust in the Lord with all thine heart; and lean not unto thine own understanding.",
    "Proverbs 3:5",
  ],
  ["Let all that you do be done in love.", "1 Corinthians 16:14"],
  [
    "Be strong and of a good courage, fear not, nor be afraid.",
    "Deuteronomy 31:6",
  ],
];

export function verseFor(date = today): [string, string] {
  const index = Math.floor(new Date(`${date}T00:00:00`).getTime() / 86400000);
  return verses[((index % verses.length) + verses.length) % verses.length]!;
}

function habitHistory(days: number, includeToday: boolean): string[] {
  const out: string[] = [];
  const start = includeToday ? 0 : 1;
  for (let i = start; i < start + days; i += 1) {
    out.push(addDays(-i));
  }
  return out;
}

export const PROFILE = {
  name: "Javier Cruz Rivas",
  first: "Javier",
  initials: "JV",
  place: "Spring Hill, Florida",
  with: "with Joy",
};

export const emptyState: DaymarkState = {
  profileVersion: 6,
  tasks: [],
  completedTasks: [],
  events: [],
  notes: [],
  habits: [],
  debts: [],
  transactions: [],
  accountBalance: 0,
  settings: { sound: true, theme: "darkwood", name: "", initials: "", place: "" },
  quickNote: "",
  closedDays: [],
};

export const seed: DaymarkState = {
  profileVersion: 6,
  tasks: [
    {
      id: 101,
      name: "Check in about Gabriel’s $100",
      meta: "Due today",
      category: "Money",
      done: false,
      completedAt: null,
      due: today,
    },
    {
      id: 102,
      name: "Set aside $400 for September rent",
      meta: "Due Sep 1",
      category: "Money",
      done: false,
      completedAt: null,
      due: "2026-09-01",
    },
    {
      id: 103,
      name: "Ask Joy about anniversary ideas",
      meta: "Wednesday, Aug 26",
      category: "Home",
      done: false,
      completedAt: null,
      due: "2026-08-26",
    },
    {
      id: 104,
      name: "Take the trash out",
      meta: "Around 3 PM",
      category: "Home",
      done: false,
      completedAt: null,
      due: addDays(-1),
    },
  ],
  completedTasks: [],
  events: [
    {
      id: 201,
      title: "Food runner shift at Bulla",
      date: today,
      time: "17:30",
      endTime: "21:00",
      category: "Work",
      location: "Tampa",
      recur: "weekly",
    },
    {
      id: 202,
      title: "Chemistry study block",
      date: today,
      time: "10:00",
      endTime: "11:30",
      category: "School",
      location: "Home",
      recur: "weekdays",
    },
    {
      id: 205,
      title: "Evening with Joy",
      date: addDays(-1),
      time: "19:00",
      endTime: "20:30",
      category: "Personal",
      location: "Spring Hill",
      recur: "weekly",
    },
    {
      id: 203,
      title: "Kathy appointment",
      date: addDays(7),
      time: "13:30",
      endTime: "15:00",
      category: "Family",
      location: "Dale Mabry Family Medicine",
      recur: "none",
    },
    {
      id: 204,
      title: "Anniversary with Joy",
      date: "2026-08-26",
      time: "19:00",
      endTime: "21:30",
      category: "Personal",
      location: "Spring Hill",
      recur: "none",
    },
  ],
  notes: [
    {
      id: 301,
      title: "The next right thing",
      text: "Keep the day simple: faith, Joy, the shift, and one useful money move.",
      dateLabel: "Today",
      createdAt: new Date().toISOString(),
      color: "sage",
    },
    {
      id: 302,
      title: "Tampa run list",
      text: "Wallet, keys, medication, water, and a little traffic buffer before leaving Spring Hill.",
      dateLabel: "Today",
      createdAt: new Date().toISOString(),
      color: "dusk",
    },
  ],
  habits: [
    {
      id: 401,
      name: "Talk with Jesus",
      icon: "cross",
      history: habitHistory(0, false),
    },
    {
      id: 402,
      name: "Morning pages",
      icon: "sun",
      history: habitHistory(7, true),
    },
    {
      id: 403,
      name: "Move your body",
      icon: "move",
      history: habitHistory(3, false),
    },
  ],
  debts: [
    {
      id: 501,
      name: "Gabriel",
      amount: 100,
      paid: 0,
      rate: "Personal · due Aug 19",
    },
    {
      id: 502,
      name: "Joy",
      amount: 3000,
      paid: 0,
      rate: "Personal balance",
    },
    {
      id: 503,
      name: "Reported credit debt",
      amount: 11737,
      paid: 0,
      rate: "Historical snapshot · Aug 14",
    },
  ],
  transactions: [],
  accountBalance: 21,
  settings: {
    sound: true,
    theme: "darkwood",
    name: "Javier",
    initials: "JV",
    place: "Spring Hill",
  },
  quickNote: "",
  closedDays: [],
};
