import { useCallback, useEffect, useRef, useState } from "react";
import { TECH_LOGO_REGISTRY } from "@/lib/tech-logo-registry";

/**
 * "How it runs": Full-height single-page architecture diagram.
 *
 * Sequence:
 * 1. Push & Security Scan:
 *    Developer pushes code to GitHub repository → triggers GitHub Actions pipeline →
 *    GitHub Actions runs Trivy security scanning for CVE vulnerabilities in source and container images.
 * 2. AWS Provisioning:
 *    Terraform provisions the AWS environment: isolated VPC, subnets, Security Groups
 *    (firewall: Ingress 443 HTTPS, Ingress 22 SSH), and assigns the AWS IAM EC2 instance role.
 * 3. Application Deployment:
 *    Ansible configures the host via SSH (port 22) and deploys the Docker Compose stack to
 *    the Ubuntu Linux EC2 server named ubuntu-app-01: Nginx, App, Database, Node Exporter, Prometheus, Grafana.
 * 4. Traffic, Monitoring & Alerts:
 *    Users connect over HTTPS (port 443) via Security Group into Nginx reverse proxy.
 *    Node Exporter streams system metrics to Prometheus, which feeds Grafana visual dashboards.
 *    Amazon CloudWatch receives host performance logs and metrics.
 *    Host cron tasks archive daily PDF reports in Amazon S3 and dispatch email alerts to hello@piyushprasad.in.
 */

export const HOW_IT_RUNS_TIMING = {
  edgeDurationMs: 1900, // Calm, steady pace along each active connector
  stepPauseMs: 1200, // Brief pause between phases
  loopPauseMs: 1600, // Pause before looping from end back to beginning
  resumeAfterClickMs: 8000, // Auto-advance pause after user clicks
} as const;

const NARROW_PX = 760;

// ---------------------------------------------------------------------------
// Topology Data: Spacious 1040 x 920 Canvas
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
  // Tier 1: Source & CI/CD Pipeline (y: 24)
  { id: "dev", x: 30, y: 24, w: 200, h: 56, name: "Developer", sub: "git push feature/infra", fb: "DEV", step: 0, tip: "Pushes verified code and configuration to GitHub" },
  { id: "gh", x: 290, y: 24, w: 200, h: 56, name: "GitHub", sub: "repository · PR branch", logo: "github", fb: "GH", step: 0, tip: "Source repository and pull request automation" },
  { id: "ci", x: 550, y: 24, w: 210, h: 56, name: "GitHub Actions", sub: "CI/CD workflow runner", logo: "githubactions", fb: "CI", step: 0, tip: "Executes automated build, test, security audit, and deployment stages" },
  { id: "trivy", x: 820, y: 24, w: 190, h: 56, name: "Trivy", sub: "security & CVE scan", logo: "trivy", fb: "TR", step: 0, tip: "Scans repository dependencies and container images for vulnerabilities" },

  // Tier 2: AWS Infrastructure Provisioning & IAM (y: 160)
  { id: "tf", x: 420, y: 160, w: 200, h: 56, name: "Terraform", sub: "IaC · AWS provisioner", logo: "terraform", fb: "TF", step: 1, ref: true, tip: "Provisions isolated VPC, subnets, and security groups (Reference only)" },
  { id: "iam", x: 740, y: 160, w: 200, h: 56, name: "AWS IAM", sub: "EC2 instance role", logo: "aws-iam", fb: "IAM", step: 1, ref: true, tip: "Attaches IAM instance profile and access policies to the EC2 host (Reference only)" },

  // Tier 3: Deployment Automation (y: 280)
  { id: "ans", x: 140, y: 280, w: 210, h: 56, name: "Ansible", sub: "SSH deploy · playbook", logo: "ansible", fb: "AN", step: 2, tip: "Executes server configuration and Docker Compose deployment via SSH" },

  // Tier 5: External Consumers, Cloud Telemetry Storage & Alerts (y: 770)
  { id: "users", x: 34, y: 770, w: 200, h: 56, name: "Users", sub: "browser · HTTPS 443", fb: "WEB", step: 3, tip: "Visitors reach the application securely over HTTPS via the Security Group and Nginx" },
  { id: "cw", x: 275, y: 770, w: 220, h: 56, name: "Amazon CloudWatch", sub: "host logs & telemetry", logo: "aws-cloudwatch", fb: "CW", step: 2, ref: true, tip: "Amazon CloudWatch captures EC2 system metrics and host telemetry (Reference only)" },
  { id: "s3", x: 535, y: 770, w: 210, h: 56, name: "Amazon S3", sub: "encrypted PDF archive", logo: "aws-s3", fb: "S3", step: 3, ref: true, tip: "Amazon S3 archives encrypted daily compliance and audit PDF reports (Reference only)" },
  { id: "mail", x: 785, y: 770, w: 225, h: 56, name: "Email Alerts", sub: "hello@piyushprasad.in", logo: "mail", fb: "@", step: 3, tip: "Automated PDF reports and workflow alerts dispatched to hello@piyushprasad.in" },
];

type Edge = {
  n: number;
  step: number;
  d: string;
  len: number;
  bx: number;
  by: number;
  tip: string;
  label?: { x: number; y: number; t: string };
};

const EDGES: Edge[] = [
  // Phase 1: Push & CI Scan
  { n: 1, step: 0, d: "M 230 52 H 290", len: 60, bx: 260, by: 52, tip: "Developer pushes code to GitHub" },
  { n: 2, step: 0, d: "M 490 52 H 550", len: 60, bx: 520, by: 52, tip: "Push triggers GitHub Actions workflow pipeline" },
  { n: 3, step: 0, d: "M 760 52 H 820", len: 60, bx: 790, by: 52, tip: "GitHub Actions executes Trivy security scan", label: { x: 790, y: 38, t: "security scan" } },

  // Phase 2: AWS Provisioning
  { n: 4, step: 1, d: "M 655 80 V 120 H 520 V 160", len: 215, bx: 587, by: 120, tip: "Pipeline triggers Terraform plan and apply", label: { x: 587, y: 108, t: "plan · apply" } },
  { n: 5, step: 1, d: "M 620 188 H 740", len: 120, bx: 680, by: 188, tip: "Terraform attaches AWS IAM instance profile", label: { x: 680, y: 174, t: "instance role" } },
  { n: 6, step: 1, d: "M 520 216 V 390", len: 174, bx: 520, by: 250, tip: "Terraform provisions AWS VPC and Security Group firewall", label: { x: 558, y: 254, t: "provision VPC & SG" } },

  // Phase 3: Application Deployment
  { n: 7, step: 2, d: "M 575 80 V 120 H 245 V 280", len: 530, bx: 410, by: 120, tip: "Pipeline executes Ansible deployment playbook", label: { x: 410, y: 108, t: "trigger deploy" } },
  { n: 8, step: 2, d: "M 245 336 V 390", len: 54, bx: 245, by: 363, tip: "Ansible configures ubuntu-app-01 via SSH port 22 and starts Docker Compose", label: { x: 282, y: 367, t: "SSH port 22" } },
  { n: 9, step: 2, d: "M 385 690 V 770", len: 80, bx: 385, by: 730, tip: "CloudWatch continuously captures host logs and system telemetry", label: { x: 422, y: 734, t: "logs · metrics" } },

  // Phase 4: Traffic, Monitoring & Alerts
  { n: 10, step: 3, d: "M 134 770 V 542", len: 228, bx: 134, by: 730, tip: "Users connect over HTTPS via Security Group port 443 into Nginx", label: { x: 172, y: 734, t: "HTTPS 443" } },
  { n: 11, step: 3, d: "M 219 614 H 245 M 410 614 H 436", len: 52, bx: 327, by: 614, tip: "Node Exporter streams metrics to Prometheus, which displays visual dashboards in Grafana", label: { x: 327, y: 601, t: "telemetry stream" } },
  { n: 12, step: 3, d: "M 640 690 V 770", len: 80, bx: 640, by: 730, tip: "Host cron job encrypts and archives daily PDF reports in Amazon S3", label: { x: 678, y: 734, t: "archive PDF" } },
  { n: 13, step: 3, d: "M 897 690 V 770", len: 80, bx: 897, by: 730, tip: "Automated PDF reports and workflow alerts dispatched to hello@piyushprasad.in", label: { x: 938, y: 734, t: "dispatch alert" } },
];

/**
 * Analytical coordinate calculation along active edge paths.
 * Moves steadily and smoothly along one connection at a time.
 */
function getPointOnEdge(edge: Edge, frac: number): { x: number; y: number } {
  const f = Math.max(0, Math.min(1, frac));
  switch (edge.n) {
    case 1:
      return { x: 230 + f * 60, y: 52 };
    case 2:
      return { x: 490 + f * 60, y: 52 };
    case 3:
      return { x: 760 + f * 60, y: 52 };
    case 4: {
      const dist = f * 215;
      if (dist <= 40) return { x: 655, y: 80 + dist };
      if (dist <= 175) return { x: 655 - (dist - 40), y: 120 };
      return { x: 520, y: 120 + (dist - 175) };
    }
    case 5:
      return { x: 620 + f * 120, y: 188 };
    case 6:
      return { x: 520, y: 216 + f * 174 };
    case 7: {
      const dist = f * 530;
      if (dist <= 40) return { x: 575, y: 80 + dist };
      if (dist <= 370) return { x: 575 - (dist - 40), y: 120 };
      return { x: 245, y: 120 + (dist - 370) };
    }
    case 8:
      return { x: 245, y: 336 + f * 54 };
    case 9:
      return { x: 385, y: 690 + f * 80 };
    case 10:
      return { x: 134, y: 770 - f * 228 };
    case 11: {
      const dist = f * 52;
      if (dist <= 26) return { x: 219 + (dist / 26) * 26, y: 614 };
      return { x: 410 + ((dist - 26) / 26) * 26, y: 614 };
    }
    case 12:
      return { x: 640, y: 690 + f * 80 };
    case 13:
      return { x: 897, y: 690 + f * 80 };
    default:
      return { x: edge.bx, y: edge.by };
  }
}

const STEPS = [
  {
    title: "Push & CI Scan",
    text: "Developer pushes code to GitHub. GitHub Actions starts the workflow and runs Trivy to scan source and container images for CVE vulnerabilities.",
  },
  {
    title: "AWS Provisioning",
    text: "Terraform provisions the AWS environment: isolated VPC & Subnets, Security Groups (ports 443 & 22), and assigns the AWS IAM EC2 instance role.",
  },
  {
    title: "Application Deployment",
    text: "Ansible configures the AWS EC2 server ubuntu-app-01 (Ubuntu Linux) via SSH and boots Docker Compose: Nginx, App, Database, Node Exporter, Prometheus, Grafana.",
  },
  {
    title: "Traffic, Monitoring & Alerts",
    text: "Users connect over HTTPS via Security Group port 443 into Nginx. Node Exporter streams metrics to Prometheus and Grafana. CloudWatch collects logs. S3 archives daily reports, and alerts are sent to hello@piyushprasad.in.",
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
    title: "Push & CI Scan",
    desc: "Developer pushes to GitHub. GitHub Actions runs Trivy security scans on code and images.",
    externalServices: [
      { name: "Developer (git push)", fb: "DEV" },
      { name: "GitHub (repository)", logo: "github", fb: "GH" },
      { name: "GitHub Actions (CI/CD)", logo: "githubactions", fb: "CI" },
      { name: "Trivy (security & CVE scan)", logo: "trivy", fb: "TR" },
    ],
  },
  {
    title: "AWS Provisioning",
    desc: "Terraform provisions isolated VPC, subnets, Security Groups, and IAM EC2 instance role.",
    externalServices: [
      { name: "Terraform (IaC provisioner)", logo: "terraform", fb: "TF", ref: true },
      { name: "AWS VPC (isolated network)", logo: "aws-vpc", fb: "VPC", ref: true },
      { name: "Security Group (ports 443, 22)", logo: "aws-vpc", fb: "SG", ref: true },
      { name: "AWS IAM (EC2 instance role)", logo: "aws-iam", fb: "IAM", ref: true },
    ],
  },
  {
    title: "Application Deployment",
    desc: "Ansible configures ubuntu-app-01 via SSH and starts the Docker Compose stack.",
    externalServices: [
      { name: "Ansible (SSH deploy playbook)", logo: "ansible", fb: "AN" },
      { name: "Security Group (SSH port 22)", logo: "aws-vpc", fb: "SG", ref: true },
      { name: "CloudWatch (host logs & metrics)", logo: "aws-cloudwatch", fb: "CW", ref: true },
    ],
    serverServices: [
      { name: "Nginx (reverse proxy · TLS)", logo: "nginx", fb: "NG" },
      { name: "App (React + Node.js API)", logo: "nodejs", fb: "APP" },
      { name: "Database (MongoDB / SQLite)", logo: "mongodb", fb: "DB" },
      { name: "Node Exporter (host metrics)", logo: "linux", fb: "NODE" },
      { name: "Prometheus (metrics collector)", logo: "prometheus", fb: "PROM" },
      { name: "Grafana (visual dashboards)", logo: "grafana", fb: "GRAF" },
    ],
  },
  {
    title: "Traffic, Monitoring & Alerts",
    desc: "Users connect via HTTPS 443. Metrics stream to Prometheus and Grafana. S3 archives reports and email alerts go to hello@piyushprasad.in.",
    externalServices: [
      { name: "Users (HTTPS port 443)", fb: "WEB" },
      { name: "Amazon CloudWatch (logs & metrics)", logo: "aws-cloudwatch", fb: "CW", ref: true },
      { name: "Amazon S3 (archived PDF reports)", logo: "aws-s3", fb: "S3", ref: true },
      { name: "Email Alerts (hello@piyushprasad.in)", logo: "mail", fb: "@" },
    ],
    serverServices: [
      { name: "Nginx (TLS termination · 443)", logo: "nginx", fb: "NG" },
      { name: "Node Exporter → Prometheus → Grafana", logo: "prometheus", fb: "METRICS" },
      { name: "Host Cron (daily audit & PDF)", logo: "pdf", fb: "CRON" },
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

  // Steady animation loop: advances smoothly along active connectors one by one, with a pause between phases
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
  let currentActiveEdgeNumber: number | null = null;

  if (edgeCount > 0) {
    if (elapsedRef.current < travelTime) {
      const idx = Math.floor(elapsedRef.current / HOW_IT_RUNS_TIMING.edgeDurationMs);
      const currEdge = stepEdges[idx] || stepEdges[0];
      currentActiveEdgeNumber = currEdge.n;
      const frac = (elapsedRef.current % HOW_IT_RUNS_TIMING.edgeDurationMs) / HOW_IT_RUNS_TIMING.edgeDurationMs;
      packetPos = getPointOnEdge(currEdge, frac);
    } else {
      // Pause period between steps: packet rests calmly at the destination of the last connection in this phase
      const last = stepEdges[edgeCount - 1];
      currentActiveEdgeNumber = last.n;
      packetPos = getPointOnEdge(last, 1.0);
    }
  }

  const ariaLabel =
    "Full architecture diagram: Developer pushes to GitHub, GitHub Actions runs Trivy scanning, Terraform provisions AWS VPC, subnets, Security Groups, and IAM role, Ansible configures ubuntu-app-01 (Ubuntu Linux) via SSH and starts Docker Compose (Nginx, App, Database, Node Exporter, Prometheus, Grafana), CloudWatch captures logs, Amazon S3 archives PDF reports, users connect over HTTPS, and email alerts go to hello@piyushprasad.in.";

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
        /* Full-Height Desktop SVG Architecture Canvas: Spacious 1040 x 920 */
        <div className="hir-svg-container">
          <svg
            className="hir-svg"
            viewBox="0 0 1040 920"
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
                y="390"
                width="980"
                height="300"
                rx="14"
                className={`hir-server-boundary ${s === 2 || s === 3 ? "hir-server-boundary-on" : ""}`}
              >
                <title>AWS EC2 Linux Server: ubuntu-app-01 (Ubuntu Linux)</title>
              </rect>

              {/* Server Header Bar */}
              <Tile x={46} y={402} size={28} href={logo("ubuntu")} fb="UB" />
              <text x="82" y="418" className="hir-server-title" fontSize={13.5} fontWeight={700}>
                AWS EC2 Server: ubuntu-app-01
              </text>
              <text x="82" y="434" className="hir-mono hir-muted" fontSize={9.5}>
                Ubuntu Linux 22.04 LTS · Private Subnet (10.0.1.50) · ap-south-1
              </text>

              {/* Security Group Firewall Status Badge */}
              <rect x="520" y="404" width="330" height="26" rx="6" className="hir-sg-badge" />
              <text x="532" y="421" className="hir-mono hir-acc" fontSize={9.5} fontWeight={600}>
                Security Group: Ingress 443 (HTTPS) · Ingress 22 (SSH)
              </text>

              {/* Reference Pill for VPC/SG */}
              <rect x="914" y="404" width="84" height="26" rx="5" className="hir-ref-pill" />
              <text x="956" y="421" textAnchor="middle" className="hir-mono hir-muted" fontSize={8.5} fontWeight={600}>
                Reference only
              </text>

              {/* Sub-container A: Docker Compose Stack */}
              <rect x="44" y="452" width="576" height="224" rx="10" className="hir-block" />
              <image href={logo("docker")} x="58" y="464" width="18" height="18" preserveAspectRatio="xMidYMid meet" />
              <text x="82" y="478" className="hir-name" fontSize={12} fontWeight={700}>
                Docker Compose Stack
              </text>
              <text x="606" y="478" textAnchor="end" className="hir-mono hir-muted" fontSize={9.5}>
                6 containers protected by Security Group
              </text>

              {/* Row 1: Core Web & App Containers */}
              {[
                { x: 54, name: "Nginx", sub: "reverse proxy · TLS :443", logo: "nginx", fb: "NG" },
                { x: 245, name: "App", sub: "React + Node.js API", logo: "nodejs", fb: "APP" },
                { x: 436, name: "Database", sub: "MongoDB / SQLite", logo: "mongodb", fb: "DB" },
              ].map((c) => (
                <g key={c.name} className={isOn([2, 3]) ? "hir-in" : "hir-off"}>
                  <rect x={c.x} y={490} width={165} height={54} rx={8} className="hir-chip" />
                  <circle cx={c.x + 153} cy={502} r={2.5} className="hir-dot" />
                  <Tile x={c.x + 8} y={500} size={26} href={logo(c.logo)} fb={c.fb} />
                  <text x={c.x + 40} y={515} className="hir-name" fontSize={11.5} fontWeight={600}>
                    {c.name}
                  </text>
                  <text x={c.x + 40} y={531} className="hir-mono hir-muted" fontSize={8}>
                    {c.sub}
                  </text>
                </g>
              ))}

              {/* Row 2: Observability Pipeline (Node Exporter -> Prometheus -> Grafana) */}
              <g className={isOn([2, 3]) ? "hir-in" : "hir-off"}>
                {/* Node Exporter */}
                <rect x="54" y="590" width="165" height="54" rx={8} className="hir-chip" />
                <circle cx={207} cy={602} r={2.5} className="hir-dot" />
                <Tile x={62} y={600} size={26} href={logo("linux")} fb="NODE" />
                <text x={94} y={615} className="hir-name" fontSize={11.5} fontWeight={600}>
                  Node Exporter
                </text>
                <text x={94} y={631} className="hir-mono hir-muted" fontSize={8}>
                  host kernel metrics :9100
                </text>

                {/* Direct Stream arrow from Node Exporter to Prometheus */}
                <path d="M 219 617 H 245" className="hir-internal-flow" markerEnd="url(#hir-ah-active)" />

                {/* Prometheus */}
                <rect x="245" y="590" width="165" height="54" rx={8} className="hir-chip" />
                <circle cx={398} cy={602} r={2.5} className="hir-dot" />
                <Tile x={253} y={600} size={26} href={logo("prometheus")} fb="PROM" />
                <text x={285} y={615} className="hir-name" fontSize={11.5} fontWeight={600}>
                  Prometheus
                </text>
                <text x={285} y={631} className="hir-mono hir-muted" fontSize={8}>
                  metrics collector :9090
                </text>

                {/* Direct Stream arrow from Prometheus to Grafana */}
                <path d="M 410 617 H 436" className="hir-internal-flow" markerEnd="url(#hir-ah-active)" />

                {/* Grafana */}
                <rect x="436" y="590" width="165" height="54" rx={8} className="hir-chip" />
                <circle cx={589} cy={602} r={2.5} className="hir-dot" />
                <Tile x={444} y={600} size={26} href={logo("grafana")} fb="GRAF" />
                <text x={476} y={615} className="hir-name" fontSize={11.5} fontWeight={600}>
                  Grafana
                </text>
                <text x={476} y={631} className="hir-mono hir-muted" fontSize={8}>
                  visual dashboards :3001
                </text>
              </g>

              {/* Sub-container B: Host Cron Automation Tasks */}
              <rect x="636" y="452" width="360" height="224" rx="10" className="hir-block" />
              <text x="652" y="478" className="hir-name" fontSize={12} fontWeight={700}>
                Host Scheduled Tasks
              </text>
              <text x="982" y="478" textAnchor="end" className="hir-mono hir-muted" fontSize={9.5}>
                Isolated crontab
              </text>

              {[
                { y: 494, t: "Trivy audit → security report", logo: "trivy", fb: "TR" },
                { y: 552, t: "Daily PDF report → Amazon S3", logo: "pdf", fb: "PDF" },
                { y: 610, t: "Alerts → hello@piyushprasad.in", logo: "mail", fb: "@" },
              ].map((r) => (
                <g key={r.t} className={isOn([3]) ? "hir-in" : "hir-off"}>
                  <rect x={648} y={r.y} width={334} height={42} rx={7} className="hir-chip" />
                  <Tile x={654} y={r.y + 8} size={26} href={logo(r.logo)} fb={r.fb} />
                  <text x={688} y={r.y + 25} className="hir-mono hir-ink" fontSize={9.5}>
                    {r.t}
                  </text>
                </g>
              ))}
            </g>

            {/* ============================================================= */}
            {/* CONNECTOR PATHS & DIRECTIONAL FLOW ARROWS                     */}
            {/* ============================================================= */}
            {EDGES.map((e) => {
              const isStepActive = isOn([e.step]);
              const isEdgeBeingTraversed = currentActiveEdgeNumber === e.n && isStepActive;

              return (
                <g key={e.n} className={dim([e.step])}>
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

            {/* ============================================================= */}
            {/* NUMBERED STEP BADGES                                          */}
            {/* ============================================================= */}
            {EDGES.map((e) => (
              <Badge key={e.n} x={e.bx} y={e.by} n={e.n} on={isOn([e.step])} />
            ))}

            {/* ============================================================= */}
            {/* SEQUENTIAL ANIMATED PACKET DOT                                */}
            {/* ============================================================= */}
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

/* SVG Container: Spacious & Natural Vertical Scroll */
.hir-svg-container{width:100%;overflow-x:auto}
.hir-svg{display:block;width:100%;height:auto;min-width:760px}
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
.hir-internal-flow{fill:none;stroke:var(--hir-acc);stroke-width:1.75;stroke-dasharray:4 3}

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

/* Mobile layout */
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
