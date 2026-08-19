import { createFileRoute } from "@tanstack/react-router";
import { WeekView } from "@/components/views/week-view";
import { useClock } from "@/lib/clock";

export const Route = createFileRoute("/_app/week")({
  component: WeekPage,
});

function WeekPage() {
  const now = useClock();
  return <WeekView now={now} />;
}