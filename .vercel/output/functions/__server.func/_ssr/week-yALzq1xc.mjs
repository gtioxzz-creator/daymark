import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { _ as ChevronRight, v as ChevronLeft } from "../_libs/lucide-react.mjs";
import { n as cn, t as Button } from "./button-GCsEU1D_.mjs";
import { _ as timeFromMinutes, a as eventHeight, c as formatTime, f as localISO, g as snapMinutes, n as clampCalendarMinutes, o as eventTop, p as minutesFromMidnight, s as formatDate, v as useDaymark, x as weekDates } from "./store-BUhXWTXw.mjs";
import { t as useNow } from "./use-now-D8fVBcbY.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/week-yALzq1xc.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var HOURS = Array.from({ length: 16 }, (_, i) => 6 + i);
function categoryTone(category) {
	const key = category.toLowerCase();
	if (key.includes("school")) return "school";
	if (key.includes("family") || key.includes("health")) return "warm";
	if (key.includes("work")) return "work";
	return "calm";
}
function overlaps(a, b) {
	if (a.date !== b.date) return false;
	const as = minutesFromMidnight(a.time);
	const ae = minutesFromMidnight(a.endTime);
	const bs = minutesFromMidnight(b.time);
	return as < minutesFromMidnight(b.endTime) && bs < ae;
}
function layoutDay(events) {
	const sorted = [...events].sort((a, b) => minutesFromMidnight(a.time) - minutesFromMidnight(b.time));
	const columns = [];
	const colOf = /* @__PURE__ */ new Map();
	for (const event of sorted) {
		let col = 0;
		while (columns[col]?.some((other) => overlaps(other, event))) col += 1;
		if (!columns[col]) columns[col] = [];
		columns[col].push(event);
		colOf.set(event.id, col);
	}
	const clusterWidth = /* @__PURE__ */ new Map();
	for (const event of sorted) {
		const cluster = sorted.filter((other) => overlaps(event, other) || other.id === event.id);
		const maxCol = Math.max(...cluster.map((item) => colOf.get(item.id) ?? 0));
		clusterWidth.set(event.id, maxCol + 1);
	}
	return {
		colOf,
		clusterWidth
	};
}
function WeekCalendar({ dates, events, now, onMove, onSelect, onCreate }) {
	const today = localISO(now);
	const boardRef = (0, import_react.useRef)(null);
	const scrollRef = (0, import_react.useRef)(null);
	const dragRef = (0, import_react.useRef)(null);
	const [drag, setDrag] = (0, import_react.useState)(null);
	const [draft, setDraft] = (0, import_react.useState)(null);
	const hoursLabel = (hour) => {
		const suffix = hour >= 12 ? "PM" : "AM";
		return `${hour % 12 || 12} ${suffix}`;
	};
	const nowTop = (0, import_react.useMemo)(() => {
		const mins = now.getHours() * 60 + now.getMinutes();
		return eventTop(timeFromMinutes(mins));
	}, [now]);
	function dateFromClientX(clientX) {
		const root = boardRef.current;
		if (!root) return null;
		const days = root.querySelectorAll("[data-cal-day]");
		for (const day of days) {
			const box = day.getBoundingClientRect();
			if (clientX >= box.left && clientX <= box.right) return day.dataset.calDay ?? null;
		}
		return null;
	}
	(0, import_react.useEffect)(() => {
		const root = scrollRef.current;
		if (!root) return;
		const hour = Math.max(6, Math.min(now.getHours(), 19));
		root.scrollTop = Math.max(0, (hour - 6) * 72 - 16);
	}, [dates[0], now.getHours()]);
	(0, import_react.useEffect)(() => {
		dragRef.current = drag;
	}, [drag]);
	(0, import_react.useEffect)(() => {
		if (!drag) return;
		const onMovePtr = (event) => {
			const delta = event.clientY - drag.originY;
			const deltaMins = snapMinutes(delta / 72 * 60, 15);
			const nextDate = dateFromClientX(event.clientX) ?? drag.date;
			if (drag.mode === "move") {
				const duration = drag.endMins - drag.startMins;
				const start = clampCalendarMinutes(snapMinutes(drag.startMins + deltaMins));
				const end = clampCalendarMinutes(start + duration);
				setDraft({
					id: drag.id,
					date: nextDate,
					time: timeFromMinutes(start),
					endTime: timeFromMinutes(Math.max(start + 15, end))
				});
			} else {
				const end = clampCalendarMinutes(snapMinutes(Math.max(drag.startMins + 15, drag.endMins + deltaMins)));
				setDraft({
					id: drag.id,
					date: drag.date,
					time: timeFromMinutes(drag.startMins),
					endTime: timeFromMinutes(end)
				});
			}
			setDrag((prev) => prev ? {
				...prev,
				moved: true
			} : prev);
		};
		const onUp = () => {
			if (draft && drag.moved) onMove(draft.id, draft.date, draft.time, draft.endTime);
			setDrag(null);
			setDraft(null);
		};
		window.addEventListener("pointermove", onMovePtr);
		window.addEventListener("pointerup", onUp);
		return () => {
			window.removeEventListener("pointermove", onMovePtr);
			window.removeEventListener("pointerup", onUp);
		};
	}, [
		drag,
		draft,
		onMove
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref: boardRef,
		className: "min-w-[860px]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid grid-cols-[64px_repeat(7,minmax(0,1fr))] border-b border-rule",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {}), dates.map((date) => {
				const isToday = date === today;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: cn("border-l border-rule px-3 py-3", isToday && "bg-mark/8"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "kicker",
						children: (/* @__PURE__ */ new Date(`${date}T12:00:00`)).toLocaleDateString("en-US", { weekday: "short" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: cn("mt-1 font-display text-2xl leading-none", isToday && "text-mark"),
						children: (/* @__PURE__ */ new Date(`${date}T12:00:00`)).getDate()
					})]
				}, date);
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			ref: scrollRef,
			className: "max-h-[680px] overflow-y-auto",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative grid grid-cols-[64px_repeat(7,minmax(0,1fr))]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: HOURS.map((hour) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "relative border-t border-rule pr-2 text-right",
					style: { height: 72 },
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "kicker relative -top-2 text-faint",
						children: hoursLabel(hour)
					})
				}, hour)) }), dates.map((date) => {
					const dayEvents = events.filter((event) => event.date === date);
					const { colOf, clusterWidth } = layoutDay(dayEvents);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-cal-day": date,
						className: "relative border-l border-rule",
						style: { height: HOURS.length * 72 },
						onDoubleClick: (event) => {
							const box = event.currentTarget.getBoundingClientRect();
							const mins = clampCalendarMinutes(snapMinutes(360 + (event.clientY - box.top) / 72 * 60));
							onCreate(date, timeFromMinutes(mins));
						},
						onClick: (event) => {
							if (event.target !== event.currentTarget) return;
							const box = event.currentTarget.getBoundingClientRect();
							const mins = clampCalendarMinutes(snapMinutes(360 + (event.clientY - box.top) / 72 * 60));
							onCreate(date, timeFromMinutes(mins));
						},
						children: [
							HOURS.map((hour) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "pointer-events-none border-t border-rule/80",
								style: { height: 72 }
							}, hour)),
							date === today && nowTop >= 0 && nowTop <= HOURS.length * 72 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "pointer-events-none absolute right-0 left-0 z-20 flex items-center",
								style: { top: nowTop },
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-2 -ml-1 rounded-full bg-mark" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px flex-1 bg-mark" })]
							}),
							dayEvents.map((event) => {
								const live = draft?.id === event.id ? draft : event;
								const col = colOf.get(event.id) ?? 0;
								const width = 100 / (clusterWidth.get(event.id) ?? 1);
								const left = col * width;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: (ev) => {
										ev.stopPropagation();
										if (dragRef.current?.moved) return;
										onSelect(event.id);
									},
									onPointerDown: (ev) => {
										ev.stopPropagation();
										ev.preventDefault();
										ev.currentTarget.setPointerCapture(ev.pointerId);
										setDrag({
											id: event.id,
											mode: "move",
											originY: ev.clientY,
											startMins: minutesFromMidnight(event.time),
											endMins: minutesFromMidnight(event.endTime),
											date: event.date,
											moved: false
										});
										setDraft({
											id: event.id,
											date: event.date,
											time: event.time,
											endTime: event.endTime
										});
									},
									className: cn("cal-chip absolute z-10 overflow-hidden rounded-sm px-2 py-1.5 text-left shadow-[var(--shadow-border)] transition-[filter] hover:brightness-110", categoryTone(event.category) === "school" && "cal-chip-school", categoryTone(event.category) === "warm" && "cal-chip-warm", categoryTone(event.category) === "work" && "cal-chip-work"),
									style: {
										top: eventTop(live.date === date ? live.time : event.time),
										height: eventHeight(live.date === date ? live.time : event.time, live.date === date ? live.endTime : event.endTime),
										left: `calc(${left}% + 4px)`,
										width: `calc(${width}% - 8px)`,
										display: live.date === date ? "block" : "none"
									},
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "block truncate font-medium text-[12px] leading-tight",
											children: event.title
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "mt-0.5 block truncate font-mono text-[10px] text-mist",
											children: formatTime(live.date === date ? live.time : event.time)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											role: "separator",
											onPointerDown: (ev) => {
												ev.stopPropagation();
												ev.preventDefault();
												setDrag({
													id: event.id,
													mode: "resize",
													originY: ev.clientY,
													startMins: minutesFromMidnight(event.time),
													endMins: minutesFromMidnight(event.endTime),
													date: event.date,
													moved: false
												});
												setDraft({
													id: event.id,
													date: event.date,
													time: event.time,
													endTime: event.endTime
												});
											},
											className: "absolute right-1 bottom-0 left-1 h-2 cursor-ns-resize"
										})
									]
								}, event.id);
							})
						]
					}, date);
				})]
			})
		})]
	});
}
function WeekView({ now }) {
	const [offset, setOffset] = (0, import_react.useState)(0);
	const events = useDaymark((s) => s.events);
	const moveEvent = useDaymark((s) => s.moveEvent);
	const openModal = useDaymark((s) => s.openModal);
	const dates = weekDates(offset, now);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pt-10 md:pt-12",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "kicker",
						children: "Planner"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-2 font-display text-title",
						children: "The week"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-sm text-mist",
						children: [
							formatDate(dates[0], "MMM d"),
							" — ",
							formatDate(dates[6], "MMM d, yyyy")
						]
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							size: "icon",
							onClick: () => setOffset((v) => v - 1),
							"aria-label": "Previous week",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-4" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							size: "sm",
							onClick: () => setOffset(0),
							children: "Today"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							size: "icon",
							onClick: () => setOffset((v) => v + 1),
							"aria-label": "Next week",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-4" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							onClick: () => openModal({
								type: "event",
								date: localISO(now)
							}),
							children: "New event"
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-4 text-xs text-mist",
				children: "Hour rows. Events sit at their exact time — 9:15 starts a quarter into the 9 AM hour. Drag to move, pull the bottom edge to resize, click an empty hour to add."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overflow-x-auto rounded-lg bg-card shadow-[var(--shadow-border)]",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WeekCalendar, {
					dates,
					events,
					now,
					onMove: (id, date, time, endTime) => moveEvent(id, date, time, endTime),
					onSelect: (id) => openModal({
						type: "event",
						id
					}),
					onCreate: (date, time) => openModal({
						type: "event",
						date,
						time
					})
				})
			})
		]
	});
}
function WeekPage() {
	const { now } = useNow(3e4);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WeekView, { now });
}
//#endregion
export { WeekPage as component };
