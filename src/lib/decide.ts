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

function cash(n: number) {
  const value = Math.round(n);
  return value < 0 ? `−$${Math.abs(value)}` : `$${value}`;
}

function pick(lines: string[], key: string) {
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) hash += key.charCodeAt(i) * (i + 3);
  return lines[hash % lines.length]!;
}

function moneyVoice(balance: number, today: string) {
  const shown = cash(balance);
  if (balance < 0) {
    return pick(
      [
        `${shown}. You’re under. Next shift is the climb — not a treat.`,
        `${shown} below zero. Hold still. Rent is still the hill.`,
        `${shown} on the book. Stop the leak until Bulla pays.`,
      ],
      today,
    );
  }
  if (balance < 50) {
    return pick(
      [
        `${shown} on hand. Thin. Leave it until the shift lands.`,
        `${shown}. That’s not room to spend.`,
        `${shown} on hand. Gas and food only.`,
      ],
      today,
    );
  }
  if (balance < 400) {
    return pick(
      [
        `${shown} on hand. Toward the $400, not out the door.`,
        `${shown}. Enough to breathe. Not enough to get loose.`,
        `${shown} on hand. Rent first if anything moves.`,
      ],
      today,
    );
  }
  return pick(
    [
      `${shown} on hand. Set the rent aside while it’s here.`,
      `${shown}. Strong day. Don’t let it wander.`,
      `${shown} on hand. The hill is still September 1.`,
    ],
    today,
  );
}

function leaveBy(time: string): string {
  const mins = minutesFromMidnight(time) - LIFE.driveMinutes;
  if (mins < 0) return "now";
  return formatTime(timeFromMinutes(mins));
}

function anniversaryMove(until: number): DayMove {
  return {
    kicker: until === 0 ? "Today" : `${until} day${until === 1 ? "" : "s"}`,
    title: "Anniversary with Joy.",
    detail:
      until === 0
        ? "The evening is already on the week. Protect it."
        : "Plan the night. The money, the place, a note to her.",
    kind: "mark",
  };
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
  const nowMins = hour * 60 + input.now.getMinutes();
  const dayEvents = eventsOn(input.events, input.viewDate);
  const faith = input.habits.find((habit) => /jesus|prayer|faith/i.test(habit.name));
  const faithOpen = Boolean(faith && !faith.history.includes(input.viewDate));
  const overdue = input.tasks.filter(
    (task) => !task.done && task.due && task.due < today,
  );
  const dueToday = input.tasks.filter(
    (task) => !task.done && task.due === input.viewDate,
  );
  const gabriel = input.debts.find(
    (debt) => /gabriel/i.test(debt.name) && debt.paid < debt.amount,
  );
  const untilMark = daysBetween(today, LIFE.anniversary);
  const nextTask = (isToday ? [...overdue, ...dueToday] : dueToday)[0];

  if (!isToday) {
    const first = dayEvents[0];
    if (first) {
      return {
        kicker: formatTime(first.time),
        title: first.title,
        detail: first.location || formatDate(input.viewDate),
        kind: "event",
        eventId: first.id,
      };
    }
    if (nextTask) {
      return {
        kicker: "On this day",
        title: nextTask.name,
        detail: nextTask.meta || nextTask.category,
        kind: "task",
        taskId: nextTask.id,
      };
    }
    if (input.viewDate === LIFE.anniversary) return anniversaryMove(0);
    return {
      kicker: formatDate(input.viewDate, "EEEE"),
      title: "Nothing is listed.",
      detail: "The day is open.",
      kind: "clear",
    };
  }

  const happening = dayEvents.find((event) => {
    const start = minutesFromMidnight(event.time);
    const end = minutesFromMidnight(event.endTime);
    return nowMins >= start && nowMins < end;
  });
  if (happening) {
    return {
      kicker: "Now",
      title: happening.title,
      detail: `Until ${formatTime(happening.endTime)}${happening.location ? ` · ${happening.location}` : ""}`,
      kind: "event",
      eventId: happening.id,
    };
  }

  const upcoming = dayEvents.find(
    (event) => minutesFromMidnight(event.time) > nowMins,
  );

  if (upcoming) {
    const start = minutesFromMidnight(upcoming.time);
    const workAway =
      /tampa/i.test(upcoming.location) || upcoming.category === "Work";
    const minutesToStart = start - nowMins;
    if (workAway && minutesToStart <= LIFE.driveMinutes + 20) {
      return {
        kicker: "Leave by",
        title: leaveBy(upcoming.time),
        detail: `${upcoming.title} · ${formatTime(upcoming.time)} · ${upcoming.location || LIFE.workCity}`,
        kind: "leave",
        eventId: upcoming.id,
      };
    }
    return {
      kicker: formatTime(upcoming.time),
      title: upcoming.title,
      detail: [upcoming.location, `until ${formatTime(upcoming.endTime)}`]
        .filter(Boolean)
        .join(" · "),
      kind: "event",
      eventId: upcoming.id,
    };
  }

  if (faithOpen && hour >= 5 && hour < 10) {
    return {
      kicker: "First",
      title: faith!.name,
      detail: "Before the list. Before the shift.",
      kind: "faith",
      habitId: faith!.id,
    };
  }

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

  if (gabriel && hour < 21) {
    const leftover = Math.round(gabriel.amount - gabriel.paid);
    if (leftover > 0 && input.balance < leftover) {
      return {
        kicker: "Money",
        title: `Gabriel still has ${leftover} on the book.`,
        detail:
          input.balance < leftover
            ? `${cash(input.balance)} in the account. Wait for the shift, then close it.`
            : `You can close it today. ${cash(input.balance)} is enough.`,
        kind: "money",
        debtId: gabriel.id,
      };
    }
  }

  if (untilMark === 0) return anniversaryMove(0);

  if (hour >= 21 && !input.closedDays.includes(today)) {
    return {
      kicker: "Close the day",
      title: "Put the day down.",
      detail: "One line in the journal. Tomorrow’s first block. Then rest.",
      kind: "close",
    };
  }

  if (untilMark > 0 && untilMark <= 7) return anniversaryMove(untilMark);

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
      note =
        left <= 0
          ? "Cleared."
          : left <= balance
            ? "You can close this today."
            : "Next paycheck. Then close it.";
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
  return { line: moneyVoice(balance, today), items };
}
