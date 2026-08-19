import { cn } from "@/lib/utils";

function inline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-medium text-ink">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

type Block =
  | { type: "h1" | "h2" | "h3" | "p"; text: string }
  | { type: "ol" | "ul"; items: string[] };

function parse(text: string): Block[] {
  const lines = text.replace(/\r/g, "").split("\n");
  const out: Block[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i] ?? "";
    if (!line.trim()) {
      i += 1;
      continue;
    }
    if (line.startsWith("# ")) {
      out.push({ type: "h1", text: line.slice(2).trim() });
      i += 1;
      continue;
    }
    if (line.startsWith("## ")) {
      out.push({ type: "h2", text: line.slice(3).trim() });
      i += 1;
      continue;
    }
    if (line.startsWith("### ")) {
      out.push({ type: "h3", text: line.slice(4).trim() });
      i += 1;
      continue;
    }
    if (/^\d+\.\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i] ?? "")) {
        items.push((lines[i] ?? "").replace(/^\d+\.\s/, ""));
        i += 1;
      }
      out.push({ type: "ol", items });
      continue;
    }
    if (/^[-*]\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s/.test(lines[i] ?? "")) {
        items.push((lines[i] ?? "").replace(/^[-*]\s/, ""));
        i += 1;
      }
      out.push({ type: "ul", items });
      continue;
    }
    const bag: string[] = [];
    while (
      i < lines.length &&
      (lines[i] ?? "").trim() &&
      !/^(#{1,3}\s|\d+\.\s|[-*]\s)/.test(lines[i] ?? "")
    ) {
      bag.push(lines[i] ?? "");
      i += 1;
    }
    out.push({ type: "p", text: bag.join(" ") });
  }
  return out;
}

export function AskMarkdown({ text, className }: { text: string; className?: string }) {
  const blocks = parse(text);
  return (
    <div className={cn("max-w-[68ch] space-y-4", className)}>
      {blocks.map((block, i) => {
        if (block.type === "h1") {
          return (
            <h2 key={i} className="font-display text-3xl leading-[0.95] tracking-tight md:text-4xl">
              {block.text.replace(/\.$/, "")}
              <span className="text-mist">.</span>
            </h2>
          );
        }
        if (block.type === "h2") {
          const label = block.text.replace(/^[⚡📋👀]\s*/, "");
          return (
            <h3 key={i} className="kicker pt-4 text-mark">
              {label}
            </h3>
          );
        }
        if (block.type === "h3") {
          return (
            <h4 key={i} className="text-[11px] uppercase tracking-[0.18em] text-mark">
              {block.text}
            </h4>
          );
        }
        if (block.type === "ol") {
          return (
            <ol key={i} className="space-y-3">
              {block.items.map((item, j) => (
                <li key={j} className="flex gap-3 text-[15px] leading-7 text-mist">
                  <span className="mt-0.5 w-4 shrink-0 font-mono text-[11px] text-mark">{j + 1}</span>
                  <span>{inline(item)}</span>
                </li>
              ))}
            </ol>
          );
        }
        if (block.type === "ul") {
          return (
            <ul key={i} className="space-y-2">
              {block.items.map((item, j) => (
                <li key={j} className="flex gap-3 text-[15px] leading-7 text-mist">
                  <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-mark" />
                  <span>{inline(item)}</span>
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i} className="text-[15px] leading-[1.65] text-mist">
            {inline(block.type === "p" ? block.text : "")}
          </p>
        );
      })}
    </div>
  );
}
