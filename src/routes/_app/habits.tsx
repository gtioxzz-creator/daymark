import { createFileRoute } from "@tanstack/react-router";
import { HabitsView } from "@/components/views/habits-view";

export const Route = createFileRoute("/_app/habits")({
  component: HabitsView,
});
