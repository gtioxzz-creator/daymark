import { Mic } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type SpeechRec = {
  lang: string;
  interimResults: boolean;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  start: () => void;
  stop: () => void;
};

function getRecognition(): (new () => SpeechRec) | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & {
    SpeechRecognition?: new () => SpeechRec;
    webkitSpeechRecognition?: new () => SpeechRec;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export function DictateButton({
  onTranscript,
  className,
}: {
  onTranscript: (text: string) => void;
  className?: string;
}) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const recRef = useRef<SpeechRec | null>(null);

  useEffect(() => {
    setSupported(Boolean(getRecognition()));
    return () => recRef.current?.stop();
  }, []);

  return (
    <button
      type="button"
      title={listening ? "Listening" : "Dictate"}
      aria-label={listening ? "Stop dictation" : "Dictate"}
      disabled={!supported}
      onClick={() => {
        const Rec = getRecognition();
        if (!Rec) return;
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
          const text = Array.from(event.results)
            .map((result) => result[0]?.transcript ?? "")
            .join(" ")
            .trim();
          if (text) onTranscript(text);
        };
        recognition.start();
      }}
      className={cn(
        "grid size-9 place-items-center rounded-sm text-mist transition-colors hover:bg-card hover:text-ink disabled:text-faint",
        listening && "bg-mark text-mark-ink hover:bg-mark hover:text-mark-ink",
        className,
      )}
    >
      <Mic className="size-3.5" />
    </button>
  );
}

export function FieldWithMic({
  children,
  onTranscript,
  className,
}: {
  children: ReactNode;
  onTranscript: (text: string) => void;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      {children}
      <DictateButton
        onTranscript={onTranscript}
        className="absolute top-1/2 right-1.5 -translate-y-1/2"
      />
    </div>
  );
}
