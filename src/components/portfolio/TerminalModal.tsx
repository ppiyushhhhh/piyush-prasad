import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { EMAIL, LINKEDIN, GITHUB, PHONE } from "@/lib/site";

type TerminalEntry = {
  id: number;
  kind: "command" | "output";
  content: ReactNode;
};

type CommandResult = {
  clear?: boolean;
  openResume?: boolean;
  output?: ReactNode;
};

const PROMPT = "guest@piyushprasad.in:~$";
const TITLE = "piyush@cloud-ops:~$";

const FILES: Record<string, string> = {
  "about.txt": "Piyush Prasad\\nCloud & DevOps Engineer\\nLocation: Navi Mumbai, India",
  "skills.txt":
    "Cloud: AWS, GCP\\nContainers & CI/CD: Docker, GitHub Actions\\nLinux: Ubuntu, server administration\\nMonitoring: Prometheus, Grafana, Node Exporter\\nITSM: ManageEngine ServiceDesk Plus, SLA operations",
  "experience.txt":
    "Current: Junior Cloud Engineer at Runtime Solutions\\nPrevious: IT Support & Service Management, IT Office Assistant Intern at Runtime Solutions\\nEarlier: IT Service Management Consultant at Credence Infotech",
  "projects.txt":
    "1) DevOps CI/CD Pipeline - https://kamleshprasad.com\\n2) Production AWS EC2 + DevSecOps - https://github.com/ppiyushhhhh/onixmall\\n3) CloudOps Sentinel - https://github.com/ppiyushhhhh/sentinel-cloud-view",
  "certifications.txt":
    "Ministry of I&B AI Readiness\\nAWS Cloud Essentials\\nGoogle AI Essentials\\nUbuntu Linux Professional Certificate (Canonical)\\nDocker Foundations Professional Certificate",
  "contact.txt": `Email: ${EMAIL}\\nLinkedIn: ${LINKEDIN}\\nGitHub: ${GITHUB}\\nPhone: ${PHONE}`,
  "resume.pdf": "Binary file (PDF). Run `resume` to open it in a new tab.",
};

const COMMANDS = [
  "help",
  "?",
  "ls",
  "cat",
  "whoami",
  "about",
  "skills",
  "stack",
  "experience",
  "projects",
  "certs",
  "contact",
  "resume",
  "uname",
  "uptime",
  "date",
  "pwd",
  "echo",
  "clear",
];

const QUICK_COMMANDS = ["help", "whoami", "skills", "projects", "clear"];

export function TerminalModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (next: boolean) => void;
}) {
  const [entries, setEntries] = useState<TerminalEntry[]>([]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const [draftInput, setDraftInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const outputEndRef = useRef<HTMLDivElement>(null);
  const entryIdRef = useRef(0);

  const files = useMemo(() => Object.keys(FILES), []);

  const nextEntryId = () => {
    entryIdRef.current += 1;
    return entryIdRef.current;
  };

  useEffect(() => {
    if (!open) return;
    setEntries([
      {
        id: nextEntryId(),
        kind: "output",
        content: (
          <span className="text-emerald-300">
            Welcome to Piyush DevOps Terminal. Type <span className="text-cobalt">help</span> to
            list commands.
          </span>
        ),
      },
    ]);
    setInput("");
    setHistoryIndex(null);
    setDraftInput("");
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [open]);

  useEffect(() => {
    outputEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [entries]);

  const appendOutput = (content: ReactNode) => {
    setEntries((prev) => [...prev, { id: nextEntryId(), kind: "output", content }]);
  };

  const evaluateCommand = (rawCommand: string): CommandResult => {
    const trimmed = rawCommand.trim();
    const [cmd = "", ...args] = trimmed.split(/\s+/);

    if (cmd === "clear") {
      return { clear: true };
    }

    if (cmd === "help" || cmd === "?") {
      return {
        output: (
          <div className="space-y-1 text-emerald-200">
            <p>help/? - list available commands</p>
            <p>ls - list virtual files</p>
            <p>cat &lt;file&gt; - print file content</p>
            <p>whoami/about, skills/stack, experience, projects, certs, contact</p>
            <p>resume - open /resume.pdf in new tab</p>
            <p>uname -a, uptime, date, pwd, echo &lt;text&gt;, clear</p>
          </div>
        ),
      };
    }

    if (cmd === "ls") {
      return { output: <span className="text-emerald-200">{files.join("  ")}</span> };
    }

    if (cmd === "cat") {
      const target = args[0];
      if (!target) {
        return { output: <span className="text-red-300">Usage: cat &lt;file&gt;</span> };
      }
      const fileContent = FILES[target];
      if (!fileContent) {
        return { output: <span className="text-red-300">cat: {target}: No such file</span> };
      }
      return { output: <pre className="whitespace-pre-wrap text-emerald-200">{fileContent}</pre> };
    }

    if (cmd === "whoami" || cmd === "about") {
      return {
        output: (
          <pre className="whitespace-pre-wrap text-emerald-200">{`Piyush Prasad\nCloud & DevOps Engineer\nNavi Mumbai, India`}</pre>
        ),
      };
    }

    if (cmd === "skills" || cmd === "stack") {
      return {
        output: (
          <pre className="whitespace-pre-wrap text-emerald-200">{`Cloud: AWS, GCP\nContainers & CI/CD: Docker, GitHub Actions\nLinux: Ubuntu, shell scripting, system hardening\nMonitoring: Prometheus, Grafana, Node Exporter\nITSM: ManageEngine ServiceDesk Plus, SLA operations`}</pre>
        ),
      };
    }

    if (cmd === "experience") {
      return {
        output: (
          <pre className="whitespace-pre-wrap text-emerald-200">{`Runtime Solutions (Current): Junior Cloud Engineer\nRuntime Solutions: IT Support & Service Management\nRuntime Solutions: IT Office Assistant Intern\nCredence Infotech: IT Service Management Consultant`}</pre>
        ),
      };
    }

    if (cmd === "projects") {
      return {
        output: (
          <div className="space-y-1 text-emerald-200">
            <p>
              CI/CD Pipeline:{" "}
              <a
                className="text-cobalt underline"
                href="https://kamleshprasad.com"
                target="_blank"
                rel="noreferrer"
              >
                https://kamleshprasad.com
              </a>
            </p>
            <p>
              AWS EC2 DevSecOps:{" "}
              <a
                className="text-cobalt underline"
                href="https://github.com/ppiyushhhhh/onixmall"
                target="_blank"
                rel="noreferrer"
              >
                github.com/ppiyushhhhh/onixmall
              </a>
            </p>
            <p>
              CloudOps Sentinel:{" "}
              <a
                className="text-cobalt underline"
                href="https://github.com/ppiyushhhhh/sentinel-cloud-view"
                target="_blank"
                rel="noreferrer"
              >
                github.com/ppiyushhhhh/sentinel-cloud-view
              </a>
            </p>
          </div>
        ),
      };
    }

    if (cmd === "certs") {
      return {
        output: (
          <pre className="whitespace-pre-wrap text-emerald-200">{`Ministry of Information & Broadcasting\nAWS Cloud Essentials\nGoogle AI Essentials\nCanonical Ubuntu Linux Professional Certificate\nDocker Foundations Professional Certificate`}</pre>
        ),
      };
    }

    if (cmd === "contact") {
      return {
        output: (
          <div className="space-y-1 text-emerald-200">
            <p>
              Email:{" "}
              <a className="text-cobalt underline" href={`mailto:${EMAIL}`}>
                {EMAIL}
              </a>
            </p>
            <p>
              LinkedIn:{" "}
              <a className="text-cobalt underline" href={LINKEDIN} target="_blank" rel="noreferrer">
                {LINKEDIN.replace("https://", "")}
              </a>
            </p>
            <p>
              GitHub:{" "}
              <a className="text-cobalt underline" href={GITHUB} target="_blank" rel="noreferrer">
                {GITHUB.replace("https://", "")}
              </a>
            </p>
            <p>
              Phone:{" "}
              <a className="text-cobalt underline" href={`tel:${PHONE.replace(/\s/g, "")}`}>
                {PHONE}
              </a>
            </p>
          </div>
        ),
      };
    }

    if (cmd === "resume") {
      return {
        openResume: true,
        output: <span className="text-emerald-200">Opening /resume.pdf in a new tab...</span>,
      };
    }

    if (cmd === "uname" && args[0] === "-a") {
      return {
        output: (
          <span className="text-emerald-200">
            Linux cloud-node-01 6.8.0-aws #1 SMP x86_64 GNU/Linux
          </span>
        ),
      };
    }

    if (cmd === "uname") {
      return { output: <span className="text-red-300">Usage: uname -a</span> };
    }

    if (cmd === "uptime") {
      const now = new Date();
      const hours = String((now.getHours() + 17) % 24).padStart(2, "0");
      const minutes = String((now.getMinutes() + 9) % 60).padStart(2, "0");
      return {
        output: (
          <span className="text-emerald-200">
            up 7 days, 4 users, load average: 0.42 0.38 0.31 ({hours}:{minutes})
          </span>
        ),
      };
    }

    if (cmd === "date") {
      return { output: <span className="text-emerald-200">{new Date().toString()}</span> };
    }

    if (cmd === "pwd") {
      return { output: <span className="text-emerald-200">/home/piyush</span> };
    }

    if (cmd === "echo") {
      return { output: <span className="text-emerald-200">{args.join(" ")}</span> };
    }

    if (cmd === "sudo") {
      return {
        output: (
          <span className="text-red-300">Permission denied: user guest is not in sudoers.</span>
        ),
      };
    }

    return {
      output: (
        <span className="text-red-300">
          Command not found: {trimmed || "<empty>"}. Type &quot;help&quot;.
        </span>
      ),
    };
  };

  const runCommand = (rawCommand: string) => {
    const trimmed = rawCommand.trim();
    if (!trimmed) return;

    setEntries((prev) => [
      ...prev,
      {
        id: nextEntryId(),
        kind: "command",
        content: `${PROMPT} ${trimmed}`,
      },
    ]);

    setHistory((prev) => [...prev, trimmed]);
    setHistoryIndex(null);
    setDraftInput("");

    const result = evaluateCommand(trimmed);

    if (result.clear) {
      setEntries([]);
      return;
    }

    if (result.openResume) {
      window.open("/resume.pdf", "_blank", "noopener,noreferrer");
    }

    if (result.output) {
      appendOutput(result.output);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const current = input;
    setInput("");
    runCommand(current);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const completeFromList = (partial: string, options: string[]) => {
    const normalized = partial.toLowerCase();
    return options.filter((item) => item.startsWith(normalized));
  };

  const onInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (history.length === 0) return;
      if (historyIndex === null) {
        setDraftInput(input);
        setHistoryIndex(history.length - 1);
        setInput(history[history.length - 1]);
        return;
      }
      const next = Math.max(0, historyIndex - 1);
      setHistoryIndex(next);
      setInput(history[next]);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (history.length === 0 || historyIndex === null) return;
      if (historyIndex >= history.length - 1) {
        setHistoryIndex(null);
        setInput(draftInput);
        return;
      }
      const next = historyIndex + 1;
      setHistoryIndex(next);
      setInput(history[next]);
      return;
    }

    if (event.key === "Tab") {
      event.preventDefault();
      const normalized = input.trimStart();
      if (!normalized) return;

      const tokens = normalized.split(/\s+/);
      const command = tokens[0]?.toLowerCase() ?? "";
      const hasTrailingSpace = /\s$/.test(input);

      if (tokens.length === 1 && !hasTrailingSpace) {
        const matches = completeFromList(command, COMMANDS);
        if (matches.length === 1) {
          setInput(`${matches[0]}${matches[0] === "?" ? "" : " "}`);
        } else if (matches.length > 1) {
          appendOutput(<span className="text-cobalt">{matches.join("  ")}</span>);
        }
        return;
      }

      if (command === "cat") {
        const currentFile = hasTrailingSpace ? "" : (tokens[1] ?? "").toLowerCase();
        const matches = completeFromList(currentFile, files);
        if (matches.length === 1) {
          setInput(`cat ${matches[0]}`);
        } else if (matches.length > 1) {
          appendOutput(<span className="text-cobalt">{matches.join("  ")}</span>);
        }
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[96vw] max-w-4xl border border-[#2A2F3A] bg-[#0F1115] p-0 text-white shadow-[0_40px_120px_-40px_rgba(0,0,0,0.8)] [&>button]:hidden">
        <div className="border-b border-[#232833] px-4 py-3 sm:px-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-[#FF5F57]" aria-hidden />
              <span className="h-3 w-3 rounded-full bg-[#FEBC2E]" aria-hidden />
              <span className="h-3 w-3 rounded-full bg-[#28C840]" aria-hidden />
            </div>
            <p className="mono text-[10px] text-[#9BA3AF]">{TITLE}</p>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="mono rounded border border-[#2A2F3A] px-2 py-1 text-[10px] text-[#9BA3AF] hover:border-cobalt hover:text-cobalt"
            >
              ESC
            </button>
          </div>
        </div>

        <div className="h-[70vh] max-h-[620px] min-h-[420px] p-4 sm:p-5">
          <div className="h-full rounded border border-[#1E2430] bg-[#0B0E13] p-3 sm:p-4">
            <div className="h-[calc(100%-84px)] overflow-y-auto pr-1 text-sm">
              {entries.map((entry) => (
                <div key={entry.id} className="mono mb-2 text-[12px] leading-relaxed">
                  {entry.kind === "command" ? (
                    <span className="text-cobalt">{entry.content}</span>
                  ) : (
                    <span>{entry.content}</span>
                  )}
                </div>
              ))}
              <div ref={outputEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="mt-3 border-t border-[#1E2430] pt-3">
              <label
                className="mono flex items-center gap-2 text-[12px] text-emerald-300"
                htmlFor="terminal-input"
              >
                <span>{PROMPT}</span>
                <div className="relative flex min-w-0 flex-1 items-center">
                  <input
                    id="terminal-input"
                    ref={inputRef}
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={onInputKeyDown}
                    className="mono w-full bg-transparent text-[12px] text-white outline-none placeholder:text-[#58606D]"
                    placeholder="type a command..."
                    autoComplete="off"
                    spellCheck={false}
                  />
                  <span aria-hidden className="absolute right-0 animate-pulse text-emerald-400">
                    ▋
                  </span>
                </div>
              </label>
            </form>

            <div className="mt-3 flex flex-wrap gap-2 border-t border-[#1E2430] pt-3">
              {QUICK_COMMANDS.map((quick) => (
                <button
                  key={quick}
                  type="button"
                  onClick={() => {
                    runCommand(quick);
                    setInput("");
                    setTimeout(() => inputRef.current?.focus(), 0);
                  }}
                  className="mono rounded border border-[#2A2F3A] px-2.5 py-1 text-[10px] text-[#C7CED8] transition-colors hover:border-cobalt hover:text-cobalt"
                >
                  {quick}
                </button>
              ))}
              <span className="mono ml-auto self-center text-[10px] text-[#7B8492]">
                Ctrl+` open · Esc close
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
