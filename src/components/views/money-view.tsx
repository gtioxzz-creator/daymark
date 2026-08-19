import { ArrowUpRight, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { moneyPlan } from "@/lib/decide";
import { debtTotal, useDaymark } from "@/lib/store";
import { formatDate, localISO, money, pct, wholeMoney } from "@/lib/time";
import { useClock } from "@/lib/clock";
import { cn } from "@/lib/utils";

export function MoneyView() {
  const now = useClock();
  const balance = useDaymark((s) => s.accountBalance);
  const debts = useDaymark((s) => s.debts);
  const transactions = useDaymark((s) => s.transactions);
  const openModal = useDaymark((s) => s.openModal);

  const outstanding = debtTotal(debts);
  const paid = debts.reduce((sum, debt) => sum + debt.paid, 0);
  const active = debts.filter((debt) => debt.paid < debt.amount);
  const settled = debts.filter((debt) => debt.amount > 0 && debt.paid >= debt.amount);
  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const spend = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const plan = moneyPlan(debts, balance, localISO(now));

  return (
    <div className="pt-10 md:pt-12">
      <div className="mb-8">
        <p className="kicker">Ledger</p>
        <h1 className="mt-2 font-display text-4xl md:text-title">The money</h1>
        <p className="mt-3 max-w-lg text-sm text-mist">{plan.line}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="panel-moss flex min-h-[300px] flex-col justify-between rounded-xl p-7">
          <div>
            <p className="kicker">Available</p>
            <p className="mt-4 font-display text-6xl leading-none tracking-tight tabular-nums">
              {money(balance)}
            </p>
            <p className="mt-2 text-xs text-mist">
              {formatDate(localISO(now), "MMM d")}
            </p>
            <div className="mt-8 grid grid-cols-3 gap-2">
              {[
                ["Income", money(income)],
                ["Spending", money(spend)],
                ["Debt", wholeMoney(outstanding)],
              ].map(([label, value]) => (
                <div key={label} className="rounded-md bg-raised px-3 py-3">
                  <span className="kicker">{label}</span>
                  <strong className="mt-2 block text-sm font-medium tabular-nums">
                    {value}
                  </strong>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-8 flex flex-wrap gap-2">
            <Button onClick={() => openModal({ type: "transaction" })}>
              Add transaction
            </Button>
            <Button variant="secondary" onClick={() => openModal({ type: "payment" })}>
              Pay debt
            </Button>
            <Button variant="ghost" onClick={() => openModal({ type: "history" })}>
              History
            </Button>
          </div>
        </section>

        <section className="panel rounded-xl p-7">
          <div className="flex items-end justify-between">
            <div>
              <p className="kicker">Debts</p>
              <h2 className="mt-2 font-display text-2xl">
                {wholeMoney(outstanding)} open
              </h2>
            </div>
            {settled.length > 0 && (
              <button
                type="button"
                onClick={() => openModal({ type: "settled" })}
                className="kicker text-mist hover:text-ink"
              >
                Settled
              </button>
            )}
          </div>
          <div className="mt-6">
            {active.length === 0 ? (
              <p className="py-10 text-center text-sm text-mist">Nothing left to pay down.</p>
            ) : (
              active.map((debt) => {
                const left = Math.max(0, debt.amount - debt.paid);
                return (
                  <button
                    key={debt.id}
                    type="button"
                    onClick={() => openModal({ type: "payment", debtId: debt.id })}
                    className="w-full border-t border-rule py-4 text-left"
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-sm">{debt.name}</span>
                      <span className="font-mono text-xs tabular-nums">{wholeMoney(left)}</span>
                    </div>
                    <p className="mt-1 text-[11px] text-mist">{debt.rate}</p>
                    <div className="mt-3 h-px overflow-hidden bg-rule">
                      <div
                        className="h-full bg-mark"
                        style={{ width: `${pct(debt.paid, debt.amount)}%` }}
                      />
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </section>
      </div>

      <section className="panel mt-4 rounded-xl px-7 py-6">
        <p className="kicker">This week</p>
        <h2 className="mt-2 font-display text-2xl">The move</h2>
        <div className="mt-4">
          {plan.items.map((item) => (
            <div key={item.name} className="flex items-baseline justify-between gap-4 border-t border-rule py-4">
              <div>
                <p className="text-sm">{item.name}</p>
                <p className="mt-1 text-xs text-mist">{item.note}</p>
              </div>
              <span className="font-mono text-xs tabular-nums">{wholeMoney(item.left)}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="panel mt-4 rounded-xl">
        <div className="flex items-end justify-between px-7 py-6">
          <div>
            <p className="kicker">Activity</p>
            <h2 className="mt-2 font-display text-2xl">The trail</h2>
          </div>
          <button
            type="button"
            onClick={() => openModal({ type: "history" })}
            className="kicker text-mist hover:text-ink"
          >
            All
          </button>
        </div>
        {transactions.length === 0 ? (
          <p className="px-7 pb-10 text-sm text-mist">No transactions yet.</p>
        ) : (
          transactions.slice(0, 8).map((entry) => (
            <div
              key={entry.id}
              className="flex items-center gap-3 border-t border-rule px-7 py-4"
            >
              <span
                className={cn(
                  "grid size-8 place-items-center rounded-full bg-raised",
                  entry.type === "income" ? "text-mark" : "text-mist",
                )}
              >
                {entry.type === "income" ? (
                  <ArrowUpRight className="size-3.5" />
                ) : (
                  <Minus className="size-3.5" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm">{entry.name}</p>
                <p className="text-[11px] text-mist">
                  {entry.category}
                  {entry.source ? ` · ${entry.source}` : ""}
                </p>
              </div>
              <span className="font-mono text-xs tabular-nums">
                {entry.type === "income" ? "+" : "−"}
                {money(entry.amount)}
              </span>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
