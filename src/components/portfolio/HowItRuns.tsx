import { useCallback, useEffect, useRef, useState } from "react";
import { TECH_LOGO_REGISTRY } from "@/lib/tech-logo-registry";

/**
 * "How it runs" v2: a full-width reference workflow, source -> CI -> IaC -> AWS -> users.
 *
 * Geometry rule: every node, line, arrowhead, badge and packet lives in ONE SVG
 * coordinate system and every line is a straight or L-shaped path that starts and
 * ends exactly on a node border. Nothing is measured at runtime, so nothing drifts.
 * Under NARROW_PX the diagram is replaced by a compact 4-step list (same services).
 *
 * Solid node = used in my repositories. Dashed node = reference only (not in my repos).
 */

export const HOW_IT_RUNS_TIMING = {
  stepMs: 3600, // time per step (4 steps)
  pxPerSecond: 110, // packet speed
  resumeAfterClickMs: 8000, // auto-loop pause after a manual click
} as const;

const NARROW_PX = 760;

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
const ROW1 = 16;
const ROW2 = 128;

const NODES: Node[] = [
  { id: "dev", x: COL[0], y: ROW1, w: W, h: H, name: "Developer", sub: "git push", fb: "DEV", steps: [0], tip: "Pushes code to the repository" },
  { id: "gh", x: COL[1], y: ROW1, w: W, h: H, name: "GitHub", sub: "repository", logo: "github", fb: "GH", steps: [0], tip: "Source code and pull requests" },
  { id: "ci", x: COL[2], y: ROW1, w: W, h: H, name: "GitHub Actions", sub: "CI/CD pipeline", logo: "githubactions", fb: "CI", steps: [0, 1, 2], tip: "Builds, tests and starts every deployment" },
  { id: "trivy", x: COL[3], y: ROW1, w: W, h: H, name: "Trivy", sub: "vulnerability scan", logo: "trivy", fb: "TR", steps: [0], tip: "Scans the code and images for known vulnerabilities" },
  { id: "ans", x: COL[1], y: ROW2, w: W, h: H, name: "Ansible", sub: "configure + deploy", logo: "ansible", fb: "AN", steps: [2], tip: "ansible-playbook configures the server and deploys the app over SSH" },
  { id: "tf", x: COL[2], y: ROW2, w: W, h: H, name: "Terraform", sub: "reference · IaC", logo: "terraform", fb: "TF", steps: [1], ref: true, tip: "plan / apply creates the AWS resources as code (reference step)" },
  { id: "users", x: 71, y: 500, w: W, h: H, name: "Users", sub: "browser · HTTPS", fb: "WEB", steps: [3], tip: "Visitors reach the app over HTTPS" },
  { id: "mail", x: COL[3], y: 500, w: W, h: H, name: "Email", sub: "SMTP · Nodemailer", logo: "mail", fb: "@", steps: [3], tip: "Daily PDF report and alert emails" },
];

type Edge = { n: number; step: number; d: string; len: number; bx: number; by: number; tip: string; label?: { x: number; y: number; t: string } };

const EDGES: Edge[] = [
  { n: 1, step: 0, d: "M214 48 H278", len: 64, bx: 246, by: 48, tip: "git push to the repository" },
  { n: 2, step: 0, d: "M468 48 H532", len: 64, bx: 500, by: 48, tip: "A push or pull request triggers the workflow" },
  { n: 3, step: 0, d: "M722 48 H786", len: 64, bx: 754, by: 48, tip: "Security scan of the code and images" },
  { n: 4, step: 1, d: "M627 80 V128", len: 48, bx: 627, by: 104, tip: "Pipeline runs terraform plan and apply", label: { x: 643, y: 108, t: "plan · apply" } },
  { n: 5, step: 1, d: "M627 192 V240", len: 48, bx: 627, by: 216, tip: "Terraform creates the AWS environment", label: { x: 643, y: 220, t: "provision" } },
  { n: 6, step: 2, d: "M577 80 V104 H373 V128", len: 252, bx: 475, by: 104, tip: "Pipeline connects to the Ansible server over SSH" },
  { n: 7, step: 2, d: "M373 192 V240", len: 48, bx: 373, by: 216, tip: "ansible-playbook deploys to the EC2 host", label: { x: 389, y: 220, t: "deploy" } },
  { n: 8, step: 3, d: "M166 500 V416", len: 84, bx: 166, by: 476, tip: "Users reach Nginx over HTTPS", label: { x: 182, y: 480, t: "HTTPS" } },
  { n: 9, step: 3, d: "M881 440 V500", len: 60, bx: 881, by: 476, tip: "Cron jobs email the PDF report and alerts", label: { x: 897, y: 480, t: "SMTP" } },
];

const STEPS = [
  { title: "Push & CI", text: "A developer pushes code. GitHub Actions starts the pipeline and Trivy scans it for vulnerabilities." },
  { title: "Provision", text: "The pipeline runs Terraform to create the AWS infrastructure (reference step)." },
  { title: "Configure & deploy", text: "Ansible configures the EC2 server and deploys the app; Docker Compose starts the containers." },
  { title: "Serve & report", text: "Users reach the app over HTTPS through Nginx. Cron jobs scan, build the PDF report and email alerts." },
];

const NARROW_STEPS: { services: { name: string; logo?: string; fb: string; ref?: boolean }[] }[] = [
  { services: [{ name: "Developer", fb: "DEV" }, { name: "GitHub", logo: "github", fb: "GH" }, { name: "GitHub Actions", logo: "githubactions", fb: "CI" }, { name: "Trivy", logo: "trivy", fb: "TR" }] },
  { services: [{ name: "Terraform", logo: "terraform", fb: "TF", ref: true }, { name: "AWS", logo: "aws", fb: "AWS" }] },
  { services: [{ name: "Ansible", logo: "ansible", fb: "AN" }, { name: "EC2 host", logo: "aws-ec2", fb: "EC2" }, { name: "Docker Compose", logo: "docker", fb: "DK" }, { name: "Nginx · App · DB", logo: "nginx", fb: "NG" }] },
  { services: [{ name: "Users · HTTPS", fb: "WEB" }, { name: "Cron automation", fb: "CRON" }, { name: "Email (SMTP)", logo: "mail", fb: "@" }] },
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
        <text x={x + size / 2} y={y + size / 2 + 3} textAnchor="middle" className="hir-mono hir-ink" fontSize={fb.length > 2 ? 8.5 : 10} fontWeight={700}>
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

function Packet({ path, begin, dur }: { path: string; begin: number; dur: number }) {
  const props = { dur: `${dur}s`, begin: `${begin}s`, path, fill: "freeze" as const, calcMode: "spline" as const, keyTimes: "0;1", keySplines: "0.4 0 0.2 1" };
  return (
    <g>
      <circle r="9" className="hir-packet-glow" filter="url(#hir-glow)" opacity="0">
        <animateMotion {...props} />
        <set attributeName="opacity" to="0.45" begin={`${begin}s`} />
      </circle>
      <circle r="4" className="hir-packet-dot" opacity="0">
        <animateMotion {...props} />
        <set attributeName="opacity" to="1" begin={`${begin}s`} />
      </circle>
    </g>
  );
}

// ---------------------------------------------------------------------------
// Component
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

  useEffect(() => {
    const updateHeaderChrome = () => {
      const header = document.querySelector("header");
      const headerHeight = header ? Math.round(header.getBoundingClientRect().height) : 70;
      const el = rootRef.current;
      if (el) {
        el.style.setProperty("--hir-chrome", `${headerHeight + 178 + 12}px`);
        el.style.scrollMarginTop = `${headerHeight + 12}px`;
      }
    };
    updateHeaderChrome();
    window.addEventListener("resize", updateHeaderChrome);
    return () => window.removeEventListener("resize", updateHeaderChrome);
  }, []);

  const running = playing && visible && !hover && !tabHidden && !reduced;

  useEffect(() => {
    if (!running) return;
    const id = setTimeout(() => setStep((s) => (s + 1) % STEPS.length), HOW_IT_RUNS_TIMING.stepMs);
    return () => clearTimeout(id);
  }, [running, step]);

  useEffect(
    () => () => {
      if (resumeTimer.current) clearTimeout(resumeTimer.current);
    },
    [],
  );

  const jump = useCallback((i: number) => {
    setStep(i);
    setPlaying(false);
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => setPlaying(true), HOW_IT_RUNS_TIMING.resumeAfterClickMs);
  }, []);

  const s = reduced ? 3 : step;
  const isOn = (steps: number[]) => reduced || steps.includes(s);
  const dim = (steps: number[]) => (isOn(steps) ? "" : "hir-dim");
  const animate = !reduced && visible && playing;
  const groupActive = isOn([1, 2, 3]);

  // packets for the active step, one after another
  const packets: { path: string; begin: number; dur: number; key: string }[] = [];
  let t = 0;
  EDGES.filter((e) => e.step === s).forEach((e) => {
    const dur = Math.max(0.6, e.len / HOW_IT_RUNS_TIMING.pxPerSecond);
    packets.push({ path: e.d, begin: t, dur, key: `${s}-${e.n}` });
    t += dur + 0.1;
  });

  const ariaLabel =
    "Reference workflow: a developer pushes to GitHub, GitHub Actions runs Trivy and Terraform, Ansible deploys Docker containers to an AWS EC2 server, users reach it over HTTPS, and cron jobs email a daily PDF report.";

  return (
    <section
      id="how-it-runs"
      ref={rootRef}
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
        <button
          type="button"
          className="hir-btn"
          aria-pressed={!playing}
          aria-label={playing && !reduced ? "Pause animation" : "Play animation"}
          onClick={() => setPlaying((p) => !p)}
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
      </header>

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
        <svg className="hir-svg" viewBox="0 0 1000 580" role="img" aria-label={ariaLabel} preserveAspectRatio="xMidYMin meet">
          <defs>
            <marker id="hir-ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" className="hir-arrow" />
            </marker>
            <filter id="hir-glow" x="-150%" y="-150%" width="400%" height="400%">
              <feGaussianBlur stdDeviation="3" />
            </filter>
          </defs>

          {/* AWS group (real containment: EC2 host runs Docker + cron jobs) */}
          <g className={dim([1, 2, 3])}>
            <rect x="24" y="240" width="952" height="212" rx="14" className={`hir-group ${s === 1 || s === 2 ? "hir-group-on" : ""}`}>
              <title>AWS environment (EC2 host)</title>
            </rect>
            <Tile x={40} y={250} size={26} href={logo("aws")} fb="AWS" />
            <text x="74" y="268" className="hir-name">
              AWS · EC2 host
            </text>
            <text x="960" y="268" textAnchor="end" className="hir-mono hir-muted" fontSize={10}>
              Ubuntu · ap-south-1
            </text>

            {/* Docker Compose block */}
            <rect x="64" y="290" width="560" height="150" rx="10" className="hir-block" />
            <image href={logo("docker")} x="80" y="301" width="20" height="20" preserveAspectRatio="xMidYMid meet" />
            <text x="108" y="316" className="hir-name" fontSize={12}>
              Docker Compose
            </text>
            <text x="608" y="316" textAnchor="end" className="hir-mono hir-muted" fontSize={10}>
              3 containers
            </text>
            {[
              { x: 84, name: "Nginx", sub: "reverse proxy · TLS", logo: "nginx", fb: "NG" },
              { x: 268, name: "App", sub: "React + Node API", logo: "nodejs", fb: "APP" },
              { x: 452, name: "Database", sub: "MongoDB / SQLite", logo: "mongodb", fb: "DB" },
            ].map((c, i) => (
              <g key={c.name} className={isOn([2, 3]) ? "hir-in" : groupActive ? "hir-off" : ""} style={{ animationDelay: `${i * 150}ms` }}>
                <rect x={c.x} y={352} width={164} height={64} rx={9} className="hir-chip" />
                <circle cx={c.x + 152} cy={364} r={3} className="hir-dot" />
                <Tile x={c.x + 10} y={364} size={28} href={logo(c.logo)} fb={c.fb} />
                <text x={c.x + 46} y={385} className="hir-name" fontSize={12}>
                  {c.name}
                </text>
                <text x={c.x + 46} y={400} className="hir-mono hir-muted" fontSize={9.5}>
                  {c.sub}
                </text>
              </g>
            ))}

            {/* Cron automation block */}
            <rect x="648" y="290" width="288" height="150" rx="10" className="hir-block" />
            <text x="664" y="316" className="hir-name" fontSize={12}>
              Cron automation
            </text>
            <text x="920" y="316" textAnchor="end" className="hir-mono hir-muted" fontSize={10}>
              scheduled
            </text>
            {[
              { y: 330, t: "Trivy scan → report", logo: "trivy", fb: "TR" },
              { y: 364, t: "Daily PDF report (PDFKit)", logo: "pdf", fb: "PDF" },
              { y: 398, t: "Alert mail on failure", logo: "mail", fb: "@" },
            ].map((r, i) => (
              <g key={r.t} className={s === 3 || reduced ? "hir-in" : groupActive ? "hir-off" : ""} style={{ animationDelay: `${i * 150}ms` }}>
                <rect x={664} y={r.y} width={256} height={30} rx={8} className="hir-chip" />
                <Tile x={670} y={r.y + 4} size={22} href={logo(r.logo)} fb={r.fb} />
                <text x={702} y={r.y + 19} className="hir-mono hir-ink" fontSize={10.5}>
                  {r.t}
                </text>
              </g>
            ))}
          </g>

          {/* lines: ONE dashed path per connection */}
          {EDGES.map((e) => (
            <g key={e.n} className={dim([e.step])}>
              <path d={e.d} className={`hir-line ${animate ? "hir-flow" : ""}`} markerEnd="url(#hir-ah)">
                <title>{e.tip}</title>
              </path>
              {e.label && (
                <text x={e.label.x} y={e.label.y} className="hir-mono hir-muted" fontSize={10.5}>
                  {e.label.t}
                </text>
              )}
            </g>
          ))}

          {/* nodes */}
          {NODES.map((n) => (
            <g key={n.id} className={dim(n.steps)}>
              <rect x={n.x} y={n.y} width={n.w} height={n.h} rx={11} className={`hir-node ${n.ref ? "hir-node-ref" : ""} ${isOn(n.steps) && !reduced ? "hir-node-on" : ""}`}>
                <title>{n.tip}</title>
              </rect>
              <Tile x={n.x + 12} y={n.y + 18} size={28} href={logo(n.logo)} fb={n.fb} />
              <text x={n.x + 50} y={n.y + 30} className="hir-name">
                {n.name}
              </text>
              <text x={n.x + 50} y={n.y + 45} className="hir-mono hir-muted" fontSize={10.5}>
                {n.sub}
              </text>
            </g>
          ))}

          {/* badges: ON their own line, away from arrowheads */}
          {EDGES.map((e) => (
            <Badge key={e.n} x={e.bx} y={e.by} n={e.n} on={e.step === s && !reduced} />
          ))}

          {/* packets: same path data as the lines */}
          {animate && packets.map((p) => <Packet key={p.key} path={p.path} begin={p.begin} dur={p.dur} />)}
        </svg>
      )}
    </section>
  );
}

/* Scoped styles. Map the fallbacks to your tokens if the names differ. */
const CSS = `
.hir{
  --hir-bg:var(--card,#FFFFFF); --hir-surf:var(--background,#FAF9F6); --hir-soft-bg:var(--surface-muted,#F3F3ED);
  --hir-text:var(--foreground,#121316); --hir-muted:var(--muted-foreground,#5A5C66);
  --hir-border:var(--border,#E5E5DF); --hir-acc:var(--accent-teal,#0F766E); --hir-acc-soft:#E4F2F0;
  --hir-ok:#16A34A; --hir-on:#FFFFFF;
  --hir-chrome:260px;
  scroll-margin-top:calc(70px + 12px);
  background:var(--hir-bg); border:1px solid var(--hir-border); border-radius:14px; padding:18px 24px 12px;
  color:var(--hir-text); width:100%; box-sizing:border-box;
}
.dark .hir,[data-theme="dark"] .hir{
  --hir-bg:var(--card,#121316); --hir-surf:var(--background,#0E0F12); --hir-soft-bg:var(--surface-muted,#1A1B20);
  --hir-text:var(--foreground,#EDEDED); --hir-muted:var(--muted-foreground,#9E9E9E);
  --hir-border:var(--border,#262626); --hir-acc:var(--accent-teal,#2DD4BF); --hir-acc-soft:#0F2A27;
  --hir-ok:#22C55E; --hir-on:#0B1412;
}
.hir-head{display:flex;align-items:flex-start;gap:16px;flex-wrap:wrap}
.hir-head>div:first-child{flex:1 1 auto}
.hir-eyebrow{margin:0 0 4px;font:600 10px/1 ui-monospace,Menlo,monospace;letter-spacing:.14em;text-transform:uppercase;color:var(--hir-acc)}
.hir-title{margin:0;font-size:20px;font-weight:700;line-height:1.2;color:var(--hir-text)}
.hir-legend{display:flex;gap:16px;align-items:center;font:500 11px ui-monospace,Menlo,monospace;color:var(--hir-muted);padding-top:2px}
.hir-key{display:inline-block;width:18px;height:10px;border-radius:3px;margin-right:6px;vertical-align:-1px;border:1.5px solid var(--hir-acc)}
.hir-key-ref{border-style:dashed;border-color:var(--hir-muted)}
.hir-btn{width:32px;height:32px;display:grid;place-items:center;border-radius:8px;border:1px solid var(--hir-border);background:var(--hir-surf);color:var(--hir-text);cursor:pointer}
.hir-btn:focus-visible,.hir-seg:focus-visible{outline:2px solid var(--hir-acc);outline-offset:2px}
.hir-steps{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:12px 0 8px}
.hir-seg{border:0;padding:0;background:none;cursor:pointer;text-align:left;color:var(--hir-muted)}
.hir-seg::before{content:"";display:block;height:5px;border-radius:3px;background:var(--hir-border);margin-bottom:8px}
.hir-seg-done::before{background:var(--hir-acc);opacity:.45}
.hir-seg-on::before{background:var(--hir-acc)}
.hir-seg-label{font:500 11.5px system-ui,sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:block}
.hir-seg-label b{font:600 10.5px ui-monospace,Menlo,monospace;color:var(--hir-acc);margin-right:4px}
.hir-seg-on .hir-seg-label{color:var(--hir-text);font-weight:600}
.hir-caption{margin:0 0 6px;min-height:20px;font-size:12.5px;line-height:1.45;color:var(--hir-muted)}
/* The whole card must fit on one screen: the diagram is limited by the viewport height.
   --hir-chrome = sticky site header + card header/steps/caption + breathing room. */
.hir-svg{display:block;width:100%;height:auto;max-height:calc(100dvh - var(--hir-chrome,250px));min-height:380px}
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
.hir-dim{opacity:.6}
.hir g{transition:opacity .35s}
.hir-packet-glow{fill:var(--hir-acc)}
.hir-packet-dot{fill:var(--hir-acc)}
.hir-flow{animation:hir-dash 12s linear infinite}
@keyframes hir-dash{to{stroke-dashoffset:-120}}
.hir-off{opacity:.5}
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
@media (max-width:760px){.hir{padding:18px 16px 12px}.hir-steps{grid-template-columns:repeat(4,1fr);gap:6px}.hir-seg-label{display:none}.hir-legend{order:3;width:100%}}
@media (prefers-reduced-motion:reduce){
  .hir *{animation:none!important;transition:none!important}
  .hir-off{opacity:1}
}
`;
