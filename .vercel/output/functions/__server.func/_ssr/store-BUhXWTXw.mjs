import { i as addDays, n as format, r as startOfWeek, t as parseISO } from "../_libs/date-fns.mjs";
import { n as create, t as persist } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/store-BUhXWTXw.js
function localISO(date = /* @__PURE__ */ new Date()) {
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
function addDays$1(amount, date = /* @__PURE__ */ new Date()) {
	return localISO(addDays(date, amount));
}
function parseDate(value) {
	return parseISO(`${value}T12:00:00`);
}
function formatDate(value, pattern = "EEE, MMM d") {
	return format(parseDate(value), pattern);
}
function formatTime(value) {
	if (!value) return "";
	const [hours, minutes] = value.split(":").map(Number);
	if (Number.isNaN(hours) || Number.isNaN(minutes)) return value;
	const suffix = hours >= 12 ? "PM" : "AM";
	return `${hours % 12 || 12}:${String(minutes).padStart(2, "0")} ${suffix}`;
}
function minutesFromMidnight(value) {
	const [hours, minutes] = value.split(":").map(Number);
	if (Number.isNaN(hours) || Number.isNaN(minutes)) return 0;
	return hours * 60 + minutes;
}
function timeFromMinutes(total) {
	const clamped = Math.max(0, Math.min(1439, total));
	const hours = Math.floor(clamped / 60);
	const minutes = clamped % 60;
	return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}
function snapMinutes(total, step = 15) {
	return Math.round(total / step) * step;
}
function greeting(hour) {
	if (hour < 5) return "Good night";
	if (hour < 12) return "Good morning";
	if (hour < 18) return "Good afternoon";
	return "Good evening";
}
function weekDates(offset = 0, now = /* @__PURE__ */ new Date()) {
	const base = startOfWeek(addDays(now, offset * 7), { weekStartsOn: 0 });
	return Array.from({ length: 7 }, (_, i) => localISO(addDays(base, i)));
}
function money(value) {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		minimumFractionDigits: 2
	}).format(value || 0);
}
function wholeMoney(value) {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		maximumFractionDigits: 0
	}).format(value || 0);
}
function pct(part, whole) {
	return whole > 0 ? Math.round(part / whole * 100) : 0;
}
function lastNDates(n, end = /* @__PURE__ */ new Date()) {
	return Array.from({ length: n }, (_, i) => addDays$1(-(n - 1 - i), end));
}
function habitStreak(history, today = localISO()) {
	const set = new Set(history);
	let cursor = today;
	if (!set.has(cursor)) cursor = addDays$1(-1, parseDate(today));
	let n = 0;
	while (set.has(cursor)) {
		n += 1;
		cursor = addDays$1(-1, parseDate(cursor));
	}
	return n;
}
function eventTop(time) {
	return (minutesFromMidnight(time) - 360) / 60 * 72;
}
function eventHeight(time, endTime) {
	const start = minutesFromMidnight(time);
	const end = Math.max(start + 15, minutesFromMidnight(endTime));
	return Math.max((end - start) / 60 * 72, 22);
}
function clampCalendarMinutes(mins) {
	return Math.max(360, Math.min(1320, mins));
}
var today = localISO();
var verses = [
	["The Lord is my strength and my shield; my heart trusted in him, and I am helped.", "Psalm 28:7"],
	["I can do all things through Christ which strengtheneth me.", "Philippians 4:13"],
	["Commit thy works unto the Lord, and thy thoughts shall be established.", "Proverbs 16:3"],
	["The Lord shall fight for you, and ye shall hold your peace.", "Exodus 14:14"],
	["Trust in the Lord with all thine heart; and lean not unto thine own understanding.", "Proverbs 3:5"],
	["Let all that you do be done in love.", "1 Corinthians 16:14"],
	["Be strong and of a good courage, fear not, nor be afraid.", "Deuteronomy 31:6"]
];
function verseFor(date = today) {
	return verses[(Math.floor((/* @__PURE__ */ new Date(`${date}T00:00:00`)).getTime() / 864e5) % verses.length + verses.length) % verses.length];
}
function habitHistory(days, includeToday) {
	const out = [];
	const start = includeToday ? 0 : 1;
	for (let i = start; i < start + days; i += 1) out.push(addDays$1(-i));
	return out;
}
var seed = {
	profileVersion: 4,
	tasks: [
		{
			id: 101,
			name: "Check in about Gabriel’s $100",
			meta: "Due today",
			category: "Money",
			done: false,
			completedAt: null
		},
		{
			id: 102,
			name: "Set aside $400 for September rent",
			meta: "Due Sep 1",
			category: "Money",
			done: false,
			completedAt: null
		},
		{
			id: 103,
			name: "Ask Joy about anniversary ideas",
			meta: "Wednesday, Aug 26",
			category: "Home",
			done: false,
			completedAt: null
		}
	],
	completedTasks: [],
	events: [
		{
			id: 201,
			title: "Food runner shift at Bulla",
			date: today,
			time: "17:30",
			endTime: "21:00",
			category: "Work",
			location: "Tampa"
		},
		{
			id: 202,
			title: "Chemistry study block",
			date: today,
			time: "10:00",
			endTime: "11:30",
			category: "School",
			location: "Home"
		},
		{
			id: 203,
			title: "Kathy appointment",
			date: addDays$1(7),
			time: "13:30",
			endTime: "15:00",
			category: "Family",
			location: "Dale Mabry Family Medicine"
		},
		{
			id: 204,
			title: "Anniversary with Joy",
			date: "2026-08-26",
			time: "19:00",
			endTime: "21:30",
			category: "Personal",
			location: "Spring Hill"
		}
	],
	notes: [{
		id: 301,
		title: "The next right thing",
		text: "Keep the day simple: faith, Joy, the shift, and one useful money move.",
		dateLabel: "Today",
		createdAt: (/* @__PURE__ */ new Date()).toISOString(),
		color: "sage"
	}, {
		id: 302,
		title: "Tampa run list",
		text: "Wallet, keys, medication, water, and a little traffic buffer before leaving Spring Hill.",
		dateLabel: "Today",
		createdAt: (/* @__PURE__ */ new Date()).toISOString(),
		color: "dusk"
	}],
	habits: [
		{
			id: 401,
			name: "Talk with Jesus",
			icon: "cross",
			history: habitHistory(0, false)
		},
		{
			id: 402,
			name: "Morning pages",
			icon: "sun",
			history: habitHistory(7, true)
		},
		{
			id: 403,
			name: "Move your body",
			icon: "move",
			history: habitHistory(3, false)
		}
	],
	debts: [
		{
			id: 501,
			name: "Gabriel",
			amount: 100,
			paid: 0,
			rate: "Personal · due Aug 19"
		},
		{
			id: 502,
			name: "Joy",
			amount: 3e3,
			paid: 0,
			rate: "Personal balance"
		},
		{
			id: 503,
			name: "Reported credit debt",
			amount: 11737,
			paid: 0,
			rate: "Historical snapshot · Aug 14"
		}
	],
	transactions: [],
	accountBalance: 21,
	settings: {
		sound: true,
		theme: "darkwood"
	},
	quickNote: ""
};
var PROFILE = {
	name: "Javier Cruz Rivas",
	first: "Javier",
	initials: "JV",
	place: "Spring Hill, Florida",
	with: "with Joy"
};
function nextId(items) {
	return Date.now() + Math.floor(Math.random() * 99);
}
function normalizeLegacy(raw) {
	const incoming = raw ?? {};
	const tasks = Array.isArray(incoming.tasks) ? incoming.tasks : seed.tasks;
	const completedTasks = Array.isArray(incoming.completedTasks) ? incoming.completedTasks : [];
	const events = Array.isArray(incoming.events) ? incoming.events : seed.events;
	const notes = Array.isArray(incoming.notes) ? incoming.notes.map((note) => ({
		...note,
		dateLabel: note.dateLabel ?? note.date ?? "Today",
		createdAt: note.createdAt ?? (/* @__PURE__ */ new Date()).toISOString(),
		color: note.color === "lav" || note.color === "peach" ? "dusk" : note.color ?? "sage"
	})) : seed.notes;
	const habits = Array.isArray(incoming.habits) ? incoming.habits.map((habit) => {
		if (Array.isArray(habit.history)) return habit;
		const old = habit;
		const days = Math.max(0, Number(old.streak ?? 0));
		const history = [];
		const start = old.done ? 0 : 1;
		for (let i = start; i < start + days; i += 1) {
			const d = /* @__PURE__ */ new Date();
			d.setDate(d.getDate() - i);
			const iso = localISO(d);
			history.push(iso);
		}
		return {
			id: habit.id,
			name: habit.name,
			icon: {
				"✝": "cross",
				"☀": "sun",
				"◒": "move"
			}[String(old.icon)] ?? old.icon ?? "leaf",
			history
		};
	}) : seed.habits;
	return {
		profileVersion: 4,
		tasks: tasks.map((task) => ({
			...task,
			category: task.category || "Personal",
			completedAt: task.completedAt ?? null
		})),
		completedTasks,
		events: events.map((event) => ({
			...event,
			category: event.category || "Personal",
			location: event.location ?? "",
			endTime: event.endTime || event.time
		})),
		notes,
		habits,
		debts: Array.isArray(incoming.debts) ? incoming.debts : seed.debts,
		transactions: Array.isArray(incoming.transactions) ? incoming.transactions : [],
		accountBalance: typeof incoming.accountBalance === "number" ? incoming.accountBalance : seed.accountBalance,
		settings: {
			sound: incoming.settings?.sound !== false,
			theme: incoming.settings?.theme === "parchment" ? "parchment" : "darkwood"
		},
		quickNote: typeof incoming.quickNote === "string" ? incoming.quickNote : (typeof window !== "undefined" ? localStorage.getItem("daymark-quick-note") : "") || ""
	};
}
var useDaymark = create()(persist((set, get) => ({
	...seed,
	hydrated: false,
	modal: { type: "none" },
	setHydrated: (value) => set({ hydrated: value }),
	openModal: (modal) => set({ modal }),
	closeModal: () => set({ modal: { type: "none" } }),
	addTask: ({ name, category, meta }) => {
		set({ tasks: [{
			id: nextId(get().tasks),
			name: name.trim(),
			category,
			meta: meta?.trim() || "",
			done: false,
			completedAt: null
		}, ...get().tasks] });
	},
	toggleTask: (id) => {
		const { tasks, completedTasks } = get();
		const open = tasks.find((task) => task.id === id);
		if (open) {
			const done = !open.done;
			const next = {
				...open,
				done,
				completedAt: done ? (/* @__PURE__ */ new Date()).toISOString() : null
			};
			if (done) set({
				tasks: tasks.filter((task) => task.id !== id),
				completedTasks: [next, ...completedTasks.filter((t) => t.id !== id)]
			});
			else set({
				tasks: tasks.map((task) => task.id === id ? next : task),
				completedTasks: completedTasks.filter((task) => task.id !== id)
			});
			return;
		}
		const archived = completedTasks.find((task) => task.id === id);
		if (!archived) return;
		set({
			completedTasks: completedTasks.filter((task) => task.id !== id),
			tasks: [{
				...archived,
				done: false,
				completedAt: null
			}, ...tasks]
		});
	},
	deleteTask: (id) => {
		set({
			tasks: get().tasks.filter((task) => task.id !== id),
			completedTasks: get().completedTasks.filter((task) => task.id !== id)
		});
	},
	addEvent: (input) => {
		set({ events: [...get().events, {
			...input,
			id: nextId(get().events)
		}] });
	},
	updateEvent: (id, patch) => {
		set({ events: get().events.map((event) => event.id === id ? {
			...event,
			...patch
		} : event) });
	},
	moveEvent: (id, date, time, endTime) => {
		const event = get().events.find((item) => item.id === id);
		if (!event) return;
		const duration = Math.max(15, minutesFromMidnight(event.endTime) - minutesFromMidnight(event.time));
		const nextEnd = endTime ?? timeFromMinutes(minutesFromMidnight(time) + duration);
		set({ events: get().events.map((item) => item.id === id ? {
			...item,
			date,
			time,
			endTime: nextEnd
		} : item) });
	},
	deleteEvent: (id) => {
		set({ events: get().events.filter((event) => event.id !== id) });
	},
	addNote: ({ title, text }) => {
		set({ notes: [{
			id: nextId(get().notes),
			title: title.trim(),
			text,
			dateLabel: "Just now",
			createdAt: (/* @__PURE__ */ new Date()).toISOString(),
			color: "sage"
		}, ...get().notes] });
	},
	updateNote: (id, patch) => {
		set({ notes: get().notes.map((note) => note.id === id ? {
			...note,
			...patch,
			dateLabel: patch.text ? "Edited just now" : note.dateLabel
		} : note) });
	},
	deleteNote: (id) => {
		set({ notes: get().notes.filter((note) => note.id !== id) });
	},
	addHabit: ({ name, icon }) => {
		const habit = {
			id: nextId(get().habits),
			name: name.trim(),
			icon,
			history: []
		};
		set({ habits: [...get().habits, habit] });
	},
	toggleHabit: (id, date = localISO()) => {
		set({ habits: get().habits.map((habit) => {
			if (habit.id !== id) return habit;
			const has = habit.history.includes(date);
			return {
				...habit,
				history: has ? habit.history.filter((day) => day !== date) : [...habit.history, date]
			};
		}) });
	},
	deleteHabit: (id) => {
		set({ habits: get().habits.filter((habit) => habit.id !== id) });
	},
	addTransaction: ({ name, amount, type, category, source }) => {
		if (!name.trim() || !(amount > 0)) return;
		const entry = {
			id: nextId(get().transactions),
			name: name.trim(),
			amount,
			type,
			category,
			source: source?.trim() || "",
			at: (/* @__PURE__ */ new Date()).toISOString()
		};
		const delta = type === "income" ? amount : -amount;
		set({
			transactions: [entry, ...get().transactions],
			accountBalance: Number((get().accountBalance + delta).toFixed(2))
		});
	},
	addDebt: ({ name, amount, rate }) => {
		const debt = {
			id: nextId(get().debts),
			name: name.trim(),
			amount,
			paid: 0,
			rate: rate?.trim() || "Personal"
		};
		set({ debts: [...get().debts, debt] });
	},
	payDebt: (debtId, amount) => {
		const debt = get().debts.find((item) => item.id === debtId);
		if (!debt || !(amount > 0)) return;
		const remaining = debt.amount - debt.paid;
		const actual = Math.min(amount, remaining);
		const entry = {
			id: nextId(get().transactions),
			name: `Payment · ${debt.name}`,
			amount: actual,
			type: "expense",
			category: "Debt payment",
			source: "Debt ledger",
			at: (/* @__PURE__ */ new Date()).toISOString()
		};
		set({
			debts: get().debts.map((item) => item.id === debtId ? {
				...item,
				paid: item.paid + actual
			} : item),
			transactions: [entry, ...get().transactions],
			accountBalance: Number((get().accountBalance - actual).toFixed(2))
		});
	},
	setQuickNote: (value) => set({ quickNote: value }),
	patchSettings: (patch) => set({ settings: {
		...get().settings,
		...patch
	} }),
	importEvents: (events) => {
		const stamped = events.map((event, i) => ({
			...event,
			id: Date.now() + i
		}));
		set({ events: [...get().events, ...stamped] });
		return stamped.length;
	}
}), {
	name: "daymark-state-v4",
	partialize: (state) => {
		const { hydrated: _hydrated, modal: _modal, setHydrated: _s, openModal: _o, closeModal: _c, addTask: _a, toggleTask: _t, deleteTask: _d, addEvent: _ae, updateEvent: _ue, moveEvent: _me, deleteEvent: _de, addNote: _an, updateNote: _un, deleteNote: _dn, addHabit: _ah, toggleHabit: _th, deleteHabit: _dh, addTransaction: _at, addDebt: _ad, payDebt: _pd, setQuickNote: _sq, patchSettings: _ps, importEvents: _ie, ...rest } = state;
		return rest;
	},
	onRehydrateStorage: () => (state) => {
		if (typeof window !== "undefined") try {
			const legacy = localStorage.getItem("daymark-state");
			if (legacy && state && state.profileVersion < 4) {
				const migrated = normalizeLegacy(JSON.parse(legacy));
				useDaymark.setState({
					...migrated,
					hydrated: true
				});
				return;
			}
		} catch {}
		state?.setHydrated(true);
	}
}));
function visibleTasks(state) {
	const active = state.tasks ?? [];
	const done = (state.completedTasks ?? []).filter((task) => !active.some((item) => item.id === task.id));
	return [...active, ...done.map((task) => ({
		...task,
		done: true
	}))];
}
function debtTotal(debts) {
	return debts.reduce((sum, debt) => sum + Math.max(0, debt.amount - debt.paid), 0);
}
function clickSound(enabled) {
	if (!enabled || typeof window === "undefined") return;
	try {
		const ctx = new AudioContext();
		const oscillator = ctx.createOscillator();
		const gain = ctx.createGain();
		oscillator.type = "sine";
		oscillator.frequency.setValueAtTime(520, ctx.currentTime);
		oscillator.frequency.exponentialRampToValueAtTime(740, ctx.currentTime + .05);
		gain.gain.setValueAtTime(.035, ctx.currentTime);
		gain.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + .08);
		oscillator.connect(gain);
		gain.connect(ctx.destination);
		oscillator.start();
		oscillator.stop(ctx.currentTime + .08);
	} catch {}
}
//#endregion
export { wholeMoney as S, timeFromMinutes as _, eventHeight as a, visibleTasks as b, formatTime as c, lastNDates as d, localISO as f, snapMinutes as g, pct as h, debtTotal as i, greeting as l, money as m, clampCalendarMinutes as n, eventTop as o, minutesFromMidnight as p, clickSound as r, formatDate as s, PROFILE as t, habitStreak as u, useDaymark as v, weekDates as x, verseFor as y };
