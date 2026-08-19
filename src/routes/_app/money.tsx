import { createFileRoute } from "@tanstack/react-router";
import { MoneyView } from "@/components/views/money-view";

export const Route = createFileRoute("/_app/money")({
  component: MoneyView,
});
