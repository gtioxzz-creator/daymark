import { ChevronDown, Square } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { DictateButton } from "@/components/dictate";
import { askDaymark, type AskTrace, type DayContext } from "@/lib/ask-ai";
import { AskMarkdown } from "@/lib/ask-md";
import { dayFromAsk, foldAsk } from "@/lib/ask-facts";
import { parseCommand, type AskCommand } from "@/lib/command";
import { expandEvents } from "@/lib/recur";
import { useDaymark } from "@/lib/store";
import { addDays, dateOnly, formatDate, formatTime, localISO } from "@/lib/time";
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

function Blaze({ live }: { live?: boolean }) {
  return <span className={cn("blaze", live && "blaze-live")} aria-hidden />;
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
    : [{ kind: "read" as const, label: "Thinking", title: "Thinking", detail: "Opening the desk." }];
  const links = rows.filter((row) => row.kind === "connect");
  const rest = rows.filter((row) => row.kind !== "connect");
  return (
    <div className="mb-7">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="mb-3 flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-faint"
      >
        <Blaze live={live} />
        {live ? "Marking the trail" : "Trail"}
        <span className="text-rule">·</span>
        {rest.length + links.length} {rest.length + links.length === 1 ? "mark" : "marks"}
        <ChevronDown className={cn("size-3 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="rounded-xl border border-rule/80 bg-card/80 px-4 py-4">
          <ol className="space-y-3.5">
            {rest.map((step, i) => (
              <li key={`${step.title}-${i}`} className="flex gap-3">
                <span className="mt-1 shrink-0">
                  <Blaze live={live && i === rest.length - 1} />
                </span>
                <div className="min-w-0">
                  <p className="text-sm text-ink">{step.title}</p>
                  {step.detail && <p className="mt-0.5 text-xs leading-5 text-mist">{step.detail}</p>}
                </div>
              </li>
            ))}
          </ol>
          {links.map((link, i) => (
            <div key={`c-${i}`} className="mt-4 flex flex-wrap items-center gap-2 border-t border-rule/70 pt-4">
              <span className="waypoint">{link.title}</span>
              <span className="blaze-dash" />
              <span className="max-w-[42ch] text-xs leading-5 text-mist">{link.detail}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function AskChat() {
  const remember = useDaymark((s) => s.remember);
  const applyAsk = useDaymark((s) => s.applyAsk);
  const name = useDaymark((s) => s.settings.name) || "Javier";
  const loops = useDaymark((s) => ensureLoops(s.openLoops));
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [live, setLive] = useState<AskTrace[]>([]);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [undo, setUndo] = useState<AskCommand | null>(null);
  const [responseId, setResponseId] = useState("");
  const abortRef = useRef(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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
    setLive([{ kind: "read", title: "Thinking", label: "Thinking", detail: "Opening the desk." }]);
    const now = new Date();
    useDaymark.getState().ensureSchedule(now);

    const user: Bubble = {
      id: `u-${Date.now()}`,
      role: "user",
      first: message,
      reply: "",
      trace: [],
    };
    setBubbles((prev) => [...prev, user]);

    let appliedNote = "";
    const command = parseCommand(foldAsk(message), now);
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
          context: snapshot(now, appliedNote),
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
          const named = dayFromAsk(message, now);
          const next =
            action.type === "add-event"
              ? { ...action, date: named || dateOnly(action.date) || localISO(now) }
              : action.type === "add-task"
                ? { ...action, due: named || action.due || localISO(now) }
                : action;
          const wrote = applyAsk(next);
          if (wrote.ok) {
            toast(wrote.message);
            const back = inverse(next);
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
            at: now.toLocaleString("en-US", {
              hour: "numeric",
              minute: "2-digit",
              month: "long",
              day: "numeric",
              year: "numeric",
              timeZoneName: "short",
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
    <div className="ask-room mx-auto flex min-h-[calc(100dvh-8rem)] w-full max-w-[680px] flex-col pt-8">
      <header className="mb-14 text-center">
        <div className="mb-3 flex items-center justify-center gap-2">
          <span className="blaze" />
          <p className="text-[11px] uppercase tracking-[0.22em] text-faint">Daymark</p>
          <span className="blaze" />
        </div>
        <h1 className="font-display text-[2.6rem] leading-none tracking-tight md:text-5xl">The trail</h1>
      </header>

      <div className="flex flex-1 flex-col gap-10 pb-10">
        {bubbles.length === 0 && (
          <div className="space-y-6">
            {loops.length > 0 && (
              <div className="rounded-xl border border-rule/80 px-5 py-4">
                <p className="kicker text-mark">Still open</p>
                <ul className="mt-3 space-y-2">
                  {loops.map((loop) => (
                    <li key={loop.id} className="flex gap-3 text-sm leading-6 text-mist">
                      <span className="mt-1.5 shrink-0">
                        <span className="blaze" />
                      </span>
                      {loop.text}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <p className="text-center text-sm text-mist">What’s on your plate, {name}.</p>
          </div>
        )}
        {bubbles.map((row) =>
          row.role === "user" ? (
            <div key={row.id} className="ml-auto max-w-[80%] rounded-2xl bg-raised px-5 py-3 text-sm leading-relaxed">
              {row.first}
            </div>
          ) : (
            <article key={row.id}>
              <ThinkingCard steps={row.trace} collapsed />
              {row.at && <p className="mb-3 text-xs text-faint">{row.at}</p>}
              <AskMarkdown text={row.reply || row.first} />
            </article>
          ),
        )}
        {busy && <ThinkingCard steps={live} live />}
        <div ref={endRef} />
      </div>

      {undo && (
        <button
          type="button"
          onClick={() => {
            const done = applyAsk(undo);
            if (done.ok) toast("Undone.");
            setUndo(null);
          }}
          className="mb-3 self-start rounded-full border border-rule px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-mist hover:text-ink"
        >
          Undo last change
        </button>
      )}

      <div className="sticky bottom-20 z-20 bg-gradient-to-t from-paper via-paper to-transparent pt-6 md:bottom-6">
        <div className="flex items-end gap-2 rounded-2xl border border-rule bg-raised px-3 py-2">
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
            placeholder="What would you like to do?"
            className="max-h-32 min-h-12 flex-1 resize-none bg-transparent px-2 py-3 text-sm leading-relaxed outline-none placeholder:text-mist"
          />
          <DictateButton onTranscript={(text) => void send(text.trim())} className="mb-2 size-8 shrink-0" />
          {busy ? (
            <button
              type="button"
              onClick={() => {
                abortRef.current = true;
                setBusy(false);
                setLive([]);
              }}
              className="mb-2 grid size-8 place-items-center rounded-full text-mist hover:text-ink"
              aria-label="Stop"
            >
              <Square className="size-3.5 fill-current" />
            </button>
          ) : (
            <button
              type="button"
              disabled={!query.trim()}
              onClick={() => void send()}
              className={cn(
                "mb-2 h-8 rounded-full px-4 text-[11px] uppercase tracking-[0.16em]",
                query.trim() ? "bg-ink text-paper" : "text-faint",
              )}
            >
              Send
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
