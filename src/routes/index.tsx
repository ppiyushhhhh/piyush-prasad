import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion, useInView, MotionConfig } from "framer-motion";
import { useRef, useState } from "react";
import {
  Cloud,
  Terminal,
  GitBranch,
  Github,
  Workflow,
  Container,
  Server,
  Globe,
  Code2,
  FileType2,
  Wind,
  Database,
  Boxes,
  ArrowRight,
  ArrowLeft,
  Mail,
  Linkedin,
  FileDown,
  ExternalLink,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

/* ---------------- Data ---------------- */

const CHAPTERS = [
  { id: "cover", label: "Cover", num: "" },
  { id: "about", label: "About", num: "01" },
  { id: "skills", label: "Skills", num: "02" },
  { id: "projects", label: "Projects", num: "03" },
  { id: "experience", label: "Experience", num: "04" },
  { id: "certs", label: "Certifications", num: "05" },
  { id: "contact", label: "Contact", num: "06" },
] as const;

type PageId = (typeof CHAPTERS)[number]["id"];

const SKILLS: { name: string; Icon: React.ComponentType<{ size?: number; className?: string }>; color: string }[] = [
  { name: "AWS", Icon: Cloud, color: "#FFE0A8" },
  { name: "Linux", Icon: Terminal, color: "#FFD6D6" },
  { name: "Git", Icon: GitBranch, color: "#D9EFD1" },
  { name: "GitHub", Icon: Github, color: "#E4DAF7" },
  { name: "GitHub Actions", Icon: Workflow, color: "#CFE4FF" },
  { name: "Docker", Icon: Container, color: "#CFE9FF" },
  { name: "Cloudflare", Icon: Globe, color: "#FFE0B0" },
  { name: "Nginx", Icon: Server, color: "#D9F0DC" },
  { name: "React", Icon: Code2, color: "#CFEEFB" },
  { name: "TypeScript", Icon: FileType2, color: "#CFE4FF" },
  { name: "Tailwind", Icon: Wind, color: "#CFEBF3" },
  { name: "MongoDB", Icon: Database, color: "#D9F0DC" },
  { name: "Node.js", Icon: Boxes, color: "#DDEED0" },
];

/* ---------------- Root ---------------- */

function Index() {
  const [page, setPage] = useState<PageId>("cover");
  const [dir, setDir] = useState<1 | -1>(1);

  const go = (id: PageId) => {
    const from = CHAPTERS.findIndex((c) => c.id === page);
    const to = CHAPTERS.findIndex((c) => c.id === id);
    if (id === page) return;
    setDir(to >= from ? 1 : -1);
    setPage(id);
  };

  const idx = CHAPTERS.findIndex((c) => c.id === page);
  const prev = idx > 0 ? CHAPTERS[idx - 1] : null;
  const next = idx < CHAPTERS.length - 1 ? CHAPTERS[idx + 1] : null;


  return (
    <MotionConfig reducedMotion="user">
    <main className="min-h-screen w-full" style={{ backgroundColor: "var(--color-desk)" }}>
      <DeskBackdrop />

      {/* top nav */}
      <nav className="sticky top-0 z-30 backdrop-blur-sm" style={{ backgroundColor: "rgba(247,242,232,0.85)", borderBottom: "1px solid var(--color-edge)" }}>
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <button
            onClick={() => go("cover")}
            className="font-[family-name:var(--font-hand)] text-2xl leading-none"
            style={{ color: "var(--color-ink)" }}
          >
            Piyush's Notebook
          </button>
          <div className="hidden gap-5 md:flex font-[family-name:var(--font-nav)] text-xs uppercase tracking-widest">
            {CHAPTERS.slice(1).map((c) => (
              <button
                key={c.id}
                onClick={() => go(c.id)}
                className="relative transition-colors"
                style={{ color: page === c.id ? "var(--color-accent)" : "var(--color-ink)" }}
              >
                {c.label}
                {page === c.id && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute -bottom-1 left-0 right-0 h-[2px]"
                    style={{ backgroundColor: "var(--color-accent)" }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>



      {/* page stage */}
      <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12" style={{ perspective: 2000 }}>
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={page}
            custom={dir}
            initial={{ rotateY: dir === 1 ? 35 : -35, opacity: 0, x: dir === 1 ? 40 : -40 }}
            animate={{ rotateY: 0, opacity: 1, x: 0 }}
            exit={{ rotateY: dir === 1 ? -35 : 35, opacity: 0, x: dir === 1 ? -40 : 40 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: dir === 1 ? "left center" : "right center", transformStyle: "preserve-3d" }}
          >
            {page === "cover" && <CoverPage go={go} />}
            {page === "about" && <AboutPage />}
            {page === "skills" && <SkillsPage />}
            {page === "projects" && <ProjectsPage />}
            {page === "experience" && <ExperiencePage />}
            {page === "certs" && <CertsPage />}
            {page === "contact" && <ContactPage />}
          </motion.div>
        </AnimatePresence>

        {/* prev / next */}
        <div className="mx-auto mt-8 flex max-w-3xl items-center justify-between gap-4 px-2 font-[family-name:var(--font-hand)] text-lg" style={{ color: "var(--color-accent)" }}>
          {prev ? (
            <button
              onClick={() => go(prev.id)}
              aria-label={`Previous page: ${prev.label}`}
              className="inline-flex items-center gap-2 rounded-sm border-2 px-4 py-1.5 font-bold shadow-[3px_3px_0_0_var(--color-accent)] transition-transform hover:translate-x-[-1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_var(--color-accent)]"
              style={{ borderColor: "var(--color-accent)", color: "var(--color-accent)", backgroundColor: "var(--color-paper)" }}
            >
              <ArrowLeft size={18} /> ← Prev {prev.label}
            </button>
          ) : <span />}
          {next ? (
            <button
              onClick={() => go(next.id)}
              className="inline-flex items-center gap-2 rounded-sm border-2 px-4 py-1.5 font-bold shadow-[3px_3px_0_0_var(--color-accent)] transition-transform hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_var(--color-accent)]"
              style={{ borderColor: "var(--color-accent)", color: "var(--color-accent)", backgroundColor: "var(--color-paper)" }}
            >
              Next → {next.label} <ArrowRight size={18} />
            </button>
          ) : <span />}
        </div>

      </div>
    </main>
    </MotionConfig>
  );
}

/* ---------------- Reusable page shell ---------------- */

function NotebookPage({
  children,
  pageNum,
  chapterLabel,
}: {
  children: React.ReactNode;
  pageNum?: string;
  chapterLabel?: string;
}) {
  return (
    <div className="relative mx-auto max-w-3xl">
      {/* stacked page shadows to hint at pages beneath */}
      <div className="pointer-events-none absolute inset-0 translate-x-2 translate-y-2 rounded-sm" style={{ backgroundColor: "#EFE9DC", boxShadow: "0 20px 40px -20px rgba(0,0,0,.15)" }} />
      <div className="pointer-events-none absolute inset-0 translate-x-1 translate-y-1 rounded-sm" style={{ backgroundColor: "#F4EFE2" }} />

      <article
        className="paper relative rounded-sm"
        style={{
          boxShadow: "0 1px 2px rgba(0,0,0,.08), 0 30px 60px -30px rgba(0,0,0,.25)",
          minHeight: "min(80vh, 780px)",
        }}
      >
        {/* folded top-right corner */}
        <div
          aria-hidden
          className="pointer-events-none absolute right-0 top-0"
          style={{
            width: 44,
            height: 44,
            background: "linear-gradient(225deg, var(--color-desk) 50%, rgba(0,0,0,.08) 50%, rgba(0,0,0,.08) 55%, transparent 55%)",
          }}
        />

        {/* chapter tag */}
        {chapterLabel && (
          <div className="absolute right-6 top-4 font-[family-name:var(--font-nav)] text-[10px] uppercase tracking-[0.3em]" style={{ color: "var(--color-accent)" }}>
            {chapterLabel}
          </div>
        )}

        <div className="pl-16 pr-8 py-14 sm:pl-24 sm:pr-14 sm:py-16">
          {children}
        </div>

        {/* page number */}
        {pageNum && (
          <div className="absolute bottom-4 right-6 font-[family-name:var(--font-hand)] text-lg" style={{ color: "var(--color-accent)" }}>
            — {pageNum} —
          </div>
        )}
      </article>
    </div>
  );
}

/* ---------------- Cover / TOC ---------------- */

function CoverPage({ go }: { go: (id: PageId) => void }) {
  return (
    <NotebookPage>
      <div className="text-center">
        <p className="font-[family-name:var(--font-nav)] text-xs uppercase tracking-[0.4em]" style={{ color: "var(--color-accent)" }}>
          Property of
        </p>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6 }}
          className="mt-4 font-[family-name:var(--font-hand)] text-6xl sm:text-8xl font-bold leading-none"
          style={{ color: "var(--color-ink)" }}
        >
          Piyush Prasad
        </motion.h1>
        <p className="mt-3 font-[family-name:var(--font-hand-alt)] text-2xl sm:text-3xl" style={{ color: "var(--color-accent)" }}>
          Engineering Notebook
        </p>
        <div className="mx-auto mt-4 h-[2px] w-24" style={{ backgroundColor: "var(--color-ink)" }} />
        <p className="mt-3 font-[family-name:var(--font-mono)] text-xs" style={{ color: "var(--color-ink)", opacity: 0.6 }}>
          Vol. I · Cloud & DevOps · 2022 — Present
        </p>
      </div>

      <nav aria-labelledby="toc-heading" className="mx-auto mt-12 max-w-md">
        <h2 id="toc-heading" className="font-[family-name:var(--font-hand)] text-3xl mb-4" style={{ color: "var(--color-ink)" }}>
          Contents
        </h2>
        <ol className="space-y-3 font-[family-name:var(--font-hand-alt)] text-xl">
          {CHAPTERS.slice(1).map((c, i) => {
            const pageLabel = String(i + 1).padStart(2, "0");
            return (
              <motion.li
                key={c.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + i * 0.06 }}
              >
                <button
                  onClick={() => go(c.id)}
                  aria-label={`Go to chapter ${c.num}, ${c.label}, page ${pageLabel}`}
                  className="group flex w-full items-baseline gap-3 rounded-sm px-1 py-0.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                  style={
                    {
                      color: "var(--color-ink)",
                      "--tw-ring-color": "var(--color-accent)",
                      "--tw-ring-offset-color": "var(--color-paper)",
                    } as React.CSSProperties
                  }
                >
                  <span aria-hidden="true" style={{ color: "var(--color-accent)" }}>{c.num}</span>
                  <span className="group-hover:marker-hi transition-all">{c.label}</span>
                  <span aria-hidden="true" className="flex-1 border-b border-dotted" style={{ borderColor: "var(--color-ink)", opacity: 0.4 }} />
                  <span aria-hidden="true" style={{ color: "var(--color-accent)" }}>p. {pageLabel}</span>
                </button>
              </motion.li>
            );
          })}
        </ol>
      </nav>


      {/* doodles */}
      <svg className="pointer-events-none absolute bottom-8 left-24 opacity-40" width="90" height="60" viewBox="0 0 90 60" fill="none" style={{ color: "var(--color-accent)" }}>
        <path d="M10 40 Q 20 20 35 30 T 65 25 T 85 35" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeDasharray="2 3" />
        <circle cx="85" cy="35" r="2.5" fill="currentColor" />
      </svg>
    </NotebookPage>
  );
}

/* ---------------- About ---------------- */

function AboutPage() {
  return (
    <NotebookPage pageNum="01" chapterLabel="Chapter 01 · About">
      <p className="font-[family-name:var(--font-hand-alt)] text-xl" style={{ color: "var(--color-accent)" }}>
        Hello.
      </p>
      <h2 className="mt-1 font-[family-name:var(--font-hand)] text-5xl sm:text-6xl font-bold leading-tight" style={{ color: "var(--color-ink)" }}>
        I'm Piyush Prasad.
      </h2>
      <p className="mt-2 font-[family-name:var(--font-hand-alt)] text-2xl" style={{ color: "var(--color-ink)" }}>
        Cloud & DevOps Engineer.
      </p>

      <div className="mt-8 grid gap-8 md:grid-cols-2 md:items-start">
        <div className="space-y-4 text-[15px] leading-relaxed" style={{ color: "var(--color-ink)" }}>
          <p>
            I build reliable cloud infrastructure, automate deployments, and solve
            real-world IT operations problems. This notebook is where I keep track of it all.
          </p>
          <p>
            I started at the help desk — resolving tickets, keeping SLAs green, learning
            how systems <span className="marker-hi">really</span> break. Curiosity pulled
            me toward the servers behind the tickets, and eventually toward the cloud.
          </p>
          <p>
            Today I'm shipping production deployments on <span className="font-[family-name:var(--font-mono)]">AWS EC2</span>,
            wiring up CI/CD with <span className="font-[family-name:var(--font-mono)]">GitHub Actions</span>,
            hardening Linux, and adding observability so nothing ships blind.
          </p>

          <div className="mt-6 flex flex-wrap gap-3 font-[family-name:var(--font-nav)] text-sm">
            <a href="#" onClick={(e) => { e.preventDefault(); document.querySelector<HTMLButtonElement>("[data-nav-projects]")?.click(); }} className="inline-flex items-center gap-2 rounded-sm border-2 border-[color:var(--color-ink)] bg-[color:var(--color-paper)] px-4 py-2 shadow-[3px_3px_0_0_var(--color-ink)] transition-transform hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_var(--color-ink)]" style={{ color: "var(--color-ink)" }}>
              View Projects <ArrowRight size={14} />
            </a>
            <a href="mailto:piyush.piyushprasad.in" className="inline-flex items-center gap-2 rounded-sm px-4 py-2 font-medium transition-opacity hover:opacity-75" style={{ color: "var(--color-accent)" }}>
              <FileDown size={14} /> Download Resume
            </a>
          </div>
        </div>

        {/* sketch */}
        <div className="relative">
          <p className="font-[family-name:var(--font-hand-alt)] text-lg mb-2" style={{ color: "var(--color-accent)" }}>
            fig. 1 — how my app ships
          </p>
          <ArchitectureSketch />
        </div>
      </div>

      {/* Journey timeline */}
      <div className="mt-12">
        <p className="font-[family-name:var(--font-hand)] text-2xl mb-4" style={{ color: "var(--color-ink)" }}>
          the journey so far →
        </p>
        <div className="flex flex-wrap items-center gap-3 font-[family-name:var(--font-hand-alt)] text-lg" style={{ color: "var(--color-ink)" }}>
          <Milestone label="IT Support" year="'22" />
          <HandArrow />
          <Milestone label="Linux + Networking" year="'23" />
          <HandArrow />
          <Milestone label="AWS + CI/CD" year="'24" />
          <HandArrow />
          <Milestone label="DevSecOps" year="'25" highlight />
        </div>
      </div>
    </NotebookPage>
  );
}

function Milestone({ label, year, highlight }: { label: string; year: string; highlight?: boolean }) {
  return (
    <div className="rounded-sm px-3 py-1.5" style={{ backgroundColor: highlight ? "#FFF3A3" : "transparent", border: highlight ? "none" : "1px dashed var(--color-ink)", opacity: highlight ? 1 : 0.85 }}>
      <span className="font-[family-name:var(--font-mono)] text-xs mr-2" style={{ color: "var(--color-accent)" }}>{year}</span>
      {label}
    </div>
  );
}

function HandArrow() {
  return (
    <svg width="40" height="20" viewBox="0 0 40 20" fill="none" style={{ color: "var(--color-accent)" }}>
      <path d="M2 10 Q 15 4 30 10" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M24 5 L 32 10 L 24 14" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArchitectureSketch() {
  return (
    <svg viewBox="0 0 340 260" className="w-full max-w-sm" style={{ color: "var(--color-ink)" }}>
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
        </marker>
      </defs>
      <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        {/* GitHub */}
        <rect x="20" y="20" width="120" height="52" rx="4" strokeDasharray="0" />
        <text x="80" y="45" textAnchor="middle" fontFamily="Patrick Hand" fontSize="16" fill="currentColor" stroke="none">GitHub</text>
        <text x="80" y="62" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="10" fill="currentColor" stroke="none" opacity="0.6">git push</text>

        {/* Actions */}
        <rect x="200" y="20" width="120" height="52" rx="4" />
        <text x="260" y="45" textAnchor="middle" fontFamily="Patrick Hand" fontSize="16" fill="currentColor" stroke="none">Actions CI/CD</text>
        <text x="260" y="62" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="10" fill="currentColor" stroke="none" opacity="0.6">build + ssh</text>

        {/* EC2 */}
        <rect x="110" y="110" width="140" height="60" rx="4" />
        <text x="180" y="138" textAnchor="middle" fontFamily="Patrick Hand" fontSize="16" fill="currentColor" stroke="none">AWS EC2 · Nginx</text>
        <text x="180" y="156" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="10" fill="currentColor" stroke="none" opacity="0.6">Ubuntu + SSL</text>

        {/* Cloudflare */}
        <rect x="90" y="200" width="180" height="42" rx="4" />
        <text x="180" y="226" textAnchor="middle" fontFamily="Patrick Hand" fontSize="16" fill="currentColor" stroke="none">Cloudflare · DNS + Email</text>

        {/* arrows */}
        <path d="M140 46 L 200 46" markerEnd="url(#arrow)" />
        <path d="M260 72 Q 260 92 220 110" markerEnd="url(#arrow)" />
        <path d="M180 170 L 180 200" markerEnd="url(#arrow)" />

        {/* doodle star */}
        <path d="M300 190 l 3 6 l 6 1 l -4 4 l 1 6 l -6 -3 l -6 3 l 1 -6 l -4 -4 l 6 -1 z" fill="#FFE0A8" stroke="currentColor" strokeWidth="1" />
      </g>
    </svg>
  );
}

/* ---------------- Skills ---------------- */

function SkillsPage() {
  return (
    <NotebookPage pageNum="02" chapterLabel="Chapter 02 · Skills">
      <p className="font-[family-name:var(--font-hand-alt)] text-xl" style={{ color: "var(--color-accent)" }}>
        stuck to the page —
      </p>
      <h2 className="mt-1 font-[family-name:var(--font-hand)] text-5xl font-bold" style={{ color: "var(--color-ink)" }}>
        Things I reach for.
      </h2>
      <p className="mt-3 max-w-lg text-[15px]" style={{ color: "var(--color-ink)" }}>
        No progress bars — those never told the truth anyway. Just the tools I actually
        pull off the shelf when it's time to ship.
      </p>

      <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 md:grid-cols-4">
        {SKILLS.map((s, i) => (
          <StickyNote key={s.name} name={s.name} Icon={s.Icon} color={s.color} index={i} />
        ))}
      </div>
    </NotebookPage>
  );
}

function StickyNote({
  name,
  Icon,
  color,
  index,
}: {
  name: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  index: number;
}) {
  const rot = ((index * 37) % 7) - 3; // deterministic pseudo-random
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: -30, rotate: rot - 5 }}
      animate={inView ? { opacity: 1, y: 0, rotate: rot } : {}}
      transition={{ delay: 0.05 * index, type: "spring", stiffness: 220, damping: 18 }}
      whileHover={{ rotate: 0, y: -4, scale: 1.03 }}
      className="relative aspect-square"
    >
      {/* tape */}
      <div className="absolute left-1/2 top-[-10px] h-4 w-16 -translate-x-1/2" style={{ backgroundColor: "rgba(255, 243, 163, 0.75)", boxShadow: "0 1px 2px rgba(0,0,0,.06)" }} />
      <div
        className="flex h-full w-full flex-col items-center justify-center gap-2 p-3"
        style={{
          backgroundColor: color,
          boxShadow: "0 10px 20px -10px rgba(0,0,0,.25), inset 0 -6px 0 rgba(0,0,0,.04)",
        }}
      >
        <Icon size={26} className="opacity-80" />
        <span className="text-center font-[family-name:var(--font-hand)] text-xl leading-tight" style={{ color: "var(--color-ink)" }}>
          {name}
        </span>
      </div>
    </motion.div>
  );
}

/* ---------------- Projects ---------------- */

const PROJECTS = [
  {
    title: "Production Portfolio",
    period: "Live · 2024",
    link: { href: "https://kamleshprasad.xyz", label: "kamleshprasad.xyz" },
    problem: "A React site needed to ship on every push without me babysitting the server.",
    solution:
      "Automated the whole path: GitHub Actions builds, SSHes into EC2, and reloads Nginx behind Cloudflare DNS + email routing.",
    tech: ["AWS EC2", "Ubuntu", "Nginx", "GitHub Actions", "Cloudflare", "React", "SSH", "SPF/DKIM/DMARC"],
    result: "Zero-touch deploys, sub-second reloads, mail delivered clean.",
  },
  {
    title: "Hardened EC2 with Monitoring",
    period: "In Progress · Live Project",
    problem: "A public server needs to survive scanners, script kiddies, and my own bad days.",
    solution:
      "React + Node behind Nginx with Certbot SSL, UFW, rate limits, Nginx return 444, and Basic Auth on admin paths. Prometheus + Grafana + Node Exporter watch it. Trivy scans in CI.",
    tech: ["AWS EC2", "Nginx", "Certbot", "UFW", "Prometheus", "Grafana", "Node Exporter", "Trivy"],
    result: "Metrics visible, attack surface narrowed, DevSecOps muscles built.",
  },
];

function ProjectsPage() {
  return (
    <NotebookPage pageNum="03" chapterLabel="Chapter 03 · Projects">
      <h2 className="font-[family-name:var(--font-hand)] text-5xl font-bold" style={{ color: "var(--color-ink)" }}>
        What I've been building.
      </h2>
      <p className="mt-2 max-w-lg text-[15px]" style={{ color: "var(--color-ink)" }}>
        Two projects I keep going back to. Each one taught me a whole shelf of things
        I couldn't have read into me.
      </p>

      <div className="mt-10 space-y-14">
        {PROJECTS.map((p, i) => (
          <ProjectEntry key={p.title} project={p} index={i} />
        ))}
      </div>
    </NotebookPage>
  );
}

function ProjectEntry({ project, index }: { project: (typeof PROJECTS)[number]; index: number }) {
  return (
    <div className="relative">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h3 className="font-[family-name:var(--font-hand)] text-3xl font-bold" style={{ color: "var(--color-ink)" }}>
          <span style={{ color: "var(--color-accent)" }}>Nº 0{index + 1}.</span> {project.title}
        </h3>
        <span className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-widest" style={{ color: "var(--color-accent)" }}>
          {project.period}
        </span>
      </div>

      {project.link && (
        <a href={project.link.href} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 font-[family-name:var(--font-hand-alt)] text-lg ink-underline" style={{ color: "var(--color-accent)" }}>
          {project.link.label} <ExternalLink size={12} />
        </a>
      )}

      <div className="mt-4 grid gap-5 md:grid-cols-2">
        <ProjectField label="Problem" body={project.problem} />
        <ProjectField label="Solution" body={project.solution} />
        <ProjectField label="Result" body={project.result} />
        <div>
          <p className="font-[family-name:var(--font-hand)] text-xl mb-2" style={{ color: "var(--color-accent)" }}>
            Tech
          </p>
          <div className="flex flex-wrap gap-1.5">
            {project.tech.map((t) => (
              <span
                key={t}
                className="rounded-sm px-2 py-0.5 font-[family-name:var(--font-mono)] text-[11px]"
                style={{ border: "1px solid var(--color-ink)", color: "var(--color-ink)", backgroundColor: "rgba(255,255,255,0.4)" }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProjectField({ label, body }: { label: string; body: string }) {
  return (
    <div>
      <p className="font-[family-name:var(--font-hand)] text-xl mb-1" style={{ color: "var(--color-accent)" }}>
        {label}
      </p>
      <p className="text-[14.5px] leading-relaxed" style={{ color: "var(--color-ink)" }}>
        {body}
      </p>
    </div>
  );
}

/* ---------------- Experience ---------------- */

const TIMELINE = [
  {
    year: "Feb 2022",
    title: "IT Service Management Consultant",
    org: "Credence Infotech",
    period: "Feb 2022 – Oct 2024",
    bullets: [
      "Delivered ITSM operations aligned with ITIL best practices, supporting incident, problem, and change management processes.",
      "Acted as a coordination point between technical teams and stakeholders to ensure smooth and efficient service delivery.",
      "Monitored service performance and maintained adherence to defined operational standards and client SLAs.",
      "Contributed to process improvement initiatives to enhance service efficiency and overall customer satisfaction.",
      "Provided operational support and consultation to improve IT service quality and system reliability.",
    ],
  },
  {
    year: "Dec 2024",
    title: "IT Office Assistant",
    org: "Runtime Solutions",
    period: "Dec 2024 – Present",
    bullets: [
      "Managed end-to-end ITSM ticket lifecycle including incidents, service requests, and escalations across multiple locations using ManageEngine ServiceDesk Plus.",
      "Maintained SLA compliance by prioritizing critical issues, minimizing downtime, and ensuring timely resolution.",
      "Administered IT asset lifecycle for laptops, desktops, access points, and biometric devices with accurate tracking and documentation.",
      "Coordinated with internal teams and external vendors to resolve hardware, network, and system issues within defined SLAs.",
      "Supported daily IT operations including ticket logging, categorization, escalation handling, and documentation to ensure service continuity.",
    ],
  },
  {
    year: "2024 → now",
    title: "Cloud & DevOps Projects",
    org: "Self-directed",
    period: "Ongoing",
    bullets: [
      "Production deployments on AWS EC2 with Nginx + Cloudflare.",
      "CI/CD via GitHub Actions, Trivy scans, Prometheus/Grafana observability.",
    ],
  },
];

function ExperiencePage() {
  return (
    <NotebookPage pageNum="04" chapterLabel="Chapter 04 · Experience">
      <h2 className="font-[family-name:var(--font-hand)] text-5xl font-bold" style={{ color: "var(--color-ink)" }}>
        The timeline.
      </h2>
      <p className="mt-2 max-w-lg text-[15px]" style={{ color: "var(--color-ink)" }}>
        Drawn top to bottom, like all good notebook things.
      </p>

      <div className="relative mt-10 pl-8">
        {/* dashed vertical spine */}
        <div className="absolute bottom-4 left-2 top-4 border-l-2 border-dashed" style={{ borderColor: "var(--color-accent)" }} />
        <div className="space-y-8">
          {TIMELINE.map((t, i) => (
            <TimelineEntry key={t.title} item={t} index={i} />
          ))}
        </div>
      </div>
    </NotebookPage>
  );
}

function TimelineEntry({ item, index }: { item: (typeof TIMELINE)[number]; index: number }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -12 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ delay: index * 0.08 }}
      className="relative"
    >
      {/* node dot */}
      <div
        className="absolute -left-[30px] top-2 flex h-5 w-5 items-center justify-center rounded-full"
        style={{
          backgroundColor: "var(--color-accent)",
          border: "2px solid var(--color-accent)",
        }}
      />
      <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-widest" style={{ color: "var(--color-accent)" }}>
        {item.year}
      </p>
      <h3 className="mt-0.5 font-[family-name:var(--font-hand)] text-2xl font-bold" style={{ color: "var(--color-ink)" }}>
        {item.title} <span className="font-normal italic" style={{ color: "var(--color-accent)" }}>· {item.org}</span>
      </h3>
      <p className="text-xs" style={{ color: "var(--color-ink)", opacity: 0.6 }}>{item.period}</p>
      <ul className="mt-2 space-y-1 pl-4 text-[14.5px]" style={{ color: "var(--color-ink)" }}>
        {item.bullets.map((b) => (
          <li key={b} className="relative">
            <span className="absolute -left-4 top-2 h-[3px] w-[3px] rounded-full" style={{ backgroundColor: "var(--color-ink)" }} />
            {b}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

/* ---------------- Certifications ---------------- */

const CERTS = [
  { name: "Ubuntu Linux Professional", issuer: "Canonical", color: "#FFE0A8" },
  { name: "GitHub Professional", issuer: "GitHub", color: "#E4DAF7" },
  { name: "AWS Cloud Essentials", issuer: "AWS", color: "#FFD6D6" },
  { name: "Linux Upgrade & Patch Mgmt", issuer: "LinkedIn Learning", color: "#CFE4FF" },
  { name: "DNS Fundamentals", issuer: "Packt", color: "#D9F0DC" },
  { name: "DevSecOps Basics", issuer: "Self-study", color: "#FFF3A3" },
];

function CertsPage() {
  return (
    <NotebookPage pageNum="05" chapterLabel="Chapter 05 · Certifications">
      <h2 className="font-[family-name:var(--font-hand)] text-5xl font-bold" style={{ color: "var(--color-ink)" }}>
        Taped in for safekeeping.
      </h2>
      <p className="mt-2 max-w-lg text-[15px]" style={{ color: "var(--color-ink)" }}>
        The paper receipts of learning.
      </p>

      <div className="mt-12 grid gap-10 sm:grid-cols-2 md:grid-cols-3">
        {CERTS.map((c, i) => (
          <TapedCert key={c.name} cert={c} index={i} />
        ))}
      </div>
    </NotebookPage>
  );
}

function TapedCert({ cert, index }: { cert: (typeof CERTS)[number]; index: number }) {
  const rot = ((index * 53) % 9) - 4;
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20, rotate: rot }}
      animate={inView ? { opacity: 1, y: 0, rotate: rot } : {}}
      transition={{ delay: index * 0.07 }}
      whileHover={{ rotate: 0, y: -4 }}
      className="relative"
    >
      {/* tape strips */}
      <div className="absolute left-[-8px] top-[-8px] h-5 w-16 rotate-[-25deg]" style={{ backgroundColor: "rgba(255, 243, 163, 0.72)", boxShadow: "0 1px 2px rgba(0,0,0,.05)" }} />
      <div className="absolute right-[-8px] top-[-6px] h-5 w-14 rotate-[20deg]" style={{ backgroundColor: "rgba(255, 243, 163, 0.72)", boxShadow: "0 1px 2px rgba(0,0,0,.05)" }} />

      <div
        className="flex min-h-[140px] flex-col justify-between p-4"
        style={{
          backgroundColor: cert.color,
          boxShadow: "0 12px 24px -14px rgba(0,0,0,.3)",
        }}
      >
        <p className="font-[family-name:var(--font-hand)] text-xl font-bold leading-tight" style={{ color: "var(--color-ink)" }}>
          {cert.name}
        </p>
        <div className="mt-4 flex items-end justify-between">
          <p className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-widest" style={{ color: "var(--color-ink)", opacity: 0.7 }}>
            {cert.issuer}
          </p>
          {/* stamp */}
          <div className="rounded-full border-2 border-dashed px-2 py-0.5 font-[family-name:var(--font-hand)] text-xs" style={{ borderColor: "var(--color-margin-line)", color: "var(--color-margin-line)" }}>
            certified
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ---------------- Contact ---------------- */

function ContactPage() {
  return (
    <NotebookPage pageNum="06" chapterLabel="Chapter 06 · Contact">
      <div className="text-center">
        <h2 className="font-[family-name:var(--font-hand)] text-6xl font-bold leading-tight" style={{ color: "var(--color-ink)" }}>
          Thanks for reading.
        </h2>
        <p className="mt-3 font-[family-name:var(--font-hand-alt)] text-2xl" style={{ color: "var(--color-accent)" }}>
          Let's build something together.
        </p>
      </div>

      <div className="mx-auto mt-12 grid max-w-xl gap-4 sm:grid-cols-2">
        <ContactLink Icon={Mail} label="Email" value="piyush.piyushprasad.in" href="mailto:piyush.piyushprasad.in" />
        <ContactLink Icon={Linkedin} label="LinkedIn" value="linkedin.com/in/ppiyushhhh" href="https://linkedin.com/in/ppiyushhhh" />
        <ContactLink Icon={Github} label="GitHub" value="github.com/ppiyushhhhh" href="https://github.com/ppiyushhhhh" />
        <ContactLink Icon={FileDown} label="Resume" value="Download PDF" href="#" />
      </div>

      <div className="mt-16 text-center">
        <p className="font-[family-name:var(--font-hand-alt)] text-lg" style={{ color: "var(--color-ink)", opacity: 0.7 }}>
          — signed —
        </p>
        <Signature />
        <p className="mt-4 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.3em]" style={{ color: "var(--color-accent)" }}>
          Mumbai · India
        </p>
      </div>
    </NotebookPage>
  );
}

function ContactLink({
  Icon,
  label,
  value,
  href,
}: {
  Icon: React.ComponentType<{ size?: number }>;
  label: string;
  value: string;
  href: string;
}) {
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel="noreferrer"
      className="group flex items-center gap-3 rounded-sm px-4 py-3 transition-all hover:-translate-y-0.5"
      style={{ border: "1.5px dashed var(--color-ink)", backgroundColor: "rgba(255,255,255,0.3)" }}
    >
      <span className="grid h-9 w-9 place-items-center rounded-full" style={{ backgroundColor: "var(--color-paper)", border: "1.5px solid var(--color-ink)", color: "var(--color-ink)" }}>
        <Icon size={16} />
      </span>
      <span>
        <span className="block font-[family-name:var(--font-nav)] text-[10px] uppercase tracking-widest" style={{ color: "var(--color-accent)" }}>{label}</span>
        <span className="block font-[family-name:var(--font-hand-alt)] text-lg" style={{ color: "var(--color-ink)" }}>{value}</span>
      </span>
    </a>
  );
}

function Signature() {
  const ref = useRef<SVGSVGElement | null>(null);
  const inView = useInView(ref, { once: true });
  return (
    <svg ref={ref} viewBox="0 0 300 90" className="mx-auto mt-2 h-24 w-64" style={{ color: "var(--color-ink)" }}>
      <motion.path
        d="M 20 60 C 35 20, 60 20, 70 55 C 78 78, 95 40, 105 55 C 115 68, 128 30, 138 55 L 148 55 M 158 30 L 158 65 M 168 45 C 180 30, 195 30, 200 50 C 205 68, 218 40, 228 55 C 240 70, 260 50, 275 45"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={inView ? { pathLength: 1 } : {}}
        transition={{ duration: 2.2, ease: "easeInOut" }}
      />
    </svg>
  );
}

/* ---------------- Backdrop ---------------- */

function DeskBackdrop() {
  return (
    <>
      {/* coffee ring */}
      <svg
        className="pointer-events-none fixed bottom-8 right-6 z-0 opacity-40"
        width="140"
        height="140"
        viewBox="0 0 140 140"
        aria-hidden
      >
        <circle cx="70" cy="70" r="52" fill="none" stroke="#B08968" strokeWidth="4" opacity="0.5" />
        <circle cx="70" cy="70" r="48" fill="none" stroke="#8B6F4E" strokeWidth="1.5" opacity="0.4" strokeDasharray="6 8" />
      </svg>
      {/* corner pencil doodle */}
      <svg className="pointer-events-none fixed left-4 top-20 z-0 opacity-30 hidden md:block" width="80" height="80" viewBox="0 0 80 80" aria-hidden style={{ color: "var(--color-accent)" }}>
        <path d="M10 60 L 30 20 L 50 60 M 20 45 L 40 45" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <text x="55" y="60" fontFamily="Patrick Hand" fontSize="14" fill="currentColor">Δ</text>
      </svg>
    </>
  );
}
