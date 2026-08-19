import { createFileRoute } from "@tanstack/react-router";
import { JournalView } from "@/components/views/journal-view";

export const Route = createFileRoute("/_app/journal")({
  component: JournalView,
});
