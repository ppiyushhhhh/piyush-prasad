import { useCallback, useEffect, useRef, useState } from "react";
import { TECH_LOGO_REGISTRY } from "@/lib/tech-logo-registry";

/**
 * "How it runs": Simplified, clear architectural workflow.
 *
 * Logical Data & Deployment Flows:
 * 1. Developer → GitHub → GitHub Actions → Trivy security scan.
 * 2. GitHub Actions → Terraform → AWS VPC, subnet, Security Group, IAM role, and EC2.
 * 3. GitHub Actions → Ansible over SSH → EC2 server named ubuntu-app-01.
 * 4. Users → HTTPS port 443 → Nginx → App → Database.
 * 5. Node Exporter → Prometheus → Grafana.
 * 6. CloudWatch Agent on EC2 → CloudWatch for host logs and metrics.
 * 7. Scheduled report job → PDF report → Amazon S3 archive, and email alerts → hello@piyushprasad.in.
 */

export const HOW_IT_RUNS_TIMING = {
  edgeDurationMs: 1800, // Calm, steady traversal along each active connector
  stepPauseMs: 1200, // Pause between phases
  loopPauseMs: 1800, // Pause before looping back from end to start
  resumeAfterClickMs: 8000, // Auto-advance pause after user clicks
} as const;

const NARROW_PX = 760;

// ---------------------------------------------------------------------------
// Desktop Topology Data (1040 x 820 Canvas with zero overlaps)
// ---------------------------------------------------------------------------
type Node = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  name: string;
  sub: string;
  logo?: string;
  fb: string;
  step: number;
  ref?: boolean;
  tip: string;
};

const NODES: Node[] = [
  // Tier 1: CI/CD Pipeline (y: 24)
  { id: "dev", x: 30, y: 24, w: 180, h: 56, name: "Developer", sub: "git push feature/infra", fb: "DEV", step: 0, tip: "Developer writes code and pushes commits to GitHub" },
  { id: "gh", x: 270, y: 24, w: 180, h: 56, name: "GitHub", sub: "repository · PR branch", logo: "github", fb: "GH", step: 0, tip: "Source repository and pull request automation" },
  { id: "ci", x: 520, y: 24, w: 220, h: 56, name: "GitHub Actions", sub: "CI/CD workflow runner", logo: "githubactions", fb: "CI", step: 0, tip: "Orchestrates automated build, scan, provisioning, and deployment stages" },
  { id: "trivy", x: 820, y: 24, w: 190, h: 56, name: "Trivy", sub: "security & CVE scan", logo: "trivy", fb: "TR", step: 0, tip: "Scans repository dependencies and container images for vulnerabilities" },

  // Tier 2: Infrastructure Provisioning & Deployment Automation (y: 150)
  { id: "ans", x: 120, y: 150, w: 190, h: 56, name: "Ansible", sub: "SSH deploy · playbook", logo: "ansible", fb: "AN", step: 2, tip: "Configures the Ubuntu EC2 host via SSH and deploys the container stack" },
  { id: "tf", x: 450, y: 150, w: 200, h: 56, name: "Terraform", sub: "IaC AWS provisioner", logo: "terraform", fb: "TF", step: 1, ref: true, tip: "Provisions VPC, subnets, Security Groups, IAM role, and EC2 (Reference only)" },
  { id: "aws_infra", x: 730, y: 150, w: 280, h: 56, name: "AWS VPC, Subnet & IAM", sub: "isolated network · EC2 role", logo: "aws-vpc", fb: "AWS", step: 1, ref: true, tip: "Isolated VPC network, security firewall, and IAM instance role (Reference only)" },

  // Tier 4: External Users & Cloud Destinations (y: 730)
  { id: "users", x: 30, y: 730, w: 180, h: 56, name: "Users", sub: "browser clients · HTTPS", fb: "WEB", step: 3, tip: "Visitors access the web application securely over HTTPS (port 443)" },
  { id: "s3", x: 260, y: 730, w: 200, h: 56, name: "Amazon S3", sub: "encrypted PDF archive", logo: "aws-s3", fb: "S3", step: 3, ref: true, tip: "Amazon S3 bucket stores encrypted daily compliance and audit PDF reports (Reference only)" },
  { id: "cw", x: 510, y: 730, w: 230, h: 56, name: "Amazon CloudWatch", sub: "host logs & metrics", logo: "aws-cloudwatch", fb: "CW", step: 3, ref: true, tip: "CloudWatch captures EC2 system metrics and operational host logs (Reference only)" },
  { id: "mail", x: 790, y: 730, w: 220, h: 56, name: "Email Alerts", sub: "hello@piyushprasad.in", logo: "mail", fb: "@", step: 3, tip: "Automated PDF reports and workflow alerts dispatched to hello@piyushprasad.in" },
];

type Edge = {
  id: string;
  step: number;
  d: string;
  len: number;
  tip: string;
  label: { x: number; y: number; t: string };
};

const EDGES: Edge[] = [
  // -------------------------------------------------------------------------
  // Phase 1: Code & Security Scan
  // -------------------------------------------------------------------------
  {
    id: "e1",
    step: 0,
    d: "M 210 52 H 270",
    len: 60,
    tip: "Developer pushes code commits to GitHub repository",
    label: { x: 240, y: 38, t: "git push" },
  },
  {
    id: "e2",
    step: 0,
    d: "M 450 52 H 520",
    len: 70,
    tip: "Push / PR webhook triggers GitHub Actions CI/CD workflow",
    label: { x: 485, y: 38, t: "trigger CI" },
  },
  {
    id: "e3",
    step: 0,
    d: "M 740 52 H 820",
    len: 80,
    tip: "GitHub Actions executes Trivy security and vulnerability scan",
    label: { x: 780, y: 38, t: "security scan" },
  },

  // -------------------------------------------------------------------------
  // Phase 2: AWS Provisioning
  // -------------------------------------------------------------------------
  {
    id: "e4",
    step: 1,
    d: "M 620 80 V 150",
    len: 70,
    tip: "GitHub Actions executes Terraform plan and apply",
    label: { x: 672, y: 115, t: "plan & apply" },
  },
  {
    id: "e5",
    step: 1,
    d: "M 650 178 H 730",
    len: 80,
    tip: "Terraform provisions AWS VPC, Subnet, and IAM instance role",
    label: { x: 690, y: 166, t: "provision & attach" },
  },
  {
    id: "e6",
    step: 1,
    d: "M 550 206 V 270",
    len: 64,
    tip: "Terraform provisions ubuntu-app-01 EC2 host and attaches Security Group",
    label: { x: 630, y: 238, t: "provisions EC2 & SG" },
  },

  // -------------------------------------------------------------------------
  // Phase 3: Application Deployment
  // -------------------------------------------------------------------------
  {
    id: "e7",
    step: 2,
    d: "M 560 80 V 112 H 215 V 150",
    len: 415,
    tip: "GitHub Actions triggers Ansible deployment playbook",
    label: { x: 380, y: 102, t: "trigger deploy" },
  },
  {
    id: "e8",
    step: 2,
    d: "M 215 206 V 270",
    len: 64,
    tip: "Ansible configures ubuntu-app-01 via SSH (port 22) and deploys containers",
    label: { x: 272, y: 238, t: "SSH port 22" },
  },

  // -------------------------------------------------------------------------
  // Phase 4: Traffic, Telemetry & Alerts
  // -------------------------------------------------------------------------
  {
    id: "e9",
    step: 3,
    d: "M 120 730 V 695 H 42 V 397 H 70",
    len: 444,
    tip: "Users connect securely over HTTPS via Security Group port 443 into Nginx",
    label: { x: 120, y: 714, t: "HTTPS 443" },
  },
  {
    id: "e10",
    step: 3,
    d: "M 235 397 H 275",
    len: 40,
    tip: "Nginx terminates TLS and reverse proxies HTTP requests to the App",
    label: { x: 255, y: 386, t: "proxy" },
  },
  {
    id: "e11",
    step: 3,
    d: "M 440 397 H 480",
    len: 40,
    tip: "App handles business logic and queries database collections",
    label: { x: 460, y: 386, t: "queries" },
  },
  {
    id: "e12",
    step: 3,
    d: "M 235 537 H 275",
    len: 40,
    tip: "Node Exporter exposes host kernel telemetry scraped by Prometheus on port 9100",
    label: { x: 255, y: 526, t: "scrape :9100" },
  },
  {
    id: "e13",
    step: 3,
    d: "M 440 537 H 480",
    len: 40,
    tip: "Prometheus metrics feed visual dashboards in Grafana on port 3001",
    label: { x: 460, y: 526, t: "dashboards" },
  },
  {
    id: "e14",
    step: 3,
    d: "M 828 424 V 455",
    len: 31,
    tip: "Isolated host crontab executes daily compliance and security report script",
    label: { x: 885, y: 440, t: "runs script" },
  },
  {
    id: "e15",
    step: 3,
    d: "M 676 482 H 360 V 730",
    len: 564,
    tip: "Generated PDF report is encrypted and archived in Amazon S3",
    label: { x: 360, y: 712, t: "archive PDF" },
  },
  {
    id: "e16",
    step: 3,
    d: "M 625 599 V 730",
    len: 131,
    tip: "CloudWatch Agent on EC2 streams host logs and metrics to Amazon CloudWatch",
    label: { x: 695, y: 712, t: "logs & metrics" },
  },
  {
    id: "e17",
    step: 3,
    d: "M 900 509 V 730",
    len: 221,
    tip: "Automated PDF reports and workflow alerts dispatched to hello@piyushprasad.in",
    label: { x: 900, y: 712, t: "email alerts" },
  },
];

/**
 * Analytical coordinate calculation along active edge paths.
 */
function getPointOnEdge(edge: Edge, frac: number): { x: number; y: number } {
  const f = Math.max(0, Math.min(1, frac));
  switch (edge.id) {
    case "e1":
      return { x: 210 + f * 60, y: 52 };
    case "e2":
      return { x: 450 + f * 70, y: 52 };
    case "e3":
      return { x: 740 + f * 80, y: 52 };
    case "e4":
      return { x: 620, y: 80 + f * 70 };
    case "e5":
      return { x: 650 + f * 80, y: 178 };
    case "e6":
      return { x: 550, y: 206 + f * 64 };
    case "e7": {
      // M 560 80 V 112 H 215 V 150 (32 + 345 + 38 = 415)
      const dist = f * 415;
      if (dist <= 32) return { x: 560, y: 80 + dist };
      if (dist <= 377) return { x: 560 - (dist - 32), y: 112 };
      return { x: 215, y: 112 + (dist - 377) };
    }
    case "e8":
      return { x: 215, y: 206 + f * 64 };
    case "e9": {
      // M 120 730 V 695 H 42 V 397 H 70 (35 + 78 + 298 + 28 = 439)
      const dist = f * 439;
      if (dist <= 35) return { x: 120, y: 730 - dist };
      if (dist <= 113) return { x: 120 - (dist - 35), y: 695 };
      if (dist <= 411) return { x: 42, y: 695 - (dist - 113) };
      return { x: 42 + (dist - 411), y: 397 };
    }
    case "e10":
      return { x: 235 + f * 40, y: 397 };
    case "e11":
      return { x: 440 + f * 40, y: 397 };
    case "e12":
      return { x: 235 + f * 40, y: 537 };
    case "e13":
      return { x: 440 + f * 40, y: 537 };
    case "e14":
      return { x: 828, y: 424 + f * 31 };
    case "e15": {
      // M 676 482 H 360 V 730 (316 + 248 = 564)
      const dist = f * 564;
      if (dist <= 316) return { x: 676 - dist, y: 482 };
      return { x: 360, y: 482 + (dist - 316) };
    }
    case "e16":
      return { x: 625, y: 599 + f * 131 };
    case "e17":
      return { x: 900, y: 509 + f * 221 };
    default:
      return { x: 0, y: 0 };
  }
}

const STEPS = [
  {
    title: "Code & Security Scan",
    text: "Developer pushes code to GitHub. GitHub Actions initiates CI/CD and executes Trivy security scanning for CVE vulnerabilities in source dependencies and container images.",
  },
  {
    title: "AWS Provisioning",
    text: "GitHub Actions triggers Terraform to provision the isolated AWS VPC, subnets, and Security Groups (ports 443 & 22), attach the AWS IAM instance role, and provision the EC2 host.",
  },
  {
    title: "Deployment via SSH",
    text: "GitHub Actions triggers Ansible over SSH (port 22) to configure the Ubuntu EC2 server named ubuntu-app-01 and launch the Docker Compose multi-container stack.",
  },
  {
    title: "Traffic, Telemetry & Alerts",
    text: "Users connect over HTTPS (port 443) to Nginx → App → Database. Node Exporter streams metrics to Prometheus & Grafana. CloudWatch Agent captures host logs. Daily PDF reports archive to Amazon S3 and email alerts go to hello@piyushprasad.in.",
  },
];

type NarrowStep = {
  title: string;
  desc: string;
  externalServices?: { name: string; logo?: string; fb: string; ref?: boolean }[];
  serverServices?: { name: string; logo?: string; fb: string; ref?: boolean }[];
};

const NARROW_STEPS: NarrowStep[] = [
  {
    title: "Code & Security Scan",
    desc: "Developer pushes code to GitHub. GitHub Actions runs Trivy security scans on repository code and container images.",
    externalServices: [
      { name: "Developer (git push)", fb: "DEV" },
      { name: "GitHub (repository)", logo: "github", fb: "GH" },
      { name: "GitHub Actions (CI/CD runner)", logo: "githubactions", fb: "CI" },
      { name: "Trivy (vulnerability scan)", logo: "trivy", fb: "TR" },
    ],
  },
  {
    title: "AWS Provisioning",
    desc: "Terraform provisions isolated AWS VPC, subnets, Security Groups, IAM role, and the EC2 server.",
    externalServices: [
      { name: "Terraform (IaC provisioner)", logo: "terraform", fb: "TF", ref: true },
      { name: "AWS VPC & Subnets", logo: "aws-vpc", fb: "VPC", ref: true },
      { name: "Security Group (ports 443, 22)", logo: "aws-vpc", fb: "SG", ref: true },
      { name: "AWS IAM (EC2 instance role)", logo: "aws-iam", fb: "IAM", ref: true },
    ],
  },
  {
    title: "Deployment via SSH",
    desc: "GitHub Actions runs Ansible over SSH (port 22) to configure ubuntu-app-01 and launch Docker Compose.",
    externalServices: [
      { name: "Ansible (SSH deploy playbook)", logo: "ansible", fb: "AN" },
      { name: "Security Group (SSH port 22)", logo: "aws-vpc", fb: "SG", ref: true },
    ],
    serverServices: [
      { name: "Docker Compose Stack", logo: "docker", fb: "DC" },
      { name: "ubuntu-app-01 (Ubuntu Linux)", logo: "ubuntu", fb: "UB" },
    ],
  },
  {
    title: "Traffic, Telemetry & Alerts",
    desc: "Users connect via HTTPS 443. Metrics feed Prometheus & Grafana. CloudWatch Agent logs host metrics. S3 archives reports and email alerts go to hello@piyushprasad.in.",
    externalServices: [
      { name: "Users (HTTPS port 443)", fb: "WEB" },
      { name: "Amazon S3 (archived PDF reports)", logo: "aws-s3", fb: "S3", ref: true },
      { name: "Amazon CloudWatch (host logs & metrics)", logo: "aws-cloudwatch", fb: "CW", ref: true },
      { name: "Email Alerts (hello@piyushprasad.in)", logo: "mail", fb: "@" },
    ],
    serverServices: [
      { name: "Nginx (reverse proxy · TLS 443)", logo: "nginx", fb: "NG" },
      { name: "App (React + Node.js API)", logo: "nodejs", fb: "APP" },
      { name: "Database (MongoDB / SQLite)", logo: "mongodb", fb: "DB" },
      { name: "Node Exporter (kernel metrics)", logo: "linux", fb: "NODE" },
      { name: "Prometheus (metrics collector)", logo: "prometheus", fb: "PROM" },
      { name: "Grafana (visual dashboards)", logo: "grafana", fb: "GRAF" },
      { name: "CloudWatch Agent (host metrics daemon)", logo: "aws-cloudwatch", fb: "CW" },
      { name: "Scheduled Report Job (crontab)", logo: "linux", fb: "CRON" },
      { name: "PDF Report Generator", logo: "pdf", fb: "PDF" },
    ],
  },
];

const logo = (key?: string) => (key ? TECH_LOGO_REGISTRY[key]?.src : undefined);

// ---------------------------------------------------------------------------
// SVG Building Blocks
// ---------------------------------------------------------------------------
function Tile({
  x,
  y,
  size = 30,
  href,
  fb,
}: {
  x: number;
  y: number;
  size?: number;
  href?: string;
  fb: string;
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={size}
        height={size}
        rx={7}
        className={href ? "hir-tile hir-tile-img" : "hir-tile"}
      />
      {href ? (
        <image
          href={href}
          x={x + 4.5}
          y={y + 4.5}
          width={size - 9}
          height={size - 9}
          preserveAspectRatio="xMidYMid meet"
        />
      ) : (
        <text
          x={x + size / 2}
          y={y + size / 2 + 3.5}
          textAnchor="middle"
          className="hir-mono hir-ink"
          fontSize={fb.length > 3 ? 8 : fb.length > 2 ? 8.5 : 10}
          fontWeight={700}
        >
          {fb}
        </text>
      )}
    </g>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------
export default function HowItRuns() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [visible, setVisible] = useState(false);
  const [hover, setHover] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [tabHidden, setTabHidden] = useState(false);
  const [narrow, setNarrow] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const elapsedRef = useRef(0);
  const lastTimeRef = useRef<number | null>(null);

  // Check reduced motion preference
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // Observers for viewport visibility and container width
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.15 });
    io.observe(el);
    const ro = new ResizeObserver(([e]) => setNarrow(e.contentRect.width < NARROW_PX));
    ro.observe(el);
    const onVis = () => setTabHidden(document.visibilityState === "hidden");
    document.addEventListener("visibilitychange", onVis);
    return () => {
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  const running = playing && visible && !hover && !tabHidden && !reduced;

  // Steady animation loop: advances smoothly along active connectors one by one
  useEffect(() => {
    if (!running) {
      lastTimeRef.current = null;
      return;
    }

    let rafId: number;

    const tick = (now: number) => {
      const stepEdges = EDGES.filter((e) => e.step === step);
      const isLastStep = step === STEPS.length - 1;
      const pauseDuration = isLastStep ? HOW_IT_RUNS_TIMING.loopPauseMs : HOW_IT_RUNS_TIMING.stepPauseMs;
      const stepDuration = stepEdges.length * HOW_IT_RUNS_TIMING.edgeDurationMs + pauseDuration;

      if (lastTimeRef.current !== null) {
        const delta = Math.min(100, now - lastTimeRef.current);
        elapsedRef.current += delta;

        if (elapsedRef.current >= stepDuration) {
          elapsedRef.current = 0;
          setStep((prev) => (prev + 1) % STEPS.length);
        }
      }
      lastTimeRef.current = now;
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafId);
      lastTimeRef.current = null;
    };
  }, [running, step]);

  // Cleanup timer
  useEffect(
    () => () => {
      if (resumeTimer.current) clearTimeout(resumeTimer.current);
    },
    [],
  );

  const jump = useCallback((i: number) => {
    setStep(i);
    elapsedRef.current = 0;
    setPlaying(false);
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => {
      lastTimeRef.current = performance.now();
      setPlaying(true);
    }, HOW_IT_RUNS_TIMING.resumeAfterClickMs);
  }, []);

  const s = step;
  const isOn = (steps: number[]) => reduced || steps.includes(s);
  const dim = (steps: number[]) => (isOn(steps) ? "" : "hir-dim");
  const animate = !reduced && visible && playing;

  // Calculate packet position strictly along the current active connector
  const stepEdges = EDGES.filter((e) => e.step === s);
  const edgeCount = stepEdges.length;
  const travelTime = edgeCount * HOW_IT_RUNS_TIMING.edgeDurationMs;

  let packetPos = { x: 0, y: 0 };
  let currentActiveEdgeId: string | null = null;

  if (edgeCount > 0) {
    if (elapsedRef.current < travelTime) {
      const idx = Math.floor(elapsedRef.current / HOW_IT_RUNS_TIMING.edgeDurationMs);
      const currEdge = stepEdges[idx] || stepEdges[0];
      currentActiveEdgeId = currEdge.id;
      const frac = (elapsedRef.current % HOW_IT_RUNS_TIMING.edgeDurationMs) / HOW_IT_RUNS_TIMING.edgeDurationMs;
      packetPos = getPointOnEdge(currEdge, frac);
    } else {
      // Pause period between steps: packet rests at the destination of the last active connection
      const last = stepEdges[edgeCount - 1];
      currentActiveEdgeId = last.id;
      packetPos = getPointOnEdge(last, 1.0);
    }
  }

  const ariaLabel =
    "Architecture workflow diagram: Developer pushes to GitHub, GitHub Actions runs Trivy scanning, Terraform provisions AWS VPC, subnet, Security Group, IAM role, and EC2, Ansible configures ubuntu-app-01 via SSH (port 22) and launches Docker Compose (Nginx, App, Database, Node Exporter, Prometheus, Grafana), CloudWatch Agent streams host logs & metrics to Amazon CloudWatch, and scheduled reports generate PDF archives in Amazon S3 with email alerts sent to hello@piyushprasad.in.";

  return (
    <section
      ref={rootRef}
      id="how-it-runs"
      className="hir"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      aria-label="How it runs architectural workflow"
    >
      <style>{CSS}</style>

      {/* Header Bar */}
      <header className="hir-head">
        <div>
          <p className="hir-eyebrow">Production Architecture Workflow</p>
          <h3 className="hir-title">How it runs</h3>
        </div>

        {/* Legend */}
        <div className="hir-legend" aria-hidden="true">
          <span>
            <i className="hir-key hir-key-solid" /> Used in my repos
          </span>
          <span>
            <i className="hir-key hir-key-ref" /> Reference only
          </span>
        </div>

        {/* Play/Pause Button */}
        <div className="hir-controls">
          <button
            type="button"
            className="hir-btn"
            aria-pressed={!playing}
            aria-label={playing && !reduced ? "Pause animation" : "Play animation"}
            onClick={() => {
              if (!playing) {
                lastTimeRef.current = performance.now();
              }
              setPlaying((p) => !p);
            }}
          >
            {playing && !reduced ? (
              <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
                <rect x="3.5" y="2.5" width="3" height="11" rx="1" fill="currentColor" />
                <rect x="9.5" y="2.5" width="3" height="11" rx="1" fill="currentColor" />
              </svg>
            ) : (
              <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
                <path d="M4 2.5v11l9-5.5z" fill="currentColor" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* Step Tabs */}
      <div className="hir-steps" role="tablist" aria-label="Workflow phases">
        {STEPS.map((st, i) => (
          <button
            key={st.title}
            type="button"
            role="tab"
            aria-selected={i === s}
            aria-label={`Phase ${i + 1}: ${st.title}`}
            className={`hir-seg ${i < s ? "hir-seg-done" : ""} ${i === s ? "hir-seg-on" : ""}`}
            onClick={() => jump(i)}
          >
            <span className="hir-seg-label">
              <b>{String(i + 1).padStart(2, "0")}</b> {st.title}
            </span>
          </button>
        ))}
      </div>

      {/* Explanatory Caption */}
      <p className="hir-caption" aria-live="polite">
        {STEPS[s].text}
      </p>

      {/* Mobile Layout */}
      {narrow ? (
        <div className="hir-mobile-wrap">
          <ol className="hir-list">
            {NARROW_STEPS.map((st, i) => (
              <li key={st.title} className={`hir-li ${i === s ? "hir-li-on" : ""}`}>
                <div className="hir-li-head">
                  <span className="hir-li-n">{i + 1}</span>
                  <strong>{st.title}</strong>
                </div>
                <p className="text-xs text-text-muted mb-3 leading-relaxed">{st.desc}</p>

                {/* External Services */}
                {st.externalServices && (
                  <div className="hir-chips mb-2.5">
                    {st.externalServices.map((sv) => (
                      <span
                        key={sv.name}
                        className={`hir-chip-html ${sv.ref ? "hir-chip-ref" : ""}`}
                      >
                        {logo(sv.logo) ? (
                          <img src={logo(sv.logo)} alt="" width={15} height={15} />
                        ) : (
                          <em>{sv.fb}</em>
                        )}
                        <span>{sv.name}</span>
                      </span>
                    ))}
                  </div>
                )}

                {/* Server Group: ubuntu-app-01 */}
                {st.serverServices && (
                  <div className="hir-mobile-server">
                    <div className="hir-mobile-server-head">
                      <img src={logo("ubuntu") || logo("aws-ec2")} alt="" width={15} height={15} />
                      <span>
                        Server: <strong>ubuntu-app-01</strong> (Ubuntu Linux)
                      </span>
                    </div>
                    <div className="hir-chips">
                      {st.serverServices.map((sv) => (
                        <span
                          key={sv.name}
                          className={`hir-chip-html ${sv.ref ? "hir-chip-ref" : ""}`}
                        >
                          {logo(sv.logo) ? (
                            <img src={logo(sv.logo)} alt="" width={15} height={15} />
                          ) : (
                            <em>{sv.fb}</em>
                          )}
                          <span>{sv.name}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ol>
        </div>
      ) : (
        /* Full-Height Desktop Architecture Canvas: Spacious 1040 x 820 with zero overlaps */
        <div className="hir-svg-container">
          <svg
            className="hir-svg"
            viewBox="0 0 1040 820"
            role="img"
            aria-label={ariaLabel}
            preserveAspectRatio="xMidYMin meet"
          >
            <defs>
              <marker
                id="hir-ah"
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M0,0 L10,5 L0,10 z" className="hir-arrow" />
              </marker>
              <marker
                id="hir-ah-active"
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M0,0 L10,5 L0,10 z" className="hir-arrow-active" />
              </marker>
              <filter id="hir-glow" x="-150%" y="-150%" width="400%" height="400%">
                <feGaussianBlur stdDeviation="3.5" />
              </filter>
            </defs>

            {/* ============================================================= */}
            {/* CENTRAL AWS EC2 LINUX SERVER BOUNDARY: ubuntu-app-01          */}
            {/* ============================================================= */}
            <g className={dim([1, 2, 3])}>
              {/* Outer Server Boundary Container */}
              <rect
                x="30"
                y="270"
                width="980"
                height="390"
                rx="14"
                className={`hir-server-boundary ${s === 2 || s === 3 ? "hir-server-boundary-on" : ""}`}
              >
                <title>AWS EC2 Linux Server: ubuntu-app-01 (Ubuntu Linux 22.04 LTS)</title>
              </rect>

              {/* Server Header Bar */}
              <Tile x={46} y={282} size={28} href={logo("ubuntu")} fb="UB" />
              <text x="82" y="298" className="hir-server-title" fontSize={13.5} fontWeight={700}>
                AWS EC2 Server: ubuntu-app-01
              </text>
              <text x="82" y="314" className="hir-mono hir-muted" fontSize={9.5}>
                Ubuntu Linux 22.04 LTS · Private Subnet (10.0.1.50) · ap-south-1
              </text>

              {/* Security Group Firewall Status Badge */}
              <rect x="520" y="284" width="340" height="26" rx="6" className="hir-sg-badge" />
              <text x="532" y="301" className="hir-mono hir-acc" fontSize={9.5} fontWeight={600}>
                Security Group Firewall: Ingress 443 (HTTPS) · Ingress 22 (SSH)
              </text>

              {/* Reference Pill for VPC/SG */}
              <rect x="914" y="284" width="84" height="26" rx="5" className="hir-ref-pill" />
              <text x="956" y="301" textAnchor="middle" className="hir-mono hir-muted" fontSize={8.5} fontWeight={600}>
                Reference only
              </text>

              {/* Sub-container A: Docker Compose Stack (Web, App, DB, Monitoring) */}
              <rect x="54" y="330" width="590" height="310" rx="10" className="hir-block" />
              <image href={logo("docker")} x="68" y="342" width="18" height="18" preserveAspectRatio="xMidYMid meet" />
              <text x="92" y="356" className="hir-name" fontSize={12} fontWeight={700}>
                Docker Compose Stack
              </text>
              <text x="630" y="356" textAnchor="end" className="hir-mono hir-muted" fontSize={9.5}>
                6 containers protected by Security Group
              </text>

              {/* Row 1: Core Web & Application Pipeline */}
              {[
                { x: 70, name: "Nginx", sub: "reverse proxy · TLS 443", logo: "nginx", fb: "NG" },
                { x: 275, name: "App", sub: "React + Node.js API", logo: "nodejs", fb: "APP" },
                { x: 480, name: "Database", sub: "MongoDB / SQLite", logo: "mongodb", fb: "DB" },
              ].map((c) => (
                <g key={c.name} className={isOn([2, 3]) ? "hir-in" : "hir-off"}>
                  <rect x={c.x} y={370} width={165} height={54} rx={8} className="hir-chip" />
                  <circle cx={c.x + 153} cy={382} r={2.5} className="hir-dot" />
                  <Tile x={c.x + 8} y={380} size={26} href={logo(c.logo)} fb={c.fb} />
                  <text x={c.x + 40} y={395} className="hir-name" fontSize={11.5} fontWeight={600}>
                    {c.name}
                  </text>
                  <text x={c.x + 40} y={411} className="hir-mono hir-muted" fontSize={8}>
                    {c.sub}
                  </text>
                </g>
              ))}

              {/* Row 2: Observability Pipeline (Node Exporter -> Prometheus -> Grafana) */}
              <g className={isOn([2, 3]) ? "hir-in" : "hir-off"}>
                {/* Node Exporter */}
                <rect x="70" y="510" width={165} height={54} rx={8} className="hir-chip" />
                <circle cx={223} cy={522} r={2.5} className="hir-dot" />
                <Tile x={78} y={520} size={26} href={logo("linux")} fb="NODE" />
                <text x={110} y={535} className="hir-name" fontSize={11.5} fontWeight={600}>
                  Node Exporter
                </text>
                <text x={110} y={551} className="hir-mono hir-muted" fontSize={8}>
                  host kernel telemetry :9100
                </text>

                {/* Prometheus */}
                <rect x="275" y="510" width={165} height={54} rx={8} className="hir-chip" />
                <circle cx={428} cy={522} r={2.5} className="hir-dot" />
                <Tile x={283} y={520} size={26} href={logo("prometheus")} fb="PROM" />
                <text x={315} y={535} className="hir-name" fontSize={11.5} fontWeight={600}>
                  Prometheus
                </text>
                <text x={315} y={551} className="hir-mono hir-muted" fontSize={8}>
                  metrics collector :9090
                </text>

                {/* Grafana */}
                <rect x="480" y="510" width={150} height={54} rx={8} className="hir-chip" />
                <circle cx={618} cy={522} r={2.5} className="hir-dot" />
                <Tile x={488} y={520} size={26} href={logo("grafana")} fb="GRAF" />
                <text x={520} y={535} className="hir-name" fontSize={11.5} fontWeight={600}>
                  Grafana
                </text>
                <text x={520} y={551} className="hir-mono hir-muted" fontSize={8}>
                  visual dashboards :3001
                </text>
              </g>

              {/* Sub-container B: Host Services & Scheduled Automation */}
              <rect x="660" y="330" width="336" height="310" rx="10" className="hir-block" />
              <text x="676" y="356" className="hir-name" fontSize={12} fontWeight={700}>
                Host Daemons & Scheduled Tasks
              </text>
              <text x="982" y="356" textAnchor="end" className="hir-mono hir-muted" fontSize={9.5}>
                systemd & isolated crontab
              </text>

              {/* Host Daemon: CloudWatch Agent */}
              <g className={isOn([2, 3]) ? "hir-in" : "hir-off"}>
                <rect x="676" y="370" width="304" height="54" rx={8} className="hir-chip" />
                <Tile x={684} y={380} size={26} href={logo("aws-cloudwatch")} fb="CW" />
                <text x={718} y={395} className="hir-name" fontSize={11.5} fontWeight={600}>
                  CloudWatch Agent
                </text>
                <text x={718} y={411} className="hir-mono hir-muted" fontSize={8}>
                  EC2 host metrics & system logs daemon
                </text>
              </g>

              {/* Scheduled Task: Daily Report Trigger */}
              <g className={isOn([3]) ? "hir-in" : "hir-off"}>
                <rect x="676" y="455" width="304" height="54" rx={8} className="hir-chip" />
                <Tile x={684} y={465} size={26} href={logo("pdf")} fb="PDF" />
                <text x={718} y={480} className="hir-name" fontSize={11.5} fontWeight={600}>
                  PDF Report Generator
                </text>
                <text x={718} y={496} className="hir-mono hir-muted" fontSize={8}>
                  compliance & security audit report
                </text>
              </g>

              {/* Scheduled Task: Host Cron */}
              <g className={isOn([3]) ? "hir-in" : "hir-off"}>
                <rect x="676" y="545" width="304" height="54" rx={8} className="hir-chip" />
                <Tile x={684} y={555} size={26} href={logo("linux")} fb="CRON" />
                <text x={718} y={570} className="hir-name" fontSize={11.5} fontWeight={600}>
                  Scheduled Report Job
                </text>
                <text x={718} y={586} className="hir-mono hir-muted" fontSize={8}>
                  isolated host crontab · daily automated trigger
                </text>
              </g>
            </g>

            {/* ============================================================= */}
            {/* CONNECTOR PATHS & DIRECTIONAL ARROWS                          */}
            {/* ============================================================= */}
            {EDGES.map((e) => {
              const isStepActive = isOn([e.step]);
              const isEdgeBeingTraversed = currentActiveEdgeId === e.id && isStepActive;

              return (
                <g key={e.id} className={dim([e.step])}>
                  <path
                    d={e.d}
                    className={`hir-line ${isStepActive ? "hir-line-step" : ""} ${isEdgeBeingTraversed ? "hir-line-active" : ""}`}
                    markerEnd={isStepActive ? "url(#hir-ah-active)" : "url(#hir-ah)"}
                  >
                    <title>{e.tip}</title>
                  </path>
                  {e.label && (
                    <text
                      x={e.label.x}
                      y={e.label.y}
                      className={`hir-mono ${isStepActive ? "hir-label-active" : "hir-muted"}`}
                      fontSize={9}
                      fontWeight={isStepActive ? 700 : 500}
                      textAnchor="middle"
                    >
                      {e.label.t}
                    </text>
                  )}
                </g>
              );
            })}

            {/* ============================================================= */}
            {/* EXTERNAL SERVICE NODES                                        */}
            {/* ============================================================= */}
            {NODES.map((n) => (
              <g key={n.id} className={dim([n.step])}>
                <rect
                  x={n.x}
                  y={n.y}
                  width={n.w}
                  height={n.h}
                  rx={10}
                  className={`hir-node ${n.ref ? "hir-node-ref" : ""} ${isOn([n.step]) && !reduced ? "hir-node-on" : ""}`}
                >
                  <title>{n.tip}</title>
                </rect>
                <Tile x={n.x + 10} y={n.y + 13} size={30} href={logo(n.logo)} fb={n.fb} />
                <text x={n.x + 48} y={n.y + 27} className="hir-name" fontSize={12.5} fontWeight={600}>
                  {n.name}
                </text>
                <text x={n.x + 48} y={n.y + 44} className="hir-mono hir-muted" fontSize={9}>
                  {n.sub}
                </text>

                {n.ref && (
                  <g>
                    <rect
                      x={n.x + n.w - 78}
                      y={n.y + 6}
                      width={70}
                      height={16}
                      rx={4}
                      className="hir-ref-pill"
                    />
                    <text
                      x={n.x + n.w - 43}
                      y={n.y + 17}
                      textAnchor="middle"
                      className="hir-mono hir-muted"
                      fontSize={7.5}
                      fontWeight={600}
                    >
                      Reference only
                    </text>
                  </g>
                )}
              </g>
            ))}

            {/* ============================================================= */}
            {/* SEQUENTIAL ANIMATED PACKET DOT                                */}
            {/* ============================================================= */}
            {animate && packetPos.x > 0 && (
              <g className="hir-packet">
                <circle
                  cx={packetPos.x}
                  cy={packetPos.y}
                  r="10"
                  className="hir-packet-glow"
                  filter="url(#hir-glow)"
                  opacity="0.45"
                />
                <circle cx={packetPos.x} cy={packetPos.y} r="4.5" className="hir-packet-dot" />
              </g>
            )}
          </svg>
        </div>
      )}
    </section>
  );
}

/* Scoped styles */
const CSS = `
.hir{
  --hir-bg:var(--card,#FFFFFF); --hir-surf:var(--background,#FAF9F6); --hir-soft-bg:var(--surface-muted,#F3F3ED);
  --hir-text:var(--foreground,#121316); --hir-muted:var(--muted-foreground,#5A5C66);
  --hir-border:var(--border,#E5E5DF); --hir-acc:var(--accent-teal,#0F766E); --hir-acc-soft:#E4F2F0;
  --hir-ok:#16A34A; --hir-on:#FFFFFF; --hir-line-inactive:#64748B;
  background:var(--hir-bg); border:1px solid var(--hir-border); border-radius:14px; padding:22px 22px 18px;
  color:var(--hir-text); width:100%; box-sizing:border-box;
  scroll-margin-top:calc(var(--site-header-h,60px) + 12px);
}
.dark .hir,[data-theme="dark"] .hir{
  --hir-bg:var(--card,#121316); --hir-surf:var(--background,#0E0F12); --hir-soft-bg:var(--surface-muted,#1A1B20);
  --hir-text:var(--foreground,#EDEDED); --hir-muted:var(--muted-foreground,#9E9E9E);
  --hir-border:var(--border,#262626); --hir-acc:var(--accent-teal,#2DD4BF); --hir-acc-soft:#0F2A27;
  --hir-ok:#22C55E; --hir-on:#0B1412; --hir-line-inactive:#94A3B8;
}
.hir-head{display:flex;align-items:flex-start;gap:16px;flex-wrap:wrap;justify-content:space-between}
.hir-head>div:first-child{flex:1 1 auto}
.hir-eyebrow{margin:0 0 4px;font:600 10px/1 ui-monospace,Menlo,monospace;letter-spacing:.14em;text-transform:uppercase;color:var(--hir-acc)}
.hir-title{margin:0;font-size:20px;font-weight:700;line-height:1.2;color:var(--hir-text)}
.hir-legend{display:flex;gap:16px;align-items:center;font:500 11px ui-monospace,Menlo,monospace;color:var(--hir-muted);padding-top:4px}
.hir-key{display:inline-block;width:18px;height:10px;border-radius:3px;margin-right:6px;vertical-align:-1px;border:1.5px solid var(--hir-acc)}
.hir-key-ref{border-style:dashed;border-color:var(--hir-muted)}
.hir-controls{display:inline-flex;align-items:center}
.hir-btn{width:32px;height:32px;display:grid;place-items:center;border-radius:8px;border:1px solid var(--hir-border);background:var(--hir-surf);color:var(--hir-text);cursor:pointer;transition:all .15s ease}
.hir-btn:hover{background:var(--hir-soft-bg)}
.hir-btn:focus-visible,.hir-seg:focus-visible{outline:2px solid var(--hir-acc);outline-offset:2px}

/* Steps bar */
.hir-steps{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:16px 0 10px}
.hir-seg{border:0;padding:0;background:none;cursor:pointer;text-align:left;color:var(--hir-muted)}
.hir-seg::before{content:"";display:block;height:4px;border-radius:2px;background:var(--hir-border);margin-bottom:6px}
.hir-seg-done::before{background:var(--hir-acc);opacity:.45}
.hir-seg-on::before{background:var(--hir-acc)}
.hir-seg-label{font:500 11.5px system-ui,sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:block}
.hir-seg-label b{font:600 10px ui-monospace,Menlo,monospace;color:var(--hir-acc);margin-right:4px}
.hir-seg-on .hir-seg-label{color:var(--hir-text);font-weight:600}
.hir-caption{margin:0 0 14px;min-height:22px;font-size:12.5px;line-height:1.5;color:var(--hir-muted)}

/* SVG Container: Full-height and naturally scrollable */
.hir-svg-container{width:100%;overflow-x:auto}
.hir-svg{display:block;width:100%;height:auto;min-width:760px}
.hir-mono{font-family:ui-monospace,Menlo,monospace}
.hir-name{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;fill:var(--hir-text)}
.hir-server-title{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;fill:var(--hir-text)}
.hir-ink{fill:var(--hir-text)}
.hir-muted{fill:var(--hir-muted)}
.hir-acc{fill:var(--hir-acc)}

/* Nodes & Server Boundary */
.hir-node{fill:var(--hir-bg);stroke:var(--hir-border);stroke-width:1.25;transition:all .3s ease}
.hir-node-ref{stroke-dasharray:4 3}
.hir-node-on{stroke:var(--hir-acc);stroke-width:1.75;filter:drop-shadow(0 2px 6px rgba(15,118,110,.12))}
.hir-ref-pill{fill:var(--hir-soft-bg);stroke:var(--hir-border);stroke-width:1;stroke-dasharray:3 2}
.hir-server-boundary{fill:var(--hir-surf);stroke:var(--hir-border);stroke-width:1.5;transition:stroke .3s}
.hir-server-boundary-on{stroke:var(--hir-acc);stroke-width:2}
.hir-sg-badge{fill:var(--hir-acc-soft);stroke:var(--hir-acc);stroke-width:1}
.hir-block{fill:var(--hir-bg);stroke:var(--hir-border);stroke-width:1}
.hir-chip{fill:var(--hir-soft-bg);stroke:var(--hir-border);stroke-width:1}
.hir-dot{fill:var(--hir-ok)}
.hir-tile{fill:var(--hir-surf);stroke:var(--hir-border);stroke-width:1}
.hir-tile-img{fill:var(--hir-bg)}

/* Connector Lines & Labels */
.hir-line{fill:none;stroke:var(--hir-line-inactive);stroke-width:1.75;stroke-dasharray:4 3;transition:stroke .3s,stroke-width .3s}
.hir-line-step{stroke:var(--hir-line-inactive);stroke-width:2;stroke-dasharray:none}
.hir-line-active{stroke:var(--hir-acc);stroke-width:3;stroke-dasharray:none;opacity:1}
.hir-arrow{fill:var(--hir-line-inactive);transition:fill .3s}
.hir-arrow-active{fill:var(--hir-acc)}
.hir-label-active{fill:var(--hir-acc)}

/* Animation */
.hir-dim{opacity:.38;transition:opacity .35s ease}
.hir-off{opacity:.35}
.hir-packet-glow{fill:var(--hir-acc)}
.hir-packet-dot{fill:var(--hir-acc);stroke:#FFFFFF;stroke-width:1.5}
.hir-in{animation:hir-in .45s both}
@keyframes hir-in{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}

/* Mobile layout */
.hir-mobile-wrap{margin-top:10px}
.hir-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:12px}
.hir-li{border:1px solid var(--hir-border);border-radius:12px;padding:12px 14px;background:var(--hir-surf);position:relative}
.hir-li-on{border-color:var(--hir-acc);box-shadow:0 0 0 1px var(--hir-acc)}
.hir-li-head{display:flex;align-items:center;gap:8px;margin-bottom:6px;font-size:13px;color:var(--hir-text)}
.hir-li-n{width:20px;height:20px;border-radius:50%;display:grid;place-items:center;background:var(--hir-acc-soft);color:var(--hir-acc);font:700 11px ui-monospace,monospace}
.hir-chips{display:flex;flex-wrap:wrap;gap:6px}
.hir-chip-html{display:inline-flex;align-items:center;gap:6px;background:var(--hir-bg);border:1px solid var(--hir-border);padding:4px 8px;border-radius:7px;font-size:11px;color:var(--hir-text)}
.hir-chip-html em{font-style:normal;font-weight:700;font-size:10px;font-family:ui-monospace,monospace;color:var(--hir-muted)}
.hir-chip-ref{border-style:dashed}
.hir-mobile-server{margin-top:8px;padding:10px;border-radius:9px;background:var(--hir-soft-bg);border:1px solid var(--hir-border)}
.hir-mobile-server-head{display:flex;align-items:center;gap:6px;margin-bottom:8px;font-size:11.5px;color:var(--hir-text)}

@media (max-width:760px){
  .hir{padding:16px 14px 10px}
  .hir-head{gap:12px}
  .hir-steps{grid-template-columns:repeat(4,1fr);gap:6px}
  .hir-seg-label{display:none}
  .hir-legend{order:3;width:100%}
  .hir-svg-container{display:none}
}
@media (min-width:761px){
  .hir-mobile-wrap{display:none}
}
@media (prefers-reduced-motion:reduce){
  .hir-dim{opacity:1}
  .hir-off{opacity:1}
  .hir-line{stroke-dasharray:none}
  .hir-packet{display:none}
}
`;
