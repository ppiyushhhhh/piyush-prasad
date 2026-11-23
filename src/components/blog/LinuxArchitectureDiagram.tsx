import { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Info,
  Terminal,
  Server,
  ShieldCheck,
  CheckCircle2,
  GitBranch,
  Cpu,
  Layers,
  FileCode,
  Lock,
} from "lucide-react";

interface LinuxNode {
  id: string;
  name: string;
  layer: "Deployment Pipeline" | "Server Host" | "Security & SSL" | "Runtime Traffic";
  pathOrPort: string;
  keyCommand: string;
  role: string;
  description: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

const LINUX_NODES: LinuxNode[] = [
  {
    id: "dev",
    name: "Developer Workstation",
    layer: "Deployment Pipeline",
    pathOrPort: "Local Git / SSH Keys",
    keyCommand: "git push origin main",
    role: "Pushes version-controlled commits to GitHub.",
    description: "Code edits and features are committed with Git and pushed over SSH to the remote repository.",
    x: 30,
    y: 80,
    w: 170,
    h: 76,
  },
  {
    id: "github",
    name: "GitHub Repository",
    layer: "Deployment Pipeline",
    pathOrPort: "github.com/org/repo",
    keyCommand: "Webhooks / Branch Protection",
    role: "Central source control with automated CI/CD triggers.",
    description: "Validates pull requests, enforces branch protection, and dispatches deployment workflows on approved commits.",
    x: 230,
    y: 80,
    w: 170,
    h: 76,
  },
  {
    id: "actions",
    name: "GitHub Actions CI/CD",
    layer: "Deployment Pipeline",
    pathOrPort: ".github/workflows/deploy.yml",
    keyCommand: "ssh -i key.pem ubuntu@ec2",
    role: "Executes test suites, builds production bundle, and triggers deploy.",
    description: "Runs automated linting, type-checking, and package compilation, then authenticates to the Ubuntu server via SSH keys.",
    x: 430,
    y: 80,
    w: 180,
    h: 76,
  },
  {
    id: "visitor",
    name: "Website Visitor",
    layer: "Runtime Traffic",
    pathOrPort: "Web Browser",
    keyCommand: "curl -I https://piyushprasad.in",
    role: "Visitor requesting web page over secure HTTPS.",
    description: "Users browser sends initial DNS query to resolve the domain, then connects to the server IP on port 443.",
    x: 30,
    y: 350,
    w: 170,
    h: 76,
  },
  {
    id: "dns",
    name: "DNS Resolution",
    layer: "Runtime Traffic",
    pathOrPort: "UDP 53 (Anycast)",
    keyCommand: "dig +short piyushprasad.in",
    role: "Resolves domain to the Ubuntu server public IP.",
    description: "Authoritative nameserver answers with the A Record pointing to the server public IPv4 address.",
    x: 230,
    y: 350,
    w: 170,
    h: 76,
  },
  {
    id: "ufw",
    name: "UFW Firewall & SSH",
    layer: "Security & SSL",
    pathOrPort: "Port 22, 80, 443 (iptables)",
    keyCommand: "sudo ufw status verbose",
    role: "Kernel-level firewall enforcing default-deny ingress policy.",
    description: "Blocks unauthorized ports. Permits only SSH (22), HTTP (80), and HTTPS (443). Restricts brute force attempts via fail2ban.",
    x: 430,
    y: 350,
    w: 180,
    h: 76,
  },
  {
    id: "nginx",
    name: "Nginx Reverse Proxy",
    layer: "Server Host",
    pathOrPort: "/etc/nginx/sites-available",
    keyCommand: "sudo nginx -t && systemctl reload nginx",
    role: "Reverse proxy handling SSL termination and routing.",
    description: "Terminates HTTPS traffic, serves static assets with aggressive caching headers, and proxies application queries to localhost:3000.",
    x: 650,
    y: 260,
    w: 190,
    h: 84,
  },
  {
    id: "certbot",
    name: "Certbot (Let's Encrypt)",
    layer: "Security & SSL",
    pathOrPort: "/etc/letsencrypt/live",
    keyCommand: "sudo certbot renew --dry-run",
    role: "Automated TLS certificate issuance and cron renewal.",
    description: "Manages 90-day Let's Encrypt SSL certificates, handles ACME challenges, and executes automatic renewals via systemd timers.",
    x: 650,
    y: 130,
    w: 190,
    h: 76,
  },
  {
    id: "app",
    name: "Application Runtime",
    layer: "Server Host",
    pathOrPort: "127.0.0.1:3000 (PM2 / Docker)",
    keyCommand: "pm2 status / docker ps",
    role: "Node.js / Docker production container hosting web server.",
    description: "Runs the production application server on an internal loopback port. Monitored by systemd or PM2 with auto-restart on crashes.",
    x: 650,
    y: 390,
    w: 190,
    h: 84,
  },
];

const LINUX_STEPS = [
  {
    step: 1,
    title: "1. Code Commit & CI/CD Push",
    summary: "Developer pushes code to GitHub repository.",
    detail: "A push to main triggers automated CI pipeline with branch protection.",
    activeNodes: ["dev", "github", "actions"],
  },
  {
    step: 2,
    title: "2. SSH Deployment to Ubuntu EC2",
    summary: "GitHub Actions deploys latest build over SSH.",
    detail: "SSH authentication using private key, pulls latest files, runs npm build, and restarts PM2 service.",
    activeNodes: ["actions", "app"],
  },
  {
    step: 3,
    title: "3. Visitor Resolves Domain (DNS)",
    summary: "Website visitor looks up server IP via DNS.",
    detail: "Browser resolves domain to the server public IP address before issuing HTTPS connection.",
    activeNodes: ["visitor", "dns"],
  },
  {
    step: 4,
    title: "4. Ingress Filtered by UFW Firewall",
    summary: "Traffic reaches server and is filtered by UFW.",
    detail: "UFW verifies traffic is targeting allowed ports (80 or 443). Non-whitelisted ports are dropped.",
    activeNodes: ["dns", "ufw"],
  },
  {
    step: 5,
    title: "5. Nginx Terminates SSL & Proxies",
    summary: "Nginx validates SSL certificate and proxies to app.",
    detail: "Certbot SSL certificate encrypts session. Nginx forwards request to internal port 127.0.0.1:3000.",
    activeNodes: ["ufw", "nginx", "certbot"],
  },
  {
    step: 6,
    title: "6. Fast Response Rendered to Visitor",
    summary: "Application generates response and delivers to visitor.",
    detail: "Nginx compresses with gzip/brotli and streams HTTP 200 OK back to browser.",
    activeNodes: ["app", "nginx", "visitor"],
  },
];

export function LinuxArchitectureDiagram() {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [selectedNode, setSelectedNode] = useState<LinuxNode>(LINUX_NODES[6]); // Nginx default
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentStep((prev) => (prev + 1) % LINUX_STEPS.length);
      }, 3000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying]);

  const activeStep = LINUX_STEPS[currentStep];

  const handleNext = () => {
    setIsPlaying(false);
    setCurrentStep((prev) => (prev + 1) % LINUX_STEPS.length);
  };

  const handlePrev = () => {
    setIsPlaying(false);
    setCurrentStep((prev) => (prev - 1 + LINUX_STEPS.length) % LINUX_STEPS.length);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
    setZoomLevel(1);
  };

  return (
    <div className="border border-border bg-surface my-8 overflow-hidden shadow-xs">
      {/* Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between border-b border-border bg-surface-muted/50 p-4 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-accent" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-text">
              Linux Server Architecture: CI/CD Deployment &amp; Nginx Runtime
            </h3>
          </div>
          <p className="text-xs text-text-muted mt-0.5">
            Stage {activeStep.step} of 6:{" "}
            <span className="font-semibold text-accent">{activeStep.title}</span>
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="inline-flex items-center gap-1.5 border border-border bg-surface px-2.5 py-1.5 text-xs font-semibold text-text hover:border-accent hover:text-accent cursor-pointer transition-colors"
          >
            {isPlaying ? (
              <>
                <Pause className="h-3.5 w-3.5 text-accent" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 text-accent" />
                <span>Play Flow</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handlePrev}
            className="inline-flex h-8 w-8 items-center justify-center border border-border bg-surface text-text hover:border-accent cursor-pointer"
            title="Previous"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="inline-flex h-8 w-8 items-center justify-center border border-border bg-surface text-text hover:border-accent cursor-pointer"
            title="Next"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="inline-flex h-8 w-8 items-center justify-center border border-border bg-surface text-text hover:border-accent cursor-pointer"
            title="Reset"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>

          <div className="h-4 w-px bg-border mx-1" />

          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.min(1.3, z + 0.1))}
            className="inline-flex h-8 w-8 items-center justify-center border border-border bg-surface text-text hover:border-accent cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.max(0.8, z - 0.1))}
            className="inline-flex h-8 w-8 items-center justify-center border border-border bg-surface text-text hover:border-accent cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setZoomLevel(1)}
            className="inline-flex items-center gap-1 border border-border bg-surface px-2 py-1 text-[11px] font-mono text-text hover:border-accent cursor-pointer"
            title="Fit to Screen"
          >
            <Maximize2 className="h-3 w-3" />
            <span>Fit</span>
          </button>
        </div>
      </div>

      {/* Step Buttons */}
      <div className="grid grid-cols-3 sm:grid-cols-6 border-b border-border bg-background">
        {LINUX_STEPS.map((s, idx) => {
          const isActive = idx === currentStep;
          const isDone = idx < currentStep;
          return (
            <button
              key={s.step}
              type="button"
              onClick={() => {
                setIsPlaying(false);
                setCurrentStep(idx);
              }}
              className={`p-2 text-left border-r border-border transition-all cursor-pointer ${
                isActive
                  ? "bg-accent/10 border-b-2 border-b-accent"
                  : isDone
                    ? "bg-surface text-text-muted hover:bg-surface-muted"
                    : "bg-surface-muted/30 text-text-muted hover:bg-surface-muted"
              }`}
            >
              <div className="flex items-center gap-1">
                <span
                  className={`mono text-[10px] font-bold ${
                    isActive ? "text-accent" : isDone ? "text-success" : "text-text-muted"
                  }`}
                >
                  Step {s.step}
                </span>
                {isDone && <CheckCircle2 className="h-2.5 w-2.5 text-success ml-auto" />}
              </div>
              <div
                className={`text-[10px] truncate ${
                  isActive ? "font-semibold text-text" : "text-text-muted"
                }`}
              >
                {s.title.split(". ")[1]}
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Canvas & Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
        <div className="lg:col-span-8 p-4 overflow-x-auto bg-background/50 flex items-center justify-center">
          <div
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: "center center",
              transition: "transform 0.2s ease-out",
            }}
            className="w-full max-w-[950px]"
          >
            <svg
              viewBox="0 0 950 510"
              className="w-full h-auto select-none font-sans"
              style={{ minWidth: "750px" }}
            >
              <defs>
                <marker
                  id="linux-arrow"
                  viewBox="0 0 10 10"
                  refX="6"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 8 5 L 0 9 z" fill="#1A4BFF" />
                </marker>
                <marker
                  id="linux-http-arrow"
                  viewBox="0 0 10 10"
                  refX="6"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 8 5 L 0 9 z" fill="#16A34A" />
                </marker>
              </defs>

              {/* Background grid */}
              <pattern id="linux-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E5E5DF" strokeWidth="0.5" />
              </pattern>
              <rect width="950" height="510" fill="url(#linux-grid)" opacity="0.4" />

              {/* Deployment Pipeline Boundary (Top Lane) */}
              <rect
                x="20"
                y="30"
                width="600"
                height="150"
                fill="#F8FAFC"
                stroke="#1A4BFF"
                strokeWidth="1.2"
                strokeDasharray="4 4"
                rx="8"
              />
              <text x="32" y="52" className="mono text-[10px] font-bold fill-accent">
                PIPELINE 1: CI/CD DEPLOYMENT WORKFLOW (SSH / GIT)
              </text>

              {/* Public Runtime Request Lane (Bottom Lane) */}
              <rect
                x="20"
                y="300"
                width="600"
                height="150"
                fill="#F0FDF4"
                fillOpacity="0.4"
                stroke="#16A34A"
                strokeWidth="1.2"
                strokeDasharray="4 4"
                rx="8"
              />
              <text x="32" y="322" className="mono text-[10px] font-bold fill-success">
                PIPELINE 2: LIVE USER TRAFFIC FLOW (HTTPS / PORT 443)
              </text>

              {/* Ubuntu 24.04 Server Host Box (Right) */}
              <rect
                x="635"
                y="30"
                width="295"
                height="460"
                fill="#FAF9F6"
                stroke="#121316"
                strokeWidth="1.5"
                rx="10"
              />
              <text x="650" y="55" className="mono text-[11px] font-bold fill-text">
                UBUNTU 24.04 LTS HOST (AWS EC2)
              </text>
              <text x="650" y="70" className="mono text-[9px] fill-text-muted">
                systemd · UFW Firewall · Nginx · Node.js
              </text>

              {/* Connectors - Pipeline 1 */}
              <path
                d="M 200 118 L 230 118"
                stroke="#1A4BFF"
                strokeWidth="2"
                markerEnd="url(#linux-arrow)"
                opacity={currentStep === 0 ? 1 : 0.4}
              />
              <path
                d="M 400 118 L 430 118"
                stroke="#1A4BFF"
                strokeWidth="2"
                markerEnd="url(#linux-arrow)"
                opacity={currentStep === 0 ? 1 : 0.4}
              />
              <path
                d="M 610 118 C 630 118, 630 420, 650 420"
                stroke="#1A4BFF"
                strokeWidth="2"
                strokeDasharray="4 4"
                fill="none"
                markerEnd="url(#linux-arrow)"
                opacity={currentStep === 1 ? 1 : 0.3}
              />

              {/* Connectors - Pipeline 2 */}
              <path
                d="M 200 388 L 230 388"
                stroke="#16A34A"
                strokeWidth="2"
                markerEnd="url(#linux-http-arrow)"
                opacity={currentStep === 2 ? 1 : 0.4}
              />
              <path
                d="M 400 388 L 430 388"
                stroke="#16A34A"
                strokeWidth="2"
                markerEnd="url(#linux-http-arrow)"
                opacity={currentStep === 3 ? 1 : 0.4}
              />
              <path
                d="M 610 388 C 630 388, 630 302, 650 302"
                stroke="#16A34A"
                strokeWidth="2.5"
                fill="none"
                markerEnd="url(#linux-http-arrow)"
                opacity={currentStep === 4 ? 1 : 0.4}
              />

              {/* Nginx <-> Certbot */}
              <path
                d="M 745 260 L 745 206"
                stroke="#94A3B8"
                strokeWidth="1.5"
                strokeDasharray="3 3"
                opacity="0.6"
              />

              {/* Nginx -> App (Internal proxy) */}
              <path
                d="M 745 344 L 745 390"
                stroke="#16A34A"
                strokeWidth="2"
                markerEnd="url(#linux-http-arrow)"
                opacity={currentStep === 4 || currentStep === 5 ? 1 : 0.4}
              />

              {/* Render Nodes */}
              {LINUX_NODES.map((node) => {
                const isSelected = selectedNode.id === node.id;
                const isStepActive = activeStep.activeNodes.includes(node.id);

                return (
                  <g
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    className="cursor-pointer transition-all"
                  >
                    {isStepActive && (
                      <rect
                        x={node.x - 3}
                        y={node.y - 3}
                        width={node.w + 6}
                        height={node.h + 6}
                        rx="8"
                        fill="none"
                        stroke="#1A4BFF"
                        strokeWidth="2"
                        className="animate-pulse"
                      />
                    )}

                    <rect
                      x={node.x}
                      y={node.y}
                      width={node.w}
                      height={node.h}
                      rx="6"
                      fill={isSelected ? "#FFFFFF" : isStepActive ? "#FFFFFF" : "#FAF9F6"}
                      stroke={isSelected ? "#1A4BFF" : isStepActive ? "#1A4BFF" : "#E5E5DF"}
                      strokeWidth={isSelected ? "2" : "1"}
                    />

                    {/* Node Header band */}
                    <rect
                      x={node.x}
                      y={node.y}
                      width={node.w}
                      height="20"
                      rx="6"
                      fill={isStepActive ? "#EEF2FF" : "#F3F3ED"}
                    />

                    <text
                      x={node.x + 8}
                      y={node.y + 14}
                      className="mono text-[10px] font-bold"
                      fill={isStepActive ? "#1A4BFF" : "#121316"}
                    >
                      {node.name}
                    </text>

                    <text
                      x={node.x + 8}
                      y={node.y + 36}
                      className="mono text-[9px] font-semibold"
                      fill="#5A5C66"
                    >
                      {node.pathOrPort}
                    </text>

                    <text
                      x={node.x + 8}
                      y={node.y + 52}
                      className="mono text-[8.5px] truncate font-medium"
                      fill="#1A4BFF"
                    >
                      $ {node.keyCommand.slice(0, 24)}...
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Inspector Sidebar */}
        <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-border bg-surface p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-accent" />
              <h4 className="mono text-xs font-bold uppercase tracking-wider text-text">
                Linux Inspector
              </h4>
            </div>
            <span className="mono text-[10px] px-2 py-0.5 border border-border bg-surface-muted text-accent">
              CLICK ANY COMPONENT
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <span className="mono text-[10px] uppercase text-text-muted">Node</span>
              <h3 className="text-sm font-bold text-text mt-0.5">{selectedNode.name}</h3>
              <p className="text-xs text-accent font-medium">{selectedNode.layer}</p>
            </div>

            <div className="p-2.5 border border-border bg-surface-muted/40 space-y-1">
              <span className="mono text-[9px] uppercase text-text-muted block">Location / Port</span>
              <div className="mono text-xs font-bold text-text">{selectedNode.pathOrPort}</div>
            </div>

            <div className="p-2.5 border border-border bg-surface-muted/40 space-y-1">
              <span className="mono text-[9px] uppercase text-text-muted block">Typical Admin Command</span>
              <div className="mono text-[11px] font-bold text-accent bg-background p-2 border border-border">
                {selectedNode.keyCommand}
              </div>
            </div>

            <div className="space-y-1">
              <span className="mono text-[10px] uppercase text-text-muted">Architectural Role</span>
              <p className="text-xs text-text leading-relaxed bg-background p-2.5 border border-border">
                {selectedNode.role}
              </p>
            </div>

            <div className="space-y-1">
              <span className="mono text-[10px] uppercase text-text-muted">Technical Overview</span>
              <p className="text-xs text-text-muted leading-relaxed">
                {selectedNode.description}
              </p>
            </div>
          </div>

          {/* Current Step Callout */}
          <div className="mt-4 pt-4 border-t border-border">
            <span className="mono text-[10px] font-bold uppercase tracking-wider text-accent block mb-1">
              Active Stage
            </span>
            <div className="border border-accent/20 bg-accent-soft p-3">
              <div className="text-xs font-bold text-accent">{activeStep.title}</div>
              <p className="text-xs text-text mt-1">{activeStep.summary}</p>
              <p className="text-[11px] text-text-muted mt-1.5 font-mono">
                {activeStep.detail}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-between border-t border-border bg-surface-muted/30 px-4 py-2.5 text-xs text-text-muted gap-3">
        <div className="flex items-center gap-6 font-mono text-[11px]">
          <span className="flex items-center gap-2">
            <span className="h-0.5 w-5 bg-accent" />
            <span>CI/CD Deployment Flow</span>
          </span>
          <span className="flex items-center gap-2">
            <span className="h-1 w-5 bg-success rounded-full" />
            <span>Live Web Traffic Flow (HTTPS)</span>
          </span>
        </div>
        <div className="mono text-[11px] text-text-muted">
          Ubuntu 24.04 LTS · Nginx Reverse Proxy
        </div>
      </div>
    </div>
  );
}
