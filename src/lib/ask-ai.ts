import { readFileSync } from "node:fs";
import { createServerFn } from "@tanstack/react-start";
import { normalizeAction, type AskCommand } from "./command";
import { isFileName, readDesk } from "./ask-files";
import { findPage, renderPage, resolvePages, searchPages, connectTraces, type WikiPage } from "./wiki";

export type DayContext = {
  today: string;
  tomorrow: string;
  focus: string;
  now: string;
  name: string;
  balance: number;
  tasks: { name: string; due: string | null }[];
  done: string[];
  events: { label: string; title: string; start: string; end: string }[];
  debts: { name: string; left: number }[];
  memories: string[];
  pages: WikiPage[];
  loops: string[];
  thread: string;
  applied?: string;
};

export type AskTrace = {
  kind: "read" | "write" | "remember" | "connect";
  label: string;
  title: string;
  detail: string;
};

export type AskResult = {
  ok: boolean;
  reply: string;
  first: string;
  why: string;
  actions: AskCommand[];
  remember: string[];
  trace: AskTrace[];
  responseId?: string;
  layout: "week" | "today" | "advise" | "answer" | "none";
  verdict: "do" | "dont" | "careful" | "";
  error?: string;
};

const SYSTEM = `You are Daymark. Not a chatbot. Javier's second brain on the Spring Hill → Tampa drive.

You talk like someone who already rode with him. Quiet. Direct. Warm when it matters. Never corporate. Never "as an AI." Never slogans (no sacred, leave-by, the hill). "Javier" or "sir" — not every line.

You know this in your bones:
- Home is Spring Hill. Work is Bulla in Tampa, food runner / busser. Fifty minutes. Leave ten early.
- Joy is his girl. Anniversary August 26, 2026. Cheap and thoughtful. After Bulla he can go to her and stay the night. A "friend" is not Joy unless he said Joy.
- Kathy is his sister. Gabriel is Kathy's boyfriend. "I paid Gabe" means complete the check-in AND pay the debt.
- Mom is in Tampa. Late nights he often sleeps there.
- Rent is $400 on September 1. Empty or negative cash = do not tell him to spend.
- Civic oil mid-September. Transmission is a note, not tonight.
- ADHD: one first move. Then the list. He scans. If it's long, it's wrong.

Open files before you claim a shift, a balance, or a name. If you didn't call a tool, the app did not change. Don't pretend.

A hello is a hello — use the hour. Morning / afternoon / night. Don't dump the day on "hi."

When he asks what's on him, write a briefing in markdown, synthesized, never a dashed file dump:

# {short true title}
one line that only he would recognize (drive, Joy, cash, the shift — pick one)

## Now
the one first move, and why

## Ranked
1. next
2. after that

## Watch
only if money, energy, Joy, or the car actually needs eyes. Omit the header if not.

Sound like you remember last turn. Sound like you care about him getting home in one piece.`;

const TOOLS = [
  {
    type: "function",
    name: "read_file",
    description: "Open one Daymark file for ground truth.",
    parameters: {
      type: "object",
      properties: {
        name: {
          type: "string",
          enum: ["today", "week", "tasks", "money", "people", "memory"],
        },
      },
      required: ["name"],
    },
  },
  {
    type: "function",
    name: "add_task",
    description: "Put a to-do on the list.",
    parameters: {
      type: "object",
      properties: {
        name: { type: "string" },
        due: { type: "string" },
        meta: { type: "string" },
      },
      required: ["name"],
    },
  },
  {
    type: "function",
    name: "add_event",
    description: "Put a block on the calendar.",
    parameters: {
      type: "object",
      properties: {
        title: { type: "string" },
        date: { type: "string" },
        time: { type: "string" },
        endTime: { type: "string" },
      },
      required: ["title", "date", "time"],
    },
  },
  {
    type: "function",
    name: "complete_task",
    description: "Mark a task done.",
    parameters: {
      type: "object",
      properties: { query: { type: "string" } },
      required: ["query"],
    },
  },
  {
    type: "function",
    name: "reopen_task",
    description: "Uncheck a task.",
    parameters: {
      type: "object",
      properties: { query: { type: "string" } },
      required: ["query"],
    },
  },
  {
    type: "function",
    name: "pay_debt",
    description: "Record a debt payment.",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string" },
        amount: { type: "number" },
      },
      required: ["query"],
    },
  },
  {
    type: "function",
    name: "remember_fact",
    description: "Keep a lasting note about him.",
    parameters: {
      type: "object",
      properties: { text: { type: "string" } },
      required: ["text"],
    },
  },
  {
    type: "function",
    name: "open_page",
    description: "Open a wiki page: joy, kathy, gabriel, bulla, civic, rent, general.",
    parameters: {
      type: "object",
      properties: { name: { type: "string" } },
      required: ["name"],
    },
  },
  {
    type: "function",
    name: "search_memory",
    description: "Keyword search across wiki pages.",
    parameters: {
      type: "object",
      properties: { query: { type: "string" } },
      required: ["query"],
    },
  },
];

function empty(error: string): AskResult {
  return {
    ok: false,
    reply: "",
    first: "",
    why: "",
    verdict: "",
    actions: [],
    remember: [],
    trace: [],
    layout: "none",
    error,
  };
}

function openaiKey() {
  if (process.env.OPENAI_API_KEY) return process.env.OPENAI_API_KEY;
  try {
    const text = readFileSync("/workspace/.env.local", "utf8");
    const line = text.split("\n").find((row) => row.startsWith("OPENAI_API_KEY="));
    return line?.slice("OPENAI_API_KEY=".length).trim() ?? "";
  } catch {
    return "";
  }
}

function excerpt(content: string): string {
  const lines = content
    .split("\n")
    .map((line) => line.replace(/^[-#]+\s*/, "").trim())
    .filter((line) => line && !/^(Today|Week|Tasks|Money|People|Memory|Events|Open|Done|Debts)$/i.test(line));
  return lines.slice(0, 2).join(" · ").slice(0, 160);
}

function mark(kind: AskTrace["kind"], title: string, detail: string): AskTrace {
  return { kind, label: title, title, detail };
}

function speak(text: string): { first: string; reply: string } {
  const clean = text.replace(/```[\s\S]*?```/g, "").trim();
  if (!clean) return { first: "", reply: "" };
  const heading = clean.match(/^#\s+(.+)$/m);
  return { first: heading?.[1] ?? "", reply: clean };
}

type ToolCall = { id: string; name: string; args: Record<string, unknown> };

function runTool(
  call: ToolCall,
  ctx: DayContext,
): { content: string; action?: AskCommand; memory?: string; trace?: AskTrace } {
  if (call.name === "read_file") {
    const name = String(call.args.name || "");
    if (!isFileName(name)) return { content: "No file by that name." };
    const content = readDesk(name, ctx);
    const title =
      name === "today"
        ? "Checked today"
        : name === "money"
          ? "Reconciled money"
          : name === "week"
            ? "Scanned the week"
            : name === "tasks"
              ? "Read the list"
              : name === "people"
                ? "Checked people"
                : "Opened memory";
    return { content, trace: mark("read", title, excerpt(content)) };
  }
  if (call.name === "add_task") {
    const action = normalizeAction({
      type: "add-task",
      name: String(call.args.name || ""),
      due: call.args.due,
      meta: call.args.meta,
    });
    return {
      content: action && action.type === "add-task" ? `Added task: ${action.name}` : "Need a task name.",
      action: action ?? undefined,
      trace: mark("write", "Updated the list", String(call.args.name || "Task")),
    };
  }
  if (call.name === "add_event") {
    const action = normalizeAction({
      type: "add-event",
      title: String(call.args.title || ""),
      date: call.args.date,
      time: call.args.time,
      endTime: call.args.endTime,
    });
    return {
      content: action && action.type === "add-event" ? `Added event: ${action.title}` : "Need a title, date, and time.",
      action: action ?? undefined,
      trace: mark("write", "Updated the week", String(call.args.title || "Event")),
    };
  }
  if (call.name === "complete_task") {
    const action = normalizeAction({ type: "complete-task", query: String(call.args.query || "") });
    return {
      content: "Marked done.",
      action: action ?? undefined,
      trace: mark("write", "Cleared a task", String(call.args.query || "Task")),
    };
  }
  if (call.name === "reopen_task") {
    const action = normalizeAction({ type: "reopen-task", query: String(call.args.query || "") });
    return {
      content: "Reopened.",
      action: action ?? undefined,
      trace: mark("write", "Reopened a task", String(call.args.query || "Task")),
    };
  }
  if (call.name === "pay_debt") {
    const action = normalizeAction({
      type: "pay-debt",
      query: String(call.args.query || ""),
      amount: call.args.amount,
    });
    return {
      content: "Payment recorded.",
      action: action ?? undefined,
      trace: mark("write", "Recorded a payment", String(call.args.query || "Debt")),
    };
  }
  if (call.name === "remember_fact") {
    const text = String(call.args.text || "").trim();
    return {
      content: text ? "Remembered." : "Empty.",
      memory: text || undefined,
      trace: text ? mark("remember", "Kept a note", text.slice(0, 80)) : undefined,
    };
  }
  if (call.name === "open_page") {
    const page = findPage(ctx.pages ?? [], String(call.args.name || ""));
    if (!page) return { content: "No page by that name." };
    const content = renderPage(page);
    return { content, trace: mark("read", `Opened ${page.title}`, excerpt(content)) };
  }
  if (call.name === "search_memory") {
    const hits = searchPages(String(call.args.query || ""), ctx.pages ?? []);
    const content = hits.map((hit) => `${hit.name}: ${hit.hit}`).join("\n") || "Nothing matched.";
    return { content, trace: mark("read", "Searched memory", content.slice(0, 140)) };
  }
  return { content: "Unknown tool." };
}

type ResponseBody = {
  id?: string;
  error?: { message?: string };
  output_text?: string;
  output?: {
    type?: string;
    call_id?: string;
    name?: string;
    arguments?: string;
    content?: { type?: string; text?: string }[];
  }[];
};

function parseOutput(body: ResponseBody): { calls: ToolCall[]; text: string } {
  const calls: ToolCall[] = [];
  let text = body.output_text ?? "";
  for (const item of body.output ?? []) {
    if (item.type === "function_call") {
      let args: Record<string, unknown> = {};
      try {
        args = JSON.parse(item.arguments || "{}") as Record<string, unknown>;
      } catch {
        args = {};
      }
      calls.push({ id: item.call_id || "", name: item.name || "", args });
    }
    if (item.type === "message") {
      for (const part of item.content ?? []) {
        if (part.type === "output_text" && part.text) text += part.text;
      }
    }
  }
  return { calls: calls.filter((call) => call.name), text: text.trim() };
}

async function respond(payload: Record<string, unknown>, key: string): Promise<ResponseBody> {
  const res = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify(payload),
  });
  const body = (await res.json()) as ResponseBody;
  if (!res.ok) {
    throw new Error(body.error?.message || `openai ${res.status}`);
  }
  return body;
}

export const askDaymark = createServerFn({ method: "POST" })
  .validator((input: {
    message: string;
    context: DayContext;
    thread?: { role: "user" | "assistant"; text: string }[];
    previousResponseId?: string;
  }) => input)
  .handler(async ({ data }): Promise<AskResult> => {
    const key = openaiKey();
    if (!key) return empty("missing-openai");

    const actions: AskCommand[] = [];
    const remember: string[] = [];
    const trace: AskTrace[] = [];
    const opened = new Set<string>();
    const pages = data.context.pages ?? [];
    const hay = `${data.message} ${(data.thread ?? []).map((t) => t.text).join(" ")}`;
    const preloaded = resolvePages(hay, pages);
    for (const page of preloaded) {
      opened.add(page.name);
      trace.push(mark("read", `Already had ${page.title}`, page.body.slice(0, 140)));
    }
    const brief = preloaded.map((page) => renderPage(page)).join("\n\n");
    const loops = (data.context.loops ?? []).filter(Boolean);
    const applied = data.context.applied ? `\nAlready applied this turn: ${data.context.applied}` : "";
    const prior = (data.thread ?? []).slice(-8);

    let previous = data.previousResponseId || "";
    let input: unknown[] = previous
      ? [
          {
            role: "user",
            content: `${brief ? `Open already:\n${brief}\n\n` : ""}${data.message}${applied}`,
          },
        ]
      : [
          ...prior.map((turn) => ({ role: turn.role, content: turn.text })),
          {
            role: "user",
            content: `Clock: ${data.context.today}. Now ${data.context.now}.${applied}${
              loops.length ? `\nOpen loops: ${loops.join(" | ")}` : ""
            }${brief ? `\n\nOpen already:\n${brief}` : ""}\n\n${data.message}`,
          },
        ];

    try {
      for (let step = 0; step < 6; step += 1) {
        const body = await respond(
          {
            model: "gpt-5.6-luna",
            instructions: SYSTEM,
            reasoning: { effort: "low", context: "all_turns" },
            tools: TOOLS,
            previous_response_id: previous || undefined,
            input,
          },
          key,
        );
        previous = body.id || previous;
        const parsed = parseOutput(body);
        if (parsed.calls.length > 0) {
          input = parsed.calls.map((call) => {
            const result = runTool(call, data.context);
            if (result.action) actions.push(result.action);
            if (result.memory) remember.push(result.memory);
            if (result.trace) trace.push(result.trace);
            if (call.name === "open_page") opened.add(String(call.args.name || ""));
            if (call.name === "read_file") opened.add(String(call.args.name || ""));
            return {
              type: "function_call_output",
              call_id: call.id,
              output: result.content,
            };
          });
          continue;
        }

        for (const link of connectTraces([...opened], pages)) {
          trace.push({ kind: "connect", label: link.title, title: link.title, detail: link.detail });
        }

        let text = parsed.text;
        try {
          const terra = await respond(
            {
              model: "gpt-5.6-terra",
              instructions: SYSTEM,
              reasoning: { effort: "medium", context: "all_turns" },
              previous_response_id: previous || undefined,
              input: [
                {
                  role: "user",
                  content:
                    "Write the user-facing briefing now. Markdown. Synthesize. Sound like Daymark who already knows him. Do not dump files. Greeting stays a greeting.",
                },
              ],
            },
            key,
          );
          previous = terra.id || previous;
          const voiced = parseOutput(terra).text;
          if (voiced) text = voiced;
        } catch (err) {
          console.error("[ask] terra", err);
        }

        const spoken = speak(text);
        if (!spoken.first && !spoken.reply) return empty("empty");
        return {
          ok: true,
          first: spoken.first,
          reply: spoken.reply,
          why: "",
          verdict: "",
          actions,
          remember,
          trace,
          responseId: previous,
          layout: "answer",
        };
      }
      return empty("loop");
    } catch (err) {
      console.error("[ask] failed", err);
      return empty(err instanceof Error ? err.message : "fetch");
    }
  });
