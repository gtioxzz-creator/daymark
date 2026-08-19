import { createContext, useContext, type ReactNode } from "react";
import { useNow } from "./use-now";

const ClockContext = createContext<Date>(new Date());

export function ClockProvider({ children }: { children: ReactNode }) {
  const { now } = useNow(1000);
  return <ClockContext.Provider value={now}>{children}</ClockContext.Provider>;
}

export function useClock() {
  return useContext(ClockContext);
}
