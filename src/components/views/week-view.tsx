import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { WeekCalendar } from "@/components/week-calendar";
import { Button } from "@/components/ui/button";
import { useDaymark } from "@/lib/store";
import { formatDate, localISO, weekDates } from "@/lib/time";
import { expandEvents } from "@/lib/recur";

export function WeekView({ now }: { now: Date }) {
  const [offset, setOffset] = useState(0);
  const events = useDaymark((s) => s.events);
  const moveEvent = useDaymark((s) => s.moveEvent);
  const openModal = useDaymark((s) => s.openModal);
  const dates = weekDates(offset, now);
  const weekEvents = expandEvents(events, dates[0]!, dates[6]!);

  return (
    <div className="pt-10 md:pt-12">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="kicker">Planner</p>
          <h1 className="mt-2 font-display text-title">The week</h1>
          <p className="mt-2 text-sm text-mist">
            {formatDate(dates[0]!, "MMM d")} — {formatDate(dates[6]!, "MMM d, yyyy")}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" size="icon" onClick={() => setOffset((v) => v - 1)} aria-label="Previous week">
            <ChevronLeft className="size-4" />
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setOffset(0)}>
            Today
          </Button>
          <Button variant="secondary" size="icon" onClick={() => setOffset((v) => v + 1)} aria-label="Next week">
            <ChevronRight className="size-4" />
          </Button>
          <Button
            size="sm"
            onClick={() => openModal({ type: "event", date: localISO(now) })}
          >
            New event
          </Button>
        </div>
      </div>
      <div className="panel overflow-x-auto rounded-xl">
        <WeekCalendar
          dates={dates}
          events={weekEvents}
          now={now}
          onMove={(id, date, time, endTime) => moveEvent(id, date, time, endTime)}
          onSelect={(id) => openModal({ type: "event", id })}
          onCreate={(date, time) => openModal({ type: "event", date, time })}
        />
      </div>
    </div>
  );
}
