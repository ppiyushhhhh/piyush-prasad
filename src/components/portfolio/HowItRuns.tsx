import { useCallback, useEffect, useRef, useState } from "react";
import { TECH_LOGO_REGISTRY } from "@/lib/tech-logo-registry";

/**
 * "How it runs": a full-width reference workflow, source -> CI -> IaC -> AWS -> users.
 *
 * Geometry rule: every node, line, arrowhead, badge and packet lives in ONE SVG
 * coordinate system and every line is a straight or L-shaped path that starts and
 * ends exactly on a node border. Nothing is measured at runtime, so nothing drifts.
 * Under NARROW_PX the diagram is replaced by a compact 4-step list (same services).
 *
 * Solid node = used in my repositories. Dashed node = reference only (not in my repos).
 */

export const HOW_IT_RUNS_TIMING = {
  stepMs: 3600, // base time per step (4 steps)
  resumeAfterClickMs: 8000, // auto-loop pause after a manual click
} as const;

const NARROW_PX = 760;

export const SPEEDS = [0.5, 1, 1.5, 2] as const;
export type Speed = (typeof SPEEDS)[number];

// ---------------------------------------------------------------------------
// Data
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
  fb: string; // monogram when no logo exists
  steps: number[]; // steps (0-based) in which the node is "active"
  ref?: boolean; // reference only (dashed)
  tip: string;
};

const W = 190;
const H = 64;
const COL = [24, 278, 532, 786]; // node lefts, 64px gaps
const ROW1 = 24;
const ROW2 = 152;
const ROW4 = 584;

const NODES: Node[] = [
  // Row 1: Source & CI
  { id: "dev", x: COL[0], y: ROW1, w: W, h: H, name: "Developer", sub: "git push", fb: "DEV", steps: [0], tip: "Pushes code to the repository" },
  { id: "gh", x: COL[1], y: ROW1, w: W, h: H, name: "GitHub", sub: "repository", logo: "github", fb: "GH", steps: [0], tip: "Source code and pull requests" },
  { id: "ci", x: COL[2], y: ROW1, w: W, h: H, name: "GitHub Actions", sub: "CI/CD pipeline", logo: "githubactions", fb: "CI", steps: [0, 1, 2], tip: "Builds, tests and starts every deployment" },
  { id: "trivy", x: COL[3], y: ROW1, w: W, h: H, name: "Trivy", sub: "vulnerability scan", logo: "trivy", fb: "TR", steps: [0], tip: "Scans the code and container images for known vulnerabilities" },

  // Row 2: Deployment & IaC
  { id: "ans", x: COL[1], y: ROW2, w: W, h: H, name: "Ansible", sub: "configure + deploy", logo: "ansible", fb: "AN", steps: [2], tip: "ansible-playbook configures the server and deploys the app over SSH" },
  { id: "tf", x: COL[2], y: ROW2, w: W, h: H, name: "Terraform", sub: "reference · IaC", logo: "terraform", fb: "TF", steps: [1], ref: true, tip: "plan / apply provisions AWS cloud infrastructure as code (reference step)" },
  { id: "iam", x: COL[3], y: ROW2, w: W, h: H, name: "AWS IAM", sub: "EC2 instance role", logo: "aws-iam", fb: "IAM", steps: [1], ref: true, tip: "Configures IAM instance profile, security policies, and least-privilege credentials during provisioning (reference step)" },

  // Row 4: Consumers, Observability, Storage & Alerts
  { id: "users", x: COL[0], y: ROW4, w: W, h: H, name: "Users", sub: "browser · HTTPS", fb: "WEB", steps: [3], tip: "Visitors reach the application securely over HTTPS via Nginx" },
  { id: "cw", x: COL[1], y: ROW4, w: W, h: H, name: "CloudWatch", sub: "host logs & metrics", logo: "aws-cloudwatch", fb: "CW", steps: [2, 3], ref: true, tip: "Amazon CloudWatch monitors EC2 host metrics, container performance, and system logs (reference step)" },
  { id: "s3", x: COL[2], y: ROW4, w: W, h: H, name: "Amazon S3", sub: "archived PDF reports", logo: "aws-s3", fb: "S3", steps: [3], ref: true, tip: "Amazon S3 stores encrypted daily PDF security & audit report archives (reference step)" },
  { id: "mail", x: COL[3], y: ROW4, w: W, h: H, name: "Email Alerts", sub: "hello@piyushprasad.in", logo: "mail", fb: "@", steps: [3], tip: "Automated PDF reports and workflow failure alerts dispatched to hello@piyushprasad.in" },
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
  // Step 0: Push & CI
  { n: 1, step: 0, d: "M214 56 H278", len: 64, bx: 246, by: 56, tip: "git push to the repository" },
  { n: 2, step: 0, d: "M468 56 H532", len: 64, bx: 500, by: 56, tip: "A push or pull request triggers the CI pipeline" },
  { n: 3, step: 0, d: "M722 56 H786", len: 64, bx: 754, by: 56, tip: "Security scan of the code and container images" },

  // Step 1: Provision (Terraform + AWS IAM)
  { n: 4, step: 1, d: "M627 88 V152", len: 64, bx: 627, by: 120, tip: "Pipeline runs terraform plan and apply", label: { x: 643, y: 124, t: "plan · apply" } },
  { n: 5, step: 1, d: "M627 216 V280", len: 64, bx: 627, by: 248, tip: "Terraform creates the AWS EC2 environment", label: { x: 643, y: 252, t: "provision" } },
  { n: 6, step: 1, d: "M722 184 H786", len: 64, bx: 754, by: 184, tip: "Terraform attaches AWS IAM instance role and security policies", label: { x: 730, y: 172, t: "instance role" } },

  // Step 2: Configure & deploy (Ansible + Docker + CloudWatch)
  { n: 7, step: 2, d: "M577 88 V120 H373 V152", len: 268, bx: 475, by: 120, tip: "Pipeline connects to Ansible over SSH", label: { x: 420, y: 114, t: "SSH deploy" } },
  { n: 8, step: 2, d: "M373 216 V280", len: 64, bx: 373, by: 248, tip: "ansible-playbook deploys to the EC2 host", label: { x: 389, y: 252, t: "playbook" } },
  { n: 9, step: 2, d: "M373 520 V584", len: 64, bx: 373, by: 552, tip: "EC2 daemon streams host metrics and container logs to CloudWatch", label: { x: 389, y: 556, t: "logs · metrics" } },

  // Step 3: Serve & report (Users + Nginx + S3 + Email)
  { n: 10, step: 3, d: "M119 584 V456", len: 128, bx: 119, by: 552, tip: "Users reach Nginx reverse proxy over HTTPS", label: { x: 135, y: 556, t: "HTTPS" } },
  { n: 11, step: 3, d: "M627 520 V584", len: 64, bx: 627, by: 552, tip: "Cron job archives generated PDF reports to Amazon S3", label: { x: 643, y: 556, t: "archive · S3" } },
  { n: 12, step: 3, d: "M881 500 V584", len: 84, bx: 881, by: 552, tip: "Automated PDF reports and workflow alerts sent to hello@piyushprasad.in", label: { x: 897, y: 556, t: "SMTP alerts" } },
];

/**
 * Exact analytical coordinate computation along every edge path.
 * Guarantees zero DOM reads, zero frame lag, and instant freeze/resume.
 */
function getPointOnEdge(edge: Edge, frac: number): { x: number; y: number } {
  const f = Math.max(0, Math.min(1, frac));
  switch (edge.n) {
    case 1: // M214 56 H278
      return { x: 214 + f * 64, y: 56 };
    case 2: // M468 56 H532
      return { x: 468 + f * 64, y: 56 };
    case 3: // M722 56 H786
      return { x: 722 + f * 64, y: 56 };
    case 4: // M627 88 V152
      return { x: 627, y: 88 + f * 64 };
    case 5: // M627 216 V280
      return { x: 627, y: 216 + f * 64 };
    case 6: // M722 184 H786
      return { x: 722 + f * 64, y: 184 };
    case 7: { // M577 88 V120 H373 V152 (len: 32 + 204 + 32 = 268)
      const d = f * 268;
      if (d <= 32) return { x: 577, y: 88 + d };
      if (d <= 236) return { x: 577 - (d - 32), y: 120 };
      return { x: 373, y: 120 + (d - 236) };
    }
    case 8: // M373 216 V280
      return { x: 373, y: 216 + f * 64 };
    case 9: // M373 520 V584
      return { x: 373, y: 520 + f * 64 };
    case 10: // M119 584 V456 (travels upwards from users into Nginx)
      return { x: 119, y: 584 - f * 128 };
    case 11: // M627 520 V584
      return { x: 627, y: 520 + f * 64 };
    case 12: // M881 500 V584
      return { x: 881, y: 500 + f * 84 };
    default:
      return { x: edge.bx, y: edge.by };
  }
}

const STEPS = [
  {
    title: "Push & CI",
    text: "A developer pushes code. GitHub Actions starts the pipeline and Trivy scans code and images for vulnerabilities.",
  },
  {
    title: "Provision",
    text: "The pipeline triggers Terraform to provision the AWS EC2 host and configure the AWS IAM instance role.",
  },
  {
    title: "Configure & deploy",
    text: "Ansible configures the server and deploys the app; Docker Compose boots containers while CloudWatch monitors host logs and metrics.",
  },
  {
    title: "Serve & report",
    text: "Users reach the app over HTTPS. Cron jobs run security scans, archive PDF reports in Amazon S3, and dispatch email alerts to hello@piyushprasad.in.",
  },
];

const NARROW_STEPS: {
  services: {
    name: string;
    logo?: string;
    fb: string;
    ref?: boolean;
    sub?: string;
  }[];
}[] = [
  {
    services: [
      { name: "Developer", fb: "DEV" },
      { name: "GitHub", logo: "github", fb: "GH" },
      { name: "GitHub Actions", logo: "githubactions", fb: "CI" },
      { name: "Trivy", logo: "trivy", fb: "TR" },
    ],
  },
  {
    services: [
      { name: "Terraform", logo: "terraform", fb: "TF", ref: true },
      { name: "AWS IAM (instance role)", logo: "aws-iam", fb: "IAM", ref: true },
      { name: "AWS (EC2 host)", logo: "aws-ec2", fb: "EC2" },
    ],
  },
  {
    services: [
      { name: "Ansible", logo: "ansible", fb: "AN" },
      { name: "EC2 host", logo: "aws-ec2", fb: "EC2" },
      { name: "CloudWatch (logs & metrics)", logo: "aws-cloudwatch", fb: "CW", ref: true },
      { name: "Docker Compose", logo: "docker", fb: "DK" },
      { name: "Nginx · App · DB", logo: "nginx", fb: "NG" },
    ],
  },
  {
    services: [
      { name: "Users · HTTPS", fb: "WEB" },
      { name: "Cron automation", fb: "CRON" },
      { name: "Amazon S3 (PDF archive)", logo: "aws-s3", fb: "S3", ref: true },
      { name: "Email → hello@piyushprasad.in", logo: "mail", fb: "@" },
    ],
  },
];

const logo = (key?: string) => (key ? TECH_LOGO_REGISTRY[key]?.src : undefined);

// ---------------------------------------------------------------------------
// SVG pieces
// ---------------------------------------------------------------------------
function Tile({ x, y, size = 28, href, fb }: { x: number; y: number; size?: number; href?: string; fb: string }) {
  return (
    <g>
      <rect x={x} y={y} width={size} height={size} rx={7} className={href ? "hir-tile hir-tile-img" : "hir-tile"} />
      {href ? (
        <image href={href} x={x + 5} y={y + 5} width={size - 10} height={size - 10} preserveAspectRatio="xMidYMid meet" />
      ) : (
        <text x={x + size / 2} y={y + size / 2 + 3} textAnchor="middle" className="hir-mono hir-ink" fontSize={fb.length > 2 ? 8 : 9.5} fontWeight={700}>
          {fb}
        </text>
      )}
    </g>
  );
}

function Badge({ x, y, n, on }: { x: number; y: number; n: number; on: boolean }) {
  return (
    <g className={on ? "hir-badge hir-badge-on" : "hir-badge"}>
      <circle cx={x} cy={y} r={10} />
      <text x={x} y={y + 3.8} textAnchor="middle">
        {n}
      </text>
    </g>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function HowItRuns() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState<Speed>(1.5);
  const [progressRatio, setProgressRatio] = useState(0);
  const [visible, setVisible] = useState(false);
  const [hover, setHover] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [tabHidden, setTabHidden] = useState(false);
  const [narrow, setNarrow] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const elapsedRef = useRef(0);
  const lastTimeRef = useRef<number | null>(null);
  const speedRef = useRef<Speed>(1.5);
  speedRef.current = speed;

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

  // Continuous animation loop that keeps dots, connectors, and steps in exact sync
  useEffect(() => {
    if (!running) {
      lastTimeRef.current = null;
      return;
    }

    let rafId: number;

    const tick = (now: number) => {
      if (lastTimeRef.current !== null) {
        const delta = Math.min(100, now - lastTimeRef.current) * speedRef.current;
        elapsedRef.current += delta;
        if (elapsedRef.current >= HOW_IT_RUNS_TIMING.stepMs) {
          elapsedRef.current %= HOW_IT_RUNS_TIMING.stepMs;
          setStep((prev) => (prev + 1) % STEPS.length);
        }
        setProgressRatio(elapsedRef.current / HOW_IT_RUNS_TIMING.stepMs);
      }
      lastTimeRef.current = now;
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafId);
      lastTimeRef.current = null;
    };
  }, [running]);

  useEffect(
    () => () => {
      if (resumeTimer.current) clearTimeout(resumeTimer.current);
    },
    [],
  );

  const jump = useCallback((i: number) => {
    setStep(i);
    elapsedRef.current = 0;
    setProgressRatio(0);
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

  // Calculate moving packet position along the active step's edges
  const stepEdges = EDGES.filter((e) => e.step === s);
  const totalLength = stepEdges.reduce((sum, e) => sum + e.len, 0);
  const currentDist = progressRatio * totalLength;

  let activeEdge = stepEdges[0] || EDGES[0];
  let edgeFrac = 0;
  let accumulated = 0;

  for (const edge of stepEdges) {
    if (currentDist <= accumulated + edge.len || edge === stepEdges[stepEdges.length - 1]) {
      activeEdge = edge;
      edgeFrac = edge.len > 0 ? (currentDist - accumulated) / edge.len : 0;
      break;
    }
    accumulated += edge.len;
  }

  const packetPos = getPointOnEdge(activeEdge, edgeFrac);

  const ariaLabel =
    "Reference workflow: a developer pushes to GitHub, GitHub Actions runs Trivy and Terraform, provisioning an EC2 host with an AWS IAM instance role, Ansible deploys Docker containers, CloudWatch monitors EC2 host logs and metrics, Amazon S3 stores archived PDF reports, users reach the app over HTTPS, and cron jobs send automated reports and alerts to hello@piyushprasad.in.";

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
          {/* Compact Speed Selector */}
          <div className="hir-speed-group" role="group" aria-label="Animation speed">
            {SPEEDS.map((rate) => (
              <button
                key={rate}
                type="button"
                className={`hir-speed-btn ${speed === rate ? "hir-speed-btn-on" : ""}`}
                aria-pressed={speed === rate}
                aria-label={`${rate}x speed`}
                onClick={() => setSpeed(rate)}
              >
                {rate}×
              </button>
            ))}
          </div>

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

      {/* Step Tabs with progress sync */}
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
                <strong>{STEPS[i].title}</strong>
              </div>
              <div className="hir-chips">
                {st.services.map((sv) => (
                  <span key={sv.name} className={`hir-chip-html ${sv.ref ? "hir-chip-ref" : ""}`}>
                    {logo(sv.logo) ? <img src={logo(sv.logo)} alt="" width={16} height={16} /> : <em>{sv.fb}</em>}
                    {sv.name}
                  </span>
                ))}
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <svg className="hir-svg" viewBox="0 0 1000 664" role="img" aria-label={ariaLabel} preserveAspectRatio="xMidYMin meet">
          <defs>
            <marker id="hir-ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" className="hir-arrow" />
            </marker>
            <filter id="hir-glow" x="-150%" y="-150%" width="400%" height="400%">
              <feGaussianBlur stdDeviation="3" />
            </filter>
          </defs>

          {/* AWS group: EC2 host running Docker Compose & Cron automation */}
          <g className={dim([1, 2, 3])}>
            <rect x="24" y="280" width="952" height="240" rx="14" className={`hir-group ${s === 1 || s === 2 ? "hir-group-on" : ""}`}>
              <title>AWS environment (EC2 host)</title>
            </rect>
            <Tile x={40} y={290} size={26} href={logo("aws")} fb="AWS" />
            <text x="74" y="308" className="hir-name">
              AWS · EC2 host
            </text>
            <text x="960" y="308" textAnchor="end" className="hir-mono hir-muted" fontSize={10}>
              Ubuntu · ap-south-1
            </text>

            {/* Docker Compose block */}
            <rect x="64" y="330" width="560" height="170" rx="10" className="hir-block" />
            <image href={logo("docker")} x="80" y="341" width="20" height="20" preserveAspectRatio="xMidYMid meet" />
            <text x="108" y="356" className="hir-name" fontSize={12}>
              Docker Compose
            </text>
            <text x="608" y="356" textAnchor="end" className="hir-mono hir-muted" fontSize={10}>
              3 containers
            </text>
            {[
              { x: 84, name: "Nginx", sub: "reverse proxy · TLS", logo: "nginx", fb: "NG" },
              { x: 268, name: "App", sub: "React + Node API", logo: "nodejs", fb: "APP" },
              { x: 452, name: "Database", sub: "MongoDB / SQLite", logo: "mongodb", fb: "DB" },
            ].map((c, i) => (
              <g key={c.name} className={isOn([2, 3]) ? "hir-in" : "hir-off"} style={{ animationDelay: `${i * 150}ms` }}>
                <rect x={c.x} y={392} width={164} height={64} rx={9} className="hir-chip" />
                <circle cx={c.x + 152} cy={404} r={3} className="hir-dot" />
                <Tile x={c.x + 10} y={404} size={28} href={logo(c.logo)} fb={c.fb} />
                <text x={c.x + 46} y={425} className="hir-name" fontSize={12}>
                  {c.name}
                </text>
                <text x={c.x + 46} y={440} className="hir-mono hir-muted" fontSize={8.5}>
                  {c.sub}
                </text>
              </g>
            ))}

            {/* Cron automation block */}
            <rect x="648" y="330" width="288" height="170" rx="10" className="hir-block" />
            <text x="664" y="356" className="hir-name" fontSize={12}>
              Cron automation
            </text>
            <text x="920" y="356" textAnchor="end" className="hir-mono hir-muted" fontSize={10}>
              scheduled
            </text>
            {[
              { y: 372, t: "Trivy scan → report", logo: "trivy", fb: "TR" },
              { y: 410, t: "PDF report → S3 archive", logo: "pdf", fb: "PDF" },
              { y: 448, t: "Alerts → hello@piyushprasad.in", logo: "mail", fb: "@" },
            ].map((r, i) => (
              <g key={r.t} className={s === 3 || reduced ? "hir-in" : "hir-off"} style={{ animationDelay: `${i * 150}ms` }}>
                <rect x={664} y={r.y} width={256} height={32} rx={8} className="hir-chip" />
                <Tile x={670} y={r.y + 4} size={24} href={logo(r.logo)} fb={r.fb} />
                <text x={702} y={r.y + 20} className="hir-mono hir-ink" fontSize={9.5}>
                  {r.t}
                </text>
              </g>
            ))}
          </g>

          {/* Lines: ONE dashed path per connection with speed-synced stroke-dash animation */}
          {EDGES.map((e) => (
            <g key={e.n} className={dim([e.step])}>
              <path
                d={e.d}
                className={`hir-line ${animate ? "hir-flow" : ""}`}
                markerEnd="url(#hir-ah)"
                style={{
                  animationDuration: `${12 / speed}s`,
                  animationPlayState: running ? "running" : "paused",
                }}
              >
                <title>{e.tip}</title>
              </path>
              {e.label && (
                <text x={e.label.x} y={e.label.y} className="hir-mono hir-muted" fontSize={9.5}>
                  {e.label.t}
                </text>
              )}
            </g>
          ))}

          {/* Nodes */}
          {NODES.map((n) => (
            <g key={n.id} className={dim(n.steps)}>
              <rect
                x={n.x}
                y={n.y}
                width={n.w}
                height={n.h}
                rx={11}
                className={`hir-node ${n.ref ? "hir-node-ref" : ""} ${isOn(n.steps) && !reduced ? "hir-node-on" : ""}`}
              >
                <title>{n.tip}</title>
              </rect>
              <Tile x={n.x + 12} y={n.y + 18} size={28} href={logo(n.logo)} fb={n.fb} />
              <text x={n.x + 48} y={n.y + 30} className="hir-name">
                {n.name}
              </text>
              <text x={n.x + 48} y={n.y + 46} className="hir-mono hir-muted" fontSize={9}>
                {n.sub}
              </text>
            </g>
          ))}

          {/* Badges: ON their own line, away from arrowheads */}
          {EDGES.map((e) => (
            <Badge key={e.n} x={e.bx} y={e.by} n={e.n} on={e.step === s && !reduced} />
          ))}

          {/* Moving packet dot: smoothly moves along active edges in lockstep with speed */}
          {animate && (
            <g className="hir-packet">
              <circle
                cx={packetPos.x}
                cy={packetPos.y}
                r="9"
                className="hir-packet-glow"
                filter="url(#hir-glow)"
                opacity="0.45"
              />
              <circle
                cx={packetPos.x}
                cy={packetPos.y}
                r="4"
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
  --hir-ok:#16A34A; --hir-on:#FFFFFF;
  background:var(--hir-bg); border:1px solid var(--hir-border); border-radius:14px; padding:24px 24px 16px;
  color:var(--hir-text); width:100%; box-sizing:border-box;
  scroll-margin-top:calc(var(--site-header-h,60px) + 12px);
}
.dark .hir,[data-theme="dark"] .hir{
  --hir-bg:var(--card,#121316); --hir-surf:var(--background,#0E0F12); --hir-soft-bg:var(--surface-muted,#1A1B20);
  --hir-text:var(--foreground,#EDEDED); --hir-muted:var(--muted-foreground,#9E9E9E);
  --hir-border:var(--border,#262626); --hir-acc:var(--accent-teal,#2DD4BF); --hir-acc-soft:#0F2A27;
  --hir-ok:#22C55E; --hir-on:#0B1412;
}
.hir-head{display:flex;align-items:flex-start;gap:16px;flex-wrap:wrap;justify-content:space-between}
.hir-head>div:first-child{flex:1 1 auto}
.hir-eyebrow{margin:0 0 4px;font:600 10px/1 ui-monospace,Menlo,monospace;letter-spacing:.14em;text-transform:uppercase;color:var(--hir-acc)}
.hir-title{margin:0;font-size:20px;font-weight:700;line-height:1.2;color:var(--hir-text)}
.hir-legend{display:flex;gap:16px;align-items:center;font:500 11px ui-monospace,Menlo,monospace;color:var(--hir-muted);padding-top:4px}
.hir-key{display:inline-block;width:18px;height:10px;border-radius:3px;margin-right:6px;vertical-align:-1px;border:1.5px solid var(--hir-acc)}
.hir-key-ref{border-style:dashed;border-color:var(--hir-muted)}
.hir-controls{display:inline-flex;align-items:center;gap:8px}
.hir-speed-group{display:inline-flex;align-items:center;background:var(--hir-surf);border:1px solid var(--hir-border);border-radius:8px;padding:2px;gap:2px}
.hir-speed-btn{border:0;background:none;font:600 10.5px/1 ui-monospace,Menlo,monospace;color:var(--hir-muted);padding:5px 8px;border-radius:6px;cursor:pointer;transition:all .15s ease}
.hir-speed-btn:hover{color:var(--hir-text);background:var(--hir-soft-bg)}
.hir-speed-btn-on{background:var(--hir-bg);color:var(--hir-acc);font-weight:700;box-shadow:0 1px 2px rgba(0,0,0,.05)}
.hir-btn{width:32px;height:32px;display:grid;place-items:center;border-radius:8px;border:1px solid var(--hir-border);background:var(--hir-surf);color:var(--hir-text);cursor:pointer;transition:all .15s ease}
.hir-btn:hover{background:var(--hir-soft-bg)}
.hir-btn:focus-visible,.hir-seg:focus-visible,.hir-speed-btn:focus-visible{outline:2px solid var(--hir-acc);outline-offset:2px}
.hir-steps{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:18px 0 12px}
.hir-seg{border:0;padding:0;background:none;cursor:pointer;text-align:left;color:var(--hir-muted)}
.hir-seg::before{content:"";display:block;height:5px;border-radius:3px;background:var(--hir-border);margin-bottom:8px}
.hir-seg-done::before{background:var(--hir-acc);opacity:.45}
.hir-seg-on::before{background:var(--hir-acc)}
.hir-seg-label{font:500 11.5px system-ui,sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:block}
.hir-seg-label b{font:600 10.5px ui-monospace,Menlo,monospace;color:var(--hir-acc);margin-right:4px}
.hir-seg-on .hir-seg-label{color:var(--hir-text);font-weight:600}
.hir-caption{margin:0 0 8px;min-height:22px;font-size:13px;line-height:1.5;color:var(--hir-muted)}
.hir-svg{display:block;width:100%;height:auto;max-height:calc(100dvh - var(--hir-chrome,250px))}
.hir-mono{font-family:ui-monospace,Menlo,monospace}
.hir-name{font:600 12.5px system-ui,-apple-system,Segoe UI,Roboto,sans-serif;fill:var(--hir-text)}
.hir-muted{fill:var(--hir-muted)}
.hir-ink{fill:var(--hir-text)}
.hir-node{fill:var(--hir-surf);stroke:var(--hir-border);transition:stroke .3s}
.hir-node-on{stroke:var(--hir-acc)}
.hir-node-ref{stroke-dasharray:5 4;stroke:var(--hir-muted)}
.hir-tile{fill:var(--hir-bg);stroke:var(--hir-border)}
.hir-tile-img{fill:#FFFFFF}
.hir-group{fill:var(--hir-soft-bg);stroke:var(--hir-border);transition:fill .4s,stroke .4s}
.hir-group-on{fill:var(--hir-acc-soft);stroke:var(--hir-acc);stroke-width:1.5}
.hir-block{fill:var(--hir-bg);stroke:var(--hir-border);stroke-dasharray:3 3}
.hir-chip{fill:var(--hir-surf);stroke:var(--hir-acc)}
.hir-dot{fill:var(--hir-ok)}
.hir-line{fill:none;stroke:var(--hir-acc);stroke-width:1.75;stroke-dasharray:6 4}
.hir-arrow{fill:var(--hir-acc)}
.hir-badge circle{fill:var(--hir-bg);stroke:var(--hir-acc);stroke-width:1.5;transition:fill .3s}
.hir-badge text{font:700 11px system-ui,sans-serif;fill:var(--hir-acc)}
.hir-badge-on circle{fill:var(--hir-acc)}
.hir-badge-on text{fill:var(--hir-on)}
.hir-dim{opacity:.55}
.hir g{transition:opacity .35s}
.hir-packet-glow{fill:var(--hir-acc)}
.hir-packet-dot{fill:var(--hir-acc);stroke:#FFFFFF;stroke-width:1}
.hir-flow{animation:hir-dash 12s linear infinite}
@keyframes hir-dash{to{stroke-dashoffset:-120}}
.hir-off{opacity:.3}
.hir-in{animation:hir-in .45s both}
@keyframes hir-in{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
.hir-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:10px}
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
@media (max-width:760px){
  .hir{padding:18px 16px 12px}
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
