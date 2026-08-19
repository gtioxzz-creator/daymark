import { createFileRoute } from "@tanstack/react-router";
import { AskChat } from "@/components/ask-chat";

export const Route = createFileRoute("/_app/ask")({
  component: AskChat,
});
