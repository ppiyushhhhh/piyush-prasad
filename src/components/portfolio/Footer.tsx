import { useState, useEffect } from "react";
import { GITHUB, LINKEDIN, EMAIL, PHONE } from "@/lib/site";
import {
  ArrowUp,
  ArrowUpRight,
  Github,
  Linkedin,
  Mail,
  FileText,
  BookOpen,
  MapPin,
  Clock,
  Terminal,
  ShieldCheck,
  Check,
  Copy,
  Server,
  Cpu,
} from "lucide-react";
import { toast } from "sonner";

interface SectionLink {
  num: string;
  label: string;
  href: string;
}

const SECTION_LINKS: SectionLink[] = [
  { num: "00", label: "Home", href: "#hero" },
  { num: "01", label: "Featured Projects", href: "#projects" },
  { num: "02", label: "Technical Skills", href: "#skills" },
  { num: "03", label: "Experience Journey", href: "#experience" },
  { num: "04", label: "Credentials & Education", href: "#certifications" },
  { num: "05", label: "Get In Touch", href: "#contact" },
];

export function Footer() {
  const [copied, setCopied] = useState(false);
  const [istTime, setIstTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formatted = new Intl.DateTimeFormat("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }).format(now);
      setIstTime(formatted);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      toast.success("Email copied to clipboard!", { description: EMAIL });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy email");
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative border-t border-border bg-[#F5F4EE]/90 pt-16 pb-12 text-carbon">
      {/* Subtle blueprint grid pattern */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#121316 1px, transparent 1px), linear-gradient(90deg, #121316 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative mx-auto max-w-[1400px] px-6 md:px-10">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10 pb-14 border-b border-border/80">
          {/* Identity & Bio Column */}
          <div className="flex flex-col justify-between space-y-6 lg:col-span-5">
            <div>
              {/* Monogram Brand Header */}
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center border border-carbon/20 bg-white shadow-2xs">
                  <img
                    src="/pp-logo.png"
                    alt="PP"
                    className="h-6 w-auto object-contain"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.style.display = "none";
                      if (target.parentElement) {
                        target.parentElement.innerHTML =
                          '<span class="mono font-bold text-cobalt text-[12px]">PP</span>';
                      }
                    }}
                  />
                </div>
                <div>
                  <h3 className="text-base font-bold tracking-tight text-carbon">
                    Piyush Prasad
                  </h3>
                  <p className="mono text-[10px] text-muted-foreground uppercase tracking-wider">
                    Cloud &amp; DevOps Engineer
                  </p>
                </div>
              </div>

              {/* Bio summary */}
              <p className="mt-4 max-w-md text-sm leading-relaxed text-carbon/75">
                Specializing in AWS cloud infrastructure, Linux server hardening,
                automated CI/CD pipelines, Docker containerization, and production
                observability with Prometheus &amp; Grafana.
              </p>

              {/* Status pill & 1-click copy */}
              <div className="mt-6 flex flex-wrap items-center gap-2.5">
                <div className="inline-flex items-center gap-1.5 border border-border bg-white px-3 py-1 text-[11px] font-mono shadow-2xs">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  <span className="text-carbon/80 font-medium">OPEN FOR ROLES</span>
                </div>

                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="inline-flex items-center gap-1.5 border border-border bg-white px-3 py-1 text-[11px] font-mono text-carbon/80 transition-all hover:border-cobalt hover:text-cobalt shadow-2xs cursor-pointer"
                  title="Copy email to clipboard"
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-600" />
                      <span className="text-emerald-700 font-semibold">COPIED!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3 text-cobalt" />
                      <span>{EMAIL}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Social channels */}
            <div className="flex items-center gap-2 pt-2">
              <a
                href={GITHUB}
                target="_blank"
                rel="noreferrer"
                className="flex h-9 w-9 items-center justify-center border border-border bg-white text-carbon/75 shadow-2xs transition-all hover:-translate-y-0.5 hover:border-cobalt hover:text-cobalt"
                aria-label="GitHub Profile"
              >
                <Github className="h-4 w-4" />
              </a>

              <a
                href={LINKEDIN}
                target="_blank"
                rel="noreferrer"
                className="flex h-9 w-9 items-center justify-center border border-border bg-white text-carbon/75 shadow-2xs transition-all hover:-translate-y-0.5 hover:border-cobalt hover:text-cobalt"
                aria-label="LinkedIn Profile"
              >
                <Linkedin className="h-4 w-4" />
              </a>

              <a
                href={`mailto:${EMAIL}`}
                className="flex h-9 w-9 items-center justify-center border border-border bg-white text-carbon/75 shadow-2xs transition-all hover:-translate-y-0.5 hover:border-cobalt hover:text-cobalt"
                aria-label="Send Direct Email"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Navigation Directory */}
          <div className="lg:col-span-3">
            <div className="mono mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-cobalt">
              <span>INDEX // DIRECTORY</span>
              <span className="h-px flex-1 bg-border/80" />
            </div>

            <ul className="space-y-2 text-xs font-mono">
              {SECTION_LINKS.map((item) => (
                <li key={item.num}>
                  <a
                    href={item.href}
                    className="group flex items-center justify-between border-b border-border/40 py-1.5 text-carbon/75 transition-colors hover:text-cobalt hover:border-cobalt/40"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground group-hover:text-cobalt transition-colors">
                        {item.num}
                      </span>
                      <span className="font-medium text-carbon group-hover:text-cobalt transition-colors">
                        {item.label}
                      </span>
                    </span>
                    <ArrowUpRight className="h-3 w-3 text-border transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-cobalt" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources & Technical Infrastructure Column */}
          <div className="flex flex-col justify-between space-y-6 lg:col-span-4">
            <div>
              <div className="mono mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-cobalt">
                <span>RESOURCES &amp; DOCS</span>
                <span className="h-px flex-1 bg-border/80" />
              </div>

              <div className="space-y-2.5">
                {/* Resume Card */}
                <a
                  href="/resume"
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center justify-between border border-border bg-white p-3 shadow-2xs transition-all hover:-translate-y-0.5 hover:border-cobalt"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-xs bg-[#FAF9F6] border border-border text-cobalt">
                      <FileText className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-carbon group-hover:text-cobalt transition-colors">
                        Interactive Resume Document
                      </div>
                      <div className="mono text-[10px] text-muted-foreground">
                        Web viewer &amp; printable PDF
                      </div>
                    </div>
                  </div>
                  <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-cobalt" />
                </a>

                {/* Pipeline Guide Card */}
                <a
                  href="/guides/devsecops-pipeline"
                  className="group flex items-center justify-between border border-border bg-white p-3 shadow-2xs transition-all hover:-translate-y-0.5 hover:border-cobalt"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-xs bg-[#FAF9F6] border border-border text-cobalt">
                      <ShieldCheck className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-carbon group-hover:text-cobalt transition-colors">
                        DevSecOps Pipeline Guide
                      </div>
                      <div className="mono text-[10px] text-muted-foreground">
                        Trivy, Docker &amp; CI/CD security
                      </div>
                    </div>
                  </div>
                  <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-cobalt" />
                </a>

                {/* Tools Ecosystem Card */}
                <a
                  href="/guides/devsecops-tools"
                  className="group flex items-center justify-between border border-border bg-white p-3 shadow-2xs transition-all hover:-translate-y-0.5 hover:border-cobalt"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-xs bg-[#FAF9F6] border border-border text-cobalt">
                      <Terminal className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-carbon group-hover:text-cobalt transition-colors">
                        DevSecOps Tools Ecosystem
                      </div>
                      <div className="mono text-[10px] text-muted-foreground">
                        Tooling stack &amp; architectures
                      </div>
                    </div>
                  </div>
                  <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-cobalt" />
                </a>
              </div>
            </div>

            {/* Location & Live IST Clock */}
            <div className="flex items-center justify-between border-t border-border/70 pt-3 text-[11px] font-mono text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3 w-3 text-cobalt" />
                <span>Navi Mumbai, MH, India</span>
              </span>
              <span className="inline-flex items-center gap-1.5 border border-border bg-white px-2 py-0.5 text-[10px] text-carbon/80 shadow-2xs font-mono font-medium">
                <Clock className="h-3 w-3 text-cobalt" />
                <span className="tabular-nums">{istTime || "IST"}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Technical Bar */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 text-[11px] font-mono text-muted-foreground sm:flex-row">
          <div>
            &copy; {new Date().getFullYear()} <span className="font-semibold text-carbon">PIYUSH PRASAD</span> &mdash; ALL RIGHTS RESERVED
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-xs border border-border bg-white px-2 py-0.5 text-[10px] text-carbon/70 shadow-2xs">
              AWS EC2
            </span>
            <span className="rounded-xs border border-border bg-white px-2 py-0.5 text-[10px] text-carbon/70 shadow-2xs">
              UBUNTU LINUX
            </span>
            <span className="rounded-xs border border-border bg-white px-2 py-0.5 text-[10px] text-carbon/70 shadow-2xs">
              DOCKER
            </span>
            <span className="rounded-xs border border-border bg-white px-2 py-0.5 text-[10px] text-carbon/70 shadow-2xs">
              NGINX
            </span>

            {/* Smooth Scroll to Top Button */}
            <button
              type="button"
              onClick={scrollToTop}
              className="ml-2 inline-flex items-center gap-1 border border-border bg-white px-2.5 py-1 text-[10px] font-bold text-carbon transition-all hover:border-cobalt hover:text-cobalt shadow-2xs cursor-pointer"
              title="Back to Top"
              aria-label="Back to top"
            >
              <span>TOP</span>
              <ArrowUp className="h-3 w-3 text-cobalt" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
