import { LIFE } from "./life";
import { addDays, localISO } from "./time";

export type FactKind = "durable" | "temporal";

export type WikiFact = {
  text: string;
  kind: FactKind;
  weight: number;
  expires?: string;
};

export type WikiPage = {
  name: string;
  title: string;
  related: string[];
  aliases: string[];
  body: string;
  facts: WikiFact[];
};

export type OpenLoop = {
  id: string;
  text: string;
  createdAt: string;
};

export const SEED_PAGES: WikiPage[] = [
  {
    name: "joy",
    title: "Joy",
    related: ["rent", "bulla"],
    aliases: ["joy", "girlfriend", "girl", "her", "anniversary"],
    body: "Joy is Javier’s girlfriend. Anniversary is August 26, 2026. Keep plans cheap and thoughtful. After a Bulla night he can go to her and stay.",
    facts: [
      { text: "Girlfriend. Anniversary 2026-08-26.", kind: "durable", weight: 4 },
      { text: "After Bulla he can stay the night.", kind: "durable", weight: 3 },
    ],
  },
  {
    name: "kathy",
    title: "Kathy",
    related: ["gabriel"],
    aliases: ["kathy", "sister"],
    body: "Kathy is Javier’s sister.",
    facts: [{ text: "Sister.", kind: "durable", weight: 2 }],
  },
  {
    name: "gabriel",
    title: "Gabriel",
    related: ["kathy"],
    aliases: ["gabriel", "gabe"],
    body: "Gabriel is Kathy’s boyfriend. Paying him completes the check-in and the debt.",
    facts: [{ text: "Kathy’s boyfriend. Debt / check-in.", kind: "durable", weight: 3 }],
  },
  {
    name: "bulla",
    title: "Bulla",
    related: ["joy"],
    aliases: ["bulla", "work", "shift", "tampa"],
    body: "Food runner / busser at Bulla in Tampa. Drive about 50 minutes from Spring Hill. Typical nights Wednesday and Thursday 5:30–9:00 PM.",
    facts: [{ text: "Work. Tampa. ~50 min drive.", kind: "durable", weight: 4 }],
  },
  {
    name: "civic",
    title: "Civic",
    related: ["rent"],
    aliases: ["civic", "oil", "car", "transmission"],
    body: "Civic oil is due mid-September. Transmission is noted, not urgent.",
    facts: [
      { text: "Oil due 2026-09-16.", kind: "temporal", weight: 2, expires: "2026-09-20" },
    ],
  },
  {
    name: "rent",
    title: "Rent",
    related: ["joy"],
    aliases: ["rent", "money", "cash", "dollars", "balance"],
    body: `Rent is $${LIFE.rentTarget} on ${LIFE.rentDue}. If the account is empty or negative, do not spend.`,
    facts: [
      { text: `$${LIFE.rentTarget} due ${LIFE.rentDue}.`, kind: "temporal", weight: 4, expires: "2026-09-02" },
    ],
  },
  {
    name: "general",
    title: "Javier",
    related: ["bulla", "joy", "rent"],
    aliases: ["javier", "adhd", "mom", "spring hill"],
    body: "Javier Cruz Rivas. Spring Hill. ADHD — one first move. Mom lives in Tampa; late nights he often sleeps there.",
    facts: [
      { text: "ADHD. One first move.", kind: "durable", weight: 4 },
      { text: "Mom in Tampa.", kind: "durable", weight: 2 },
    ],
  },
];

export const SEED_LOOPS: OpenLoop[] = [
  {
    id: "bartender",
    text: "Bartender path at Bulla — wine and the drink list, no date yet.",
    createdAt: "2026-08-01",
  },
  {
    id: "uber",
    text: "Uber Eats is down until the insurance paper is in.",
    createdAt: "2026-08-10",
  },
];

export function liveFacts(page: WikiPage, today = localISO()): WikiFact[] {
  return page.facts.filter((fact) => fact.kind === "durable" || !fact.expires || fact.expires >= today);
}

export function renderPage(page: WikiPage, today = localISO()): string {
  const facts = liveFacts(page, today)
    .sort((a, b) => b.weight - a.weight)
    .map((fact) => `- ${fact.text}`)
    .join("\n");
  return `# ${page.title}\nrelated: ${page.related.join(", ") || "none"}\n\n${page.body}\n\n${facts}`;
}

export function resolvePages(text: string, pages: WikiPage[]): WikiPage[] {
  const hay = text.toLowerCase();
  return pages.filter((page) => page.aliases.some((alias) => hay.includes(alias)));
}

export function searchPages(query: string, pages: WikiPage[], today = localISO()): { name: string; hit: string }[] {
  const tokens = query.toLowerCase().split(/\s+/).filter((token) => token.length > 2);
  const hits: { name: string; hit: string; weight: number }[] = [];
  for (const page of pages) {
    const blob = `${page.title} ${page.body} ${page.aliases.join(" ")} ${liveFacts(page, today).map((f) => f.text).join(" ")}`.toLowerCase();
    const score = tokens.reduce((sum, token) => sum + (blob.includes(token) ? 1 : 0), 0);
    if (score === 0 && !page.aliases.some((alias) => query.toLowerCase().includes(alias))) continue;
    const fact = liveFacts(page, today)[0]?.text || page.body;
    hits.push({ name: page.name, hit: fact, weight: score + (liveFacts(page, today)[0]?.weight ?? 0) });
  }
  return hits.sort((a, b) => b.weight - a.weight).slice(0, 5);
}

export function mergeFact(pages: WikiPage[], raw: string, today = localISO()): WikiPage[] {
  const text = raw.trim();
  if (!text) return pages;
  const match = resolvePages(text, pages)[0] ?? pages.find((page) => page.name === "general");
  if (!match) return pages;
  const temporal = /\b(this week|tonight|today|right now|stressed|later)\b/i.test(text);
  const next: WikiFact = {
    text,
    kind: temporal ? "temporal" : "durable",
    weight: 1,
    expires: temporal ? addDays(7, new Date(`${today}T12:00:00`)) : undefined,
  };
  return pages.map((page) => {
    if (page.name !== match.name) return page;
    const existing = page.facts.find((fact) => fact.text.toLowerCase() === text.toLowerCase());
    if (existing) {
      return {
        ...page,
        facts: page.facts.map((fact) =>
          fact === existing ? { ...fact, weight: fact.weight + 1 } : fact,
        ),
      };
    }
    return {
      ...page,
      body: temporal ? page.body : `${page.body} ${text}`.trim(),
      facts: [...page.facts, next],
    };
  });
}

export function findPage(pages: WikiPage[], name: string): WikiPage | undefined {
  const key = name.toLowerCase().replace(/\.md$/, "");
  return pages.find((page) => page.name === key || page.title.toLowerCase() === key);
}

export function connectTraces(
  opened: string[],
  pages: WikiPage[],
): { title: string; detail: string }[] {
  const names = new Set(opened);
  const out: { title: string; detail: string }[] = [];
  if ((names.has("rent") || names.has("money")) && (names.has("joy") || names.has("anniversary"))) {
    out.push({
      title: "Two waypoints",
      detail: `Anniversary ${LIFE.anniversary.slice(5)} and rent ${LIFE.rentDue.slice(5)} sit close. Both want cash.`,
    });
  }
  if (names.has("bulla") && names.has("joy")) {
    out.push({
      title: "Two waypoints",
      detail: "After Bulla he can go to Joy and stay. One night, not two trips.",
    });
  }
  if (names.has("civic") && names.has("rent")) {
    out.push({
      title: "Two waypoints",
      detail: "Oil waits. Rent does not.",
    });
  }
  void pages;
  return out;
}

export function ensureWiki(pages?: WikiPage[]): WikiPage[] {
  if (!pages?.length) return SEED_PAGES.map((page) => ({ ...page, facts: [...page.facts] }));
  const have = new Set(pages.map((page) => page.name));
  return [...pages, ...SEED_PAGES.filter((page) => !have.has(page.name))];
}

export function ensureLoops(loops?: OpenLoop[]): OpenLoop[] {
  if (!loops?.length) return [...SEED_LOOPS];
  return loops;
}
