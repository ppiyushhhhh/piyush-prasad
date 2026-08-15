import { useCallback, useEffect, useRef, useState } from "react";
import { Send, X, RotateCcw, Loader2 } from "lucide-react";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "What AWS projects has Piyush worked on?",
  "Explain CloudOps Sentinel.",
  "What DevOps technologies does Piyush use?",
  "What cloud platforms does Piyush know?",
  "What certifications does Piyush have?",
  "Tell me about Piyush's current experience.",
];

const MAX_LENGTH = 1000;

export default function ChatPanel({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const lastSentRef = useRef<Msg[] | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading, error]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const send = useCallback(async (history: Msg[]) => {
    lastSentRef.current = history;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });
      const data = (await res.json().catch(() => ({}))) as { reply?: string; error?: string };
      if (!res.ok || !data.reply) {
        setError(
          data.error ?? "Sorry, the AI assistant is temporarily unavailable. Please try again.",
        );
        return;
      }
      setMessages([...history, { role: "assistant", content: data.reply }]);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const submit = useCallback(
    (raw: string) => {
      const text = raw.trim().slice(0, MAX_LENGTH);
      if (!text || loading) return;
      const next: Msg[] = [...messages, { role: "user", content: text }];
      setMessages(next);
      setInput("");
      void send(next);
    },
    [loading, messages, send],
  );

  const retry = useCallback(() => {
    if (lastSentRef.current) void send(lastSentRef.current);
  }, [send]);

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Piyush AI assistant"
      className="fixed inset-x-3 bottom-3 z-[60] flex h-[min(78dvh,560px)] flex-col border border-aluminum bg-white shadow-[0_20px_60px_-20px_rgba(15,17,21,0.45)] sm:inset-x-auto sm:right-6 sm:bottom-[8.5rem] sm:w-[400px]"
    >
      {/* Header */}
      <header className="flex items-start justify-between gap-3 border-b border-aluminum bg-carbon px-4 py-3">
        <div className="min-w-0">
          <h2 className="mono text-[13px] font-medium tracking-[0.08em] text-white uppercase">
            Piyush AI
          </h2>
          <p className="mt-1 text-[12px] leading-snug text-white/60">
            Ask me about Piyush&apos;s projects, skills, experience and certifications.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close chat"
          className="shrink-0 border border-white/20 p-1.5 text-white/70 transition-colors hover:border-white/50 hover:text-white focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <div>
            <p className="text-[14px] leading-relaxed text-muted-foreground">
              Hi — I&apos;m Piyush&apos;s portfolio assistant. Pick a question or ask your own.
            </p>
            <ul className="mt-3 space-y-2">
              {SUGGESTIONS.map((q) => (
                <li key={q}>
                  <button
                    type="button"
                    onClick={() => submit(q)}
                    className="w-full border border-aluminum px-3 py-2 text-left text-[13px] text-carbon transition-colors hover:border-cobalt hover:text-cobalt focus-visible:ring-2 focus-visible:ring-cobalt focus-visible:outline-none"
                  >
                    {q}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <ul className="space-y-4">
          {messages.map((m, i) => (
            <li
              key={i}
              className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
            >
              <div
                className={
                  m.role === "user"
                    ? "max-w-[85%] bg-cobalt px-3 py-2 text-[14px] leading-relaxed whitespace-pre-wrap text-white"
                    : "max-w-[92%] text-[14px] leading-relaxed whitespace-pre-wrap text-carbon"
                }
              >
                {m.role === "assistant" && (
                  <span className="mono mb-1 block text-[10px] tracking-[0.12em] text-muted-foreground uppercase">
                    Piyush AI
                  </span>
                )}
                {m.content}
              </div>
            </li>
          ))}
        </ul>

        <div aria-live="polite" className="mt-3">
          {loading && (
            <p className="mono flex items-center gap-2 text-[12px] tracking-[0.08em] text-muted-foreground uppercase">
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              Thinking…
            </p>
          )}
          {error && (
            <div className="border border-destructive/40 bg-destructive/5 px-3 py-2">
              <p className="text-[13px] text-destructive">{error}</p>
              <button
                type="button"
                onClick={retry}
                className="mono mt-2 inline-flex items-center gap-1.5 text-[11px] tracking-[0.08em] text-cobalt uppercase hover:underline focus-visible:ring-2 focus-visible:ring-cobalt focus-visible:outline-none"
              >
                <RotateCcw className="h-3 w-3" aria-hidden="true" />
                Retry
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Composer */}
      <form
        className="border-t border-aluminum p-3"
        onSubmit={(e) => {
          e.preventDefault();
          submit(input);
        }}
      >
        <div className="flex items-end gap-2">
          <label htmlFor="piyush-ai-input" className="sr-only">
            Ask Piyush AI a question
          </label>
          <textarea
            id="piyush-ai-input"
            ref={inputRef}
            rows={1}
            value={input}
            maxLength={MAX_LENGTH}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit(input);
              }
            }}
            placeholder="Ask about projects, skills, experience…"
            className="max-h-28 min-h-[42px] flex-1 resize-y border border-aluminum bg-white px-3 py-2 text-[14px] text-carbon placeholder:text-muted-foreground/70 focus-visible:border-cobalt focus-visible:ring-1 focus-visible:ring-cobalt focus-visible:outline-none"
          />
          <button
            type="submit"
            disabled={loading || input.trim().length === 0}
            aria-label="Send message"
            className="inline-flex h-[42px] w-[42px] shrink-0 items-center justify-center bg-carbon text-white transition-colors hover:bg-cobalt focus-visible:ring-2 focus-visible:ring-cobalt focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Send className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
