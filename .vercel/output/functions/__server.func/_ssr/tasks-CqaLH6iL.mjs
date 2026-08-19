import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { y as Check } from "../_libs/lucide-react.mjs";
import { n as cn, t as Button } from "./button-GCsEU1D_.mjs";
import { b as visibleTasks, v as useDaymark } from "./store-BUhXWTXw.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/tasks-CqaLH6iL.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var FILTERS = [
	"All",
	"Open",
	"Done",
	"Money",
	"Home",
	"Work",
	"School"
];
function TasksView() {
	const tasks = useDaymark((s) => s.tasks);
	const completed = useDaymark((s) => s.completedTasks);
	const toggleTask = useDaymark((s) => s.toggleTask);
	const openModal = useDaymark((s) => s.openModal);
	const [filter, setFilter] = (0, import_react.useState)("All");
	const all = visibleTasks({
		tasks,
		completedTasks: completed
	});
	const shown = (0, import_react.useMemo)(() => {
		return all.filter((task) => {
			if (filter === "Open") return !task.done;
			if (filter === "Done") return task.done;
			if (filter === "All") return true;
			return task.category === filter;
		});
	}, [all, filter]);
	const openCount = all.filter((task) => !task.done).length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pt-10 md:pt-12",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "kicker",
						children: "Tasks"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-2 font-display text-title",
						children: "What needs to move"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 max-w-md text-sm text-mist",
						children: [openCount, " open. Finished work stays visible so the day still shows its wins."]
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: () => openModal({ type: "task" }),
					children: "New task"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-6 flex flex-wrap gap-2",
				children: FILTERS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setFilter(item),
					className: cn("h-9 rounded-full px-3 text-xs text-mist shadow-[inset_0_0_0_1px_var(--color-rule)]", filter === item && "bg-ink text-paper shadow-none"),
					children: item
				}, item))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "rounded-lg bg-card shadow-[var(--shadow-border)]",
				children: shown.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "px-6 py-16 text-center text-sm text-mist",
					children: "Nothing in this view. Add the next useful thing."
				}) : shown.map((task) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: cn("flex items-center gap-4 border-b border-rule px-5 py-5 last:border-0 md:px-7", task.done && "opacity-55"),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-label": task.done ? "Reopen task" : "Complete task",
							onClick: () => toggleTask(task.id),
							className: cn("grid size-7 shrink-0 place-items-center rounded-sm shadow-[inset_0_0_0_1px_var(--color-rule)] after:absolute after:size-10", "relative", task.done && "bg-mark text-mark-ink shadow-none"),
							children: task.done && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3.5" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => openModal({
								type: "task",
								id: task.id
							}),
							className: "min-w-0 flex-1 text-left",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: cn("block font-display text-xl leading-snug", task.done && "line-through"),
								children: task.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "mt-1 block text-xs text-mist",
								children: [task.category, task.meta ? ` · ${task.meta}` : ""]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "hidden font-mono text-[10px] tracking-wider text-faint uppercase sm:block",
							children: task.done ? "Done" : "Open"
						})
					]
				}, task.id))
			})
		]
	});
}
var SplitComponent = TasksView;
//#endregion
export { SplitComponent as component };
