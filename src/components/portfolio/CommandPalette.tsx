import { useEffect, useState, useCallback } from "react";
import {
  Search,
  Terminal,
  Folder,
  Code2,
  Briefcase,
  Award,
  Mail,
  Phone,
  ExternalLink,
  Copy,
  Download,
  Github,
  Linkedin,
  FileText,
  Home,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { EMAIL, PHONE, GITHUB, LINKEDIN } from "@/lib/site";

export function CommandPalette() {
  const [open, setOpen] = useState(false);

  // Global keydown shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    const handleOpenEvent = () => setOpen(true);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("open-command-palette", handleOpenEvent);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("open-command-palette", handleOpenEvent);
    };
  }, []);

  const runCommand = useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  const navigateTo = (hashOrUrl: string) => {
    if (hashOrUrl.startsWith("#")) {
      const el = document.getElementById(hashOrUrl.replace("#", ""));
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      } else {
        window.location.hash = hashOrUrl;
      }
    } else {
      window.location.href = hashOrUrl;
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard!`, {
        description: text,
      });
    } catch {
      toast.error(`Could not copy ${label}`);
    }
  };

  const triggerDownloadResume = () => {
    const link = document.createElement("a");
    link.href = "/resume.pdf";
    link.download = "Piyush_Prasad_Resume.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Downloading Piyush's Resume PDF");
  };

  const openAiChat = () => {
    // Open chat panel
    window.dispatchEvent(new CustomEvent("open-ai-chat"));
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search sections, projects, tech..." />
      <CommandList className="max-h-[380px] p-2">
        <CommandEmpty>No results found.</CommandEmpty>

        {/* Navigation Group */}
        <CommandGroup heading="Navigation">
          <CommandItem
            onSelect={() => runCommand(() => navigateTo("#hero"))}
            className="cursor-pointer"
          >
            <Home className="mr-2 h-4 w-4 text-cobalt" />
            <span>Home / Overview</span>
            <CommandShortcut className="font-mono text-[10px]">#hero</CommandShortcut>
          </CommandItem>

          <CommandItem
            onSelect={() => runCommand(() => navigateTo("#projects"))}
            className="cursor-pointer"
          >
            <Folder className="mr-2 h-4 w-4 text-cobalt" />
            <span>Featured Projects</span>
            <CommandShortcut className="font-mono text-[10px]">#projects</CommandShortcut>
          </CommandItem>

          <CommandItem
            onSelect={() => runCommand(() => navigateTo("#skills"))}
            className="cursor-pointer"
          >
            <Code2 className="mr-2 h-4 w-4 text-cobalt" />
            <span>Skills & Tech Stack</span>
            <CommandShortcut className="font-mono text-[10px]">#skills</CommandShortcut>
          </CommandItem>

          <CommandItem
            onSelect={() => runCommand(() => navigateTo("#experience"))}
            className="cursor-pointer"
          >
            <Briefcase className="mr-2 h-4 w-4 text-cobalt" />
            <span>Experience & Career Timeline</span>
            <CommandShortcut className="font-mono text-[10px]">#experience</CommandShortcut>
          </CommandItem>

          <CommandItem
            onSelect={() => runCommand(() => navigateTo("#certifications"))}
            className="cursor-pointer"
          >
            <Award className="mr-2 h-4 w-4 text-cobalt" />
            <span>Certifications & Credentials</span>
            <CommandShortcut className="font-mono text-[10px]">#certifications</CommandShortcut>
          </CommandItem>

          <CommandItem
            onSelect={() => runCommand(() => navigateTo("#github-activity"))}
            className="cursor-pointer"
          >
            <Github className="mr-2 h-4 w-4 text-cobalt" />
            <span>GitHub Live Activity</span>
            <CommandShortcut className="font-mono text-[10px]">#github</CommandShortcut>
          </CommandItem>

          <CommandItem
            onSelect={() => runCommand(() => navigateTo("#contact"))}
            className="cursor-pointer"
          >
            <Mail className="mr-2 h-4 w-4 text-cobalt" />
            <span>Contact & Get In Touch</span>
            <CommandShortcut className="font-mono text-[10px]">#contact</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator className="my-1" />

        {/* Projects Quick Jump */}
        <CommandGroup heading="Featured Projects">
          <CommandItem
            onSelect={() => runCommand(() => navigateTo("#projects"))}
            className="cursor-pointer"
          >
            <Terminal className="mr-2 h-4 w-4 text-carbon/70" />
            <div className="flex flex-col">
              <span className="font-medium">01. DevOps CI/CD Pipeline</span>
              <span className="mono text-[10px] text-muted-foreground">
                AWS EC2 · Nginx · Cloudflare · GitHub Actions
              </span>
            </div>
          </CommandItem>

          <CommandItem
            onSelect={() => runCommand(() => navigateTo("#projects"))}
            className="cursor-pointer"
          >
            <Terminal className="mr-2 h-4 w-4 text-carbon/70" />
            <div className="flex flex-col">
              <span className="font-medium">02. Production AWS EC2 + DevSecOps</span>
              <span className="mono text-[10px] text-muted-foreground">
                Prometheus · Grafana · Trivy · UFW · Certbot
              </span>
            </div>
          </CommandItem>

          <CommandItem
            onSelect={() => runCommand(() => navigateTo("#projects"))}
            className="cursor-pointer"
          >
            <Terminal className="mr-2 h-4 w-4 text-carbon/70" />
            <div className="flex flex-col">
              <span className="font-medium">03. CloudOps Sentinel</span>
              <span className="mono text-[10px] text-muted-foreground">
                React · Node.js · SQLite · Nginx · PM2
              </span>
            </div>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator className="my-1" />

        {/* Quick Actions */}
        <CommandGroup heading="Quick Actions & Contacts">
          <CommandItem
            onSelect={() => runCommand(() => copyToClipboard(EMAIL, "Email"))}
            className="cursor-pointer"
          >
            <Copy className="mr-2 h-4 w-4 text-cobalt" />
            <span>Copy Email Address ({EMAIL})</span>
            <CommandShortcut className="font-mono text-[10px]">Copy</CommandShortcut>
          </CommandItem>

          <CommandItem
            onSelect={() => runCommand(() => copyToClipboard(PHONE, "Phone"))}
            className="cursor-pointer"
          >
            <Phone className="mr-2 h-4 w-4 text-cobalt" />
            <span>Copy Phone Number ({PHONE})</span>
            <CommandShortcut className="font-mono text-[10px]">Copy</CommandShortcut>
          </CommandItem>

          <CommandItem
            onSelect={() => runCommand(triggerDownloadResume)}
            className="cursor-pointer"
          >
            <Download className="mr-2 h-4 w-4 text-cobalt" />
            <span>Download Resume PDF</span>
            <CommandShortcut className="font-mono text-[10px]">PDF</CommandShortcut>
          </CommandItem>

          <CommandItem
            onSelect={() => runCommand(() => navigateTo("/resume"))}
            className="cursor-pointer"
          >
            <FileText className="mr-2 h-4 w-4 text-cobalt" />
            <span>View Interactive Resume Page</span>
            <CommandShortcut className="font-mono text-[10px]">/resume</CommandShortcut>
          </CommandItem>

          <CommandItem
            onSelect={() => runCommand(openAiChat)}
            className="cursor-pointer"
          >
            <Sparkles className="mr-2 h-4 w-4 text-amber-500" />
            <span>Ask Piyush's AI Assistant</span>
            <CommandShortcut className="font-mono text-[10px]">AI Chat</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator className="my-1" />

        {/* External Links */}
        <CommandGroup heading="External Links">
          <CommandItem
            onSelect={() => runCommand(() => window.open(GITHUB, "_blank"))}
            className="cursor-pointer"
          >
            <Github className="mr-2 h-4 w-4 text-carbon/70" />
            <span>GitHub Profile (github.com/ppiyushhhhh)</span>
            <ExternalLink className="ml-auto h-3 w-3 text-muted-foreground" />
          </CommandItem>

          <CommandItem
            onSelect={() => runCommand(() => window.open(LINKEDIN, "_blank"))}
            className="cursor-pointer"
          >
            <Linkedin className="mr-2 h-4 w-4 text-[#0A66C2]" />
            <span>LinkedIn Profile (linkedin.com/in/ppiyushhhh)</span>
            <ExternalLink className="ml-auto h-3 w-3 text-muted-foreground" />
          </CommandItem>
        </CommandGroup>
      </CommandList>

      {/* Command Palette Keyboard Legend Footer */}
      <div className="flex items-center justify-between border-t border-border bg-[#FAF9F6] px-4 py-2.5 text-[11px] font-mono text-muted-foreground">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-border bg-white px-1 py-0.5 text-[9px] shadow-2xs">↑↓</kbd> Navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-border bg-white px-1 py-0.5 text-[9px] shadow-2xs">↵</kbd> Select
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-border bg-white px-1 py-0.5 text-[9px] shadow-2xs">ESC</kbd> Close
          </span>
        </div>
        <span className="text-[10px] text-cobalt font-medium">PIYUSH PRASAD // CLI</span>
      </div>
    </CommandDialog>
  );
}
