import { useCallback, useEffect, useRef, useState } from "react";
import { TECH_LOGO_REGISTRY } from "@/lib/tech-logo-registry";

/**
 * "How it runs": clean and professional reference workflow.
 *
 * Sequence:
 * 1. Code push & security scan:
 *    Developer pushes to GitHub repository. GitHub Actions starts the pipeline and runs
 *    Trivy security scanning for CVE vulnerabilities in source and container images.
 * 2. AWS provisioning:
 *    Terraform provisions the AWS environment: isolated VPC & Subnets, Security Groups
 *    (firewall protecting EC2: Ingress 443 HTTPS, Ingress 22 SSH), and assigns the AWS IAM instance role.
 * 3. Application deployment:
 *    Protected by the Security Group, Ansible configures the host via SSH (port 22) and deploys
 *    the Docker Compose stack on the AWS EC2 Linux server named ubuntu-app-01 (Ubuntu Linux):
 *    Nginx, App, Database, Node Exporter, Prometheus, and Grafana. CloudWatch monitors host telemetry.
 * 4. Traffic, monitoring, reports & alerts:
 *    Users connect securely over HTTPS (port 443) through Nginx reverse proxy.
 *    Node Exporter streams system metrics to Prometheus, which feeds Grafana dashboards.
 *    Scheduled host cron jobs archive daily PDF reports in Amazon S3 and dispatch email reports
 *    and failure alerts to hello@piyushprasad.in.
 */

export const HOW_IT_RUNS_TIMING = {
  edgeDurationMs: 2000, // Steady, comfortable pace (2.0s per active connection)
  stepPauseMs: 1400, // Calm pause between workflow steps
  resumeAfterClickMs: 8000, // Auto-loop pause after manual tab interaction
} as const;

const NARROW_PX = 760;

// ---------------------------------------------------------------------------
// Desktop SVG Topology: 1020 x 620
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
  steps: number[];
  ref?: boolean;
  tip: string;
};

const NODES: Node[] = [
  // Row 1: Source & CI/CD
  { id: "dev", x: 24, y: 22, w: 200, h: 54, name: "Developer", sub: "git push feature/infra", fb: "DEV", steps: [0], tip: "Pushes verified code and configuration to GitHub" },
  { id: "gh", x: 284, y: 22, w: 200, h: 54, name: "GitHub", sub: "repository · PR branch", logo: "github", fb: "GH", steps: [0], tip: "Central source repository and pull request automation" },
  { id: "ci", x: 544, y: 22, w: 210, h: 54, name: "GitHub Actions", sub: "CI/CD workflow runner", logo: "githubactions", fb: "CI", steps: [0, 1, 2], tip: "Executes automated build, test, security audit, and deployment stages" },
  { id: "trivy", x: 814, y: 22, w: 180, h: 54, name: "Trivy", sub: "security & CVE scan", logo: "trivy", fb: "TR", steps: [0], tip: "Scans repository dependencies and container images for vulnerabilities" },

  // Row 2: Provisioning & Config Automation (External / Connected AWS Services)
  { id: "ans", x: 154, y: 122, w: 180, h: 54, name: "Ansible", sub: "SSH deploy · playbook", logo: "ansible", fb: "AN", steps: [2], tip: "Executes server configuration and Docker Compose deployment via SSH port 22" },
  { id: "tf", x: 434, y: 122, w: 180, h: 54, name: "Terraform", sub: "IaC · VPC & SG provision", logo: "terraform", fb: "TF", steps: [1], ref: true, tip: "Provisions isolated VPC, subnets, and security groups (Reference only)" },
  { id: "iam", x: 714, y: 122, w: 180, h: 54, name: "AWS IAM", sub: "EC2 instance role", logo: "aws-iam", fb: "IAM", steps: [1], ref: true, tip: "Attaches IAM instance profile and access policies to the EC2 host (Reference only)" },

  // Row 4: External Consumers, Cloud Telemetry Storage & Email Alerts
  { id: "users", x: 37, y: 536, w: 190, h: 54, name: "Users", sub: "browser · HTTPS 443", fb: "WEB", steps: [3], tip: "Visitors reach the application securely over HTTPS via the Security Group and Nginx" },
  { id: "cw", x: 284, y: 536, w: 210, h: 54, name: "Amazon CloudWatch", sub: "host logs & metrics", logo: "aws-cloudwatch", fb: "CW", steps: [2, 3], ref: true, tip: "Amazon CloudWatch captures EC2 system metrics and host telemetry (Reference only)" },
  { id: "s3", x: 534, y: 536, w: 200, h: 54, name: "Amazon S3", sub: "encrypted PDF archive", logo: "aws-s3", fb: "S3", steps: [3], ref: true, tip: "Amazon S3 archives encrypted daily compliance and audit PDF reports (Reference only)" },
  { id: "mail", x: 764, y: 536, w: 232, h: 54, name: "Email Alerts", sub: "hello@piyushprasad.in", logo: "mail", fb: "@", steps: [3], tip: "Automated PDF reports and workflow failure alerts delivered to hello@piyushprasad.in" },
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
  // Step 0: Code push & security scan (GitHub Actions runs Trivy)
  { n: 1, step: 0, d: "M 224 49 H 284", len: 60, bx: 254, by: 49, tip: "Developer pushes code to GitHub" },
  { n: 2, step: 0, d: "M 484 49 H 544", len: 60, bx: 514, by: 49, tip: "Push or pull request triggers GitHub Actions pipeline" },
  { n: 3, step: 0, d: "M 754 49 H 814", len: 60, bx: 784, by: 49, tip: "GitHub Actions executes Trivy security scan", label: { x: 784, y: 35, t: "security scan" } },

  // Step 1: AWS provisioning (Terraform provisions VPC, Security Groups & IAM role)
  { n: 4, step: 1, d: "M 649 76 V 99 H 524 V 122", len: 171, bx: 580, by: 99, tip: "Pipeline triggers Terraform plan and apply", label: { x: 580, y: 89, t: "plan · apply" } },
  { n: 5, step: 1, d: "M 524 176 V 236", len: 60, bx: 524, by: 206, tip: "Terraform provisions AWS VPC, Subnets, and Security Groups", label: { x: 550, y: 209, t: "provision VPC & SG" } },
  { n: 6, step: 1, d: "M 614 149 H 714", len: 100, bx: 664, by: 149, tip: "Terraform attaches AWS IAM instance profile to the EC2 server", label: { x: 664, y: 137, t: "instance role" } },

  // Step 2: Application deployment (Ansible configures ubuntu-app-01 via SSH; CloudWatch monitors)
  { n: 7, step: 2, d: "M 594 76 V 99 H 244 V 122", len: 396, bx: 419, by: 99, tip: "Pipeline triggers Ansible deployment playbook", label: { x: 419, y: 89, t: "SSH deploy" } },
  { n: 8, step: 2, d: "M 244 176 V 236", len: 60, bx: 244, by: 206, tip: "Ansible configures ubuntu-app-01 and starts Docker Compose via SSH port 22", label: { x: 270, y: 209, t: "SSH port 22" } },
  { n: 9, step: 2, d: "M 389 486 V 536", len: 50, bx: 389, by: 511, tip: "CloudWatch continuously captures host logs and system telemetry", label: { x: 415, y: 514, t: "logs · metrics" } },

  // Step 3: Traffic, monitoring, reports & alerts
  { n: 10, step: 3, d: "M 132 536 V 374", len: 162, bx: 132, by: 511, tip: "Users connect over HTTPS via Security Group port 443 into Nginx", label: { x: 158, y: 514, t: "HTTPS 443" } },
  { n: 11, step: 3, d: "M 210 425 H 236 M 392 425 H 418", len: 52, bx: 314, by: 425, tip: "Node Exporter streams metrics to Prometheus, which displays visual dashboards in Grafana", label: { x: 314, y: 412, t: "telemetry stream" } },
  { n: 12, step: 3, d: "M 634 486 V 536", len: 50, bx: 634, by: 511, tip: "Host cron job encrypts and archives daily PDF reports in Amazon S3", label: { x: 660, y: 514, t: "archive PDF" } },
  { n: 13, step: 3, d: "M 880 486 V 536", len: 50, bx: 880, by: 511, tip: "Automated PDF reports and workflow alerts dispatched to hello@piyushprasad.in", label: { x: 906, y: 514, t: "SMTP alerts" } },
];

/**
 * Analytical coordinate calculation along active edge paths.
 * Moves smoothly and steadily along one connection at a time.
 */
function getPointOnEdge(edge: Edge, frac: number): { x: number; y: number } {
  const f = Math.max(0, Math.min(1, frac));
  switch (edge.n) {
    case 1:
      return { x: 224 + f * 60, y: 49 };
    case 2:
      return { x: 484 + f * 60, y: 49 };
    case 3:
      return { x: 754 + f * 60, y: 49 };
    case 4: {
      const dist = f * 171;
      if (dist <= 23) return { x: 649, y: 76 + dist };
      if (dist <= 148) return { x: 649 - (dist - 23), y: 99 };
      return { x: 524, y: 99 + (dist - 148) };
    }
    case 5:
      return { x: 524, y: 176 + f * 60 };
    case 6:
      return { x: 614 + f * 100, y: 149 };
    case 7: {
      const dist = f * 396;
      if (dist <= 23) return { x: 594, y: 76 + dist };
      if (dist <= 373) return { x: 594 - (dist - 23), y: 99 };
      return { x: 244, y: 99 + (dist - 373) };
    }
    case 8:
      return { x: 244, y: 176 + f * 60 };
    case 9:
      return { x: 389, y: 486 + f * 50 };
    case 10:
      return { x: 132, y: 536 - f * 162 };
    case 11: {
      const dist = f * 52;
      if (dist <= 26) return { x: 210 + (dist / 26) * 26, y: 425 };
      return { x: 392 + ((dist - 26) / 26) * 26, y: 425 };
    }
    case 12:
      return { x: 634, y: 486 + f * 50 };
    case 13:
      return { x: 880, y: 486 + f * 50 };
    default:
      return { x: edge.bx, y: edge.by };
  }
}

const STEPS = [
  {
    title: "Push & CI Scan",
    text: "A developer pushes code to GitHub. GitHub Actions starts the pipeline and executes Trivy security scanning for CVE vulnerabilities in source and container images.",
  },
  {
    title: "AWS Provisioning",
    text: "Terraform provisions the AWS environment, creating the isolated VPC & Subnets, configuring Security Groups (ports 443 & 22), and attaching the AWS IAM EC2 instance role.",
  },
  {
    title: "Application Deployment",
    text: "Protected by the Security Group, Ansible configures the AWS EC2 server ubuntu-app-01 (Ubuntu Linux) via SSH and deploys Docker Compose: Nginx, App, Database, Node Exporter, Prometheus, and Grafana, while CloudWatch captures host logs.",
  },
  {
    title: "Traffic, Monitoring & Alerts",
    text: "Users reach the app over HTTPS through Security Group port 443 into Nginx. Node Exporter streams system metrics to Prometheus and Grafana dashboards. Scheduled cron jobs archive PDF reports in Amazon S3 and send alerts to hello@piyushprasad.in.",
  },
];

type NarrowStep = {
  title: string;
  externalServices?: { name: string; logo?: string; fb: string; ref?: boolean; sub?: string }[];
  serverServices?: { name: string; logo?: string; fb: string; ref?: boolean; sub?: string }[];
};

const NARROW_STEPS: NarrowStep[] = [
  {
    title: "Push & CI Scan",
    externalServices: [
      { name: "Developer (git push)", fb: "DEV" },
      { name: "GitHub (repository)", logo: "github", fb: "GH" },
      { name: "GitHub Actions (CI/CD)", logo: "githubactions", fb: "CI" },
      { name: "Trivy (security & CVE scan)", logo: "trivy", fb: "TR" },
    ],
  },
  {
    title: "AWS Provisioning",
    externalServices: [
      { name: "Terraform (IaC provisioner)", logo: "terraform", fb: "TF", ref: true },
      { name: "AWS VPC (isolated network)", logo: "aws-vpc", fb: "VPC", ref: true },
      { name: "Security Group (firewall: 443, 22)", logo: "aws-vpc", fb: "SG", ref: true },
      { name: "AWS IAM (EC2 instance role)", logo: "aws-iam", fb: "IAM", ref: true },
    ],
  },
  {
    title: "Application Deployment",
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
    externalServices: [
      { name: "Users (HTTPS port 443)", fb: "WEB" },
      { name: "Amazon S3 (archived PDF reports)", logo: "aws-s3", fb: "S3", ref: true },
      { name: "Email Alerts (hello@piyushprasad.in)", logo: "mail", fb: "@" },
    ],
    serverServices: [
      { name: "Nginx (TLS termination · 443)", logo: "nginx", fb: "NG" },
      { name: "Node Exporter → Prometheus → Grafana", logo: "prometheus", fb: "METRICS" },
      { name: "Cron Automation (daily audit & PDF)", logo: "pdf", fb: "CRON" },
    ],
  },
];

const logo = (key?: string) => (key ? TECH_LOGO_REGISTRY[key]?.src : undefined);

// ---------------------------------------------------------------------------
// SVG building blocks
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

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.3 });
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

  // Steady animation loop: moves along active connectors one connection at a time, with a pause between steps
  useEffect(() => {
    if (!running) {
      lastTimeRef.current = null;
      return;
    }

    let rafId: number;

    const tick = (now: number) => {
      const stepEdges = EDGES.filter((e) => e.step === step);
      const totalDuration =
        stepEdges.length * HOW_IT_RUNS_TIMING.edgeDurationMs + HOW_IT_RUNS_TIMING.stepPauseMs;

      if (lastTimeRef.current !== null) {
        const delta = Math.min(100, now - lastTimeRef.current);
        elapsedRef.current += delta;
        if (elapsedRef.current >= totalDuration) {
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

  // Calculate moving packet along active step's edges, one connection at a time
  const stepEdges = EDGES.filter((e) => e.step === s);
  const edgeCount = stepEdges.length;
  const travelTime = edgeCount * HOW_IT_RUNS_TIMING.edgeDurationMs;

  let packetPos = { x: 0, y: 0 };
  let activeEdgeNumber: number | null = null;

  if (edgeCount > 0) {
    if (elapsedRef.current < travelTime) {
      const edgeIdx = Math.floor(elapsedRef.current / HOW_IT_RUNS_TIMING.edgeDurationMs);
      const currEdge = stepEdges[edgeIdx] || stepEdges[0];
      activeEdgeNumber = currEdge.n;
      const edgeFraction =
        (elapsedRef.current % HOW_IT_RUNS_TIMING.edgeDurationMs) /
        HOW_IT_RUNS_TIMING.edgeDurationMs;
      packetPos = getPointOnEdge(currEdge, edgeFraction);
    } else {
      // Pause period between steps: rest calmly at the destination of the last connection
      const lastEdge = stepEdges[edgeCount - 1];
      activeEdgeNumber = lastEdge.n;
      packetPos = getPointOnEdge(lastEdge, 1.0);
    }
  }

  const ariaLabel =
    "Reference workflow: developer pushes to GitHub, GitHub Actions runs Trivy security scanning, Terraform provisions the AWS environment including VPC, Security Groups, and AWS IAM instance role, Ansible configures the AWS EC2 server ubuntu-app-01 (Ubuntu Linux) via SSH and deploys the Docker Compose stack (Nginx, App, Database, Node Exporter, Prometheus, and Grafana), CloudWatch monitors host logs, Amazon S3 archives daily PDF reports, users connect over HTTPS, and cron jobs send reports and alerts to hello@piyushprasad.in.";

  return (
    <section
      ref={rootRef}
      id="how-it-runs"
      className="hir"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      aria-label="How it runs"
    >
      <style>{CSS}</style>

      <header className="hir-head">
        <div>
          <p className="hir-eyebrow">Reference workflow</p>
          <h3 className="hir-title">How it runs</h3>
        </div>

        <div className="hir-legend" aria-hidden="true">
          <span>
            <i className="hir-key hir-key-solid" /> Used in my repos
          </span>
          <span>
            <i className="hir-key hir-key-ref" /> Reference only
          </span>
        </div>

        <div className="hir-controls">
          {/* Play / Pause Toggle Button */}
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
      <div className="hir-steps" role="tablist" aria-label="Workflow steps">
        {STEPS.map((st, i) => (
          <button
            key={st.title}
            type="button"
            role="tab"
            aria-selected={i === s}
            aria-label={`Step ${i + 1}: ${st.title}`}
            className={`hir-seg ${i < s ? "hir-seg-done" : ""} ${i === s ? "hir-seg-on" : ""}`}
            onClick={() => jump(i)}
          >
            <span className="hir-seg-label">
              <b>{String(i + 1).padStart(2, "0")}</b> {st.title}
            </span>
          </button>
        ))}
      </div>

      <p className="hir-caption" aria-live="polite">
        {STEPS[s].text}
      </p>

      {narrow ? (
        <ol className="hir-list">
          {NARROW_STEPS.map((st, i) => (
            <li key={i} className={`hir-li ${i === s ? "hir-li-on" : ""}`}>
              <div className="hir-li-head">
                <span className="hir-li-n">{i + 1}</span>
                <strong>{st.title}</strong>
              </div>

              {/* External Services */}
              {st.externalServices && (
                <div className="hir-chips mb-2.5">
                  {st.externalServices.map((sv) => (
                    <span
                      key={sv.name}
                      className={`hir-chip-html ${sv.ref ? "hir-chip-ref" : ""}`}
                    >
                      {logo(sv.logo) ? (
                        <img src={logo(sv.logo)} alt="" width={16} height={16} />
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
      ) : (
        <svg
          className="hir-svg"
          viewBox="0 0 1020 620"
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
          {/* AWS EC2 Linux Server Boundary: ubuntu-app-01 (Ubuntu Linux)   */}
          {/* ============================================================= */}
          <g className={dim([1, 2, 3])}>
            {/* Outer EC2 Server Container */}
            <rect
              x="24"
              y="236"
              width="972"
              height="250"
              rx="12"
              className={`hir-server-boundary ${s === 2 || s === 3 ? "hir-server-boundary-on" : ""}`}
            >
              <title>AWS EC2 Linux Server: ubuntu-app-01 (Ubuntu Linux)</title>
            </rect>

            {/* Server Header Bar */}
            <g>
              <Tile x={38} y={246} size={28} href={logo("ubuntu") || logo("aws-ec2")} fb="UB" />
              <text x="74" y="262" className="hir-server-title" fontSize={13} fontWeight={700}>
                AWS EC2 Server: ubuntu-app-01
              </text>
              <text x="74" y="278" className="hir-mono hir-muted" fontSize={9.5}>
                Ubuntu Linux 22.04 LTS · Private Subnet (10.0.1.50) · ap-south-1
              </text>

              {/* Security Group Firewall Status Badge */}
              <rect x="470" y="248" width="310" height="24" rx="6" className="hir-sg-badge" />
              <text x="482" y="264" className="hir-mono hir-acc" fontSize={9.5} fontWeight={600}>
                Security Group: Ingress 443 (HTTPS) · Ingress 22 (SSH)
              </text>

              {/* Reference Tag for AWS VPC / SG integration */}
              <rect x="896" y="248" width="88" height="24" rx="5" className="hir-ref-pill" />
              <text x="940" y="264" textAnchor="middle" className="hir-mono hir-muted" fontSize={9} fontWeight={600}>
                Reference only
              </text>
            </g>

            {/* Sub-container A: Docker Compose Stack (5 containers) */}
            <g>
              <rect x="40" y="294" width="554" height="178" rx="10" className="hir-block" />
              <image
                href={logo("docker")}
                x="52"
                y="304"
                width="18"
                height="18"
                preserveAspectRatio="xMidYMid meet"
              />
              <text x="76" y="318" className="hir-name" fontSize={12} fontWeight={700}>
                Docker Compose Stack
              </text>
              <text x="580" y="318" textAnchor="end" className="hir-mono hir-muted" fontSize={9.5}>
                Protected by Security Group · 5 containers
              </text>

              {/* App Tier: Nginx, App, Database */}
              {[
                { x: 54, name: "Nginx", sub: "reverse proxy · TLS", logo: "nginx", fb: "NG" },
                { x: 236, name: "App", sub: "React + Node.js API", logo: "nodejs", fb: "APP" },
                { x: 418, name: "Database", sub: "MongoDB / SQLite", logo: "mongodb", fb: "DB" },
              ].map((c) => (
                <g key={c.name} className={isOn([2, 3]) ? "hir-in" : "hir-off"}>
                  <rect x={c.x} y={328} width={156} height={54} rx={8} className="hir-chip" />
                  <circle cx={c.x + 144} cy={340} r={2.5} className="hir-dot" />
                  <Tile x={c.x + 8} y={338} size={26} href={logo(c.logo)} fb={c.fb} />
                  <text x={c.x + 40} y={353} className="hir-name" fontSize={11.5} fontWeight={600}>
                    {c.name}
                  </text>
                  <text x={c.x + 40} y={369} className="hir-mono hir-muted" fontSize={8}>
                    {c.sub}
                  </text>
                </g>
              ))}

              {/* Observability Tier: Node Exporter -> Prometheus -> Grafana */}
              <g className={isOn([2, 3]) ? "hir-in" : "hir-off"}>
                {/* Node Exporter */}
                <rect x="54" y="398" width="156" height="54" rx={8} className="hir-chip" />
                <circle cx={200} cy={410} r={2.5} className="hir-dot" />
                <Tile x={62} y={408} size={26} href={logo("linux")} fb="NODE" />
                <text x={94} y={423} className="hir-name" fontSize={11.5} fontWeight={600}>
                  Node Exporter
                </text>
                <text x={94} y={439} className="hir-mono hir-muted" fontSize={8}>
                  host kernel metrics
                </text>

                {/* Direct stream arrow from Node Exporter to Prometheus */}
                <path
                  d="M 210 425 H 236"
                  className="hir-internal-flow"
                  markerEnd="url(#hir-ah-active)"
                />

                {/* Prometheus */}
                <rect x="236" y="398" width="156" height="54" rx={8} className="hir-chip" />
                <circle cx={382} cy={410} r={2.5} className="hir-dot" />
                <Tile x={244} y={408} size={26} href={logo("prometheus")} fb="PROM" />
                <text x={276} y={423} className="hir-name" fontSize={11.5} fontWeight={600}>
                  Prometheus
                </text>
                <text x={276} y={439} className="hir-mono hir-muted" fontSize={8}>
                  metrics collector
                </text>

                {/* Direct stream arrow from Prometheus to Grafana */}
                <path
                  d="M 392 425 H 418"
                  className="hir-internal-flow"
                  markerEnd="url(#hir-ah-active)"
                />

                {/* Grafana */}
                <rect x="418" y="398" width="156" height="54" rx={8} className="hir-chip" />
                <circle cx={564} cy={410} r={2.5} className="hir-dot" />
                <Tile x={426} y={408} size={26} href={logo("grafana")} fb="GRAF" />
                <text x={458} y={423} className="hir-name" fontSize={11.5} fontWeight={600}>
                  Grafana
                </text>
                <text x={458} y={439} className="hir-mono hir-muted" fontSize={8}>
                  visual dashboards
                </text>
              </g>
            </g>

            {/* Sub-container B: Host Cron Automation */}
            <g>
              <rect x="612" y="294" width="370" height="178" rx="10" className="hir-block" />
              <text x="626" y="318" className="hir-name" fontSize={12} fontWeight={700}>
                Automated Scheduled Tasks
              </text>
              <text x="968" y="318" textAnchor="end" className="hir-mono hir-muted" fontSize={9.5}>
                Isolated host crontab
              </text>

              {[
                { y: 330, t: "Trivy audit → security report", logo: "trivy", fb: "TR" },
                { y: 374, t: "PDF report → Amazon S3", logo: "pdf", fb: "PDF" },
                { y: 418, t: "Alerts → hello@piyushprasad.in", logo: "mail", fb: "@" },
              ].map((r) => (
                <g key={r.t} className={isOn([3]) ? "hir-in" : "hir-off"}>
                  <rect x={626} y={r.y} width={342} height={36} rx={7} className="hir-chip" />
                  <Tile x={632} y={r.y + 5} size={26} href={logo(r.logo)} fb={r.fb} />
                  <text x={666} y={r.y + 22} className="hir-mono hir-ink" fontSize={9.5}>
                    {r.t}
                  </text>
                </g>
              ))}
            </g>
          </g>

          {/* ============================================================= */}
          {/* Connector Lines & Flow Paths                                  */}
          {/* ============================================================= */}
          {EDGES.map((e) => {
            const isStepActive = e.step === s && !reduced;
            const isEdgeBeingTraversed = activeEdgeNumber === e.n && isStepActive;

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

          {/* External Service Nodes */}
          {NODES.map((n) => (
            <g key={n.id} className={dim(n.steps)}>
              <rect
                x={n.x}
                y={n.y}
                width={n.w}
                height={n.h}
                rx={10}
                className={`hir-node ${n.ref ? "hir-node-ref" : ""} ${isOn(n.steps) && !reduced ? "hir-node-on" : ""}`}
              >
                <title>{n.tip}</title>
              </rect>
              <Tile x={n.x + 10} y={n.y + 12} size={30} href={logo(n.logo)} fb={n.fb} />
              <text x={n.x + 48} y={n.y + 26} className="hir-name" fontSize={12.5} fontWeight={600}>
                {n.name}
              </text>
              <text x={n.x + 48} y={n.y + 42} className="hir-mono hir-muted" fontSize={9}>
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

          {/* Badges: placed at clean path coordinates */}
          {EDGES.map((e) => (
            <Badge key={e.n} x={e.bx} y={e.by} n={e.n} on={e.step === s && !reduced} />
          ))}

          {/* Animated Point: moves steadily along active edge, rests during pause */}
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
              <circle
                cx={packetPos.x}
                cy={packetPos.y}
                r="4.5"
                className="hir-packet-dot"
              />
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
.hir-btn:focus-visible,.hir-seg:focus-visible{outline:2px solid var(--hir-acc);outline-offset:2px}
.hir-steps{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:18px 0 12px}
.hir-seg{border:0;padding:0;background:none;cursor:pointer;text-align:left;color:var(--hir-muted)}
.hir-seg::before{content:"";display:block;height:5px;border-radius:3px;background:var(--hir-border);margin-bottom:8px}
.hir-seg-done::before{background:var(--hir-acc);opacity:.45}
.hir-seg-on::before{background:var(--hir-acc)}
.hir-seg-label{font:500 11.5px system-ui,sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:block}
.hir-seg-label b{font:600 10.5px ui-monospace,Menlo,monospace;color:var(--hir-acc);margin-right:4px}
.hir-seg-on .hir-seg-label{color:var(--hir-text);font-weight:600}
.hir-caption{margin:0 0 10px;min-height:22px;font-size:13px;line-height:1.5;color:var(--hir-muted)}
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

/* Mobile list */
.hir-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:12px}
.hir-li{border:1px solid var(--hir-border);border-radius:12px;padding:12px 14px;background:var(--hir-surf);position:relative}
.hir-li:not(:last-child)::after{content:"↓";position:absolute;left:50%;bottom:-17px;transform:translateX(-50%);font:700 13px ui-monospace,monospace;color:var(--hir-acc);background:var(--hir-bg);line-height:1;padding:1px 4px;z-index:1}
.hir-li-on{border-color:var(--hir-acc);background:var(--hir-acc-soft)}
.hir-li-head{display:flex;align-items:center;gap:10px;margin-bottom:10px;font-size:13px}
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
