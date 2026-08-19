import { createFileRoute } from "@tanstack/react-router";
import { TodayView } from "@/components/views/today-view";

export const Route = createFileRoute("/_app/")({
  component: TodayPage,
});

function TodayPage() {
  return <TodayView />;
}