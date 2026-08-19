import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as cn, t as Button } from "./button-GCsEU1D_.mjs";
import { v as useDaymark } from "./store-BUhXWTXw.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/journal-BmwJHM26.js
var import_jsx_runtime = require_jsx_runtime();
var TONES = {
	sage: "bg-[color-mix(in_oklab,var(--color-mark)_12%,var(--color-card))]",
	dusk: "bg-[color-mix(in_oklab,var(--color-ink)_6%,var(--color-card))]",
	clay: "bg-[color-mix(in_oklab,var(--color-danger)_10%,var(--color-card))]",
	ink: "bg-card"
};
function JournalView() {
	const notes = useDaymark((s) => s.notes);
	const openModal = useDaymark((s) => s.openModal);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pt-10 md:pt-12",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "kicker",
					children: "Journal"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-2 font-display text-title",
					children: "What happened"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 max-w-md text-sm text-mist",
					children: "Private pages. Write it down so the day does not have to hold it."
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				onClick: () => openModal({ type: "note" }),
				children: "New entry"
			})]
		}), notes.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-lg border border-dashed border-rule px-6 py-20 text-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-display text-2xl",
				children: "The book is empty"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mx-auto mt-2 max-w-sm text-sm text-mist",
				children: "Start with one line. Title it later if you want."
			})]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
			children: notes.map((note) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => openModal({
					type: "note",
					id: note.id
				}),
				className: cn("flex min-h-[240px] flex-col rounded-lg p-6 text-left shadow-[var(--shadow-border)] transition-transform duration-200 hover:-translate-y-0.5", TONES[note.color] ?? TONES.ink),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "kicker",
						children: note.dateLabel
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-5 font-display text-2xl leading-snug",
						children: note.title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 line-clamp-5 flex-1 text-sm leading-relaxed text-mist",
						children: note.text
					})
				]
			}, note.id))
		})]
	});
}
var SplitComponent = JournalView;
//#endregion
export { SplitComponent as component };
