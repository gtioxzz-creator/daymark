import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { hasLife, loadCloud, saveCloud } from "@/lib/cloud";
import { snapshotState, useDaymark } from "@/lib/store";

type SyncState = "off" | "loading" | "saved" | "error";

let syncAt = "";
let syncState: SyncState = "off";
let syncDetail = "";
const listeners = new Set<() => void>();

function setSync(next: SyncState, detail = "") {
  syncState = next;
  syncDetail = detail;
  if (next === "saved") syncAt = new Date().toISOString();
  listeners.forEach((fn) => fn());
}

export function useCloudStatus() {
  const [, bump] = useState(0);
  useEffect(() => {
    const fn = () => bump((n) => n + 1);
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  }, []);
  return { state: syncState, at: syncAt, detail: syncDetail };
}

export async function pushCloudNow() {
  const snap = snapshotState(useDaymark.getState());
  setSync("loading", "Saving…");
  const result = await saveCloud({ data: snap });
  if (!result?.ok) throw new Error("Save failed");
  setSync("saved", "On your account");
  return result;
}

export function CloudSync() {
  const { user, isPending } = useCurrentUserState();
  const hydrated = useDaymark((s) => s.hydrated);
  const hydrateFromCloud = useDaymark((s) => s.hydrateFromCloud);
  const ready = useRef(false);
  const greeted = useRef(false);

  useEffect(() => {
    if (isPending) return;
    if (!user) {
      setSync("off", "Not signed in");
      ready.current = false;
      return;
    }
    if (!hydrated) return;
    let alive = true;
    setSync("loading", "Checking your account…");
    loadCloud()
      .then(async (remote) => {
        if (!alive) return;
        const local = snapshotState(useDaymark.getState());
        const remoteLife = hasLife(remote?.payload);
        const localLife = hasLife(local);

        if (remoteLife && !localLife) {
          hydrateFromCloud(remote!.payload);
          setSync("saved", "Loaded from your account");
          if (!greeted.current) {
            toast("Your day is on this device again.");
            greeted.current = true;
          }
        } else if (localLife && !remoteLife) {
          await saveCloud({ data: local });
          setSync("saved", "Copied this device to your account");
          if (!greeted.current) {
            toast("This device’s day is on your account now.");
            greeted.current = true;
          }
        } else if (localLife && remoteLife) {
          hydrateFromCloud(remote!.payload);
          setSync("saved", "Loaded from your account");
          if (!greeted.current) {
            toast("Loaded the day on your account.");
            greeted.current = true;
          }
        } else {
          setSync("saved", "Account is ready. Empty until you add a day.");
        }
        ready.current = true;
      })
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : "Could not reach your account.";
        setSync("error", message);
        toast("Account save failed. Your day is still on this device.");
        ready.current = true;
      });
    return () => {
      alive = false;
    };
  }, [user, isPending, hydrated, hydrateFromCloud]);

  useEffect(() => {
    if (!user || !hydrated) return;
    let timer = 0;
    const unsub = useDaymark.subscribe((state) => {
      if (!ready.current) return;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        void saveCloud({ data: snapshotState(state) })
          .then(() => setSync("saved", "On your account"))
          .catch(() => setSync("error", "Last save failed"));
      }, 900);
    });
    return () => {
      window.clearTimeout(timer);
      unsub();
    };
  }, [user, hydrated]);

  return null;
}
