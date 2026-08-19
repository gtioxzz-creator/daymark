import { useRouterState } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { DictateButton } from "@/components/dictate";
import { commandLabel, parseCommand } from "@/lib/command";
import { useDaymark } from "@/lib/store";
import { formatDate, formatTime, wholeMoney } from "@/lib/time";
import { cn } from "@/lib/utils";

export function AskBar() {
  const tasks = useDaymark((s) => s.tasks);
  const events = useDaymark((s) => s.events);
  const notes = useDaymark((s) => s.notes);
  const debts = useDaymark((s) => s.debts);
  const openModal = useDaymark((s) => s.openModal);
  const applyAsk = useDaymark((s) => s.applyAsk);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setQuery("");
    setOpen(false);
    inputRef.current?.blur();
  }, [pathname]);

  const command = useMemo(
    () => (query.trim() ? parseCommand(query) : null),
    [query],
  );
  const canAct = Boolean(command && command.type !== "search");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const out: { title: string; meta: string; type: string; run: () => void }[] = [];
    tasks
      .filter((x) => `${x.name} ${x.meta}`.toLowerCase().includes(q))
      .forEach((x) =>
        out.push({
          title: x.name,
          meta: x.meta,
          type: "Task",
          run: () => openModal({ type: "task", id: x.id }),
        }),
      );
    events
      .filter((x) => `${x.title} ${x.category} ${x.location}`.toLowerCase().includes(q))
      .forEach((x) =>
        out.push({
          title: x.title,
          meta: `${formatDate(x.date)} · ${formatTime(x.time)}`,
          type: "Event",
          run: () => openModal({ type: "event", id: x.id }),
        }),
      );
    notes
      .filter((x) => `${x.title} ${x.text}`.toLowerCase().includes(q))
      .forEach((x) =>
        out.push({
          title: x.title,
          meta: x.text,
          type: "Journal",
          run: () => openModal({ type: "note", id: x.id }),
        }),
      );
    debts
      .filter((x) => x.name.toLowerCase().includes(q))
      .forEach((x) =>
        out.push({
          title: x.name,
          meta: `${wholeMoney(x.amount - x.paid)} remaining`,
          type: "Debt",
          run: () => openModal({ type: "payment", debtId: x.id }),
        }),
      );
    return out.slice(0, 8);
  }, [query, tasks, events, notes, debts, openModal]);

  function runQuery() {
    if (!query.trim()) return;
    const result = applyAsk(query);
    if (result.ok) {
      toast(result.message);
      setQuery("");
      setOpen(false);
      inputRef.current?.blur();
    }
  }

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
        inputRef.current?.focus();
      }
      if (event.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    window.addEventListener("pointerdown", onPointer);
    return () => window.removeEventListener("pointerdown", onPointer);
  }, []);

  const showPanel = open && query.trim().length > 0;

  return (
    <div ref={rootRef} className="relative w-full max-w-[520px] justify-self-center">
      <div
        className={cn(
          "flex h-11 items-center gap-2 bg-raised px-3 shadow-[var(--shadow-border)]",
          showPanel ? "rounded-t-xl" : "rounded-full",
        )}
      >
        <input
          ref={inputRef}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              runQuery();
            }
          }}
          placeholder="Ask Daymark"
          className="h-11 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-mist"
          aria-label="Ask Daymark"
        />
        <DictateButton
          onTranscript={(text) => {
            const next = text.trim();
            setQuery(next);
            setOpen(true);
            const result = applyAsk(next);
            if (result.ok) {
              toast(result.message);
              setQuery("");
              setOpen(false);
            }
          }}
          className="size-8 shrink-0"
        />
        <kbd className="hidden shrink-0 rounded-sm border border-rule px-1.5 font-mono text-[10px] text-faint md:inline">
          ⌘K
        </kbd>
      </div>

      {showPanel && (
        <div className="absolute inset-x-0 top-full z-50 overflow-hidden rounded-b-xl bg-raised shadow-[var(--shadow-border),var(--shadow-lift)]">
          <div className="max-h-80 overflow-auto">
            {canAct && command && (
              <button
                type="button"
                onClick={runQuery}
                className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-card"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm">{commandLabel(command)}</span>
                  <span className="mt-0.5 block text-[11px] text-mist">Do this</span>
                </span>
                <span className="kicker text-mark">Do</span>
              </button>
            )}
            {results.map((result, index) => (
              <button
                key={`${result.type}-${index}`}
                type="button"
                onClick={() => {
                  result.run();
                  setQuery("");
                  setOpen(false);
                }}
                className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-card"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm">{result.title}</span>
                  {result.meta && (
                    <span className="mt-0.5 block truncate text-[11px] text-mist">
                      {result.meta}
                    </span>
                  )}
                </span>
                <span className="kicker">{result.type}</span>
              </button>
            ))}
            {!canAct && results.length === 0 && (
              <p className="px-4 py-6 text-center text-sm text-mist">Nothing found.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
