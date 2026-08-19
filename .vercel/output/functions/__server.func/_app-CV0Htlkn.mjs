import { o as __toESM } from "./_runtime.mjs";
import { n as require_react } from "./_libs/@radix-ui/react-compose-refs+[...].mjs";
import { v as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "./_libs/radix-ui__react-context+react.mjs";
import { S as ArrowUpRight, o as Plus, y as Check } from "./_libs/lucide-react.mjs";
import { n as cn, t as Button } from "./_ssr/button-GCsEU1D_.mjs";
import { S as wholeMoney, b as visibleTasks, c as formatTime, f as localISO, i as debtTotal, l as greeting, m as money, t as PROFILE, v as useDaymark, x as weekDates, y as verseFor } from "./_ssr/store-BUhXWTXw.mjs";
import { t as useNow } from "./_ssr/use-now-D8fVBcbY.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_app-CV0Htlkn.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function TodayView({ now }) {
	const tasks = useDaymark((s) => s.tasks);
	const completed = useDaymark((s) => s.completedTasks);
	const events = useDaymark((s) => s.events);
	const habits = useDaymark((s) => s.habits);
	const notes = useDaymark((s) => s.notes);
	const debts = useDaymark((s) => s.debts);
	const balance = useDaymark((s) => s.accountBalance);
	const quickNote = useDaymark((s) => s.quickNote);
	const setQuickNote = useDaymark((s) => s.setQuickNote);
	const toggleTask = useDaymark((s) => s.toggleTask);
	const toggleHabit = useDaymark((s) => s.toggleHabit);
	const openModal = useDaymark((s) => s.openModal);
	const today = localISO(now);
	const [verse, ref] = verseFor(today);
	const dayEvents = events.filter((event) => event.date === today).sort((a, b) => a.time.localeCompare(b.time));
	const list = visibleTasks({
		tasks,
		completedTasks: completed
	});
	const openTasks = list.filter((task) => !task.done);
	const progress = (now.getHours() * 60 + now.getMinutes()) / 1440 * 100;
	const week = weekDates(0, now);
	const ritualDone = habits.filter((h) => h.history.includes(today)).length;
	const clock = (0, import_react.useMemo)(() => now.toLocaleTimeString("en-US", {
		hour: "numeric",
		minute: "2-digit",
		hour12: true
	}), [now]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pt-10 md:pt-14",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "flex flex-col gap-10 border-b border-rule pb-10 lg:flex-row lg:items-end lg:gap-12",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 max-w-xl",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "kicker",
							children: [
								greeting(now.getHours()),
								", ",
								PROFILE.first
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
							className: "mt-3 font-display text-display",
							children: [now.toLocaleDateString("en-US", { weekday: "long" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-mist",
								children: "."
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-4 max-w-xl text-base text-mist",
							children: [now.toLocaleDateString("en-US", {
								month: "long",
								day: "numeric",
								year: "numeric"
							}), ". Keep the day simple."]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("blockquote", {
							className: "mt-8 max-w-xl border-l border-mark/70 pl-5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-display text-lg leading-snug text-ink/90 italic",
								children: verse
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("cite", {
								className: "kicker mt-3 block not-italic",
								children: ref
							})]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "w-full max-w-[280px] shrink-0 rounded-lg bg-card px-6 py-5 shadow-[var(--shadow-border)]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "kicker",
								children: "Local time"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-center gap-2 kicker text-mark",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "size-1.5 rounded-full bg-mark" }), "EDT"]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-5 font-display text-5xl leading-none tracking-tight tabular-nums",
							children: clock
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-6 flex justify-between font-mono text-[10px] text-mist",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Spring Hill" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [Math.round(progress), "% of day"] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3 h-1 overflow-hidden rounded-full bg-rule",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-full rounded-full bg-mark transition-[width] duration-500",
								style: { width: `${progress}%` }
							})
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 flex gap-1 overflow-x-auto py-3",
				children: week.map((date) => {
					const d = /* @__PURE__ */ new Date(`${date}T12:00:00`);
					const has = events.some((event) => event.date === date);
					const isToday = date === today;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/week",
						className: "flex min-w-12 flex-1 flex-col items-center gap-2 py-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "kicker",
							children: d.toLocaleDateString("en-US", { weekday: "narrow" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: cn("grid size-10 place-items-center rounded-full text-sm", isToday && "bg-ink text-paper", !isToday && has && "shadow-[inset_0_-2px_0_var(--color-mark)]"),
							children: d.getDate()
						})]
					}, date);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.85fr)]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-lg bg-card p-6 shadow-[var(--shadow-border)] md:p-7",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-end justify-between gap-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "kicker",
								children: "Up next"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mt-2 font-display text-3xl",
								children: "The day"
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => openModal({
									type: "event",
									date: today
								}),
								className: "kicker text-mist hover:text-ink",
								children: "Add event"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-6",
							children: dayEvents.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "rounded-md border border-dashed border-rule px-4 py-10 text-center text-sm text-mist",
								children: "Nothing on the calendar. The afternoon is still open."
							}) : dayEvents.map((event) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => openModal({
									type: "event",
									id: event.id
								}),
								className: "flex w-full items-center gap-4 border-t border-rule py-4 text-left transition-colors hover:bg-raised/50",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "w-16 shrink-0 font-mono text-[11px] text-mark",
										children: formatTime(event.time)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-1.5 rounded-full bg-mark" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "min-w-0 flex-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "block text-sm font-medium",
											children: event.title
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "mt-1 block text-xs text-mist",
											children: [event.category, event.location ? ` · ${event.location}` : ""]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { className: "size-4 text-faint" })
								]
							}, event.id))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-8 flex items-end justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "kicker",
								children: "The list"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
								className: "mt-2 font-display text-2xl",
								children: [openTasks.length, " still open"]
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => openModal({ type: "task" }),
								className: "kicker text-mist hover:text-ink",
								children: "Add task"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-4",
							children: list.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "rounded-md border border-dashed border-rule px-4 py-10 text-center text-sm text-mist",
								children: "Nothing urgent is waiting."
							}) : list.slice(0, 6).map((task) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: cn("flex items-center gap-3 border-t border-rule py-3.5", task.done && "opacity-50"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									"aria-label": task.done ? "Reopen task" : "Complete task",
									onClick: () => toggleTask(task.id),
									className: cn("grid size-6 shrink-0 place-items-center rounded-sm shadow-[inset_0_0_0_1px_var(--color-rule)]", task.done && "bg-mark text-mark-ink shadow-none"),
									children: task.done && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3.5" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => openModal({
										type: "task",
										id: task.id
									}),
									className: "min-w-0 flex-1 text-left",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: cn("block text-sm", task.done && "line-through"),
										children: task.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "mt-0.5 block text-xs text-mist",
										children: [task.category, task.meta ? ` · ${task.meta}` : ""]
									})]
								})]
							}, task.id))
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "rounded-lg bg-card p-6 shadow-[var(--shadow-border)]",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-end justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "kicker",
									children: "Rituals"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
									className: "mt-2 font-display text-2xl",
									children: [
										ritualDone,
										" of ",
										habits.length
									]
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/habits",
									className: "kicker text-mist hover:text-ink",
									children: "All"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-5 space-y-1",
								children: habits.map((habit) => {
									const done = habit.history.includes(today);
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => toggleHabit(habit.id),
										className: "flex w-full items-center gap-3 rounded-md py-2 text-left hover:bg-raised",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: cn("grid size-6 place-items-center rounded-full shadow-[inset_0_0_0_1px_var(--color-rule)]", done && "bg-ink text-paper shadow-none"),
											children: done && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3.5" })
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-sm",
											children: habit.name
										})]
									}, habit.id);
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "rounded-lg bg-card p-6 shadow-[var(--shadow-border)]",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "kicker",
									children: "Ledger"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-3 font-display text-4xl tracking-tight tabular-nums",
									children: money(balance)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-1 text-xs text-mist",
									children: [wholeMoney(debtTotal(debts)), " still owed"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-5 flex gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										size: "sm",
										variant: "secondary",
										className: "flex-1",
										onClick: () => openModal({ type: "transaction" }),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-3.5" }), "Transaction"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "ghost",
										onClick: () => openModal({ type: "payment" }),
										children: "Pay debt"
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "rounded-lg bg-card p-6 shadow-[var(--shadow-border)]",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-end justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "kicker",
										children: "Scratch"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/journal",
										className: "kicker text-mist hover:text-ink",
										children: "Journal"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
									value: quickNote,
									onChange: (event) => setQuickNote(event.target.value),
									placeholder: "A line for later…",
									className: "mt-4 min-h-24 w-full resize-none bg-transparent font-display text-lg leading-relaxed outline-none placeholder:text-faint"
								}),
								notes[0] && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => openModal({
										type: "note",
										id: notes[0].id
									}),
									className: "mt-2 w-full border-t border-rule pt-4 text-left",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block text-sm",
										children: notes[0].title
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "mt-1 block line-clamp-2 text-xs text-mist",
										children: notes[0].text
									})]
								})
							]
						})
					]
				})]
			})
		]
	});
}
function TodayPage() {
	const { now } = useNow(1e3);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TodayView, { now });
}
//#endregion
export { TodayPage as component };
