import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  CalendarEvent,
  DaymarkState,
  Debt,
  EventCategory,
  Habit,
  LedgerEntry,
  ModalKind,
  Note,
  Settings,
  Task,
  TaskCategory,
} from "./types";
import { emptyState, ensureCoreEvents, PROFILE, seed } from "./seed";
import { STARTER_MEMORIES } from "./life";
import { ensureLoops, ensureWiki, mergeFact } from "./wiki";
import { inferRecur } from "./recur";
import { commandLabel, matchName, parseCommand, type AskCommand } from "./command";
import { dateOnly, localISO, minutesFromMidnight, timeFromMinutes } from "./time";

type DaymarkStore = DaymarkState & {
  hydrated: boolean;
  modal: ModalKind;
  setHydrated: (value: boolean) => void;
  openModal: (modal: ModalKind) => void;
  closeModal: () => void;
  addTask: (input: { name: string; category: TaskCategory; meta?: string; due?: string | null }) => void;
  toggleTask: (id: number) => void;
  deleteTask: (id: number) => void;
  addEvent: (input: Omit<CalendarEvent, "id">) => void;
  updateEvent: (id: number, patch: Partial<CalendarEvent>) => void;
  moveEvent: (id: number, date: string, time: string, endTime?: string) => void;
  deleteEvent: (id: number) => void;
  addNote: (input: { title: string; text: string }) => void;
  updateNote: (id: number, patch: Partial<Note>) => void;
  deleteNote: (id: number) => void;
  addHabit: (input: { name: string; icon: Habit["icon"] }) => void;
  toggleHabit: (id: number, date?: string) => void;
  deleteHabit: (id: number) => void;
  addTransaction: (input: {
    name: string;
    amount: number;
    type: LedgerEntry["type"];
    category: string;
    source?: string;
  }) => void;
  addDebt: (input: { name: string; amount: number; rate?: string }) => void;
  payDebt: (debtId: number, amount: number) => void;
  setQuickNote: (value: string) => void;
  patchSettings: (patch: Partial<Settings>) => void;
  importEvents: (events: Omit<CalendarEvent, "id">[]) => number;
  closeDay: (date?: string) => void;
  remember: (text: string) => void;
  applyAsk: (input: string | AskCommand, now?: Date) => { ok: boolean; message: string };
  hydrateFromCloud: (data: Partial<DaymarkState>) => void;
  ensureSchedule: (now?: Date) => void;
};

function nextId(): number {
  return Date.now() + Math.floor(Math.random() * 99);
}

function inferTaskDue(task: { due?: string | null; meta?: string }): string | null {
  if (task.due) return task.due;
  const meta = task.meta ?? "";
  if (/due today/i.test(meta)) return localISO();
  if (/sep\.?\s*1/i.test(meta)) return "2026-09-01";
  if (/aug\.?\s*26/i.test(meta)) return "2026-08-26";
  return null;
}

function runAsk(get: () => DaymarkStore, command: AskCommand): { ok: boolean; message: string } {
  const state = get();
  if (command.type === "add-task") {
    state.addTask({
      name: command.name,
      category: /trash|home|joy/i.test(command.name) ? "Home" : "Personal",
      due: command.due,
      meta: command.meta,
    });
    return { ok: true, message: commandLabel(command) };
  }
  if (command.type === "add-event") {
    state.addEvent({
      title: command.title,
      date: command.date,
      time: command.time,
      endTime: command.endTime,
      category: "Personal",
      location: "",
      recur: "none",
    });
    return { ok: true, message: commandLabel(command) };
  }
  if (command.type === "move-event") {
    const event = matchName(state.events, command.query);
    if (!event) return { ok: false, message: `Nothing named ${command.query}.` };
    const duration = Math.max(
      15,
      minutesFromMidnight(event.endTime) - minutesFromMidnight(event.time),
    );
    const time = command.time ?? event.time;
    const endTime = timeFromMinutes(minutesFromMidnight(time) + duration);
    state.moveEvent(event.id, command.date ?? event.date, time, endTime);
    return { ok: true, message: `Moved ${event.title}.` };
  }
  if (command.type === "delete-task") {
    const task = matchName(state.tasks, command.query);
    if (!task) return { ok: false, message: "No task like that." };
    state.deleteTask(task.id);
    return { ok: true, message: `Removed · ${task.name}` };
  }
  if (command.type === "delete-event") {
    const event = matchName(state.events, command.query);
    if (!event) return { ok: false, message: "No event like that." };
    state.deleteEvent(event.id);
    return { ok: true, message: `Removed · ${event.title}` };
  }
  if (command.type === "add-note") {
    state.addNote({ title: command.title, text: command.text });
    return { ok: true, message: `Saved · ${command.title}` };
  }
  if (command.type === "patch-settings") {
    const patch: Partial<Settings> = {};
    if (command.name != null) patch.name = command.name;
    if (command.place != null) patch.place = command.place;
    if (command.sound != null) patch.sound = command.sound;
    if (command.theme) patch.theme = command.theme;
    state.patchSettings(patch);
    return { ok: true, message: "Settings updated." };
  }
  if (command.type === "complete-task") {
    const task = matchName(
      state.tasks.filter((item) => !item.done),
      command.query,
    );
    if (!task) return { ok: false, message: "No open task like that." };
    state.toggleTask(task.id);
    return { ok: true, message: `Done · ${task.name}` };
  }
  if (command.type === "reopen-task") {
    const task =
      matchName(state.completedTasks, command.query) ??
      matchName(
        state.tasks.filter((item) => item.done),
        command.query,
      );
    if (!task) return { ok: false, message: `Nothing done named ${command.query}.` };
    state.toggleTask(task.id);
    return { ok: true, message: `Back open · ${task.name}` };
  }
  if (command.type === "toggle-habit") {
    const habit = matchName(state.habits, command.query);
    if (!habit) return { ok: false, message: "No habit like that." };
    state.toggleHabit(habit.id);
    return { ok: true, message: `Marked · ${habit.name}` };
  }
  if (command.type === "income") {
    state.addTransaction({
      name: command.name,
      amount: command.amount,
      type: "income",
      category: "Work",
      source: "Ask Daymark",
    });
    return { ok: true, message: `Logged ${command.amount}.` };
  }
  if (command.type === "pay-debt") {
    const debt = matchName(state.debts, command.query);
    if (debt) {
      const leftover = Math.max(0, debt.amount - debt.paid);
      const amount = command.amount && command.amount > 0 ? command.amount : leftover;
      if (amount > 0) state.payDebt(debt.id, amount);
    }
    const related = state.tasks.filter(
      (task) => !task.done && matchName([task], command.query),
    );
    for (const task of related) state.toggleTask(task.id);
    if (!debt && related.length === 0) return { ok: false, message: "Nothing like that to clear." };
    return { ok: true, message: `Cleared · ${command.query}` };
  }
  return { ok: false, message: "" };
}

function normalizeLegacy(raw: unknown): DaymarkState {
  const incoming = (raw ?? {}) as Partial<DaymarkState> & Record<string, unknown>;
  const tasks = Array.isArray(incoming.tasks) ? incoming.tasks : seed.tasks;
  const completedTasks = (
    Array.isArray(incoming.completedTasks) ? incoming.completedTasks : []
  ).map((task) => ({
    ...task,
    due: task.due ?? inferTaskDue(task),
  }));
  const events = Array.isArray(incoming.events) ? incoming.events : seed.events;
  const notes = Array.isArray(incoming.notes)
    ? incoming.notes.map((note) => ({
        ...note,
        dateLabel: note.dateLabel ?? (note as { date?: string }).date ?? "Today",
        createdAt: note.createdAt ?? new Date().toISOString(),
        color:
          (note as { color?: string }).color === "lav" ||
          (note as { color?: string }).color === "peach"
            ? "dusk"
            : ((note.color as Note["color"]) ?? "sage"),
      }))
    : seed.notes;
  const habits = Array.isArray(incoming.habits)
    ? incoming.habits.map((habit) => {
        if (Array.isArray(habit.history)) return habit;
        const old = habit as Habit & { streak?: number; done?: boolean; icon?: string };
        const days = Math.max(0, Number(old.streak ?? 0));
        const history: string[] = [];
        const start = old.done ? 0 : 1;
        for (let i = start; i < start + days; i += 1) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          history.push(localISO(d));
        }
        const iconMap: Record<string, Habit["icon"]> = {
          "✝": "cross",
          "☀": "sun",
          "◒": "move",
        };
        return {
          id: habit.id,
          name: habit.name,
          icon: iconMap[String(old.icon)] ?? (old.icon as Habit["icon"]) ?? "leaf",
          history,
        };
      })
    : seed.habits;

  return {
    profileVersion: 5,
    tasks: tasks.map((task) => ({
      ...task,
      category: (task.category as TaskCategory) || "Personal",
      completedAt: task.completedAt ?? null,
      due: task.due ?? inferTaskDue(task),
    })),
    completedTasks,
    events: events.map((event) => ({
      ...event,
      category: (event.category as EventCategory) || "Personal",
      location: event.location ?? "",
      endTime: event.endTime || event.time,
      recur: inferRecur(event.title, event.recur),
    })),
    notes,
    habits,
    debts: Array.isArray(incoming.debts) ? incoming.debts : seed.debts,
    transactions: Array.isArray(incoming.transactions) ? incoming.transactions : [],
    accountBalance:
      typeof incoming.accountBalance === "number"
        ? incoming.accountBalance
        : seed.accountBalance,
    settings: {
      sound: incoming.settings?.sound !== false,
      theme: incoming.settings?.theme === "parchment" ? "parchment" : "darkwood",
      name: incoming.settings?.name ?? "",
      initials: incoming.settings?.initials ?? "",
      place: incoming.settings?.place ?? "",
    },
    quickNote:
      typeof incoming.quickNote === "string"
        ? incoming.quickNote
        : (typeof window !== "undefined"
            ? localStorage.getItem("daymark-quick-note")
            : "") || "",
    closedDays: Array.isArray(incoming.closedDays) ? incoming.closedDays : [],
    memories: Array.isArray(incoming.memories) ? incoming.memories : [],
    wiki: ensureWiki(incoming.wiki),
    openLoops: ensureLoops(incoming.openLoops),
  };
}

export function snapshotState(state: DaymarkState): DaymarkState {
  return {
    profileVersion: state.profileVersion,
    tasks: state.tasks,
    completedTasks: state.completedTasks,
    events: state.events,
    notes: state.notes,
    habits: state.habits,
    debts: state.debts,
    transactions: state.transactions,
    accountBalance: state.accountBalance,
    settings: state.settings,
    quickNote: state.quickNote,
    closedDays: state.closedDays ?? [],
    memories: state.memories ?? [],
    wiki: ensureWiki(state.wiki),
    openLoops: ensureLoops(state.openLoops),
  };
}

export const useDaymark = create<DaymarkStore>()(
  persist(
    (set, get) => ({
      ...emptyState,
      hydrated: false,
      modal: { type: "none" },
      setHydrated: (value) => set({ hydrated: value }),
      openModal: (modal) => set({ modal }),
      closeModal: () => set({ modal: { type: "none" } }),
      addTask: ({ name, category, meta, due }) => {
        const task: Task = {
          id: nextId(),
          name: name.trim(),
          category,
          meta: meta?.trim() || "",
          done: false,
          completedAt: null,
          due: due || null,
        };
        set({ tasks: [task, ...get().tasks] });
      },
      toggleTask: (id) => {
        const { tasks, completedTasks } = get();
        const open = tasks.find((task) => task.id === id);
        if (open) {
          const done = !open.done;
          const next: Task = {
            ...open,
            done,
            completedAt: done ? new Date().toISOString() : null,
          };
          if (done) {
            set({
              tasks: tasks.filter((task) => task.id !== id),
              completedTasks: [next, ...completedTasks.filter((t) => t.id !== id)],
            });
            markSound();
          } else {
            set({
              tasks: tasks.map((task) => (task.id === id ? next : task)),
              completedTasks: completedTasks.filter((task) => task.id !== id),
            });
          }
          return;
        }
        const archived = completedTasks.find((task) => task.id === id);
        if (!archived) return;
        set({
          completedTasks: completedTasks.filter((task) => task.id !== id),
          tasks: [{ ...archived, done: false, completedAt: null }, ...tasks],
        });
      },
      deleteTask: (id) => {
        set({
          tasks: get().tasks.filter((task) => task.id !== id),
          completedTasks: get().completedTasks.filter((task) => task.id !== id),
        });
      },
      addEvent: (input) => {
        const event: CalendarEvent = {
          ...input,
          id: nextId(),
          date: dateOnly(input.date),
          time: input.time || "12:00",
          endTime: input.endTime || input.time || "13:00",
          recur: input.recur ?? inferRecur(input.title),
        };
        set({ events: [...get().events, event] });
      },
      updateEvent: (id, patch) => {
        set({
          events: get().events.map((event) =>
            event.id === id ? { ...event, ...patch } : event,
          ),
        });
      },
      moveEvent: (id, date, time, endTime) => {
        const event = get().events.find((item) => item.id === id);
        if (!event) return;
        const duration = Math.max(
          15,
          minutesFromMidnight(event.endTime) - minutesFromMidnight(event.time),
        );
        const nextEnd = endTime ?? timeFromMinutes(minutesFromMidnight(time) + duration);
        set({
          events: get().events.map((item) =>
            item.id === id ? { ...item, date, time, endTime: nextEnd } : item,
          ),
        });
      },
      deleteEvent: (id) => {
        set({ events: get().events.filter((event) => event.id !== id) });
      },
      addNote: ({ title, text }) => {
        const note: Note = {
          id: nextId(),
          title: title.trim(),
          text,
          dateLabel: "Just now",
          createdAt: new Date().toISOString(),
          color: "sage",
        };
        set({ notes: [note, ...get().notes] });
      },
      updateNote: (id, patch) => {
        set({
          notes: get().notes.map((note) =>
            note.id === id
              ? { ...note, ...patch, dateLabel: patch.text ? "Edited just now" : note.dateLabel }
              : note,
          ),
        });
      },
      deleteNote: (id) => {
        set({ notes: get().notes.filter((note) => note.id !== id) });
      },
      addHabit: ({ name, icon }) => {
        set({
          habits: [
            ...get().habits,
            { id: nextId(), name: name.trim(), icon, history: [] },
          ],
        });
      },
      toggleHabit: (id, date = localISO()) => {
        const habit = get().habits.find((item) => item.id === id);
        const completing = Boolean(habit && !habit.history.includes(date));
        set({
          habits: get().habits.map((item) => {
            if (item.id !== id) return item;
            const has = item.history.includes(date);
            return {
              ...item,
              history: has
                ? item.history.filter((day) => day !== date)
                : [...item.history, date],
            };
          }),
        });
        if (completing) markSound();
      },
      deleteHabit: (id) => {
        set({ habits: get().habits.filter((habit) => habit.id !== id) });
      },
      addTransaction: ({ name, amount, type, category, source }) => {
        if (!name.trim() || !(amount > 0)) return;
        const entry: LedgerEntry = {
          id: nextId(),
          name: name.trim(),
          amount,
          type,
          category,
          source: source?.trim() || "",
          at: new Date().toISOString(),
        };
        const delta = type === "income" ? amount : -amount;
        set({
          transactions: [entry, ...get().transactions],
          accountBalance: Number((get().accountBalance + delta).toFixed(2)),
        });
        markSound();
      },
      addDebt: ({ name, amount, rate }) => {
        set({
          debts: [
            ...get().debts,
            { id: nextId(), name: name.trim(), amount, paid: 0, rate: rate?.trim() || "Personal" },
          ],
        });
      },
      payDebt: (debtId, amount) => {
        const debt = get().debts.find((item) => item.id === debtId);
        if (!debt || !(amount > 0)) return;
        const remaining = debt.amount - debt.paid;
        const actual = Math.min(amount, remaining);
        const entry: LedgerEntry = {
          id: nextId(),
          name: `Payment · ${debt.name}`,
          amount: actual,
          type: "expense",
          category: "Debt payment",
          source: "Debt ledger",
          at: new Date().toISOString(),
        };
        set({
          debts: get().debts.map((item) =>
            item.id === debtId ? { ...item, paid: item.paid + actual } : item,
          ),
          transactions: [entry, ...get().transactions],
          accountBalance: Number((get().accountBalance - actual).toFixed(2)),
        });
        markSound();
      },
      setQuickNote: (value) => set({ quickNote: value }),
      patchSettings: (patch) => set({ settings: { ...get().settings, ...patch } }),
      closeDay: (date = localISO()) => {
        const days = get().closedDays;
        if (days.includes(date)) return;
        set({ closedDays: [...days, date] });
        markSound();
      },
      remember: (text) => {
        const clean = text.trim();
        if (!clean) return;
        const memories = get().memories.filter(
          (item) => item.text.toLowerCase() !== clean.toLowerCase(),
        );
        set({
          memories: [{ id: nextId(), text: clean, at: new Date().toISOString() }, ...memories].slice(
            0,
            48,
          ),
          wiki: mergeFact(ensureWiki(get().wiki), clean),
        });
      },
      applyAsk: (input, now = new Date()) =>
        runAsk(get, typeof input === "string" ? parseCommand(input, now) : input),
      hydrateFromCloud: (data) => {
        set({
          tasks: data.tasks ?? get().tasks,
          completedTasks: data.completedTasks ?? get().completedTasks,
          events: ensureCoreEvents(data.events ?? get().events),
          notes: data.notes ?? get().notes,
          habits: data.habits ?? get().habits,
          debts: data.debts ?? get().debts,
          transactions: data.transactions ?? get().transactions,
          accountBalance: data.accountBalance ?? get().accountBalance,
          settings: data.settings ?? get().settings,
          quickNote: data.quickNote ?? get().quickNote,
          closedDays: data.closedDays ?? get().closedDays,
          memories: data.memories ?? get().memories,
          wiki: ensureWiki(data.wiki ?? get().wiki),
          openLoops: ensureLoops(data.openLoops ?? get().openLoops),
        });
      },
      ensureSchedule: (now = new Date()) => {
        const events = ensureCoreEvents(get().events, now).map((event) => ({
          ...event,
          date: dateOnly(event.date),
          time: event.time || "12:00",
          endTime: event.endTime || event.time || "13:00",
        }));
        const dirty =
          events.length !== get().events.length ||
          events.some((event, i) => event.date !== get().events[i]?.date);
        const wiki = ensureWiki(get().wiki);
        const loops = ensureLoops(get().openLoops);
        if (dirty || wiki !== get().wiki || loops !== get().openLoops) {
          set({
            events,
            wiki,
            openLoops: loops,
            profileVersion: Math.max(get().profileVersion, 8),
          });
        }
      },
      importEvents: (events) => {
        const stamped = events.map((event, i) => ({
          ...event,
          id: Date.now() + i,
          recur: event.recur ?? inferRecur(event.title),
        }));
        set({ events: [...get().events, ...stamped] });
        return stamped.length;
      },
    }),
    {
      name: "daymark-state-v4",
      partialize: (state) => {
        const {
          hydrated: _h,
          modal: _m,
          setHydrated: _s,
          openModal: _o,
          closeModal: _c,
          addTask: _a,
          toggleTask: _t,
          deleteTask: _d,
          addEvent: _ae,
          updateEvent: _ue,
          moveEvent: _me,
          deleteEvent: _de,
          addNote: _an,
          updateNote: _un,
          deleteNote: _dn,
          addHabit: _ah,
          toggleHabit: _th,
          deleteHabit: _dh,
          addTransaction: _at,
          addDebt: _ad,
          payDebt: _pd,
          setQuickNote: _sq,
          patchSettings: _ps,
          importEvents: _ie,
          closeDay: _cd,
          remember: _rm,
          applyAsk: _aa,
          hydrateFromCloud: _hc,
          ensureSchedule: _es,
          ...rest
        } = state;
        return rest;
      },
      onRehydrateStorage: () => (state) => {
        if (typeof window !== "undefined") {
          try {
            const legacy = localStorage.getItem("daymark-state");
            if (legacy && state && state.profileVersion < 4) {
              const migrated = normalizeLegacy(JSON.parse(legacy));
              useDaymark.setState({ ...migrated, hydrated: true });
              return;
            }
          } catch {
            /* ignore */
          }
        }
        state?.setHydrated(true);
        if (state) {
          const hasLife =
            state.tasks.length +
              state.events.length +
              state.debts.length +
              state.notes.length >
            0;
          const settings = {
            ...state.settings,
            name: state.settings.name || (hasLife ? PROFILE.first : ""),
            initials: state.settings.initials || (hasLife ? PROFILE.initials : ""),
            place: state.settings.place || (hasLife ? "Spring Hill" : ""),
            sound: state.settings.sound !== false,
            theme: state.settings.theme === "parchment" ? "parchment" as const : "darkwood" as const,
          };
          useDaymark.setState({
            profileVersion: Math.max(state.profileVersion, 7),
            events: ensureCoreEvents(
              state.profileVersion < 8 || state.events.length === 0
                ? seed.events
                : state.events,
            ),
            tasks: state.tasks.map((task) => ({
              ...task,
              due: task.due ?? inferTaskDue(task),
            })),
            completedTasks: state.completedTasks.map((task) => ({
              ...task,
              due: task.due ?? inferTaskDue(task),
            })),
            closedDays: state.closedDays ?? [],
            memories:
              state.memories?.length
                ? state.memories
                : hasLife
                  ? STARTER_MEMORIES.map((text, i) => ({
                      id: 9000 + i,
                      text,
                      at: new Date().toISOString(),
                    }))
                  : [],
            settings,
          });
        }
      },
    },
  ),
);

export function visibleTasks(state: Pick<DaymarkState, "tasks" | "completedTasks">): Task[] {
  const active = state.tasks ?? [];
  const done = (state.completedTasks ?? []).filter(
    (task) => !active.some((item) => item.id === task.id),
  );
  return [...active, ...done.map((task) => ({ ...task, done: true }))];
}

export function tasksForDay(
  state: Pick<DaymarkState, "tasks" | "completedTasks">,
  day: string,
  today = localISO(),
): Task[] {
  return visibleTasks(state).filter((task) => {
    if (task.due === day) return true;
    if (task.completedAt && localISO(new Date(task.completedAt)) === day) return true;
    if (day === today && !task.due && !task.done) return true;
    if (day === today && task.due && task.due < today && !task.done) return true;
    return false;
  });
}

export function debtTotal(debts: Debt[]): number {
  return debts.reduce((sum, debt) => sum + Math.max(0, debt.amount - debt.paid), 0);
}

let audioCtx: AudioContext | null = null;

function audioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  audioCtx ??= new AudioContext();
  if (audioCtx.state === "suspended") void audioCtx.resume();
  return audioCtx;
}

function tone(
  ac: AudioContext,
  freq: number,
  start: number,
  dur: number,
  gain: number,
) {
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(gain, start + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  osc.connect(g);
  g.connect(ac.destination);
  return { osc };
}

function markSound() {
  if (!useDaymark.getState().settings.sound) return;
  const ac = audioContext();
  if (!ac) return;
  const now = ac.currentTime;
  const note1 = tone(ac, 784, now, 0.09, 0.07);
  const note2 = tone(ac, 1175, now + 0.032, 0.14, 0.045);
  const sparkle = tone(ac, 2349, now + 0.04, 0.08, 0.012);
  note1.osc.start(now);
  note1.osc.stop(now + 0.15);
  note2.osc.start(now + 0.032);
  note2.osc.stop(now + 0.18);
  sparkle.osc.start(now + 0.04);
  sparkle.osc.stop(now + 0.12);
}
