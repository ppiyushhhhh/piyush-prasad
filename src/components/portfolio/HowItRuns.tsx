import { useCallback, useEffect, useRef, useState } from "react";
import { TECH_LOGO_REGISTRY } from "@/lib/tech-logo-registry";

/**
 * "How it runs": Two-panel interactive reference architecture workflow.
 *
 * Panel 1: Build & Deploy
 * 1. Developer pushes code to GitHub repository
 * 2. Push/PR triggers GitHub Actions CI/CD pipeline
 * 3. GitHub Actions executes Trivy security & vulnerability scanning
 * 4. Pipeline triggers Terraform to provision AWS VPC, subnets, and security groups
 * 5. Terraform attaches AWS IAM instance profile to the EC2 host
 * 6. Pipeline triggers Ansible configuration playbook
 * 7. Terraform provisions VPC & Security Group firewall (ports 443 & 22)
 * 8. Ansible configures ubuntu-app-01 via SSH (port 22) and deploys Docker Compose
 *
 * Panel 2: Runtime & Reporting
 * 1. Users reach the application over HTTPS via Security Group port 443 into Nginx
 * 2. Nginx reverse proxies traffic to App (React + Node.js API) and Database (MongoDB/SQLite)
 * 3. Node Exporter captures host kernel & system telemetry on ubuntu-app-01
 * 4. Prometheus scrapes Node Exporter metrics (:9100) and displays visual dashboards in Grafana (:3001)
 * 5. EC2 host streams performance logs and system metrics to Amazon CloudWatch
 * 6. Scheduled host cron job encrypts and archives daily PDF security reports in Amazon S3
 * 7. Automated PDF reports and workflow failure alerts dispatched to hello@piyushprasad.in
 */

export const HOW_IT_RUNS_TIMING = {
  edgeMs: 2200, // Calm, steady traversal along each active connector
  pauseMs: 1500, // Graceful pause at the destination before advancing
  resumeAfterClickMs: 8000, // Pause auto-advance after manual interaction
} as const;

const NARROW_PX = 760;

// ---------------------------------------------------------------------------
// Type Definitions
// ---------------------------------------------------------------------------
export type PanelId = "build" | "runtime";

type ServiceNode = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  name: string;
  sub: string;
  logo?: string;
  fb: string;
  stepIndex: number;
  ref?: boolean;
  tip: string;
};

type WorkflowEdge = {
  n: number;
  stepIndex: number;
  d: string;
  len: number;
  bx: number;
  by: number;
  tip: string;
  label?: { x: number; y: number; t: string };
};

// ---------------------------------------------------------------------------
// PANEL 1 DATA: Build & Deploy
// ---------------------------------------------------------------------------
const PANEL_1_NODES: ServiceNode[] = [
  // Top Row: Source & Security Scanning
  { id: "dev", x: 30, y: 30, w: 200, h: 56, name: "Developer", sub: "git push feature/infra", fb: "DEV", stepIndex: 0, tip: "Pushes verified code and configuration to GitHub" },
  { id: "gh", x: 290, y: 30, w: 200, h: 56, name: "GitHub", sub: "repository · PR branch", logo: "github", fb: "GH", stepIndex: 0, tip: "Source repository and pull request automation" },
  { id: "ci", x: 550, y: 30, w: 200, h: 56, name: "GitHub Actions", sub: "CI/CD workflow runner", logo: "githubactions", fb: "CI", stepIndex: 1, tip: "Executes automated test, scan, and deploy pipeline" },
  { id: "trivy", x: 800, y: 30, w: 170, h: 56, name: "Trivy", sub: "security & CVE scan", logo: "trivy", fb: "TR", stepIndex: 1, tip: "Scans repository dependencies and container images for vulnerabilities" },

  // Middle Row: IaC & Provisioning Automation
  { id: "ans", x: 180, y: 160, w: 200, h: 56, name: "Ansible", sub: "SSH deploy · playbook", logo: "ansible", fb: "AN", stepIndex: 3, tip: "Executes server configuration and Docker Compose deployment via SSH" },
  { id: "tf", x: 460, y: 160, w: 200, h: 56, name: "Terraform", sub: "IaC · AWS provisioner", logo: "terraform", fb: "TF", stepIndex: 2, ref: true, tip: "Provisions isolated VPC, subnets, and security groups (Reference only)" },
  { id: "iam", x: 740, y: 160, w: 200, h: 56, name: "AWS IAM", sub: "EC2 instance role", logo: "aws-iam", fb: "IAM", stepIndex: 2, ref: true, tip: "Attaches IAM instance profile and access policies to the EC2 host (Reference only)" },
];

const PANEL_1_EDGES: WorkflowEdge[] = [
  { n: 1, stepIndex: 0, d: "M 230 58 H 290", len: 60, bx: 260, by: 58, tip: "Developer pushes code to GitHub" },
  { n: 2, stepIndex: 0, d: "M 490 58 H 550", len: 60, bx: 520, by: 58, tip: "Push or pull request triggers GitHub Actions pipeline" },
  { n: 3, stepIndex: 1, d: "M 750 58 H 800", len: 50, bx: 775, by: 58, tip: "GitHub Actions executes Trivy security scan", label: { x: 775, y: 44, t: "security scan" } },
  { n: 4, stepIndex: 2, d: "M 650 86 V 123 H 560 V 160", len: 164, bx: 605, by: 123, tip: "Pipeline triggers Terraform plan and apply", label: { x: 605, y: 112, t: "plan · apply" } },
  { n: 5, stepIndex: 2, d: "M 660 188 H 740", len: 80, bx: 700, by: 188, tip: "Terraform assigns AWS IAM instance role", label: { x: 700, y: 176, t: "instance role" } },
  { n: 6, stepIndex: 3, d: "M 590 86 V 123 H 280 V 160", len: 384, bx: 435, by: 123, tip: "Pipeline executes Ansible deployment playbook", label: { x: 435, y: 112, t: "trigger deploy" } },
  { n: 7, stepIndex: 2, d: "M 560 216 V 280", len: 64, bx: 560, by: 248, tip: "Terraform provisions AWS VPC and Security Group firewall", label: { x: 595, y: 252, t: "provision VPC & SG" } },
  { n: 8, stepIndex: 3, d: "M 280 216 V 280", len: 64, bx: 280, by: 248, tip: "Ansible deploys containers to ubuntu-app-01 via SSH port 22", label: { x: 315, y: 252, t: "SSH port 22" } },
];

function getPanel1Point(edge: WorkflowEdge, frac: number): { x: number; y: number } {
  const f = Math.max(0, Math.min(1, frac));
  switch (edge.n) {
    case 1:
      return { x: 230 + f * 60, y: 58 };
    case 2:
      return { x: 490 + f * 60, y: 58 };
    case 3:
      return { x: 750 + f * 50, y: 58 };
    case 4: {
      const dist = f * 164;
      if (dist <= 37) return { x: 650, y: 86 + dist };
      if (dist <= 127) return { x: 650 - (dist - 37), y: 123 };
      return { x: 560, y: 123 + (dist - 127) };
    }
    case 5:
      return { x: 660 + f * 80, y: 188 };
    case 6: {
      const dist = f * 384;
      if (dist <= 37) return { x: 590, y: 86 + dist };
      if (dist <= 347) return { x: 590 - (dist - 37), y: 123 };
      return { x: 280, y: 123 + (dist - 347) };
    }
    case 7:
      return { x: 560, y: 216 + f * 64 };
    case 8:
      return { x: 280, y: 216 + f * 64 };
    default:
      return { x: edge.bx, y: edge.by };
  }
}

// ---------------------------------------------------------------------------
// PANEL 2 DATA: Runtime & Reporting
// ---------------------------------------------------------------------------
const PANEL_2_NODES: ServiceNode[] = [
  // Top External: Users
  { id: "users", x: 40, y: 26, w: 220, h: 56, name: "Users", sub: "browser · HTTPS 443", fb: "WEB", stepIndex: 0, tip: "Visitors reach the application securely over HTTPS via Security Group port 443" },

  // Bottom External: CloudWatch, S3, Email
  { id: "cw", x: 70, y: 416, w: 240, h: 56, name: "Amazon CloudWatch", sub: "host logs & telemetry", logo: "aws-cloudwatch", fb: "CW", stepIndex: 2, ref: true, tip: "Amazon CloudWatch captures EC2 system metrics and host telemetry (Reference only)" },
  { id: "s3", x: 390, y: 416, w: 220, h: 56, name: "Amazon S3", sub: "encrypted PDF archive", logo: "aws-s3", fb: "S3", stepIndex: 3, ref: true, tip: "Amazon S3 archives encrypted daily compliance and audit PDF reports (Reference only)" },
  { id: "mail", x: 690, y: 416, w: 270, h: 56, name: "Email Alerts", sub: "hello@piyushprasad.in", logo: "mail", fb: "@", stepIndex: 3, tip: "Automated PDF reports and workflow alerts dispatched to hello@piyushprasad.in" },
];

const PANEL_2_EDGES: WorkflowEdge[] = [
  { n: 1, stepIndex: 0, d: "M 150 82 V 160", len: 78, bx: 150, by: 121, tip: "Users connect over HTTPS via Security Group port 443 into Nginx", label: { x: 185, y: 125, t: "HTTPS 443" } },
  { n: 2, stepIndex: 0, d: "M 240 187 H 280 M 460 187 H 500", len: 80, bx: 260, by: 187, tip: "Nginx proxies traffic to App and Database", label: { x: 260, y: 174, t: "internal proxy" } },
  { n: 3, stepIndex: 1, d: "M 240 267 H 280", len: 40, bx: 260, by: 267, tip: "Prometheus scrapes host telemetry from Node Exporter :9100", label: { x: 260, y: 254, t: "scrape :9100" } },
  { n: 4, stepIndex: 1, d: "M 460 267 H 500", len: 40, bx: 480, by: 267, tip: "Prometheus feeds metrics into Grafana visual dashboards :3001", label: { x: 480, y: 254, t: "dashboards" } },
  { n: 5, stepIndex: 2, d: "M 190 370 V 416", len: 46, bx: 190, by: 393, tip: "EC2 host streams system logs and metrics to CloudWatch", label: { x: 230, y: 397, t: "host metrics" } },
  { n: 6, stepIndex: 3, d: "M 500 370 V 416", len: 46, bx: 500, by: 393, tip: "Host cron job encrypts and archives daily PDF reports in Amazon S3", label: { x: 540, y: 397, t: "archive PDF" } },
  { n: 7, stepIndex: 3, d: "M 825 370 V 416", len: 46, bx: 825, by: 393, tip: "Automated audit reports and alerts sent to hello@piyushprasad.in", label: { x: 865, y: 397, t: "dispatch alert" } },
];

function getPanel2Point(edge: WorkflowEdge, frac: number): { x: number; y: number } {
  const f = Math.max(0, Math.min(1, frac));
  switch (edge.n) {
    case 1:
      return { x: 150, y: 82 + f * 78 };
    case 2: {
      const dist = f * 80;
      if (dist <= 40) return { x: 240 + dist, y: 187 };
      return { x: 460 + (dist - 40), y: 187 };
    }
    case 3:
      return { x: 240 + f * 40, y: 267 };
    case 4:
      return { x: 460 + f * 40, y: 267 };
    case 5:
      return { x: 190, y: 370 + f * 46 };
    case 6:
      return { x: 500, y: 370 + f * 46 };
    case 7:
      return { x: 825, y: 370 + f * 46 };
    default:
      return { x: edge.bx, y: edge.by };
  }
}

// ---------------------------------------------------------------------------
// Step Descriptions & Explanations
// ---------------------------------------------------------------------------
const PANEL_CONFIGS = {
  build: {
    title: "Phase 1: Build & Deploy",
    subtitle: "Source commit, security scanning, AWS IaC provisioning, and Ansible deployment to ubuntu-app-01",
    steps: [
      { id: "p1-s0", title: "Code Push & CI", text: "Developer pushes code to GitHub. Push/PR triggers GitHub Actions automated workflow." },
      { id: "p1-s1", title: "Security Scanning", text: "GitHub Actions executes Trivy to scan dependencies and container images for CVE vulnerabilities." },
      { id: "p1-s2", title: "AWS Provisioning", text: "Terraform provisions isolated VPC, Subnets, and Security Groups (ports 443 & 22), and assigns the AWS IAM EC2 instance role." },
      { id: "p1-s3", title: "Ansible Deployment", text: "Ansible configures the server via SSH port 22 and boots the Docker Compose application stack on ubuntu-app-01." },
    ],
  },
  runtime: {
    title: "Phase 2: Runtime & Reporting",
    subtitle: "Production traffic, Node Exporter to Prometheus & Grafana telemetry, S3 archival, and email alerts",
    steps: [
      { id: "p2-s0", title: "HTTPS Traffic", text: "Users reach the application over HTTPS via Security Group port 443 into Nginx, proxying to App and Database." },
      { id: "p2-s1", title: "Metrics & Dashboards", text: "Node Exporter captures host telemetry; Prometheus scrapes :9100 and streams visual dashboards to Grafana :3001." },
      { id: "p2-s2", title: "CloudWatch Logs", text: "Amazon CloudWatch continuously receives host logs, CPU/memory performance, and system telemetry from EC2." },
      { id: "p2-s3", title: "Reports & Alerts", text: "Host cron jobs archive daily PDF audit reports in Amazon S3 and dispatch failure alerts to hello@piyushprasad.in." },
    ],
  },
} as const;

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

function Badge({ x, y, n, on }: { x: number; y: number; n: number; on: boolean }) {
  return (
    <g className={on ? "hir-badge hir-badge-on" : "hir-badge"}>
      <circle cx={x} cy={y} r={11} />
      <text x={x} y={y + 4} textAnchor="middle">
        {n}
      </text>
    </g>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------
export default function HowItRuns() {
  const [activePanel, setActivePanel] = useState<PanelId>("build");
  const [stepIndex, setStepIndex] = useState(0);
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
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.25 });
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

  // Active dataset depending on selected panel
  const activeEdges = activePanel === "build" ? PANEL_1_EDGES : PANEL_2_EDGES;
  const activeNodes = activePanel === "build" ? PANEL_1_NODES : PANEL_2_NODES;
  const panelConfig = PANEL_CONFIGS[activePanel];

  // Paced animation loop: traverses one connection at a time, followed by pause
  useEffect(() => {
    if (!running) {
      lastTimeRef.current = null;
      return;
    }

    let rafId: number;

    const tick = (now: number) => {
      const edgesInStep = activeEdges.filter((e) => e.stepIndex === stepIndex);
      const stepDuration = edgesInStep.length * HOW_IT_RUNS_TIMING.edgeMs + HOW_IT_RUNS_TIMING.pauseMs;

      if (lastTimeRef.current !== null) {
        const delta = Math.min(100, now - lastTimeRef.current);
        elapsedRef.current += delta;

        if (elapsedRef.current >= stepDuration) {
          elapsedRef.current = 0;
          if (stepIndex + 1 < panelConfig.steps.length) {
            setStepIndex((prev) => prev + 1);
          } else {
            // Smoothly cycle to the other panel once current panel completes
            setStepIndex(0);
            setActivePanel((prev) => (prev === "build" ? "runtime" : "build"));
          }
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
  }, [running, activePanel, stepIndex, activeEdges, panelConfig.steps.length]);

  // Clean timer cleanup
  useEffect(
    () => () => {
      if (resumeTimer.current) clearTimeout(resumeTimer.current);
    },
    [],
  );

  // Jump to specific step or panel manually
  const selectStep = useCallback((stepIdx: number) => {
    setStepIndex(stepIdx);
    elapsedRef.current = 0;
    setPlaying(false);
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => {
      lastTimeRef.current = performance.now();
      setPlaying(true);
    }, HOW_IT_RUNS_TIMING.resumeAfterClickMs);
  }, []);

  const selectPanel = useCallback((panel: PanelId) => {
    setActivePanel(panel);
    setStepIndex(0);
    elapsedRef.current = 0;
    setPlaying(false);
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => {
      lastTimeRef.current = performance.now();
      setPlaying(true);
    }, HOW_IT_RUNS_TIMING.resumeAfterClickMs);
  }, []);

  // Compute moving packet position strictly along the active connection
  const stepEdges = activeEdges.filter((e) => e.stepIndex === stepIndex);
  const count = stepEdges.length;
  const travelDuration = count * HOW_IT_RUNS_TIMING.edgeMs;

  let packetPos = { x: 0, y: 0 };
  let currentActiveEdgeNumber: number | null = null;

  if (count > 0) {
    if (elapsedRef.current < travelDuration) {
      const idx = Math.floor(elapsedRef.current / HOW_IT_RUNS_TIMING.edgeMs);
      const edge = stepEdges[idx] || stepEdges[0];
      currentActiveEdgeNumber = edge.n;
      const frac = (elapsedRef.current % HOW_IT_RUNS_TIMING.edgeMs) / HOW_IT_RUNS_TIMING.edgeMs;
      packetPos = activePanel === "build" ? getPanel1Point(edge, frac) : getPanel2Point(edge, frac);
    } else {
      // In pause period: packet rests at destination node of last connection
      const last = stepEdges[count - 1];
      currentActiveEdgeNumber = last.n;
      packetPos = activePanel === "build" ? getPanel1Point(last, 1.0) : getPanel2Point(last, 1.0);
    }
  }

  const isStepOn = (idx: number) => reduced || idx === stepIndex;
  const dimClass = (idx: number) => (isStepOn(idx) ? "" : "hir-dim");
  const animate = !reduced && visible && playing;

  const currentStepInfo = panelConfig.steps[stepIndex] || panelConfig.steps[0];

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
          <p className="hir-eyebrow">Reference architecture workflow</p>
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

        {/* Controls: Play/Pause button */}
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

      {/* Panel Switcher: Build & Deploy vs Runtime & Reporting */}
      <div className="hir-panel-switcher" role="tablist" aria-label="Workflow phase selector">
        <button
          type="button"
          role="tab"
          aria-selected={activePanel === "build"}
          className={`hir-panel-tab ${activePanel === "build" ? "hir-panel-tab-on" : ""}`}
          onClick={() => selectPanel("build")}
        >
          <span className="hir-mono text-[11px] font-bold">01</span>
          <span>Build &amp; Deploy (CI/CD · IaC · Ansible)</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activePanel === "runtime"}
          className={`hir-panel-tab ${activePanel === "runtime" ? "hir-panel-tab-on" : ""}`}
          onClick={() => selectPanel("runtime")}
        >
          <span className="hir-mono text-[11px] font-bold">02</span>
          <span>Runtime &amp; Reporting (Traffic · Telemetry · Alerts)</span>
        </button>
      </div>

      {/* Step Tabs within Active Panel */}
      <div className="hir-steps" role="tablist" aria-label={`${panelConfig.title} steps`}>
        {panelConfig.steps.map((st, i) => (
          <button
            key={st.id}
            type="button"
            role="tab"
            aria-selected={i === stepIndex}
            className={`hir-seg ${i < stepIndex ? "hir-seg-done" : ""} ${i === stepIndex ? "hir-seg-on" : ""}`}
            onClick={() => selectStep(i)}
          >
            <span className="hir-seg-label">
              <b>{String(i + 1).padStart(2, "0")}</b> {st.title}
            </span>
          </button>
        ))}
      </div>

      {/* Explanatory Caption */}
      <p className="hir-caption" aria-live="polite">
        {currentStepInfo.text}
      </p>

      {/* Mobile Layout */}
      {narrow ? (
        <div className="hir-mobile-wrap">
          <ol className="hir-list">
            {panelConfig.steps.map((st, i) => (
              <li key={st.id} className={`hir-li ${i === stepIndex ? "hir-li-on" : ""}`}>
                <div className="hir-li-head">
                  <span className="hir-li-n">{i + 1}</span>
                  <strong>{st.title}</strong>
                </div>
                <p className="text-xs text-text-muted mb-3 leading-relaxed">{st.text}</p>

                {activePanel === "build" ? (
                  i === 0 ? (
                    <div className="hir-chips">
                      <span className="hir-chip-html">
                        <em>DEV</em> Developer (git push)
                      </span>
                      <span className="hir-chip-html">
                        <img src={logo("github")} alt="" width={15} height={15} /> GitHub Repo
                      </span>
                    </div>
                  ) : i === 1 ? (
                    <div className="hir-chips">
                      <span className="hir-chip-html">
                        <img src={logo("githubactions")} alt="" width={15} height={15} /> GitHub Actions
                      </span>
                      <span className="hir-chip-html">
                        <img src={logo("trivy")} alt="" width={15} height={15} /> Trivy CVE Scan
                      </span>
                    </div>
                  ) : i === 2 ? (
                    <div className="hir-chips">
                      <span className="hir-chip-html hir-chip-ref">
                        <img src={logo("terraform")} alt="" width={15} height={15} /> Terraform IaC
                      </span>
                      <span className="hir-chip-html hir-chip-ref">
                        <img src={logo("aws-iam")} alt="" width={15} height={15} /> AWS IAM Role
                      </span>
                      <span className="hir-chip-html hir-chip-ref">
                        <img src={logo("aws-vpc")} alt="" width={15} height={15} /> VPC &amp; SG
                      </span>
                    </div>
                  ) : (
                    <div className="hir-mobile-server">
                      <div className="hir-mobile-server-head">
                        <img src={logo("ubuntu")} alt="" width={15} height={15} />
                        <span>Server: <strong>ubuntu-app-01</strong> (Ubuntu Linux)</span>
                      </div>
                      <div className="hir-chips">
                        <span className="hir-chip-html">
                          <img src={logo("ansible")} alt="" width={15} height={15} /> Ansible (SSH :22)
                        </span>
                        <span className="hir-chip-html">
                          <img src={logo("docker")} alt="" width={15} height={15} /> Docker Compose
                        </span>
                      </div>
                    </div>
                  )
                ) : (
                  i === 0 ? (
                    <div className="hir-chips">
                      <span className="hir-chip-html">
                        <em>WEB</em> Users (HTTPS port 443)
                      </span>
                      <span className="hir-chip-html">
                        <img src={logo("nginx")} alt="" width={15} height={15} /> Nginx Reverse Proxy
                      </span>
                      <span className="hir-chip-html">
                        <img src={logo("nodejs")} alt="" width={15} height={15} /> App (React + Node)
                      </span>
                      <span className="hir-chip-html">
                        <img src={logo("mongodb")} alt="" width={15} height={15} /> Database
                      </span>
                    </div>
                  ) : i === 1 ? (
                    <div className="hir-mobile-server">
                      <div className="hir-mobile-server-head">
                        <img src={logo("ubuntu")} alt="" width={15} height={15} />
                        <span>Telemetry: Node Exporter → Prometheus → Grafana</span>
                      </div>
                      <div className="hir-chips">
                        <span className="hir-chip-html">
                          <img src={logo("linux")} alt="" width={15} height={15} /> Node Exporter (:9100)
                        </span>
                        <span className="hir-chip-html">
                          <img src={logo("prometheus")} alt="" width={15} height={15} /> Prometheus (:9090)
                        </span>
                        <span className="hir-chip-html">
                          <img src={logo("grafana")} alt="" width={15} height={15} /> Grafana Dashboards
                        </span>
                      </div>
                    </div>
                  ) : i === 2 ? (
                    <div className="hir-chips">
                      <span className="hir-chip-html hir-chip-ref">
                        <img src={logo("aws-cloudwatch")} alt="" width={15} height={15} /> Amazon CloudWatch
                      </span>
                      <span className="hir-chip-html">
                        <em>HOST</em> EC2 Host System Logs
                      </span>
                    </div>
                  ) : (
                    <div className="hir-chips">
                      <span className="hir-chip-html hir-chip-ref">
                        <img src={logo("aws-s3")} alt="" width={15} height={15} /> Amazon S3 (PDFs)
                      </span>
                      <span className="hir-chip-html">
                        <img src={logo("mail")} alt="" width={15} height={15} /> hello@piyushprasad.in
                      </span>
                    </div>
                  )
                )}
              </li>
            ))}
          </ol>
        </div>
      ) : (
        /* Desktop SVG Architecture Canvas: Spacious 1000 x 520 viewBox */
        <svg
          className="hir-svg"
          viewBox="0 0 1000 520"
          role="img"
          aria-label={`${panelConfig.title} diagram`}
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
          {/* PANEL 1: Build & Deploy Content                               */}
          {/* ============================================================= */}
          {activePanel === "build" && (
            <g>
              {/* Target Server Container: ubuntu-app-01 */}
              <g className={dimClass(3)}>
                <rect
                  x="40"
                  y="280"
                  width="920"
                  height="210"
                  rx="12"
                  className={`hir-server-boundary ${isStepOn(3) ? "hir-server-boundary-on" : ""}`}
                />

                {/* Server Header */}
                <Tile x={56} y={292} size={28} href={logo("ubuntu")} fb="UB" />
                <text x="92" y="308" className="hir-server-title" fontSize={13} fontWeight={700}>
                  AWS EC2 Server: ubuntu-app-01
                </text>
                <text x="92" y="324" className="hir-mono hir-muted" fontSize={9.5}>
                  Ubuntu Linux 22.04 LTS · Private Subnet (10.0.1.50) · ap-south-1
                </text>

                {/* Security Group Firewall Status */}
                <rect x="460" y="294" width="310" height="24" rx="6" className="hir-sg-badge" />
                <text x="472" y="310" className="hir-mono hir-acc" fontSize={9.5} fontWeight={600}>
                  Security Group: Ingress 22 (SSH) · Ingress 443 (HTTPS)
                </text>

                {/* Reference Pill */}
                <rect x="860" y="294" width="84" height="24" rx="5" className="hir-ref-pill" />
                <text x="902" y="310" textAnchor="middle" className="hir-mono hir-muted" fontSize={8.5} fontWeight={600}>
                  Reference only
                </text>

                {/* Inner Deployed Docker Compose Stack Card */}
                <rect x="56" y="340" width="888" height="132" rx="10" className="hir-block" />
                <image href={logo("docker")} x="70" y="352" width="18" height="18" preserveAspectRatio="xMidYMid meet" />
                <text x="94" y="366" className="hir-name" fontSize={12} fontWeight={700}>
                  Docker Compose Application Stack
                </text>
                <text x="928" y="366" textAnchor="end" className="hir-mono hir-ok" fontSize={9.5} fontWeight={600}>
                  ● Deployed via Ansible Playbook
                </text>

                {/* 6 Booted Container Chips */}
                {[
                  { x: 70, name: "Nginx", sub: "reverse proxy · TLS", logo: "nginx", fb: "NG" },
                  { x: 215, name: "App", sub: "React + Node API", logo: "nodejs", fb: "APP" },
                  { x: 360, name: "Database", sub: "MongoDB / SQLite", logo: "mongodb", fb: "DB" },
                  { x: 505, name: "Node Exporter", sub: "host telemetry", logo: "linux", fb: "NODE" },
                  { x: 650, name: "Prometheus", sub: "metrics collector", logo: "prometheus", fb: "PROM" },
                  { x: 795, name: "Grafana", sub: "dashboards UI", logo: "grafana", fb: "GRAF" },
                ].map((c) => (
                  <g key={c.name} className={isStepOn(3) ? "hir-in" : "hir-off"}>
                    <rect x={c.x} y={384} width={135} height={70} rx={8} className="hir-chip" />
                    <circle cx={c.x + 123} cy={396} r={2.5} className="hir-dot" />
                    <Tile x={c.x + 8} y={394} size={26} href={logo(c.logo)} fb={c.fb} />
                    <text x={c.x + 40} y={410} className="hir-name" fontSize={11} fontWeight={600}>
                      {c.name}
                    </text>
                    <text x={c.x + 40} y={426} className="hir-mono hir-muted" fontSize={7.5}>
                      {c.sub}
                    </text>
                  </g>
                ))}
              </g>
            </g>
          )}

          {/* ============================================================= */}
          {/* PANEL 2: Runtime & Reporting Content                          */}
          {/* ============================================================= */}
          {activePanel === "runtime" && (
            <g>
              {/* Security Group Firewall Header Badge beside Users */}
              <rect x="290" y="38" width="360" height="28" rx="6" className="hir-sg-badge" />
              <text x="304" y="56" className="hir-mono hir-acc" fontSize={9.5} fontWeight={600}>
                Security Group Firewall: Ingress 443 (HTTPS) active
              </text>

              {/* Central Server Boundary: ubuntu-app-01 */}
              <g className={dimClass(0)}>
                <rect
                  x="40"
                  y="110"
                  width="920"
                  height="260"
                  rx="12"
                  className={`hir-server-boundary ${isStepOn(0) || isStepOn(1) ? "hir-server-boundary-on" : ""}`}
                />

                {/* Server Header */}
                <Tile x={56} y={122} size={28} href={logo("ubuntu")} fb="UB" />
                <text x="92" y="138" className="hir-server-title" fontSize={13} fontWeight={700}>
                  AWS EC2 Server: ubuntu-app-01 (Ubuntu Linux 22.04 LTS)
                </text>
                <text x="92" y="152" className="hir-mono hir-muted" fontSize={9.5}>
                  Production Runtime Host · Private Subnet (10.0.1.50) · Docker Compose
                </text>

                {/* Sub-container: Core App Containers */}
                {[
                  { x: 60, name: "Nginx", sub: "reverse proxy · TLS :443", logo: "nginx", fb: "NG" },
                  { x: 280, name: "App", sub: "React + Node.js API", logo: "nodejs", fb: "APP" },
                  { x: 500, name: "Database", sub: "MongoDB / SQLite", logo: "mongodb", fb: "DB" },
                ].map((c) => (
                  <g key={c.name} className={isStepOn(0) ? "hir-in" : "hir-off"}>
                    <rect x={c.x} y={160} width={180} height={54} rx={8} className="hir-chip" />
                    <circle cx={c.x + 168} cy={172} r={2.5} className="hir-dot" />
                    <Tile x={c.x + 8} y={170} size={26} href={logo(c.logo)} fb={c.fb} />
                    <text x={c.x + 42} y={185} className="hir-name" fontSize={12} fontWeight={600}>
                      {c.name}
                    </text>
                    <text x={c.x + 42} y={201} className="hir-mono hir-muted" fontSize={8}>
                      {c.sub}
                    </text>
                  </g>
                ))}

                {/* Sub-container: Observability Pipeline (Node Exporter -> Prometheus -> Grafana) */}
                <g className={isStepOn(1) ? "hir-in" : "hir-off"}>
                  {/* Node Exporter */}
                  <rect x="60" y="240" width="180" height="54" rx={8} className="hir-chip" />
                  <circle cx={228} cy={252} r={2.5} className="hir-dot" />
                  <Tile x={68} y={250} size={26} href={logo("linux")} fb="NODE" />
                  <text x={102} y={265} className="hir-name" fontSize={12} fontWeight={600}>
                    Node Exporter
                  </text>
                  <text x={102} y={281} className="hir-mono hir-muted" fontSize={8}>
                    system kernel metrics :9100
                  </text>

                  {/* Prometheus */}
                  <rect x="280" y="240" width="180" height="54" rx={8} className="hir-chip" />
                  <circle cx={448} cy={252} r={2.5} className="hir-dot" />
                  <Tile x={288} y={250} size={26} href={logo("prometheus")} fb="PROM" />
                  <text x={322} y={265} className="hir-name" fontSize={12} fontWeight={600}>
                    Prometheus
                  </text>
                  <text x={322} y={281} className="hir-mono hir-muted" fontSize={8}>
                    metrics collector :9090
                  </text>

                  {/* Grafana */}
                  <rect x="500" y="240" width="180" height="54" rx={8} className="hir-chip" />
                  <circle cx={668} cy={252} r={2.5} className="hir-dot" />
                  <Tile x={508} y={250} size={26} href={logo("grafana")} fb="GRAF" />
                  <text x={542} y={265} className="hir-name" fontSize={12} fontWeight={600}>
                    Grafana
                  </text>
                  <text x={542} y={281} className="hir-mono hir-muted" fontSize={8}>
                    dashboards UI :3001
                  </text>
                </g>

                {/* Sub-container: Host Cron Tasks Block */}
                <rect x="710" y="160" width="234" height="194" rx="10" className="hir-block" />
                <text x="724" y="180" className="hir-name" fontSize={11.5} fontWeight={700}>
                  Host Cron Automation
                </text>
                <text x="930" y="180" textAnchor="end" className="hir-mono hir-muted" fontSize={8.5}>
                  Isolated crontab
                </text>

                {[
                  { y: 194, t: "Trivy posture audit", logo: "trivy", fb: "TR" },
                  { y: 242, t: "PDF archive to S3", logo: "pdf", fb: "PDF" },
                  { y: 290, t: "Alerts to primary mail", logo: "mail", fb: "@" },
                ].map((r) => (
                  <g key={r.t} className={isStepOn(3) ? "hir-in" : "hir-off"}>
                    <rect x={722} y={r.y} width={210} height={38} rx={7} className="hir-chip" />
                    <Tile x={728} y={r.y + 6} size={26} href={logo(r.logo)} fb={r.fb} />
                    <text x={762} y={r.y + 23} className="hir-mono hir-ink" fontSize={9}>
                      {r.t}
                    </text>
                  </g>
                ))}
              </g>
            </g>
          )}

          {/* ============================================================= */}
          {/* Connector Lines & Arrows                                      */}
          {/* ============================================================= */}
          {activeEdges.map((e) => {
            const isStepActive = isStepOn(e.stepIndex);
            const isEdgeBeingTraversed = currentActiveEdgeNumber === e.n && isStepActive;

            return (
              <g key={e.n} className={dimClass(e.stepIndex)}>
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

          {/* External Nodes */}
          {activeNodes.map((n) => (
            <g key={n.id} className={dimClass(n.stepIndex)}>
              <rect
                x={n.x}
                y={n.y}
                width={n.w}
                height={n.h}
                rx={10}
                className={`hir-node ${n.ref ? "hir-node-ref" : ""} ${isStepOn(n.stepIndex) && !reduced ? "hir-node-on" : ""}`}
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
                    x={n.x + n.w - 74}
                    y={n.y + 8}
                    width={66}
                    height={16}
                    rx={3}
                    className="hir-ref-pill"
                  />
                  <text
                    x={n.x + n.w - 41}
                    y={n.y + 19}
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

          {/* Numbered Badges along paths */}
          {activeEdges.map((e) => (
            <Badge key={e.n} x={e.bx} y={e.by} n={e.n} on={isStepOn(e.stepIndex)} />
          ))}

          {/* Sequential Animated Packet Dot */}
          {animate && (
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
  background:var(--hir-bg); border:1px solid var(--hir-border); border-radius:14px; padding:20px 20px 14px;
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
.hir-btn:focus-visible,.hir-seg:focus-visible,.hir-panel-tab:focus-visible{outline:2px solid var(--hir-acc);outline-offset:2px}

/* Panel Switcher */
.hir-panel-switcher{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:16px 0 12px;background:var(--hir-soft-bg);padding:4px;border-radius:10px;border:1px solid var(--hir-border)}
.hir-panel-tab{border:0;background:none;padding:8px 12px;border-radius:8px;font:600 12px/1.3 system-ui,sans-serif;color:var(--hir-muted);cursor:pointer;transition:all .2s ease;display:flex;align-items:center;justify-content:center;gap:8px}
.hir-panel-tab:hover{color:var(--hir-text)}
.hir-panel-tab-on{background:var(--hir-bg);color:var(--hir-acc);box-shadow:0 1px 3px rgba(0,0,0,.06)}

/* Steps bar */
.hir-steps{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:10px 0 10px}
.hir-seg{border:0;padding:0;background:none;cursor:pointer;text-align:left;color:var(--hir-muted)}
.hir-seg::before{content:"";display:block;height:4px;border-radius:2px;background:var(--hir-border);margin-bottom:6px}
.hir-seg-done::before{background:var(--hir-acc);opacity:.45}
.hir-seg-on::before{background:var(--hir-acc)}
.hir-seg-label{font:500 11.5px system-ui,sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:block}
.hir-seg-label b{font:600 10px ui-monospace,Menlo,monospace;color:var(--hir-acc);margin-right:4px}
.hir-seg-on .hir-seg-label{color:var(--hir-text);font-weight:600}
.hir-caption{margin:0 0 10px;min-height:22px;font-size:12.5px;line-height:1.5;color:var(--hir-muted)}
.hir-svg{display:block;width:100%;height:auto;max-height:calc(100dvh - var(--hir-chrome,230px))}
.hir-mono{font-family:ui-monospace,Menlo,monospace}
.hir-name{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;fill:var(--hir-text)}
.hir-server-title{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;fill:var(--hir-text)}
.hir-muted{fill:var(--hir-muted)}
.hir-ink{fill:var(--hir-text)}
.hir-acc{fill:var(--hir-acc)}
.hir-label-active{fill:var(--hir-acc)}
.hir-node{fill:var(--hir-surf);stroke:var(--hir-border);transition:stroke .3s}
.hir-node-on{stroke:var(--hir-acc)}
.hir-node-ref{stroke-dasharray:5 4;stroke:var(--hir-muted)}
.hir-tile{fill:var(--hir-bg);stroke:var(--hir-border)}
.hir-tile-img{fill:#FFFFFF}
.hir-server-boundary{fill:var(--hir-soft-bg);stroke:var(--hir-border);transition:fill .4s,stroke .4s}
.hir-server-boundary-on{fill:var(--hir-acc-soft);stroke:var(--hir-acc);stroke-width:1.5}
.hir-sg-badge{fill:var(--hir-bg);stroke:var(--hir-border);stroke-dasharray:3 2}
.hir-ref-pill{fill:var(--hir-bg);stroke:var(--hir-border);stroke-dasharray:2 2}
.hir-block{fill:var(--hir-bg);stroke:var(--hir-border);stroke-dasharray:3 3}
.hir-chip{fill:var(--hir-surf);stroke:var(--hir-acc)}
.hir-dot{fill:var(--hir-ok)}

/* High-contrast connector lines */
.hir-line{fill:none;stroke:var(--hir-line-inactive);stroke-width:2;stroke-dasharray:6 4;opacity:.7;transition:stroke .3s,stroke-width .3s,opacity .3s}
.hir-line-step{stroke:var(--hir-acc);stroke-width:2.25;opacity:.9}
.hir-line-active{stroke:var(--hir-acc);stroke-width:3;stroke-dasharray:none;opacity:1}
.hir-arrow{fill:var(--hir-line-inactive);transition:fill .3s}
.hir-arrow-active{fill:var(--hir-acc)}

/* Badges */
.hir-badge circle{fill:var(--hir-bg);stroke:var(--hir-line-inactive);stroke-width:1.75;transition:fill .3s,stroke .3s}
.hir-badge text{font:700 11px system-ui,sans-serif;fill:var(--hir-text);transition:fill .3s}
.hir-badge-on circle{fill:var(--hir-acc);stroke:var(--hir-acc);stroke-width:2}
.hir-badge-on text{fill:var(--hir-on)}

.hir-dim{opacity:.65}
.hir g{transition:opacity .35s}
.hir-packet-glow{fill:var(--hir-acc)}
.hir-packet-dot{fill:var(--hir-acc);stroke:#FFFFFF;stroke-width:1.5}
.hir-off{opacity:.3}
.hir-in{animation:hir-in .45s both}
@keyframes hir-in{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}

/* Mobile list */
.hir-mobile-wrap{margin-top:10px}
.hir-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:12px}
.hir-li{border:1px solid var(--hir-border);border-radius:12px;padding:12px 14px;background:var(--hir-surf);position:relative}
.hir-li:not(:last-child)::after{content:"↓";position:absolute;left:50%;bottom:-17px;transform:translateX(-50%);font:700 13px ui-monospace,monospace;color:var(--hir-acc);background:var(--hir-bg);line-height:1;padding:1px 4px;z-index:1}
.hir-li-on{border-color:var(--hir-acc);background:var(--hir-acc-soft)}
.hir-li-head{display:flex;align-items:center;gap:10px;margin-bottom:8px;font-size:13px}
.hir-li-n{width:22px;height:22px;border-radius:50%;display:grid;place-items:center;font:700 11px system-ui;border:1.5px solid var(--hir-acc);color:var(--hir-acc);background:var(--hir-bg)}
.hir-li-on .hir-li-n{background:var(--hir-acc);color:var(--hir-on)}
.hir-chips{display:flex;flex-wrap:wrap;gap:8px}
.hir-chip-html{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--hir-border);background:var(--hir-bg);border-radius:8px;padding:5px 9px;font:500 12px system-ui,sans-serif}
.hir-chip-html em{font:700 9px ui-monospace,monospace;font-style:normal;color:var(--hir-muted)}
.hir-chip-ref{border-style:dashed}
.hir-mobile-server{border:1px dashed var(--hir-acc);background:var(--hir-bg);border-radius:8px;padding:8px 10px;margin-top:6px}
.hir-mobile-server-head{display:flex;align-items:center;gap:6px;font-size:11px;color:var(--hir-acc);margin-bottom:8px;font-family:ui-monospace,Menlo,monospace}

@media (max-width:760px){
  .hir{padding:16px 14px 10px}
  .hir-head{gap:12px}
  .hir-panel-switcher{grid-template-columns:1fr;gap:6px}
  .hir-panel-tab{font-size:11px;padding:7px 10px}
  .hir-steps{grid-template-columns:repeat(4,1fr);gap:6px}
  .hir-seg-label{display:none}
  .hir-legend{order:3;width:100%}
  .hir-controls{order:2}
}
@media (prefers-reduced-motion:reduce){
  .hir *{animation:none!important;transition:none!important}
  .hir-off{opacity:1}
  .hir-packet{display:none}
}
`;
