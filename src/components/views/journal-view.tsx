import { Button } from "@/components/ui/button";
import { useDaymark } from "@/lib/store";
import { cn } from "@/lib/utils";

const TONES: Record<string, string> = {
  sage: "panel-moss",
  dusk: "panel",
  clay: "panel-sun",
  ink: "panel",
};

export function JournalView() {
  const notes = useDaymark((s) => s.notes);
  const openModal = useDaymark((s) => s.openModal);

  return (
    <div className="pt-10 md:pt-12">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="kicker">Journal</p>
          <h1 className="mt-2 font-display text-title">What happened</h1>
          <p className="mt-3 max-w-md text-sm text-mist">
            Private pages. Write it down so the day does not have to hold it.
          </p>
        </div>
        <Button onClick={() => openModal({ type: "note" })}>New entry</Button>
      </div>

      {notes.length === 0 ? (
        <div className="rounded-lg border border-dashed border-rule px-6 py-20 text-center">
          <p className="font-display text-2xl">The book is empty</p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-mist">
            Start with one line. Title it later if you want.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => (
            <button
              key={note.id}
              type="button"
              onClick={() => openModal({ type: "note", id: note.id })}
              className={cn(
                "flex min-h-[240px] flex-col rounded-xl p-6 text-left transition-transform duration-200 hover:-translate-y-0.5",
                TONES[note.color] ?? TONES.ink,
              )}
            >
              <span className="kicker">{note.dateLabel}</span>
              <h2 className="mt-5 font-display text-2xl leading-snug">{note.title}</h2>
              <p className="mt-3 line-clamp-5 flex-1 text-sm leading-relaxed text-mist">
                {note.text}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
