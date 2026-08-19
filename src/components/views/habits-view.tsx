import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HabitGlyph } from "@/lib/icons";
import { useDaymark } from "@/lib/store";
import { habitStreak, lastNDates, localISO } from "@/lib/time";
import { useClock } from "@/lib/clock";
import { cn } from "@/lib/utils";

export function HabitsView() {
  const now = useClock();
  const habits = useDaymark((s) => s.habits);
  const toggleHabit = useDaymark((s) => s.toggleHabit);
  const openModal = useDaymark((s) => s.openModal);
  const today = localISO(now);
  const grid = lastNDates(84, now);

  return (
    <div className="pt-10 md:pt-12">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="kicker">Habits</p>
          <h1 className="mt-2 font-display text-title">Practice, not streak theater</h1>
          <p className="mt-3 max-w-lg text-sm text-mist">
            Each mark is a real day. The grid is twelve weeks. Missing today does not erase the work already done.
          </p>
        </div>
        <Button onClick={() => openModal({ type: "habit" })}>New habit</Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {habits.map((habit) => {
          const done = habit.history.includes(today);
          const streak = habitStreak(habit.history, today);
          const set = new Set(habit.history);
          return (
            <article
              key={habit.id}
              className={cn(
                "panel rounded-xl p-6",
                done && "shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--color-mark)_55%,transparent),var(--shadow-lift)]",
              )}
            >
              <button
                type="button"
                onClick={() => openModal({ type: "habit", id: habit.id })}
                className="flex w-full items-start gap-3 text-left"
              >
                <span className="grid size-10 place-items-center rounded-md bg-raised text-mark">
                  <HabitGlyph icon={habit.icon} className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-2xl leading-tight">
                    {habit.name}
                  </span>
                  <span className="mt-1 block text-xs text-mist">
                    {streak} day streak · {set.size} days kept
                  </span>
                </span>
              </button>

              <div className="mt-6 grid grid-cols-14 gap-1">
                {grid.map((day) => (
                  <i
                    key={day}
                    title={day}
                    className={cn(
                      "h-2.5 rounded-[2px] bg-rule",
                      set.has(day) && "bg-mark",
                      day === today && "ring-1 ring-ink/40",
                    )}
                  />
                ))}
              </div>

              <Button
                variant={done ? "secondary" : "primary"}
                className="mt-6 w-full"
                onClick={() => toggleHabit(habit.id, today)}
              >
                {done ? "Mark incomplete" : (
                  <>
                    <Check className="size-3.5" />
                    Complete today
                  </>
                )}
              </Button>
            </article>
          );
        })}
      </div>
    </div>
  );
}
