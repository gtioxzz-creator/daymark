import { o as __toESM } from "./_runtime.mjs";
import { n as require_react } from "./_libs/@radix-ui/react-compose-refs+[...].mjs";
import { d as useRouterState, m as Outlet, v as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "./_libs/radix-ui__react-context+react.mjs";
import { a as DialogOverlay, i as DialogDescription$1, n as DialogClose, o as DialogPortal, r as DialogContent$1, s as DialogTitle$1, t as Dialog$1 } from "./_libs/@radix-ui/react-dialog+[...].mjs";
import { a as Settings, b as CalendarDays, d as ListChecks, g as CircleDollarSign, h as Command, i as SunMedium, r as Sun, t as X, u as Mic, x as BookOpen } from "./_libs/lucide-react.mjs";
import { r as signOut, t as authClient } from "./_ssr/client-7PpZLKX8.mjs";
import { n as cn, t as Button } from "./_ssr/button-GCsEU1D_.mjs";
import { S as wholeMoney, _ as timeFromMinutes, b as visibleTasks, c as formatTime, f as localISO, m as money, p as minutesFromMidnight, r as clickSound, s as formatDate, t as PROFILE, u as habitStreak, v as useDaymark } from "./_ssr/store-BUhXWTXw.mjs";
import { n as toast, t as Toaster } from "./_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_app-BPNGpIcM.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function getRecognition() {
	if (typeof window === "undefined") return null;
	const w = window;
	return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}
function DictateButton({ onTranscript, className }) {
	const Rec = getRecognition();
	const [listening, setListening] = (0, import_react.useState)(false);
	const recRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => () => recRef.current?.stop(), []);
	if (!Rec) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		disabled: true,
		title: "Dictation is not supported in this browser",
		className: cn("grid size-9 place-items-center rounded-sm text-faint", className),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mic, { className: "size-3.5" })
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		title: listening ? "Listening" : "Dictate",
		"aria-label": listening ? "Stop dictation" : "Dictate",
		onClick: () => {
			if (listening) {
				recRef.current?.stop();
				return;
			}
			const recognition = new Rec();
			recRef.current = recognition;
			recognition.lang = "en-US";
			recognition.interimResults = false;
			recognition.onstart = () => setListening(true);
			recognition.onend = () => setListening(false);
			recognition.onerror = () => {
				setListening(false);
				toast("Dictation could not start here.");
			};
			recognition.onresult = (event) => {
				const text = Array.from(event.results).map((result) => result[0]?.transcript ?? "").join(" ").trim();
				if (text) onTranscript(text);
			};
			recognition.start();
		},
		className: cn("grid size-9 place-items-center rounded-sm text-mist transition-colors hover:bg-raised hover:text-ink", listening && "bg-mark text-mark-ink hover:bg-mark hover:text-mark-ink", className),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mic, { className: "size-3.5" })
	});
}
function FieldWithMic({ children, onTranscript, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("relative", className),
		children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DictateButton, {
			onTranscript,
			className: "absolute top-1 right-1"
		})]
	});
}
var Dialog = Dialog$1;
function DialogContent({ className, children, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, { className: "fixed inset-0 z-50 bg-paper/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent$1, {
		className: cn("fixed top-1/2 left-1/2 z-50 w-[min(440px,calc(100vw-28px))] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-card p-7 text-ink shadow-[var(--shadow-border),var(--shadow-lift)] outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95", className),
		...props,
		children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogClose, {
			className: "absolute top-4 right-4 grid size-10 place-items-center text-mist transition-colors hover:text-ink",
			"aria-label": "Close",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
		})]
	})] });
}
function DialogTitle({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle$1, {
		className: cn("font-display text-title text-ink", className),
		...props
	});
}
function DialogDescription({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription$1, {
		className: cn("kicker mb-3", className),
		...props
	});
}
function Input({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		className: cn("h-11 w-full rounded-md bg-paper px-3 text-sm text-ink shadow-[inset_0_0_0_1px_var(--color-rule)] outline-none transition-[box-shadow] placeholder:text-faint focus:shadow-[inset_0_0_0_1px_var(--color-mark)]", className),
		...props
	});
}
function Textarea({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		className: cn("min-h-32 w-full resize-y rounded-md bg-paper px-3 py-3 text-sm leading-relaxed text-ink shadow-[inset_0_0_0_1px_var(--color-rule)] outline-none transition-[box-shadow] placeholder:text-faint focus:shadow-[inset_0_0_0_1px_var(--color-mark)]", className),
		...props
	});
}
var TASK_CATEGORIES = [
	"Personal",
	"Work",
	"Money",
	"Home",
	"School",
	"Health",
	"Errand",
	"Faith"
];
var EVENT_CATEGORIES = [
	"Personal",
	"Work",
	"Family",
	"School",
	"Health",
	"Home",
	"Travel",
	"Faith",
	"Other"
];
var TRANSACTION_CATEGORIES = [
	"Work",
	"Food",
	"Home",
	"Transport",
	"Health",
	"Debt payment",
	"Gift",
	"Other"
];
var HABIT_ICONS = [
	"cross",
	"sun",
	"move",
	"book",
	"water",
	"moon",
	"leaf"
];
function useNowIso() {
	return localISO();
}
function ModalHost() {
	const modal = useDaymark((s) => s.modal);
	const close = useDaymark((s) => s.closeModal);
	const open = modal.type !== "none";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange: (next) => !next && close(),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
			modal.type === "task" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskForm, {
				id: modal.id,
				initial: modal.initial
			}),
			modal.type === "event" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EventForm, {
				id: modal.id,
				date: modal.date,
				time: modal.time,
				endTime: modal.endTime
			}),
			modal.type === "note" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NoteForm, { id: modal.id }),
			modal.type === "habit" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HabitForm, { id: modal.id }),
			modal.type === "transaction" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TransactionForm, {}),
			modal.type === "payment" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaymentForm, { debtId: modal.debtId }),
			modal.type === "history" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HistoryPane, {}),
			modal.type === "settled" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettledPane, {}),
			modal.type === "settings" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsPane, {}),
			modal.type === "profile" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProfilePane, {}),
			modal.type === "search" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchPane, {}),
			modal.type === "completed" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CompletedPane, {})
		] })
	});
}
function TaskForm({ id, initial }) {
	const tasks = useDaymark((s) => s.tasks);
	const completed = useDaymark((s) => s.completedTasks);
	const addTask = useDaymark((s) => s.addTask);
	const toggleTask = useDaymark((s) => s.toggleTask);
	const deleteTask = useDaymark((s) => s.deleteTask);
	const close = useDaymark((s) => s.closeModal);
	const existing = visibleTasks({
		tasks,
		completedTasks: completed
	}).find((t) => t.id === id);
	const [name, setName] = (0, import_react.useState)(existing?.name ?? initial ?? "");
	const [category, setCategory] = (0, import_react.useState)(existing?.category ?? "Personal");
	const [meta, setMeta] = (0, import_react.useState)(existing?.meta ?? "");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "space-y-3",
		onSubmit: (event) => {
			event.preventDefault();
			if (!name.trim()) return toast("Give it a name first.");
			if (!existing) {
				addTask({
					name,
					category,
					meta
				});
				toast("Task added.");
			}
			close();
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: existing ? "Task" : "New task" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: existing ? existing.name : "What needs to move?" }),
			!existing && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldWithMic, {
					onTranscript: (text) => setName((v) => v ? `${v} ${text}` : text),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: name,
						onChange: (e) => setName(e.target.value),
						placeholder: "e.g. Call Mom",
						className: "pr-11",
						autoFocus: true
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
					value: category,
					onChange: (e) => setCategory(e.target.value),
					className: "h-11 w-full rounded-md bg-paper px-3 text-sm shadow-[inset_0_0_0_1px_var(--color-rule)] outline-none",
					children: TASK_CATEGORIES.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: item }, item))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: meta,
					onChange: (e) => setMeta(e.target.value),
					placeholder: "Due date or helpful note"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					className: "w-full",
					children: "Add task"
				})
			] }),
			existing && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-mist",
					children: [existing.category, existing.meta ? ` · ${existing.meta}` : ""]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					className: "w-full",
					onClick: () => {
						toggleTask(existing.id);
						toast(existing.done ? "Task reopened." : "Task complete.");
						close();
					},
					children: existing.done ? "Reopen task" : "Mark complete"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "danger",
					className: "w-full",
					onClick: () => {
						deleteTask(existing.id);
						toast("Task removed.");
						close();
					},
					children: "Delete task"
				})
			] })
		]
	});
}
function EventForm({ id, date, time, endTime }) {
	const events = useDaymark((s) => s.events);
	const addEvent = useDaymark((s) => s.addEvent);
	const updateEvent = useDaymark((s) => s.updateEvent);
	const deleteEvent = useDaymark((s) => s.deleteEvent);
	const close = useDaymark((s) => s.closeModal);
	const existing = events.find((event) => event.id === id);
	const today = useNowIso();
	const [title, setTitle] = (0, import_react.useState)(existing?.title ?? "");
	const [when, setWhen] = (0, import_react.useState)(existing?.date ?? date ?? today);
	const [start, setStart] = (0, import_react.useState)(existing?.time ?? time ?? "10:00");
	const [end, setEnd] = (0, import_react.useState)(existing?.endTime ?? endTime ?? timeFromMinutes(minutesFromMidnight(time ?? "10:00") + 60));
	const [category, setCategory] = (0, import_react.useState)(existing?.category ?? "Personal");
	const [location, setLocation] = (0, import_react.useState)(existing?.location ?? "");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "space-y-3",
		onSubmit: (event) => {
			event.preventDefault();
			if (!title.trim()) return toast("Name the event first.");
			const payload = {
				title: title.trim(),
				date: when || today,
				time: start || "10:00",
				endTime: end || timeFromMinutes(minutesFromMidnight(start || "10:00") + 60),
				category,
				location: location.trim()
			};
			if (existing) {
				updateEvent(existing.id, payload);
				toast("Event updated.");
			} else {
				addEvent(payload);
				toast("Event added.");
			}
			close();
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: existing ? "Edit event" : "New event" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: existing ? "Move something in your week." : "Put it on the calendar." }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldWithMic, {
				onTranscript: (text) => setTitle((v) => v ? `${v} ${text}` : text),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: title,
					onChange: (e) => setTitle(e.target.value),
					placeholder: "Event name",
					className: "pr-11",
					autoFocus: true
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				type: "date",
				value: when,
				onChange: (e) => setWhen(e.target.value)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					type: "time",
					value: start,
					onChange: (e) => setStart(e.target.value)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					type: "time",
					value: end,
					onChange: (e) => setEnd(e.target.value)
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
				value: category,
				onChange: (e) => setCategory(e.target.value),
				className: "h-11 w-full rounded-md bg-paper px-3 text-sm shadow-[inset_0_0_0_1px_var(--color-rule)] outline-none",
				children: EVENT_CATEGORIES.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: item }, item))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldWithMic, {
				onTranscript: (text) => setLocation((v) => v ? `${v} ${text}` : text),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: location,
					onChange: (e) => setLocation(e.target.value),
					placeholder: "Location",
					className: "pr-11"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "submit",
				className: "w-full",
				children: existing ? "Save changes" : "Add event"
			}),
			existing && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				variant: "danger",
				className: "w-full",
				onClick: () => {
					deleteEvent(existing.id);
					toast("Event removed.");
					close();
				},
				children: "Delete event"
			})
		]
	});
}
function NoteForm({ id }) {
	const notes = useDaymark((s) => s.notes);
	const addNote = useDaymark((s) => s.addNote);
	const updateNote = useDaymark((s) => s.updateNote);
	const deleteNote = useDaymark((s) => s.deleteNote);
	const close = useDaymark((s) => s.closeModal);
	const existing = notes.find((note) => note.id === id);
	const [title, setTitle] = (0, import_react.useState)(existing?.title ?? "");
	const [text, setText] = (0, import_react.useState)(existing?.text ?? "");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "space-y-3",
		onSubmit: (event) => {
			event.preventDefault();
			if (!title.trim()) return toast("Give the entry a title first.");
			if (existing) {
				updateNote(existing.id, {
					title,
					text
				});
				toast("Journal updated.");
			} else {
				addNote({
					title,
					text
				});
				toast("Journal entry saved.");
			}
			close();
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: existing ? `Journal · ${existing.dateLabel}` : "New journal entry" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: existing ? existing.title : "What happened today?" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldWithMic, {
				onTranscript: (chunk) => setTitle((v) => v ? `${v} ${chunk}` : chunk),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: title,
					onChange: (e) => setTitle(e.target.value),
					placeholder: "Entry title",
					className: "pr-11"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					value: text,
					onChange: (e) => setText(e.target.value),
					placeholder: "Write it down…",
					rows: 8,
					className: "pr-11"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DictateButton, {
					onTranscript: (chunk) => setText((v) => v ? `${v} ${chunk}` : chunk),
					className: "absolute right-2 bottom-2"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "submit",
				className: "w-full",
				children: existing ? "Save changes" : "Save journal entry"
			}),
			existing && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				variant: "danger",
				className: "w-full",
				onClick: () => {
					deleteNote(existing.id);
					toast("Journal entry deleted.");
					close();
				},
				children: "Delete journal entry"
			})
		]
	});
}
function HabitForm({ id }) {
	const habits = useDaymark((s) => s.habits);
	const addHabit = useDaymark((s) => s.addHabit);
	const toggleHabit = useDaymark((s) => s.toggleHabit);
	const deleteHabit = useDaymark((s) => s.deleteHabit);
	const close = useDaymark((s) => s.closeModal);
	const existing = habits.find((habit) => habit.id === id);
	const [name, setName] = (0, import_react.useState)("");
	const [icon, setIcon] = (0, import_react.useState)("leaf");
	const today = localISO();
	if (existing) {
		const done = existing.history.includes(today);
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Ritual" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: existing.name }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-3 gap-2",
					children: [
						["Streak", `${habitStreak(existing.history)}d`],
						["Today", done ? "Done" : "Open"],
						["Kept", `${existing.history.length}`]
					].map(([label, value]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-md bg-raised px-3 py-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "kicker",
							children: label
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
							className: "mt-1 block text-lg",
							children: value
						})]
					}, label))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "w-full",
					onClick: () => {
						toggleHabit(existing.id);
						toast(done ? "Ritual reopened." : "Ritual checked.");
						close();
					},
					children: done ? "Mark incomplete" : "Complete today"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "danger",
					className: "w-full",
					onClick: () => {
						deleteHabit(existing.id);
						toast("Ritual removed.");
						close();
					},
					children: "Remove ritual"
				})
			]
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "space-y-3",
		onSubmit: (event) => {
			event.preventDefault();
			if (!name.trim()) return toast("Give it a name first.");
			addHabit({
				name,
				icon
			});
			toast("Ritual added.");
			close();
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "New ritual" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "What do you want to practice?" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldWithMic, {
				onTranscript: (text) => setName((v) => v ? `${v} ${text}` : text),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: name,
					onChange: (e) => setName(e.target.value),
					placeholder: "e.g. Drink water",
					className: "pr-11"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-2",
				children: HABIT_ICONS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setIcon(item),
					className: `h-9 rounded-full px-3 text-xs capitalize ${icon === item ? "bg-ink text-paper" : "text-mist shadow-[inset_0_0_0_1px_var(--color-rule)]"}`,
					children: item
				}, item))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "submit",
				className: "w-full",
				children: "Add ritual"
			})
		]
	});
}
function TransactionForm() {
	const addTransaction = useDaymark((s) => s.addTransaction);
	const close = useDaymark((s) => s.closeModal);
	const [name, setName] = (0, import_react.useState)("");
	const [amount, setAmount] = (0, import_react.useState)("");
	const [type, setType] = (0, import_react.useState)("income");
	const [category, setCategory] = (0, import_react.useState)("Work");
	const [source, setSource] = (0, import_react.useState)("");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "space-y-3",
		onSubmit: (event) => {
			event.preventDefault();
			const value = Number(amount);
			if (!name.trim() || !(value > 0)) return toast("Add a name and a positive amount first.");
			addTransaction({
				name,
				amount: value,
				type,
				category,
				source
			});
			toast(type === "income" ? "Added to the balance." : "Expense logged.");
			close();
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "New transaction" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Where did the money move?" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldWithMic, {
				onTranscript: (text) => setName((v) => v ? `${v} ${text}` : text),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: name,
					onChange: (e) => setName(e.target.value),
					placeholder: "e.g. Bulla paycheck",
					className: "pr-11",
					autoFocus: true
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				type: "number",
				min: "0.01",
				step: "0.01",
				value: amount,
				onChange: (e) => setAmount(e.target.value),
				placeholder: "Amount"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
				value: type,
				onChange: (e) => setType(e.target.value),
				className: "h-11 w-full rounded-md bg-paper px-3 text-sm shadow-[inset_0_0_0_1px_var(--color-rule)]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
					value: "income",
					children: "Money in · paycheck or deposit"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
					value: "expense",
					children: "Money out · spending or bill"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
				value: category,
				onChange: (e) => setCategory(e.target.value),
				className: "h-11 w-full rounded-md bg-paper px-3 text-sm shadow-[inset_0_0_0_1px_var(--color-rule)]",
				children: TRANSACTION_CATEGORIES.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: item }, item))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				value: source,
				onChange: (e) => setSource(e.target.value),
				placeholder: "Source or note · optional"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "submit",
				className: "w-full",
				children: "Save transaction"
			})
		]
	});
}
function PaymentForm({ debtId }) {
	const debts = useDaymark((s) => s.debts);
	const payDebt = useDaymark((s) => s.payDebt);
	const close = useDaymark((s) => s.closeModal);
	const active = debts.filter((debt) => debt.paid < debt.amount);
	const [amount, setAmount] = (0, import_react.useState)("");
	const [id, setId] = (0, import_react.useState)(String(debtId ?? active[0]?.id ?? ""));
	if (!active.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Make a payment" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Nothing left to pay down." })] });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "space-y-3",
		onSubmit: (event) => {
			event.preventDefault();
			const value = Number(amount);
			const debt = debts.find((item) => item.id === Number(id));
			if (!debt || !(value > 0)) return toast("Add a payment amount first.");
			payDebt(debt.id, value);
			const next = debt.paid + Math.min(value, debt.amount - debt.paid);
			toast(next >= debt.amount ? `${debt.name} is paid off.` : `${wholeMoney(Math.min(value, debt.amount - debt.paid))} applied to ${debt.name}.`);
			close();
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Make a payment" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Reduce what you owe." }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				type: "number",
				min: "0.01",
				step: "0.01",
				value: amount,
				onChange: (e) => setAmount(e.target.value),
				placeholder: "Payment amount",
				autoFocus: true
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
				value: id,
				onChange: (e) => setId(e.target.value),
				className: "h-11 w-full rounded-md bg-paper px-3 text-sm shadow-[inset_0_0_0_1px_var(--color-rule)]",
				children: active.map((debt) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
					value: debt.id,
					children: [
						debt.name,
						" · ",
						wholeMoney(debt.amount - debt.paid),
						" left"
					]
				}, debt.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "submit",
				className: "w-full",
				children: "Record payment"
			})
		]
	});
}
function HistoryPane() {
	const transactions = useDaymark((s) => s.transactions);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Money trail" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Transaction history" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4 max-h-80 overflow-auto",
			children: transactions.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "py-8 text-center text-sm text-mist",
				children: "No transactions yet."
			}) : transactions.map((entry) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between border-t border-rule py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm",
					children: entry.name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] text-mist",
					children: entry.category
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "font-mono text-xs tabular-nums",
					children: [entry.type === "income" ? "+" : "−", money(entry.amount)]
				})]
			}, entry.id))
		})
	] });
}
function SettledPane() {
	const settled = useDaymark((s) => s.debts).filter((d) => d.amount > 0 && d.paid >= d.amount);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Paid off" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Debts you settled" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4",
			children: settled.map((debt) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "border-t border-rule py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm",
					children: debt.name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-mist",
					children: [
						wholeMoney(debt.amount),
						" settled · ",
						debt.rate
					]
				})]
			}, debt.id))
		})
	] });
}
function SettingsPane() {
	const settings = useDaymark((s) => s.settings);
	const patch = useDaymark((s) => s.patchSettings);
	const completed = useDaymark((s) => s.completedTasks);
	const transactions = useDaymark((s) => s.transactions);
	const importEvents = useDaymark((s) => s.importEvents);
	const openModal = useDaymark((s) => s.openModal);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Settings" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Your Daymark controls" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "divide-y divide-rule border-y border-rule",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						title: "Click sounds",
						hint: "A quiet note on buttons and rows.",
						action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => {
								patch({ sound: !settings.sound });
								toast(settings.sound ? "Sounds off." : "Sounds on.");
							},
							className: `h-9 rounded-full px-3 text-xs ${settings.sound ? "bg-mark text-mark-ink" : "text-mist shadow-[inset_0_0_0_1px_var(--color-rule)]"}`,
							children: settings.sound ? "On" : "Off"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						title: "Finish",
						hint: settings.theme === "parchment" ? "Parchment" : "Darkwood",
						action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => {
								const next = settings.theme === "parchment" ? "darkwood" : "parchment";
								patch({ theme: next });
								toast(next === "parchment" ? "Parchment finish on." : "Darkwood finish on.");
							},
							className: "h-9 rounded-full px-3 text-xs text-mist shadow-[inset_0_0_0_1px_var(--color-rule)]",
							children: "Swap"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						title: "Completed tasks",
						hint: `${completed.length} stored locally`,
						action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "kicker",
							onClick: () => openModal({ type: "completed" }),
							children: "View log"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						title: "Money ledger",
						hint: `${transactions.length} transactions stored locally`,
						action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "kicker",
							onClick: () => openModal({ type: "history" }),
							children: "View history"
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium",
					children: "Calendar import"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-xs text-mist",
					children: "Import an .ics export privately from this device. Live Google sync can wait."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "file",
					accept: ".ics,text/calendar",
					className: "mt-3 block w-full text-xs text-mist",
					onChange: (event) => {
						const file = event.target.files?.[0];
						if (!file) return;
						const reader = new FileReader();
						reader.onload = () => {
							const imported = String(reader.result).split("BEGIN:VEVENT").slice(1).map((block) => {
								const title = (block.match(/SUMMARY:(.*)/) || [])[1];
								const start = (block.match(/DTSTART(?:;[^:]*)?:(\d{8}T\d{6})/) || [])[1];
								if (!title || !start) return null;
								const date = `${start.slice(0, 4)}-${start.slice(4, 6)}-${start.slice(6, 8)}`;
								const time = `${start.slice(9, 11)}:${start.slice(11, 13)}`;
								return {
									title: title.trim(),
									date,
									time,
									endTime: timeFromMinutes(minutesFromMidnight(time) + 60),
									category: "Other",
									location: ""
								};
							}).filter((item) => Boolean(item));
							const count = importEvents(imported);
							toast(count ? `${count} calendar event${count === 1 ? "" : "s"} imported.` : "No events found in that file.");
						};
						reader.readAsText(file);
					}
				})
			] })
		]
	});
}
function Row({ title, hint, action }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-between gap-4 py-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm",
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-[11px] text-mist",
			children: hint
		})] }), action]
	});
}
function ProfilePane() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Local profile" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mx-auto mt-2 grid size-16 place-items-center rounded-full bg-ink font-mono text-sm text-paper",
				children: PROFILE.initials
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
				className: "mt-4",
				children: PROFILE.first
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-sm text-mist",
				children: [
					PROFILE.place,
					" · ",
					PROFILE.with
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 font-mono text-[10px] text-mark",
				children: "Local mode · Your data stays on this device."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/login",
				className: "mt-6 inline-flex h-11 items-center justify-center rounded-md px-4 text-sm text-mist shadow-[inset_0_0_0_1px_var(--color-rule)]",
				children: "Sign in for an identity"
			})
		]
	});
}
function SearchPane() {
	const tasks = useDaymark((s) => s.tasks);
	const events = useDaymark((s) => s.events);
	const notes = useDaymark((s) => s.notes);
	const debts = useDaymark((s) => s.debts);
	const openModal = useDaymark((s) => s.openModal);
	const close = useDaymark((s) => s.closeModal);
	const [query, setQuery] = (0, import_react.useState)("");
	const results = (0, import_react.useMemo)(() => {
		const q = query.trim().toLowerCase();
		if (!q) return [];
		const out = [];
		tasks.filter((x) => `${x.name} ${x.meta}`.toLowerCase().includes(q)).forEach((x) => out.push({
			title: x.name,
			meta: x.meta,
			type: "Task",
			run: () => openModal({
				type: "task",
				id: x.id
			})
		}));
		events.filter((x) => `${x.title} ${x.category} ${x.location}`.toLowerCase().includes(q)).forEach((x) => out.push({
			title: x.title,
			meta: `${formatDate(x.date)} · ${formatTime(x.time)}`,
			type: "Event",
			run: () => openModal({
				type: "event",
				id: x.id
			})
		}));
		notes.filter((x) => `${x.title} ${x.text}`.toLowerCase().includes(q)).forEach((x) => out.push({
			title: x.title,
			meta: x.text,
			type: "Journal",
			run: () => openModal({
				type: "note",
				id: x.id
			})
		}));
		debts.filter((x) => x.name.toLowerCase().includes(q)).forEach((x) => out.push({
			title: x.name,
			meta: `${wholeMoney(x.amount - x.paid)} remaining`,
			type: "Debt",
			run: () => {
				close();
			}
		}));
		return out;
	}, [
		query,
		tasks,
		events,
		notes,
		debts,
		openModal,
		close
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Daymark search" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Ask anything" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldWithMic, {
			onTranscript: (text) => setQuery((v) => v ? `${v} ${text}` : text),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				value: query,
				onChange: (e) => setQuery(e.target.value),
				onKeyDown: (event) => {
					if (event.key === "Enter" && query.toLowerCase().startsWith("add task ")) openModal({
						type: "task",
						initial: query.slice(9).trim()
					});
				},
				placeholder: "Search tasks, events, notes, money…",
				className: "mt-2 pr-11",
				autoFocus: true
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-[11px] text-mist",
			children: "Try “Bulla”, “Gabriel”, or “add task call Alex”."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-3 max-h-72 overflow-auto",
			children: [
				!query && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "py-8 text-center text-sm text-mist",
					children: "Search the whole life, stored on this device."
				}),
				query && results.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "py-8 text-center text-sm text-mist",
					children: "Nothing found. Prefix with “add task” to create one."
				}),
				results.map((result, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: result.run,
					className: "flex w-full items-center gap-3 border-t border-rule py-3 text-left",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block text-sm",
							children: result.title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mt-0.5 block truncate text-[11px] text-mist",
							children: result.meta
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "kicker",
						children: result.type
					})]
				}, `${result.type}-${index}`))
			]
		})
	] });
}
function CompletedPane() {
	const completed = useDaymark((s) => s.completedTasks);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Completed" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Things you finished" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4 max-h-80 overflow-auto",
			children: completed.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "py-8 text-center text-sm text-mist",
				children: "Your completed tasks will collect here."
			}) : completed.map((task) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "border-t border-rule py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm",
					children: task.name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] text-mist",
					children: task.meta || task.category
				})]
			}, task.id))
		})
	] });
}
/**
* Current user + loading state. Same behavior in live preview and when deployed:
*   - Auth enabled (default) -> the real signed-in user; `user` is `null` while
*                            the session resolves (`isPending: true`) and when
*                            signed out (`isPending: false`). Session comes from
*                            Better Auth `useSession()` → `/api/auth/get-session`
*                            (cookie when deployed; bearer in live preview).
*   - Auth disabled (`VITE_AUTH_ENABLED=false`) -> `DEV_USER`, never pending.
*
* Protect a route by waiting out `isPending` before acting on `user` —
* redirecting on `user: null` alone bounces signed-in visitors to sign-in on
* every hard reload:
*
*   import { RedirectToSignIn } from "@/lib/auth/gates";
*   const { user, isPending } = useCurrentUserState();
*   if (isPending) return null;              // still resolving — don't redirect yet
*   if (!user) return <RedirectToSignIn />;  // definitely signed out
*
* `authEnabled` is a module-level constant fixed at load, so the guarded hook
* call keeps a stable hook order across every render of a given component.
*/
function useCurrentUserState() {
	const { data, isPending } = authClient.useSession();
	const user = data?.user;
	return {
		user: user ? {
			id: user.id,
			displayName: user.name ?? null,
			primaryEmail: user.email ?? null,
			profileImageUrl: user.image ?? null,
			isDevFallback: false
		} : null,
		isPending
	};
}
/**
* Convenience view of `useCurrentUserState().user` for display (e.g.
* `user?.displayName ?? "Guest"`). NOTE: `null` means *loading OR signed out* —
* for redirects/guards use `useCurrentUserState()` and check `isPending`.
*/
function useCurrentUser() {
	return useCurrentUserState().user;
}
/**
* Minimal signed-in identity chip + sign-out. Restyle freely (see the
* `design-ui` skill). Sign-out is only shown when auth is enabled (the
* disabled-auth dev user has nothing to sign out of).
*/
function UserButton() {
	const user = useCurrentUser();
	if (!user) return null;
	const label = user.displayName ?? user.primaryEmail ?? "Account";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-2",
		children: [
			user.profileImageUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: user.profileImageUrl,
				alt: "",
				className: "h-8 w-8 rounded-full object-cover"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "grid h-8 w-8 place-items-center rounded-full bg-black/10 text-sm font-medium dark:bg-white/20",
				children: label.charAt(0).toUpperCase()
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-sm font-medium",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => void signOut(),
				className: "cursor-pointer text-sm underline-offset-4 opacity-70 hover:underline",
				children: "Sign out"
			})
		]
	});
}
function AccountMenu() {
	const { user, isPending } = useCurrentUserState();
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "size-9 animate-pulse rounded-full bg-raised" });
	if (user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "[&_img]:size-9 [&_span.grid]:size-9 [&_span.grid]:bg-ink [&_span.grid]:text-paper",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserButton, {})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/login",
		className: "grid size-9 place-items-center rounded-full bg-ink font-mono text-[10px] font-medium text-paper",
		"aria-label": "Sign in",
		children: PROFILE.initials
	});
}
var NAV = [
	{
		to: "/",
		label: "Today",
		icon: SunMedium,
		match: (p) => p === "/"
	},
	{
		to: "/week",
		label: "Week",
		icon: CalendarDays,
		match: (p) => p.startsWith("/week")
	},
	{
		to: "/tasks",
		label: "Tasks",
		icon: ListChecks,
		match: (p) => p.startsWith("/tasks")
	},
	{
		to: "/journal",
		label: "Journal",
		icon: BookOpen,
		match: (p) => p.startsWith("/journal")
	},
	{
		to: "/habits",
		label: "Rituals",
		icon: Sun,
		match: (p) => p.startsWith("/habits")
	},
	{
		to: "/money",
		label: "Ledger",
		icon: CircleDollarSign,
		match: (p) => p.startsWith("/money")
	}
];
function AppShell({ children }) {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const theme = useDaymark((s) => s.settings.theme);
	const sound = useDaymark((s) => s.settings.sound);
	const openModal = useDaymark((s) => s.openModal);
	const taskCount = useDaymark((s) => s.tasks.length);
	(0, import_react.useEffect)(() => {
		document.documentElement.dataset.theme = theme;
	}, [theme]);
	(0, import_react.useEffect)(() => {
		const onKey = (event) => {
			if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
				event.preventDefault();
				openModal({ type: "search" });
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [openModal]);
	(0, import_react.useEffect)(() => {
		const onClick = (event) => {
			if (event.target?.closest("button, a, [role='button']")) clickSound(sound);
		};
		document.addEventListener("click", onClick, true);
		return () => document.removeEventListener("click", onClick, true);
	}, [sound]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grain min-h-dvh bg-paper text-ink",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-h-dvh",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "sticky top-0 hidden h-dvh w-[220px] shrink-0 flex-col border-r border-rule px-4 py-6 md:flex",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "mb-10 flex items-center gap-2 px-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-display text-2xl tracking-tight",
							children: "Daymark"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
						className: "flex flex-1 flex-col gap-1",
						children: NAV.map((item) => {
							const Icon = item.icon;
							const active = item.match(pathname);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: item.to,
								className: cn("flex h-11 items-center gap-3 rounded-md px-3 text-sm text-mist transition-colors hover:bg-raised hover:text-ink", active && "bg-raised text-ink"),
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: cn("size-4", active && "text-mark") }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: item.label }),
									item.to === "/tasks" && taskCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "ml-auto font-mono text-[10px] text-mist",
										children: taskCount
									})
								]
							}, item.to);
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-auto space-y-1 border-t border-rule pt-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => openModal({ type: "settings" }),
							className: "flex h-11 w-full items-center gap-3 rounded-md px-3 text-sm text-mist transition-colors hover:bg-raised hover:text-ink",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "size-4" }), "Settings"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "px-3 pt-3 font-mono text-[10px] leading-relaxed text-faint",
							children: "Local ledger. Your day stays on this device."
						})]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-w-0 flex-1 flex-col",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "flex h-[72px] items-center justify-between border-b border-rule px-4 md:px-8",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "kicker hidden sm:block",
							children: [
								"Spring Hill",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "mx-3 text-rule",
									children: "/"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-mark",
									children: "Live"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/",
							className: "font-display text-xl md:hidden",
							children: "Daymark"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => openModal({ type: "search" }),
								className: "flex h-10 items-center gap-2 rounded-full bg-raised px-3 text-sm text-mist shadow-[var(--shadow-border)] transition-colors hover:text-ink",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Command, { className: "size-3.5" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "hidden sm:inline",
										children: "Ask Daymark"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("kbd", {
										className: "hidden rounded-sm border border-rule px-1.5 font-mono text-[10px] md:inline",
										children: "⌘K"
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccountMenu, {})]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
					className: "mx-auto w-full max-w-[1180px] flex-1 px-4 pb-28 md:px-8 md:pb-16",
					children
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
			className: "fixed inset-x-0 bottom-0 z-40 flex border-t border-rule bg-paper/95 px-2 py-2 backdrop-blur-md md:hidden",
			children: NAV.map((item) => {
				const Icon = item.icon;
				const active = item.match(pathname);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: item.to,
					className: cn("flex min-h-11 flex-1 flex-col items-center justify-center gap-1 text-[10px] text-mist", active && "text-ink"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: cn("size-4", active && "text-mark") }), item.label]
				}, item.to);
			})
		})]
	});
}
function AppLayout() {
	const theme = useDaymark((s) => s.settings.theme);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ModalHost, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
			theme: theme === "parchment" ? "light" : "dark",
			position: "bottom-center",
			toastOptions: { className: "!bg-ink !text-paper !border-0 !font-sans !text-sm" }
		})
	] });
}
//#endregion
export { AppLayout as component };
