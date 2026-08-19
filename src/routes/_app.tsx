import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { CloudSync } from "@/components/cloud-sync";
import { ModalHost } from "@/components/modal-host";
import { AppShell } from "@/components/shell";
import { ClockProvider } from "@/lib/clock";
import { useDaymark } from "@/lib/store";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const theme = useDaymark((s) => s.settings.theme);
  return (
    <ClockProvider>
      <AppShell>
        <Outlet />
        <CloudSync />
        <ModalHost />
        <Toaster
          theme={theme === "parchment" ? "light" : "dark"}
          position="bottom-center"
          toastOptions={{
            className: "!bg-ink !text-paper !border-0 !font-sans !text-sm",
          }}
        />
      </AppShell>
    </ClockProvider>
  );
}