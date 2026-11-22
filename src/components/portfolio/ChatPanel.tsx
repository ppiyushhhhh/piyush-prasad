import { useCallback, useEffect, useRef, useState } from "react";
import {
  Send,
  X,
  RotateCcw,
  FileText,
  Terminal,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "What Credly badges does Piyush have?",
  "What AWS certifications has Piyush earned?",
  "What's his experience at Runtime Solutions?",
  "Tell me about CloudOps Sentinel",
  "Which certification is his latest?",
  "How can I contact Piyush?",
];

const CHAT_STORAGE_KEY = "piyush_portfolio_chat_history";

const MAX_LENGTH = 1000;

// Highlighted technologies for technical badge styling
const TECH_TERMS = [
  "AWS",
  "EC2",
  "S3",
  "IAM",
  "Linux",
  "Ubuntu",
  "Docker",
  "Kubernetes",
  "GitHub Actions",
  "Nginx",
  "MySQL",
  "SQLite",
  "Prometheus",
  "Grafana",
  "Node Exporter",
  "Terraform",
  "Git",
  "Trivy",
  "PM2",
  "Certbot",
  "Cloudflare",
  "UFW",
];

/**
 * Editorial Technical Message Formatter
 * Formats paragraphs, code blocks, inline code, bold text, lists, and URLs cleanly.
 */
function FormattedMessage({ text }: { text: string }) {
  // If response contains code blocks
  const parts = text.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-2 text-xs sm:text-[13px] leading-relaxed text-carbon font-sans">
      {parts.map((part, index) => {
        if (part.startsWith("```") && part.endsWith("```")) {
          const lines = part.slice(3, -3).trim().split("\n");
          const firstLine = lines[0]?.trim();
          const isLang = firstLine && !firstLine.includes(" ") && lines.length > 1;
          const lang = isLang ? firstLine : "sh";
          const code = isLang ? lines.slice(1).join("\n") : lines.join("\n");

          return (
            <div
              key={index}
              className="my-2.5 overflow-hidden rounded border border-border bg-surface-muted"
            >
              <div className="flex items-center justify-between border-b border-border/80 bg-surface px-3 py-1 font-mono text-[9px] uppercase tracking-wider text-text-muted">
                <span>{lang}</span>
                <span>CODE</span>
              </div>
              <pre className="overflow-x-auto p-3 font-mono text-[11px] leading-snug text-text">
                <code>{code}</code>
              </pre>
            </div>
          );
        }

        // Split into paragraphs / lines
        const paragraphs = part.split(/\n\s*\n/);
        return (
          <div key={index} className="space-y-2">
            {paragraphs.map((para, pIdx) => {
              const lines = para.split("\n");

              return (
                <p key={pIdx} className="leading-relaxed">
                  {lines.map((line, lIdx) => {
                    const isBullet = line.trim().startsWith("* ") || line.trim().startsWith("- ");
                    const cleanLine = isBullet ? line.trim().slice(2) : line;

                    return (
                      <span key={lIdx} className={isBullet ? "flex items-start gap-1.5 my-1 ml-1" : "inline"}>
                        {isBullet && (
                          <span className="mono text-accent text-[10px] select-none font-bold mt-0.5">
                            →
                          </span>
                        )}
                        <span>{renderInlineFormatting(cleanLine)}</span>
                        {!isBullet && lIdx < lines.length - 1 && <br />}
                      </span>
                    );
                  })}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Format inline tokens: **bold**, `code`, URLs, and prioritized tech tags
 */
function renderInlineFormatting(line: string) {
  // Regex matches markdown links [text](url), raw URLs, backtick code, and **bold**
  const regex =
    /(\[[^\]]+\]\(https?:\/\/[^\s)]+\)|(?:https?:\/\/[^\s]+)|(?:`[^`]+`)|(?:\*\*[^*]+\*\*))/g;
  const tokens = line.split(regex);

  return tokens.map((token, i) => {
    // 1. Markdown link: [Title](url)
    const mdLinkMatch = token.match(/^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/);
    if (mdLinkMatch) {
      const linkText = mdLinkMatch[1];
      const linkUrl = mdLinkMatch[2];
      return (
        <a
          key={i}
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-0.5 text-accent font-semibold underline underline-offset-2 hover:text-text"
        >
          <span>{linkText}</span>
          <ExternalLink className="h-2.5 w-2.5" />
        </a>
      );
    }

    // 2. Raw URL
    if (token.startsWith("http://") || token.startsWith("https://")) {
      const cleanUrl = token.replace(/[.,;)]+$/, "");
      return (
        <a
          key={i}
          href={cleanUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-0.5 text-accent font-medium underline underline-offset-2 hover:text-text"
        >
          <span>{cleanUrl.replace(/^https?:\/\/(www\.)?/, "")}</span>
          <ExternalLink className="h-2.5 w-2.5" />
        </a>
      );
    }

    if (token.startsWith("`") && token.endsWith("`")) {
      return (
        <code
          key={i}
          className="rounded border border-border/80 bg-surface-muted px-1 py-0.2 font-mono text-[11px] text-text font-semibold"
        >
          {token.slice(1, -1)}
        </code>
      );
    }

    if (token.startsWith("**") && token.endsWith("**")) {
      return (
        <strong key={i} className="font-bold text-text">
          {token.slice(2, -2)}
        </strong>
      );
    }

    return token;
  });
}

export default function ChatPanel({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<Msg[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = sessionStorage.getItem(CHAT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return [];
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const lastSentRef = useRef<Msg[] | null>(null);
  const shouldReduceMotion = useReducedMotion();

  // Persist conversation to sessionStorage so closing/reopening chat restores memory
  useEffect(() => {
    try {
      if (messages.length > 0) {
        sessionStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
      } else {
        sessionStorage.removeItem(CHAT_STORAGE_KEY);
      }
    } catch {
      // ignore quota errors
    }
  }, [messages]);

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

  const clearConversation = useCallback(() => {
    setMessages([]);
    setError(null);
    try {
      sessionStorage.removeItem(CHAT_STORAGE_KEY);
    } catch {
      // ignore
    }
    inputRef.current?.focus();
  }, []);

  return (
    <motion.div
      role="dialog"
      aria-modal="false"
      aria-label="Piyush AI Assistant"
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: shouldReduceMotion ? 0 : 12, scale: 0.98 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="fixed inset-3 sm:inset-auto sm:right-6 sm:bottom-6 z-[60] flex flex-col sm:w-[420px] md:w-[440px] sm:h-[640px] max-h-[calc(100dvh-24px)] sm:max-h-[calc(100vh-48px)] rounded-lg border border-border bg-surface shadow-[0_20px_50px_-12px_rgba(15,118,110,0.3)] overflow-hidden overscroll-contain"
    >
      {/* Editorial Engineering Header */}
      <header className="flex items-center justify-between border-b border-border bg-surface-muted px-4 py-3.5 select-none">
        <div className="flex items-center gap-3 min-w-0">
          {/* PP Monogram Badge */}
          <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-border bg-surface shadow-2xs">
            <img
              src="/pp-logo.png"
              alt="PP"
              className="h-5 w-auto object-contain"
              onError={(e) => {
                const target = e.currentTarget;
                target.style.display = "none";
                if (target.parentElement) {
                  target.parentElement.innerHTML =
                    '<span class="mono font-bold text-accent text-[10px]">PP</span>';
                }
              }}
            />
          </div>

          <div className="min-w-0 flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-text tracking-tight truncate">
                Piyush AI
              </span>
              <span className="mono text-[9px] text-accent font-semibold border border-accent/25 bg-accent/10 px-1.5 py-0.2">
                ASSISTANT
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-text-muted font-mono">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
              </span>
              <span>Online &bull; Cloud &amp; DevOps</span>
            </div>
          </div>
        </div>

        {/* Header Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {messages.length > 0 && (
            <button
              type="button"
              onClick={clearConversation}
              title="Clear conversation"
              aria-label="Clear conversation"
              className="flex h-7 w-7 items-center justify-center rounded border border-border bg-surface text-text/60 transition-colors hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            aria-label="Close AI Assistant"
            className="flex h-7 w-7 items-center justify-center rounded border border-border bg-surface text-text/70 transition-colors hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Messages Conversation Container */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-surface">
        {/* Welcome / Empty State */}
        {messages.length === 0 && (
          <div className="py-2 animate-in fade-in duration-300">
            <div className="border border-border bg-surface-muted p-4 rounded-sm">
              <div className="flex items-center gap-2 text-accent mb-1.5">
                <Terminal className="h-4 w-4" />
                <span className="mono text-[10px] font-bold tracking-wider">
                  ENGINEERING ASSISTANT READY
                </span>
              </div>
              <h3 className="text-sm font-bold text-text">
                Hi, I'm Piyush's AI assistant.
              </h3>
              <p className="mt-1 text-xs text-text-muted leading-relaxed">
                Ask me about his Cloud &amp; DevOps projects, AWS work, infrastructure, automation, or experience.
              </p>
            </div>

            {/* Suggested Questions Grid */}
            <div className="mt-4">
              <div className="mono text-[9px] font-semibold text-text-muted uppercase tracking-widest mb-2 px-1">
                SUGGESTED QUESTIONS
              </div>
              <div className="grid grid-cols-1 gap-2">
                {SUGGESTIONS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => submit(q)}
                    className="group flex items-center justify-between border border-border bg-surface px-3 py-2.5 text-left text-xs font-medium text-text transition-all hover:border-accent hover:bg-surface-muted hover:text-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
                  >
                    <span>{q}</span>
                    <ArrowRight className="h-3 w-3 text-text/30 group-hover:text-accent group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Messages List */}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
          >
            {/* Metadata Label */}
            <span className="mono text-[9px] font-semibold text-text-muted uppercase tracking-wider mb-1 px-1">
              {m.role === "user" ? "YOU // QUERY" : "PIYUSH AI // ASSISTANT"}
            </span>

            {/* Bubble Content */}
            <div
              className={`max-w-[88%] sm:max-w-[85%] ${
                m.role === "user"
                  ? "bg-accent text-text-on-accent rounded-md px-3.5 py-2.5 text-xs sm:text-[13px] leading-relaxed shadow-2xs whitespace-pre-wrap"
                  : "bg-surface-muted border border-border rounded-md p-3.5 sm:p-4 text-xs sm:text-[13px] text-text shadow-2xs w-full"
              }`}
            >
              {m.role === "user" ? (
                m.content
              ) : (
                <FormattedMessage text={m.content} />
              )}
            </div>
          </div>
        ))}

        {/* Thinking / Loading State */}
        {loading && (
          <div className="flex flex-col items-start">
            <span className="mono text-[9px] font-semibold text-text-muted uppercase tracking-wider mb-1 px-1">
              PIYUSH AI // PROCESSING
            </span>
            <div className="flex items-center gap-2 border border-border bg-surface-muted px-3.5 py-2.5 rounded-md text-xs text-text/80 shadow-2xs">
              <div className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="h-1.5 w-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="h-1.5 w-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              <span className="font-mono text-[11px] text-text-muted ml-1">
                Piyush AI is thinking…
              </span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex flex-col items-start">
            <div className="w-full border border-danger/30 bg-danger/10 p-3 rounded-md text-xs text-danger">
              <div className="flex items-center gap-2 font-semibold">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>Something went wrong. Please try again.</span>
              </div>
              <p className="mt-1 text-[11px] text-danger/80">{error}</p>
              <button
                type="button"
                onClick={retry}
                className="mono mt-2 inline-flex items-center gap-1.5 border border-danger/40 bg-surface px-2.5 py-1 text-[10px] font-semibold text-danger hover:bg-danger/10 transition-colors"
              >
                <RotateCcw className="h-3 w-3" />
                RETRY REQUEST
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Fixed Composer Form */}
      <form
        className="border-t border-border bg-surface-muted p-3 select-none"
        onSubmit={(e) => {
          e.preventDefault();
          submit(input);
        }}
      >
        <div className="flex items-end gap-2">
          <label htmlFor="piyush-ai-input" className="sr-only">
            Ask about Piyush's projects, stack, experience
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
            placeholder="Ask about Piyush's projects, stack, experience…"
            className="max-h-24 min-h-[42px] flex-1 resize-y border border-border bg-surface px-3 py-2 text-xs sm:text-sm text-text placeholder:text-text-muted/60 focus:border-accent focus:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded-sm"
          />

          <button
            type="submit"
            disabled={loading || input.trim().length === 0}
            aria-label="Send message to Piyush AI"
            className="inline-flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-sm bg-accent text-text-on-accent transition-all hover:bg-accent-hover focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>

        {/* Input Footer Metadata */}
        <div className="mt-2 flex items-center justify-between gap-3 text-[10px] text-text-muted font-mono">
          <a
            href="/resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 hover:text-accent transition-colors"
          >
            <FileText className="h-3 w-3" />
            <span>Resume</span>
          </a>
          <span>Enter to send &bull; Shift+Enter for newline</span>
        </div>
      </form>
    </motion.div>
  );
}
