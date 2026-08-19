import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import type { DaymarkState } from "@/lib/types";

export type CloudPayload = DaymarkState;

function hasLife(payload: Partial<DaymarkState> | null | undefined): boolean {
  if (!payload) return false;
  return (
    (payload.tasks?.length ?? 0) +
      (payload.events?.length ?? 0) +
      (payload.debts?.length ?? 0) +
      (payload.notes?.length ?? 0) +
      (payload.habits?.length ?? 0) +
      (payload.transactions?.length ?? 0) >
    0
  );
}

export { hasLife };

export const loadCloud = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql.query<{ payload: unknown; updated_at: string }>(
      "select payload, updated_at from daymark_state where user_id = $1 limit 1",
      [context.userId],
    );
    const row = rows[0];
    if (!row) return null;
    const payload =
      typeof row.payload === "string"
        ? (JSON.parse(row.payload) as CloudPayload)
        : (row.payload as CloudPayload);
    return { payload, updated_at: row.updated_at };
  });

export const saveCloud = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((payload: CloudPayload) => payload)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql.query(
      `insert into daymark_state (user_id, payload, updated_at)
       values ($1, $2::jsonb, now())
       on conflict (user_id) do update
       set payload = excluded.payload, updated_at = now()`,
      [context.userId, JSON.stringify(data)],
    );
    return { ok: true as const, at: new Date().toISOString() };
  });
