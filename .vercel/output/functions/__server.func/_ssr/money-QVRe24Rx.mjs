import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { S as ArrowUpRight, l as Minus } from "../_libs/lucide-react.mjs";
import { n as cn, t as Button } from "./button-GCsEU1D_.mjs";
import { S as wholeMoney, f as localISO, h as pct, i as debtTotal, m as money, s as formatDate, v as useDaymark } from "./store-BUhXWTXw.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/money-QVRe24Rx.js
var import_jsx_runtime = require_jsx_runtime();
function MoneyView() {
	const balance = useDaymark((s) => s.accountBalance);
	const debts = useDaymark((s) => s.debts);
	const transactions = useDaymark((s) => s.transactions);
	const openModal = useDaymark((s) => s.openModal);
	const outstanding = debtTotal(debts);
	const original = debts.reduce((sum, debt) => sum + debt.amount, 0);
	const paid = debts.reduce((sum, debt) => sum + debt.paid, 0);
	const active = debts.filter((debt) => debt.paid < debt.amount);
	const settled = debts.filter((debt) => debt.amount > 0 && debt.paid >= debt.amount);
	const income = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
	const spend = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pt-10 md:pt-12",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "kicker",
					children: "Ledger"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-2 font-display text-title",
					children: "The money"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 lg:grid-cols-[1.15fr_0.85fr]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "flex min-h-[300px] flex-col justify-between rounded-lg bg-card p-7 shadow-[var(--shadow-border)]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "kicker",
							children: "Available"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 font-display text-6xl leading-none tracking-tight tabular-nums",
							children: money(balance)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 text-xs text-mist",
							children: ["Local device ledger · ", formatDate(localISO(), "MMM d")]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-8 grid grid-cols-3 gap-2",
							children: [
								["Income", money(income)],
								["Spending", money(spend)],
								["Debt", wholeMoney(outstanding)]
							].map(([label, value]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-md bg-raised px-3 py-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "kicker",
									children: label
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
									className: "mt-2 block text-sm font-medium tabular-nums",
									children: value
								})]
							}, label))
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-8 flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "flex-1",
							onClick: () => openModal({ type: "transaction" }),
							children: "Add transaction"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							className: "flex-1",
							onClick: () => openModal({ type: "payment" }),
							children: "Pay down debt"
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-lg bg-card p-7 shadow-[var(--shadow-border)]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-2 flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-2xl",
							children: "Activity"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => openModal({ type: "history" }),
							className: "kicker text-mist hover:text-ink",
							children: "View all"
						})]
					}), transactions.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-10 text-sm text-mist",
						children: "The trail is empty. Add a paycheck or a bill and it will live here."
					}) : transactions.slice(0, 6).map((entry) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3 border-t border-rule py-3.5 first:border-0",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "grid size-8 place-items-center rounded-md bg-raised text-mark",
								children: entry.type === "income" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { className: "size-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, { className: "size-3.5" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate text-sm",
									children: entry.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-[11px] text-mist",
									children: [entry.category, entry.source ? ` · ${entry.source}` : ""]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: cn("font-mono text-xs tabular-nums", entry.type === "income" && "text-good"),
								children: [entry.type === "income" ? "+" : "−", money(entry.amount)]
							})
						]
					}, entry.id))]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-4 rounded-lg bg-card p-7 shadow-[var(--shadow-border)]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-2 flex items-end justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-2xl",
							children: "Debt map"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "kicker",
							children: [
								active.length,
								" active · ",
								pct(paid, original),
								"% paid down"
							]
						})]
					}),
					active.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "py-10 text-sm text-mist",
						children: "No active debts. Quiet books."
					}) : active.map((debt) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-3 border-t border-rule py-5 sm:flex-row sm:items-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-medium",
									children: debt.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-1 text-xs text-mist",
									children: [
										debt.rate,
										" · ",
										pct(debt.paid, debt.amount),
										"% paid"
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-3 h-1 overflow-hidden rounded-full bg-rule",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "h-full bg-mark",
										style: { width: `${pct(debt.paid, debt.amount)}%` }
									})
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono text-sm tabular-nums",
								children: wholeMoney(debt.amount - debt.paid)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "secondary",
								onClick: () => openModal({
									type: "payment",
									debtId: debt.id
								}),
								children: "Pay"
							})]
						})]
					}, debt.id)),
					settled.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => openModal({ type: "settled" }),
						className: "mt-2 w-full border-t border-rule pt-4 text-left text-xs text-mist hover:text-ink",
						children: [settled.length, " paid off"]
					})
				]
			})
		]
	});
}
var SplitComponent = MoneyView;
//#endregion
export { SplitComponent as component };
