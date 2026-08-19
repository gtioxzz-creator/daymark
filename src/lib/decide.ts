import { LIFE } from "./life";
import { eventsOn } from "./recur";
import type { CalendarEvent, Debt, Habit, Task } from "./types";
import {
  daysBetween,
  formatDate,
  formatTime,
  localISO,
  minutesFromMidnight,
  timeFromMinutes,
} from "./time";

export type DayMove = {
  kicker: string;
  title: string;
  detail: string;
  kind: "faith" | "leave" | "event" | "money" | "task" | "close" | "mark" | "clear";
  habitId?: number;
  taskId?: number;
  eventId?: number;
  debtId?: number;
};

export type MoneyPlan = {
  line: string;
  items: { name: string; note: string; left: number }[];
};

function stamp(now: Date) {
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

function leaveBy(time: string): string {
  const mins = minutesFromMidnight(time) - LIFE.driveMinutes;
  if (mins < 0) return "now";
  return formatTime(timeFromMinutes(mins));
}

export function decideDay(input: {
  now: Date;
  viewDate: string;
  tasks: Task[];
  events: CalendarEvent[];
  habits: Habit[];
  debts: Debt[];
  balance: number;
  closedDays: string[];
}): DayMove {
  const today = localISO(input.now);
  const isToday = input.viewDate === today;
  const hour = input.now.getHours();
  const nowStamp = stamp(input.now);
  const dayEvents = eventsOn(input.events, input.viewDate);
  const upcoming = isToday
    ? dayEvents.find((event) => event.endTime > nowStamp)
    : dayEvents[0];
  const faith = input.habits.find((habit) => /jesus|prayer|faith/i.test(habit.name));
  const faithOpen = Boolean(faith && !faith.history.includes(input.viewDate));
  const overdue = input.tasks.filter(
    (task) => !task.done && task.due && task.due < today,
  );
  const dueToday = input.tasks.filter(
    (task) => !task.done && task.due === input.viewDate,
  );
  const gabriel = input.debts.find((debt) => /gabriel/i.test(debt.name) && debt.paid < debt.amount);
  const untilMark = daysBetween(today, LIFE.anniversary);

  if (isToday && hour >= 21 && !input.closedDays.includes(today)) {
    return {
      kicker: "Close the day",
      title: "Put the day down.",
      detail: "One line in the journal. Tomorrow’s first block. Then rest.",
      kind: "close",
    };
  }

  if (isToday && faithOpen && hour < 14) {
    return {
      kicker: "First",
      title: faith!.name,
      detail: "Before the list. Before the shift.",
      kind: "faith",
      habitId: faith!.id,
    };
  }

  if (isToday && untilMark >= 0 && untilMark <= 10) {
    return {
      kicker: untilMark === 0 ? "Today" : `${untilMark} day${untilMark === 1 ? "" : "s"}`,
      title: untilMark === 0 ? "Anniversary with Joy." : "Anniversary with Joy.",
      detail:
        untilMark === 0
          ? "The evening is already on the week. Protect it."
          : "Plan the night. The money, the place, a note to her.",
      kind: "mark",
    };
  }

  if (isToday && upcoming) {
    const workAway =
      /tampa/i.test(upcoming.location) || upcoming.category === "Work";
    const startSoon =
      minutesFromMidnight(upcoming.time) - minutesFromMidnight(nowStamp) <= 180;
    if (workAway && startSoon) {
      return {
        kicker: "Leave by",
        title: leaveBy(upcoming.time),
        detail: `${upcoming.title} · ${formatTime(upcoming.time)} · ${upcoming.location || LIFE.workCity}`,
        kind: "leave",
        eventId: upcoming.id,
      };
    }
    if (upcoming.time > nowStamp || startSoon) {
      return {
        kicker: formatTime(upcoming.time),
        title: upcoming.title,
        detail: [upcoming.location, upcoming.endTime ? `until ${formatTime(upcoming.endTime)}` : ""]
          .filter(Boolean)
          .join(" · "),
        kind: "event",
        eventId: upcoming.id,
      };
    }
  }

  if (isToday && gabriel && input.balance < gabriel.amount - gabriel.paid) {
    return {
      kicker: "Money",
      title: `Gabriel still has ${Math.round(gabriel.amount - gabriel.paid)} on the book.`,
      detail: `You have $${input.balance.toFixed(0)}. Don’t spend before the shift.`,
      kind: "money",
      debtId: gabriel.id,
    };
  }

  const nextTask = (isToday ? [...overdue, ...dueToday] : dueToday)[0];
  if (nextTask) {
    const late = Boolean(nextTask.due && nextTask.due < today);
    return {
      kicker: late ? "Yesterday left this" : "Do this",
      title: nextTask.name,
      detail: nextTask.meta || nextTask.category,
      kind: "task",
      taskId: nextTask.id,
    };
  }

  if (!isToday) {
    if (upcoming) {
      return {
        kicker: formatTime(upcoming.time),
        title: upcoming.title,
        detail: upcoming.location || formatDate(input.viewDate),
        kind: "event",
        eventId: upcoming.id,
      };
    }
    return {
      kicker: formatDate(input.viewDate, "EEEE"),
      title: "Nothing is listed.",
      detail: "The day is open.",
      kind: "clear",
    };
  }

  return {
    kicker: "The board",
    title: "The day is clear.",
    detail: "That’s rare. Keep it that way.",
    kind: "clear",
  };
}

export function moneyPlan(debts: Debt[], balance: number, today = localISO()): MoneyPlan {
  const active = debts.filter((debt) => debt.paid < debt.amount);
  const items = active.map((debt) => {
    const left = Math.max(0, debt.amount - debt.paid);
    let note = debt.rate;
    if (/gabriel/i.test(debt.name)) {
      note = left <= balance ? "You can close this today." : "Next paycheck. Then close it.";
    } else if (/joy/i.test(debt.name)) {
      note = "Hold. Do not add to it.";
    } else if (/credit/i.test(debt.name)) {
      note = "Not this week.";
    }
    return { name: debt.name, note, left };
  });
  const daysToRent = daysBetween(today, LIFE.rentDue);
  if (daysToRent >= 0) {
    items.unshift({
      name: "September rent",
      note:
        daysToRent === 0
          ? "Due today."
          : `${daysToRent} day${daysToRent === 1 ? "" : "s"} · ${LIFE.rentTarget} to set aside.`,
      left: LIFE.rentTarget,
    });
  }
  const line =
    balance < 50
      ? `$${balance.toFixed(0)} on hand. Protect it until the shift pays.`
      : `$${balance.toFixed(0)} on hand. One useful money move.`;
  return { line, items };
}
