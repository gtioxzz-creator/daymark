import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { pushCloudNow, useCloudStatus } from "@/components/cloud-sync";
import { DictateButton, FieldWithMic } from "@/components/dictate";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input, Textarea } from "@/components/ui/input";
import { useDaymark, visibleTasks } from "@/lib/store";
import {
  EVENT_CATEGORIES,
  HABIT_ICONS,
  TASK_CATEGORIES,
  TRANSACTION_CATEGORIES,
  type EventCategory,
  type Habit,
  type Recurrence,
  type TaskCategory,
} from "@/lib/types";
import {
  formatDate,
  formatTime,
  habitStreak,
  localISO,
  money,
  timeFromMinutes,
  minutesFromMidnight,
  wholeMoney,
} from "@/lib/time";
import { Link } from "@tanstack/react-router";
import { useClock } from "@/lib/clock";

export function ModalHost() {
  const modal = useDaymark((s) => s.modal);
  const close = useDaymark((s) => s.closeModal);
  const open = modal.type !== "none";

  return (
    <Dialog open={open} onOpenChange={(next) => !next && close()}>
      <DialogContent>
        {modal.type === "task" && (
          <TaskForm id={modal.id} initial={modal.initial} date={modal.date} />
        )}
        {modal.type === "event" && (
          <EventForm id={modal.id} date={modal.date} time={modal.time} endTime={modal.endTime} />
        )}
        {modal.type === "note" && <NoteForm id={modal.id} />}
        {modal.type === "habit" && <HabitForm id={modal.id} />}
        {modal.type === "transaction" && <TransactionForm />}
        {modal.type === "payment" && <PaymentForm debtId={modal.debtId} />}
        {modal.type === "history" && <HistoryPane />}
        {modal.type === "settled" && <SettledPane />}
        {modal.type === "settings" && <SettingsPane />}
        {modal.type === "profile" && <ProfilePane />}
        {modal.type === "completed" && <CompletedPane />}
      </DialogContent>
    </Dialog>
  );
}

function TaskForm({
  id,
  initial,
  date,
}: {
  id?: number;
  initial?: string;
  date?: string;
}) {
  const tasks = useDaymark((s) => s.tasks);
  const completed = useDaymark((s) => s.completedTasks);
  const addTask = useDaymark((s) => s.addTask);
  const toggleTask = useDaymark((s) => s.toggleTask);
  const deleteTask = useDaymark((s) => s.deleteTask);
  const close = useDaymark((s) => s.closeModal);
  const existing = visibleTasks({ tasks, completedTasks: completed }).find((t) => t.id === id);

  const [name, setName] = useState(existing?.name ?? initial ?? "");
  const [category, setCategory] = useState<TaskCategory>(existing?.category ?? "Personal");
  const [meta, setMeta] = useState(existing?.meta ?? "");
  const [due, setDue] = useState(existing?.due ?? date ?? "");

  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault();
        if (!name.trim()) return toast("Give it a name first.");
        if (!existing) {
          addTask({ name, category, meta, due: due || null });
          toast("Task added.");
        }
        close();
      }}
    >
      <DialogDescription>{existing ? "Task" : "New task"}</DialogDescription>
      <DialogTitle>{existing ? existing.name : "What needs to move?"}</DialogTitle>
      {!existing && (
        <>
          <FieldWithMic onTranscript={(text) => setName((v) => (v ? `${v} ${text}` : text))}>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Call Mom"
              className="pr-11"
              autoFocus
            />
          </FieldWithMic>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as TaskCategory)}
            className="h-11 w-full rounded-md bg-paper px-3 text-sm shadow-[inset_0_0_0_1px_var(--color-rule)] outline-none"
          >
            {TASK_CATEGORIES.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <Input
            type="date"
            value={due}
            onChange={(e) => setDue(e.target.value)}
            aria-label="Due date"
          />
          <Input
            value={meta}
            onChange={(e) => setMeta(e.target.value)}
            placeholder="Helpful note"
          />
          <Button type="submit" className="w-full">
            Add task
          </Button>
        </>
      )}
      {existing && (
        <>
          <p className="text-sm text-mist">
            {existing.category}
            {existing.due ? ` · ${formatDate(existing.due)}` : ""}
            {existing.meta ? ` · ${existing.meta}` : ""}
          </p>
          <Button
            type="button"
            className="w-full"
            onClick={() => {
              toggleTask(existing.id);
              toast(existing.done ? "Task reopened." : "Task complete.");
              close();
            }}
          >
            {existing.done ? "Reopen task" : "Mark complete"}
          </Button>
          <Button
            type="button"
            variant="danger"
            className="w-full"
            onClick={() => {
              deleteTask(existing.id);
              toast("Task removed.");
              close();
            }}
          >
            Delete task
          </Button>
        </>
      )}
    </form>
  );
}

function EventForm({
  id,
  date,
  time,
  endTime,
}: {
  id?: number;
  date?: string;
  time?: string;
  endTime?: string;
}) {
  const events = useDaymark((s) => s.events);
  const addEvent = useDaymark((s) => s.addEvent);
  const updateEvent = useDaymark((s) => s.updateEvent);
  const deleteEvent = useDaymark((s) => s.deleteEvent);
  const close = useDaymark((s) => s.closeModal);
  const existing = events.find((event) => event.id === id);
  const today = localISO(useClock());

  const [title, setTitle] = useState(existing?.title ?? "");
  const [when, setWhen] = useState(existing?.date ?? date ?? today);
  const [start, setStart] = useState(existing?.time ?? time ?? "10:00");
  const [end, setEnd] = useState(
    existing?.endTime ??
      endTime ??
      timeFromMinutes(minutesFromMidnight(time ?? "10:00") + 60),
  );
  const [category, setCategory] = useState<EventCategory>(existing?.category ?? "Personal");
  const [location, setLocation] = useState(existing?.location ?? "");
  const [recur, setRecur] = useState<Recurrence>(existing?.recur ?? "none");

  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault();
        if (!title.trim()) return toast("Name the event first.");
        const payload = {
          title: title.trim(),
          date: when || today,
          time: start || "10:00",
          endTime: end || timeFromMinutes(minutesFromMidnight(start || "10:00") + 60),
          category,
          location: location.trim(),
          recur,
        };
        if (existing) {
          updateEvent(existing.id, payload);
          toast("Event updated.");
        } else {
          addEvent(payload);
          toast("Event added.");
        }
        close();
      }}
    >
      <DialogDescription>{existing ? "Edit event" : "New event"}</DialogDescription>
      <DialogTitle>{existing ? "Move something in your week." : "Put it on the calendar."}</DialogTitle>
      <FieldWithMic onTranscript={(text) => setTitle((v) => (v ? `${v} ${text}` : text))}>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Event name"
          className="pr-11"
          autoFocus
        />
      </FieldWithMic>
      <Input type="date" value={when} onChange={(e) => setWhen(e.target.value)} />
      <div className="grid grid-cols-2 gap-2">
        <Input type="time" value={start} onChange={(e) => setStart(e.target.value)} />
        <Input type="time" value={end} onChange={(e) => setEnd(e.target.value)} />
      </div>
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value as EventCategory)}
        className="h-11 w-full rounded-md bg-paper px-3 text-sm shadow-[inset_0_0_0_1px_var(--color-rule)] outline-none"
      >
        {EVENT_CATEGORIES.map((item) => (
          <option key={item}>{item}</option>
        ))}
      </select>
      <FieldWithMic onTranscript={(text) => setLocation((v) => (v ? `${v} ${text}` : text))}>
        <Input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Location"
          className="pr-11"
        />
      </FieldWithMic>
      <select
        value={recur}
        onChange={(e) => setRecur(e.target.value as Recurrence)}
        className="h-11 w-full rounded-md bg-paper px-3 text-sm shadow-[inset_0_0_0_1px_var(--color-rule)] outline-none"
      >
        <option value="none">Once</option>
        <option value="weekly">Every week</option>
        <option value="weekdays">Weekdays</option>
      </select>
      <Button type="submit" className="w-full">
        {existing ? "Save changes" : "Add event"}
      </Button>
      {existing && (
        <Button
          type="button"
          variant="danger"
          className="w-full"
          onClick={() => {
            deleteEvent(existing.id);
            toast("Event removed.");
            close();
          }}
        >
          Delete event
        </Button>
      )}
    </form>
  );
}

function NoteForm({ id }: { id?: number }) {
  const notes = useDaymark((s) => s.notes);
  const addNote = useDaymark((s) => s.addNote);
  const updateNote = useDaymark((s) => s.updateNote);
  const deleteNote = useDaymark((s) => s.deleteNote);
  const close = useDaymark((s) => s.closeModal);
  const existing = notes.find((note) => note.id === id);
  const [title, setTitle] = useState(existing?.title ?? "");
  const [text, setText] = useState(existing?.text ?? "");

  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault();
        if (!title.trim()) return toast("Give the entry a title first.");
        if (existing) {
          updateNote(existing.id, { title, text });
          toast("Journal updated.");
        } else {
          addNote({ title, text });
          toast("Journal entry saved.");
        }
        close();
      }}
    >
      <DialogDescription>{existing ? `Journal · ${existing.dateLabel}` : "New journal entry"}</DialogDescription>
      <DialogTitle>{existing ? existing.title : "What happened today?"}</DialogTitle>
      <FieldWithMic onTranscript={(chunk) => setTitle((v) => (v ? `${v} ${chunk}` : chunk))}>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Entry title"
          className="pr-11"
        />
      </FieldWithMic>
      <div className="relative">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write it down…"
          rows={8}
          className="pr-11"
        />
        <DictateButton
          onTranscript={(chunk) => setText((v) => (v ? `${v} ${chunk}` : chunk))}
          className="absolute right-2 bottom-2"
        />
      </div>
      <Button type="submit" className="w-full">
        {existing ? "Save changes" : "Save journal entry"}
      </Button>
      {existing && (
        <Button
          type="button"
          variant="danger"
          className="w-full"
          onClick={() => {
            deleteNote(existing.id);
            toast("Journal entry deleted.");
            close();
          }}
        >
          Delete journal entry
        </Button>
      )}
    </form>
  );
}

function HabitForm({ id }: { id?: number }) {
  const habits = useDaymark((s) => s.habits);
  const addHabit = useDaymark((s) => s.addHabit);
  const toggleHabit = useDaymark((s) => s.toggleHabit);
  const deleteHabit = useDaymark((s) => s.deleteHabit);
  const close = useDaymark((s) => s.closeModal);
  const existing = habits.find((habit) => habit.id === id);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState<Habit["icon"]>("leaf");
  const today = localISO(useClock());

  if (existing) {
    const done = existing.history.includes(today);
    return (
      <div className="space-y-4">
        <DialogDescription>Habit</DialogDescription>
        <DialogTitle>{existing.name}</DialogTitle>
        <div className="grid grid-cols-3 gap-2">
          {[
            ["Streak", `${habitStreak(existing.history)}d`],
            ["Today", done ? "Done" : "Open"],
            ["Kept", `${existing.history.length}`],
          ].map(([label, value]) => (
            <div key={label} className="rounded-md bg-raised px-3 py-3">
              <span className="kicker">{label}</span>
              <strong className="mt-1 block text-lg">{value}</strong>
            </div>
          ))}
        </div>
        <Button
          className="w-full"
          onClick={() => {
            toggleHabit(existing.id);
            toast(done ? "Habit reopened." : "Habit checked.");
            close();
          }}
        >
          {done ? "Mark incomplete" : "Complete today"}
        </Button>
        <Button
          variant="danger"
          className="w-full"
          onClick={() => {
            deleteHabit(existing.id);
            toast("Habit removed.");
            close();
          }}
        >
          Remove habit
        </Button>
      </div>
    );
  }

  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault();
        if (!name.trim()) return toast("Give it a name first.");
        addHabit({ name, icon });
        toast("Habit added.");
        close();
      }}
    >
      <DialogDescription>New habit</DialogDescription>
      <DialogTitle>What do you want to practice?</DialogTitle>
      <FieldWithMic onTranscript={(text) => setName((v) => (v ? `${v} ${text}` : text))}>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Drink water"
          className="pr-11"
        />
      </FieldWithMic>
      <div className="flex flex-wrap gap-2">
        {HABIT_ICONS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setIcon(item)}
            className={`h-9 rounded-full px-3 text-xs capitalize ${
              icon === item ? "bg-ink text-paper" : "text-mist shadow-[inset_0_0_0_1px_var(--color-rule)]"
            }`}
          >
            {item}
          </button>
        ))}
      </div>
      <Button type="submit" className="w-full">
        Add habit
      </Button>
    </form>
  );
}

function TransactionForm() {
  const addTransaction = useDaymark((s) => s.addTransaction);
  const close = useDaymark((s) => s.closeModal);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"income" | "expense">("income");
  const [category, setCategory] = useState("Work");
  const [source, setSource] = useState("");

  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault();
        const value = Number(amount);
        if (!name.trim() || !(value > 0)) return toast("Add a name and a positive amount first.");
        addTransaction({ name, amount: value, type, category, source });
        toast(type === "income" ? "Added to the balance." : "Expense logged.");
        close();
      }}
    >
      <DialogDescription>New transaction</DialogDescription>
      <DialogTitle>Where did the money move?</DialogTitle>
      <FieldWithMic onTranscript={(text) => setName((v) => (v ? `${v} ${text}` : text))}>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Bulla paycheck"
          className="pr-11"
          autoFocus
        />
      </FieldWithMic>
      <Input
        type="number"
        min="0.01"
        step="0.01"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount"
      />
      <select
        value={type}
        onChange={(e) => setType(e.target.value as "income" | "expense")}
        className="h-11 w-full rounded-md bg-paper px-3 text-sm shadow-[inset_0_0_0_1px_var(--color-rule)]"
      >
        <option value="income">Money in · paycheck or deposit</option>
        <option value="expense">Money out · spending or bill</option>
      </select>
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="h-11 w-full rounded-md bg-paper px-3 text-sm shadow-[inset_0_0_0_1px_var(--color-rule)]"
      >
        {TRANSACTION_CATEGORIES.map((item) => (
          <option key={item}>{item}</option>
        ))}
      </select>
      <Input
        value={source}
        onChange={(e) => setSource(e.target.value)}
        placeholder="Source or note · optional"
      />
      <Button type="submit" className="w-full">
        Save transaction
      </Button>
    </form>
  );
}

function PaymentForm({ debtId }: { debtId?: number }) {
  const debts = useDaymark((s) => s.debts);
  const payDebt = useDaymark((s) => s.payDebt);
  const close = useDaymark((s) => s.closeModal);
  const active = debts.filter((debt) => debt.paid < debt.amount);
  const [amount, setAmount] = useState("");
  const [id, setId] = useState(String(debtId ?? active[0]?.id ?? ""));

  if (!active.length) {
    return (
      <div>
        <DialogDescription>Make a payment</DialogDescription>
        <DialogTitle>Nothing left to pay down.</DialogTitle>
      </div>
    );
  }

  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault();
        const value = Number(amount);
        const debt = debts.find((item) => item.id === Number(id));
        if (!debt || !(value > 0)) return toast("Add a payment amount first.");
        payDebt(debt.id, value);
        const next = debt.paid + Math.min(value, debt.amount - debt.paid);
        toast(
          next >= debt.amount
            ? `${debt.name} is paid off.`
            : `${wholeMoney(Math.min(value, debt.amount - debt.paid))} applied to ${debt.name}.`,
        );
        close();
      }}
    >
      <DialogDescription>Make a payment</DialogDescription>
      <DialogTitle>Reduce what you owe.</DialogTitle>
      <Input
        type="number"
        min="0.01"
        step="0.01"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Payment amount"
        autoFocus
      />
      <select
        value={id}
        onChange={(e) => setId(e.target.value)}
        className="h-11 w-full rounded-md bg-paper px-3 text-sm shadow-[inset_0_0_0_1px_var(--color-rule)]"
      >
        {active.map((debt) => (
          <option key={debt.id} value={debt.id}>
            {debt.name} · {wholeMoney(debt.amount - debt.paid)} left
          </option>
        ))}
      </select>
      <Button type="submit" className="w-full">
        Record payment
      </Button>
    </form>
  );
}

function HistoryPane() {
  const transactions = useDaymark((s) => s.transactions);
  return (
    <div>
      <DialogDescription>Money trail</DialogDescription>
      <DialogTitle>Transaction history</DialogTitle>
      <div className="mt-4 max-h-80 overflow-auto">
        {transactions.length === 0 ? (
          <p className="py-8 text-center text-sm text-mist">No transactions yet.</p>
        ) : (
          transactions.map((entry) => (
            <div key={entry.id} className="flex items-center justify-between border-t border-rule py-3">
              <div>
                <p className="text-sm">{entry.name}</p>
                <p className="text-[11px] text-mist">{entry.category}</p>
              </div>
              <span className="font-mono text-xs tabular-nums">
                {entry.type === "income" ? "+" : "−"}
                {money(entry.amount)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function SettledPane() {
  const debts = useDaymark((s) => s.debts);
  const settled = debts.filter((d) => d.amount > 0 && d.paid >= d.amount);
  return (
    <div>
      <DialogDescription>Paid off</DialogDescription>
      <DialogTitle>Debts you settled</DialogTitle>
      <div className="mt-4">
        {settled.map((debt) => (
          <div key={debt.id} className="border-t border-rule py-3">
            <p className="text-sm">{debt.name}</p>
            <p className="text-xs text-mist">
              {wholeMoney(debt.amount)} settled · {debt.rate}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsPane() {
  const settings = useDaymark((s) => s.settings);
  const patch = useDaymark((s) => s.patchSettings);
  const completed = useDaymark((s) => s.completedTasks);
  const transactions = useDaymark((s) => s.transactions);
  const importEvents = useDaymark((s) => s.importEvents);
  const openModal = useDaymark((s) => s.openModal);
  const { user } = useCurrentUserState();
  const cloud = useCloudStatus();

  return (
    <div className="space-y-5">
      <DialogDescription>Settings</DialogDescription>
      <DialogTitle>Your Daymark controls</DialogTitle>
      <div className="rounded-lg bg-raised px-4 py-4 shadow-[var(--shadow-inset)]">
        <p className="kicker">Account</p>
        <p className="mt-2 text-sm">
          {user ? user.primaryEmail || user.displayName || "Signed in" : "Not signed in"}
        </p>
        <p className="mt-1 text-xs text-mist">
          {user
            ? cloud.detail || "Your day saves to this account."
            : "Sign in to put this day on an account. Until then it stays on this device only."}
        </p>
        {user && (
          <Button
            type="button"
            variant="secondary"
            className="mt-3"
            onClick={() => {
              void pushCloudNow()
                .then(() => toast("Saved to your account."))
                .catch(() => toast("Could not save to the account."));
            }}
          >
            Save to account now
          </Button>
        )}
      </div>
      <div className="space-y-2">
        <Input
          value={settings.name}
          onChange={(e) => patch({ name: e.target.value })}
          placeholder="Your first name"
        />
        <Input
          value={settings.place}
          onChange={(e) => patch({ place: e.target.value })}
          placeholder="City"
        />
      </div>
      <div className="divide-y divide-rule border-y border-rule">
        <Row
          title="Done sounds"
          hint="A quiet stamp when you finish a task, habit, or payment."
          action={
            <button
              type="button"
              onClick={() => {
                patch({ sound: !settings.sound });
                toast(settings.sound ? "Sounds off." : "Sounds on.");
              }}
              className={`h-9 rounded-full px-3 text-xs ${
                settings.sound ? "bg-mark text-mark-ink" : "text-mist shadow-[inset_0_0_0_1px_var(--color-rule)]"
              }`}
            >
              {settings.sound ? "On" : "Off"}
            </button>
          }
        />
        <Row
          title="Finish"
          hint={settings.theme === "parchment" ? "Parchment" : "Darkwood"}
          action={
            <button
              type="button"
              onClick={() => {
                const next = settings.theme === "parchment" ? "darkwood" : "parchment";
                patch({ theme: next });
                toast(next === "parchment" ? "Parchment finish on." : "Darkwood finish on.");
              }}
              className="h-9 rounded-full px-3 text-xs text-mist shadow-[inset_0_0_0_1px_var(--color-rule)]"
            >
              Swap
            </button>
          }
        />
        <Row
          title="Completed tasks"
          hint={`${completed.length} stored locally`}
          action={
            <button type="button" className="kicker" onClick={() => openModal({ type: "completed" })}>
              View log
            </button>
          }
        />
        <Row
          title="Money ledger"
          hint={`${transactions.length} transactions stored locally`}
          action={
            <button type="button" className="kicker" onClick={() => openModal({ type: "history" })}>
              View history
            </button>
          }
        />
      </div>
      <div>
        <p className="text-sm font-medium">Calendar import</p>
        <p className="mt-1 text-xs text-mist">
          Import an .ics export privately from this device. Live Google sync can wait.
        </p>
        <input
          type="file"
          accept=".ics,text/calendar"
          className="mt-3 block w-full text-xs text-mist"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => {
              const text = String(reader.result);
              const blocks = text.split("BEGIN:VEVENT").slice(1);
              const imported = blocks
                .map((block) => {
                  const title = (block.match(/SUMMARY:(.*)/) || [])[1];
                  const start = (block.match(/DTSTART(?:;[^:]*)?:(\d{8}T\d{6})/) || [])[1];
                  if (!title || !start) return null;
                  const date = `${start.slice(0, 4)}-${start.slice(4, 6)}-${start.slice(6, 8)}`;
                  const time = `${start.slice(9, 11)}:${start.slice(11, 13)}`;
                  return {
                    title: title.trim(),
                    date,
                    time,
                    endTime: timeFromMinutes(minutesFromMidnight(time) + 60),
                    category: "Other" as const,
                    location: "",
                    recur: "none" as const,
                  };
                })
                .filter((item): item is NonNullable<typeof item> => Boolean(item));
              const count = importEvents(imported);
              toast(
                count
                  ? `${count} calendar event${count === 1 ? "" : "s"} imported.`
                  : "No events found in that file.",
              );
            };
            reader.readAsText(file);
          }}
        />
      </div>
    </div>
  );
}

function Row({
  title,
  hint,
  action,
}: {
  title: string;
  hint: string;
  action: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <p className="text-sm">{title}</p>
        <p className="mt-1 text-[11px] text-mist">{hint}</p>
      </div>
      {action}
    </div>
  );
}

function ProfilePane() {
  const settings = useDaymark((s) => s.settings);
  const userName = settings.name || "Your day";
  const initials = settings.initials || (settings.name ? settings.name.slice(0, 2).toUpperCase() : "DM");
  return (
    <div className="text-center">
      <DialogDescription>Profile</DialogDescription>
      <div className="mx-auto mt-2 grid size-16 place-items-center rounded-full bg-ink font-mono text-sm text-paper">
        {initials}
      </div>
      <DialogTitle className="mt-4">{userName}</DialogTitle>
      <p className="mt-2 text-sm text-mist">
        {settings.place || "Set your city in Settings."}
      </p>
      <p className="mt-4 font-mono text-[10px] text-mark">
        Sign in to keep this day on your account. Guests stay empty and local.
      </p>
      <Link
        to="/login"
        className="mt-6 inline-flex h-11 items-center justify-center rounded-md px-4 text-sm text-mist shadow-[inset_0_0_0_1px_var(--color-rule)]"
      >
        Sign in for an identity
      </Link>
    </div>
  );
}

function CompletedPane() {
  const completed = useDaymark((s) => s.completedTasks);
  return (
    <div>
      <DialogDescription>Completed</DialogDescription>
      <DialogTitle>Things you finished</DialogTitle>
      <div className="mt-4 max-h-80 overflow-auto">
        {completed.length === 0 ? (
          <p className="py-8 text-center text-sm text-mist">Your completed tasks will collect here.</p>
        ) : (
          completed.map((task) => (
            <div key={task.id} className="border-t border-rule py-3">
              <p className="text-sm">{task.name}</p>
              <p className="text-[11px] text-mist">{task.meta || task.category}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

