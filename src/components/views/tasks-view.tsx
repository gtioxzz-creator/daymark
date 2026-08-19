import { Check, SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useDaymark, visibleTasks } from "@/lib/store";
import { formatDate } from "@/lib/time";
import { cn } from "@/lib/utils";

type Filter = "all" | "open" | "done";

export function TasksView() {
  const tasks = useDaymark((s) => s.tasks);
  const completed = useDaymark((s) => s.completedTasks);
  const toggleTask = useDaymark((s) => s.toggleTask);
  const openModal = useDaymark((s) => s.openModal);
  const [filter, setFilter] = useState<Filter>("all");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onPointer = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    window.addEventListener("pointerdown", onPointer);
    return () => window.removeEventListener("pointerdown", onPointer);
  }, [menuOpen]);

  const all = visibleTasks({ tasks, completedTasks: completed });
  const open = all.filter((task) => !task.done);
  const done = all.filter((task) => task.done);
  const shown = useMemo(() => {
    if (filter === "open") return open;
    if (filter === "done") return done;
    return all;
  }, [all, done, filter, open]);

  return (
    <div className="pt-10 md:pt-12">
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="kicker">Tasks</p>
          <h1 className="mt-2 font-display text-4xl md:text-title">What needs to move</h1>
          <p className="mt-3 text-sm text-mist">
            <span className="text-ink">{open.length} open</span>
            <span className="mx-2 text-rule">·</span>
            {done.length} finished
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="grid size-11 place-items-center rounded-md text-mist shadow-[inset_0_0_0_1px_var(--color-rule)] hover:text-ink"
              aria-label="Filter tasks"
              aria-expanded={menuOpen}
            >
              <SlidersHorizontal className="size-4" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 z-20 mt-2 w-36 rounded-md bg-card p-1 shadow-[var(--shadow-border),var(--shadow-lift)]">
                {([
                  ["all", "All"],
                  ["open", "Open"],
                  ["done", "Done"],
                ] as const).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setFilter(key);
                      setMenuOpen(false);
                    }}
                    className={cn(
                      "flex h-9 w-full items-center px-3 text-left text-sm text-mist hover:bg-raised hover:text-ink",
                      filter === key && "text-ink",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <Button onClick={() => openModal({ type: "task" })}>New task</Button>
        </div>
      </div>

      {filter === "all" ? (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(260px,0.8fr)]">
          <Board
            kicker="Open"
            title={`${open.length} still in front of you`}
            empty="Nothing open. Add the next useful thing."
            items={open}
            onToggle={toggleTask}
            onOpen={(id) => openModal({ type: "task", id })}
          />
          <Board
            kicker="Finished"
            title={`${done.length} kept`}
            empty="Finished work will collect here."
            items={done}
            quiet
            onToggle={toggleTask}
            onOpen={(id) => openModal({ type: "task", id })}
          />
        </div>
      ) : (
        <Board
          kicker={filter === "open" ? "Open" : "Finished"}
          title={filter === "open" ? `${shown.length} still in front of you` : `${shown.length} kept`}
          empty="Nothing in this view."
          items={shown}
          quiet={filter === "done"}
          onToggle={toggleTask}
          onOpen={(id) => openModal({ type: "task", id })}
        />
      )}
    </div>
  );
}

function Board({
  kicker,
  title,
  empty,
  items,
  quiet,
  onToggle,
  onOpen,
}: {
  kicker: string;
  title: string;
  empty: string;
  items: ReturnType<typeof visibleTasks>;
  quiet?: boolean;
  onToggle: (id: number) => void;
  onOpen: (id: number) => void;
}) {
  return (
    <section className="panel rounded-xl">
      <header className="border-b border-rule px-6 py-5 md:px-7">
        <p className="kicker">{kicker}</p>
        <h2 className="mt-2 font-display text-2xl leading-tight">{title}</h2>
      </header>
      {items.length === 0 ? (
        <p className="px-6 py-16 text-center text-sm text-mist">{empty}</p>
      ) : (
        items.map((task) => (
          <div
            key={task.id}
            className={cn(
              "flex items-center gap-4 border-b border-rule px-5 py-5 last:border-0 md:px-7",
              quiet && "opacity-60",
            )}
          >
            <button
              type="button"
              aria-label={task.done ? "Reopen task" : "Complete task"}
              onClick={() => onToggle(task.id)}
              className={cn(
                "relative grid size-7 shrink-0 place-items-center rounded-sm shadow-[inset_0_0_0_1px_var(--color-rule)] after:absolute after:size-10",
                task.done && "bg-mark text-mark-ink shadow-none",
              )}
            >
              {task.done && <Check className="size-3.5" />}
            </button>
            <button
              type="button"
              onClick={() => onOpen(task.id)}
              className="min-w-0 flex-1 text-left"
            >
              <span
                className={cn(
                  "block font-display leading-snug",
                  quiet ? "text-lg" : "text-xl",
                  task.done && "line-through",
                )}
              >
                {task.name}
              </span>
              <span className="mt-1 block text-xs text-mist">
                {task.category}
                {task.due ? ` · ${formatDate(task.due)}` : ""}
                {task.meta ? ` · ${task.meta}` : ""}
              </span>
            </button>
          </div>
        ))
      )}
    </section>
  );
}
