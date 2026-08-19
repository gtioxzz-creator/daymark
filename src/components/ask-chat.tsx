import { ChevronDown, Square } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { DictateButton } from "@/components/dictate";
import { askDaymark, type AskTrace, type DayContext } from "@/lib/ask-ai";
import { AskMarkdown } from "@/lib/ask-md";
import { dayFromAsk, foldAsk } from "@/lib/ask-facts";
import { parseCommand, type AskCommand } from "@/lib/command";
import { useClock } from "@/lib/clock";
import { LIFE } from "@/lib/life";
import { eventsOn, expandEvents } from "@/lib/recur";
import { useDaymark } from "@/lib/store";
import { addDays, dateOnly, daysBetween, formatDate, formatTime, localISO } from "@/lib/time";
import { ensureLoops, ensureWiki } from "@/lib/wiki";
import { cn } from "@/lib/utils";

type Bubble = {
  id: string;
  role: "user" | "assistant";
  first: string;
  reply: string;
  trace: AskTrace[];
  at?: string;
};

function inverse(command: AskCommand): AskCommand | null {
  if (command.type === "add-task") return { type: "delete-task", query: command.name };
  if (command.type === "add-event") return { type: "delete-event", query: command.title };
  if (command.type === "complete-task") return { type: "reopen-task", query: command.query };
  if (command.type === "reopen-task") return { type: "complete-task", query: command.query };
  return null;
}

function snapshot(now = new Date(), applied = ""): DayContext {
  const state = useDaymark.getState();
  const today = localISO(now);
  const week = expandEvents(state.events, today, addDays(6, now));
  return {
    today: `${today} ${formatDate(today, "EEEE")}`,
    tomorrow: `${addDays(1, now)} ${formatDate(addDays(1, now), "EEEE")}`,
    focus: `${today} ${formatDate(today, "EEEE")}`,
    now: now.toISOString(),
    name: state.settings.name || "Javier",
    balance: state.accountBalance,
    tasks: state.tasks.slice(0, 16).map((task) => ({ name: task.name, due: task.due })),
    done: state.completedTasks.slice(0, 8).map((task) => task.name),
    events: week.map((event) => ({
      label: `${event.date} ${formatDate(event.date, "EEEE")}`,
      title: event.title,
      start: formatTime(event.time),
      end: formatTime(event.endTime),
    })),
    debts: state.debts.map((debt) => ({
      name: debt.name,
      left: Math.max(0, debt.amount - debt.paid),
    })),
    memories: state.memories.slice(0, 16).map((item) => item.text),
    pages: ensureWiki(state.wiki),
    loops: ensureLoops(state.openLoops).map((loop) => loop.text),
    thread: "",
    applied,
  };
}

function hourWord(now: Date) {
  const h = now.getHours();
  if (h < 5) return "Still up";
  if (h < 12) return "Morning";
  if (h < 17) return "Afternoon";
  if (h < 21) return "Evening";
  return "Night";
}

function ThinkingCard({
  steps,
  live,
  collapsed,
}: {
  steps: AskTrace[];
  live?: boolean;
  collapsed?: boolean;
}) {
  const [open, setOpen] = useState(!collapsed);
  useEffect(() => {
    setOpen(!collapsed);
  }, [collapsed, live]);
  if (steps.length === 0 && !live) return null;
  const rows = steps.length
    ? steps
    : [{ kind: "read" as const, label: "Thinking", title: "Reading the board", detail: "" }];
  return (
    <div className="mb-6">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="kicker flex items-center gap-2 text-mist hover:text-ink"
      >
        {live ? "Reading" : "How I got here"}
        <span className="text-rule">/</span>
        {rows.length}
        <ChevronDown className={cn("size-3 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <ol className="mt-3">
          {rows.map((step, i) => (
            <li key={`${step.title}-${i}`} className="border-t border-rule/80 py-3">
              <p className="text-sm">{step.title}</p>
              {step.detail && <p className="mt-1 text-xs leading-5 text-mist">{step.detail}</p>}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export function AskChat() {
  const remember = useDaymark((s) => s.remember);
  const applyAsk = useDaymark((s) => s.applyAsk);
  const name = useDaymark((s) => s.settings.name) || "Javier";
  const place = useDaymark((s) => s.settings.place) || LIFE.home;
  const balance = useDaymark((s) => s.accountBalance);
  const events = useDaymark((s) => s.events);
  const loops = useDaymark((s) => ensureLoops(s.openLoops));
  const now = useClock();
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [live, setLive] = useState<AskTrace[]>([]);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [undo, setUndo] = useState<AskCommand | null>(null);
  const [responseId, setResponseId] = useState("");
  const abortRef = useRef(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const today = localISO(now);
  const dayEvents = eventsOn(events, today);
  const clock = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  const next = dayEvents.find((event) => event.endTime > clock) ?? dayEvents[0] ?? null;
  const joyDays = Math.max(0, daysBetween(today, LIFE.anniversary));
  const rentDays = Math.max(0, daysBetween(today, LIFE.rentDue));
  const greeting = useMemo(() => `${hourWord(now)}, ${name}`, [now, name]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [bubbles, live, busy]);

  useEffect(() => {
    if (!undo) return;
    const timer = window.setTimeout(() => setUndo(null), 10000);
    return () => window.clearTimeout(timer);
  }, [undo]);

  async function send(text = query) {
    const message = text.trim();
    if (!message || busy) return;
    setQuery("");
    setBusy(true);
    abortRef.current = false;
    setLive([{ kind: "read", title: "Reading the board", label: "Thinking", detail: "" }]);
    const stamp = new Date();
    useDaymark.getState().ensureSchedule(stamp);

    const user: Bubble = {
      id: `u-${Date.now()}`,
      role: "user",
      first: message,
      reply: "",
      trace: [],
    };
    setBubbles((prev) => [...prev, user]);

    let appliedNote = "";
    const command = parseCommand(foldAsk(message), stamp);
    if (
      command.type === "add-task" ||
      command.type === "add-event" ||
      command.type === "complete-task" ||
      command.type === "reopen-task" ||
      command.type === "pay-debt"
    ) {
      const applied = applyAsk(command);
      if (applied.ok) {
        toast(applied.message);
        appliedNote = applied.message;
        const back = inverse(command);
        if (back) setUndo(back);
      }
    }

    try {
      const thread = [...bubbles, user].slice(-10).map((row) => ({
        role: row.role,
        text: [row.first, row.reply].filter(Boolean).join("\n"),
      }));
      const result = await askDaymark({
        data: {
          message,
          context: snapshot(stamp, appliedNote),
          thread,
          previousResponseId: responseId || undefined,
        },
      });
      if (abortRef.current) return;
      setLive(result.trace ?? []);
      if (result.responseId) setResponseId(result.responseId);
      if (result.ok && (result.first || result.reply)) {
        for (const action of result.actions) {
          if (action.type === "search") continue;
          if (appliedNote && action.type === command.type) continue;
          const named = dayFromAsk(message, stamp);
          const nextAction =
            action.type === "add-event"
              ? { ...action, date: named || dateOnly(action.date) || localISO(stamp) }
              : action.type === "add-task"
                ? { ...action, due: named || action.due || localISO(stamp) }
                : action;
          const wrote = applyAsk(nextAction);
          if (wrote.ok) {
            toast(wrote.message);
            const back = inverse(nextAction);
            if (back) setUndo(back);
          }
        }
        for (const fact of result.remember) remember(fact);
        setBubbles((prev) => [
          ...prev,
          {
            id: `a-${Date.now()}`,
            role: "assistant",
            first: result.first,
            reply: result.reply,
            trace: result.trace ?? [],
            at: stamp.toLocaleString("en-US", {
              hour: "numeric",
              minute: "2-digit",
              month: "long",
              day: "numeric",
            }),
          },
        ]);
      } else {
        setBubbles((prev) => [
          ...prev,
          {
            id: `a-${Date.now()}`,
            role: "assistant",
            first: "",
            reply: "I lost the line. Say it again.",
            trace: [],
          },
        ]);
      }
    } catch {
      if (!abortRef.current) {
        setBubbles((prev) => [
          ...prev,
          {
            id: `a-${Date.now()}`,
            role: "assistant",
            first: "",
            reply: "I lost the line. Say it again.",
            trace: [],
          },
        ]);
      }
    } finally {
      setBusy(false);
      setLive([]);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }

  return (
    <div className="pt-5 md:pt-8">
      <section className="panel grid gap-6 rounded-xl px-5 py-5 md:px-8 md:py-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(300px,0.9fr)] lg:gap-16">
        <div className="min-w-0">
          <p className="kicker">{greeting}</p>
          <h1 className="mt-2 font-display text-5xl leading-[0.92] tracking-tight md:text-display">
            Ask
            <span className="text-mist">.</span>
          </h1>
          <p className="mt-3 text-base text-mist">
            {next
              ? `Next on the day is ${formatTime(next.time)} · ${next.title}.`
              : "Nothing on the board yet. Keep it simple."}
          </p>
          <blockquote className="mt-5 border-l border-mark/70 pl-5">
            <p className="font-display text-lg leading-snug text-ink/90 italic md:text-xl">
              One first move. Then the list.
            </p>
            <cite className="kicker mt-2 block not-italic">For {name}</cite>
          </blockquote>
        </div>

        <div className="flex flex-col justify-between rounded-lg bg-raised px-6 py-5 shadow-[var(--shadow-inset)]">
          <div className="flex items-center justify-between">
            <span className="kicker">Local time</span>
            <span className="kicker text-mark">{place}</span>
          </div>
          <p className="mt-5 font-display text-5xl leading-none tracking-tight tabular-nums md:text-6xl">
            {formatTime(clock)}
          </p>
          <div className="mt-5 space-y-3 border-t border-rule pt-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="kicker">Joy</p>
                <p className="mt-1 font-display text-lg">{joyDays === 0 ? "Today" : `${joyDays} days`}</p>
              </div>
              <div className="text-right">
                <p className="kicker">Rent</p>
                <p className="mt-1 font-display text-lg">
                  {rentDays}d · ${LIFE.rentTarget}
                </p>
              </div>
              <div className="text-right">
                <p className="kicker">Cash</p>
                <p className="mt-1 font-display text-lg">${Math.round(balance)}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="panel mt-6 rounded-xl px-5 py-6 md:px-8 md:py-8">
        <div className="mx-auto flex max-w-[640px] flex-col gap-8">
          {bubbles.length === 0 && (
            <div>
              <p className="kicker">Still open</p>
              {loops.length === 0 ? (
                <p className="mt-4 text-sm text-mist">Talk whenever you’re ready.</p>
              ) : (
                loops.slice(0, 3).map((loop) => (
                  <div key={loop.id} className="border-t border-rule/80 py-4">
                    <p className="text-sm">{loop.text}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {bubbles.map((row) =>
            row.role === "user" ? (
              <div key={row.id} className="ml-auto max-w-[85%] text-right">
                <p className="kicker text-mist">You</p>
                <p className="mt-2 font-display text-xl leading-snug">{row.first}</p>
              </div>
            ) : (
              <article key={row.id} className="border-t border-rule pt-6">
                <ThinkingCard steps={row.trace} collapsed />
                {row.at && <p className="kicker mb-3 text-faint">{row.at}</p>}
                <AskMarkdown text={row.reply || row.first} />
              </article>
            ),
          )}
          {busy && <ThinkingCard steps={live} live />}
          <div ref={endRef} />

          {undo && (
            <button
              type="button"
              onClick={() => {
                const done = applyAsk(undo);
                if (done.ok) toast("Undone.");
                setUndo(null);
              }}
              className="kicker self-start text-mist hover:text-ink"
            >
              Undo last change
            </button>
          )}

          <div className="sticky bottom-20 z-20 md:bottom-6">
            <div className="flex items-end gap-2 rounded-lg bg-raised px-3 py-2 shadow-[var(--shadow-inset)]">
              <textarea
                ref={inputRef}
                value={query}
                rows={1}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void send();
                  }
                }}
                placeholder="Ask Daymark"
                className="max-h-32 min-h-11 flex-1 resize-none bg-transparent px-2 py-2.5 text-sm leading-relaxed outline-none placeholder:text-mist"
              />
              <DictateButton onTranscript={(text) => void send(text.trim())} className="mb-1.5 size-8 shrink-0" />
              {busy ? (
                <button
                  type="button"
                  onClick={() => {
                    abortRef.current = true;
                    setBusy(false);
                    setLive([]);
                  }}
                  className="mb-1.5 grid size-8 place-items-center text-mist hover:text-ink"
                  aria-label="Stop"
                >
                  <Square className="size-3.5 fill-current" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={!query.trim()}
                  onClick={() => void send()}
                  className={cn("kicker mb-1.5 h-8 px-3", query.trim() ? "text-mark" : "text-faint")}
                >
                  Send
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
