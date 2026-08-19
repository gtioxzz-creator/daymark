import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { c as Moon, f as Leaf, m as Cross, p as Droplets, r as Sun, s as PersonStanding, x as BookOpen, y as Check } from "../_libs/lucide-react.mjs";
import { n as cn, t as Button } from "./button-GCsEU1D_.mjs";
import { d as lastNDates, f as localISO, u as habitStreak, v as useDaymark } from "./store-BUhXWTXw.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/habits-Bt_A_eDj.js
var import_jsx_runtime = require_jsx_runtime();
function HabitGlyph({ icon, className }) {
	const props = {
		className,
		strokeWidth: 1.6
	};
	switch (icon) {
		case "cross": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cross, { ...props });
		case "sun": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sun, { ...props });
		case "move": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PersonStanding, { ...props });
		case "book": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, { ...props });
		case "water": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Droplets, { ...props });
		case "moon": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Moon, { ...props });
		default: return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Leaf, { ...props });
	}
}
function HabitsView() {
	const habits = useDaymark((s) => s.habits);
	const toggleHabit = useDaymark((s) => s.toggleHabit);
	const openModal = useDaymark((s) => s.openModal);
	const today = localISO();
	const grid = lastNDates(84);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pt-10 md:pt-12",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "kicker",
					children: "Rituals"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-2 font-display text-title",
					children: "Practice, not streak theater"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 max-w-lg text-sm text-mist",
					children: "Each mark is a real day. The grid is twelve weeks. Missing today does not erase the work already done."
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				onClick: () => openModal({ type: "habit" }),
				children: "New ritual"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-4 lg:grid-cols-3",
			children: habits.map((habit) => {
				const done = habit.history.includes(today);
				const streak = habitStreak(habit.history, today);
				const set = new Set(habit.history);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: cn("rounded-lg bg-card p-6 shadow-[var(--shadow-border)]", done && "shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--color-mark)_45%,transparent),var(--shadow-border)]"),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => openModal({
								type: "habit",
								id: habit.id
							}),
							className: "flex w-full items-start gap-3 text-left",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "grid size-10 place-items-center rounded-md bg-raised text-mark",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HabitGlyph, {
									icon: habit.icon,
									className: "size-4"
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block font-display text-2xl leading-tight",
									children: habit.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "mt-1 block text-xs text-mist",
									children: [
										streak,
										" day streak · ",
										set.size,
										" days kept"
									]
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-6 grid grid-cols-14 gap-1",
							children: grid.map((day) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {
								title: day,
								className: cn("h-2.5 rounded-[2px] bg-rule", set.has(day) && "bg-mark", day === today && "ring-1 ring-ink/40")
							}, day))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: done ? "secondary" : "primary",
							className: "mt-6 w-full",
							onClick: () => toggleHabit(habit.id),
							children: done ? "Mark incomplete" : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3.5" }), "Complete today"] })
						})
					]
				}, habit.id);
			})
		})]
	});
}
var SplitComponent = HabitsView;
//#endregion
export { SplitComponent as component };
