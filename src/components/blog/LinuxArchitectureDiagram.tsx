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
  Terminal,
  Server,
  GitBranch,
  Globe,
  CheckCircle2,
  Laptop,
  Layers,
  Gauge,
  Lock,
} from "lucide-react";

interface LinuxStep {
  stepNumber: number;
  stage: "Code Deployment Flow" | "Live Website Traffic";
  activeNodeId: string;
  sourceNodeId?: string;
  targetNodeId?: string;
  title: string;
  whatIsHappening: string;
  whyImportant: string;
  realWorldExample: string;
}

const LINUX_STEPS: LinuxStep[] = [
  {
    stepNumber: 1,
    stage: "Code Deployment Flow",
    activeNodeId: "developer",
    title: "1. Developer Pushes Code",
    whatIsHappening:
      'The developer writes website updates on their laptop and runs "git push origin main" to send the code to GitHub over a secure SSH connection.',
    whyImportant:
      "Developers should never edit production files directly on live servers. Code changes must be tracked in version control first.",
    realWorldExample:
      "Writing an article on your computer and sending the draft to your editor for review.",
  },
  {
    stepNumber: 2,
    stage: "Code Deployment Flow",
    activeNodeId: "github",
    sourceNodeId: "developer",
    targetNodeId: "github",
    title: "2. GitHub Receives Changes",
    whatIsHappening:
      "GitHub stores the new code safely, runs automated tests, and notifies the Ubuntu server that an approved update is ready for deployment.",
    whyImportant:
      "GitHub provides a centralized, secure repository with automated checks so broken code never reaches the live site.",
    realWorldExample:
      "The publishing house reviews the draft, ensures no typos exist, and stamps it approved.",
  },
  {
    stepNumber: 3,
    stage: "Code Deployment Flow",
    activeNodeId: "ubuntu",
    sourceNodeId: "github",
    targetNodeId: "ubuntu",
    title: "3. Ubuntu Server Updates Files",
    whatIsHappening:
      "The Ubuntu cloud server pulls the latest files into /var/www/website. System permissions and environment settings are verified.",
    whyImportant:
      "The server host provides the secure Linux operating system where web software and background processes execute safely.",
    realWorldExample:
      "The printing press downloads the finalized book files onto the printing machine.",
  },
  {
    stepNumber: 4,
    stage: "Code Deployment Flow",
    activeNodeId: "nginx",
    sourceNodeId: "ubuntu",
    targetNodeId: "nginx",
    title: "4. Nginx Reloads Website",
    whatIsHappening:
      'Nginx executes a zero-downtime configuration reload ("sudo systemctl reload nginx") to serve the updated website files immediately.',
    whyImportant:
      "Nginx reloads configurations in memory without disconnecting active visitors or causing website downtime.",
    realWorldExample:
      "The bookstore places the new edition on display while customers are already shopping.",
  },
  {
    stepNumber: 5,
    stage: "Live Website Traffic",
    activeNodeId: "visitor",
    title: "5. Visitor Browses Site",
    whatIsHappening:
      "A visitor enters the domain in their browser. Before contacting the server, the browser performs a quick DNS lookup to get the server's IP address.",
    whyImportant:
      "DNS resolution is a separate preparatory step that translates human domain names into numerical IP addresses.",
    realWorldExample:
      "A shopper looks up the street address of the bookstore in Google Maps.",
  },
  {
    stepNumber: 6,
    stage: "Live Website Traffic",
    activeNodeId: "dns",
    sourceNodeId: "visitor",
    targetNodeId: "dns",
    title: "6. DNS Returns Server IP",
    whatIsHappening:
      "The DNS nameserver returns the server's public IP address, allowing the browser to connect straight to the Ubuntu server.",
    whyImportant:
      "Without DNS, the browser would not know which computer across the globe hosts the website.",
    realWorldExample:
      "The map provides the exact storefront address: 42 MG Road.",
  },
  {
    stepNumber: 7,
    stage: "Live Website Traffic",
    activeNodeId: "nginx",
    sourceNodeId: "visitor",
    targetNodeId: "nginx",
    title: "7. Nginx Handles HTTPS Traffic",
    whatIsHappening:
      "The browser connects to port 443 (HTTPS) on Nginx. Nginx validates the SSL/TLS certificate (Let's Encrypt) and fetches the requested webpage.",
    whyImportant:
      "Nginx acts as a high-speed reverse proxy and web server, shielding backend processes and encrypting traffic with SSL.",
    realWorldExample:
      "The receptionist welcomes you at the front door, verifies your appointment, and guides you to your room.",
  },
  {
    stepNumber: 8,
    stage: "Live Website Traffic",
    activeNodeId: "visitor",
    sourceNodeId: "nginx",
    targetNodeId: "visitor",
    title: "8. Webpage Loads on Device",
    whatIsHappening:
      "Nginx streams the HTML, CSS, and media back to the visitor's device. The website displays smoothly and securely in the browser.",
    whyImportant:
      "Both the code deployment flow and the visitor traffic flow work together smoothly on the Linux server.",
    realWorldExample:
      "You sit down comfortably with the new book and begin reading.",
  },
];

export function LinuxArchitectureDiagram() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const step = LINUX_STEPS[currentStepIndex];

  // Auto-play timer
  useEffect(() => {
    if (!isPlaying) return;

    const delay = 3800 / playbackSpeed;
    const timer = setTimeout(() => {
      setCurrentStepIndex((prev) => (prev + 1) % LINUX_STEPS.length);
    }, delay);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStepIndex, playbackSpeed]);

  const handleNext = () => {
    setIsPlaying(false);
    setCurrentStepIndex((prev) => (prev + 1) % LINUX_STEPS.length);
  };

  const handlePrev = () => {
    setIsPlaying(false);
    setCurrentStepIndex((prev) => (prev - 1 + LINUX_STEPS.length) % LINUX_STEPS.length);
  };

  const handleRestart = () => {
    setCurrentStepIndex(0);
    setIsPlaying(true);
  };

  const handleZoomIn = () => setZoomLevel((z) => Math.min(1.6, z + 0.15));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(0.7, z - 0.15));
  const handleResetView = () => {
    setZoomLevel(1);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <div className="my-8 overflow-hidden rounded-xs border border-border bg-surface shadow-xs">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface-muted/60 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-xs bg-accent/10 border border-accent/30 text-accent">
            <Terminal className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="mono text-xs font-bold uppercase tracking-wider text-text">
                Live Linux Server Architecture
              </span>
              <span
                className={`mono text-[9px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                  step.stage === "Code Deployment Flow"
                    ? "border-indigo-500/30 bg-indigo-500/10 text-indigo-700"
                    : "border-emerald-500/30 bg-emerald-500/10 text-emerald-700"
                }`}
              >
                {step.stage}
              </span>
            </div>
            <div className="mono text-[10px] text-text-muted">
              Step {step.stepNumber} of {LINUX_STEPS.length} &bull; {step.title}
            </div>
          </div>
        </div>

        {/* Playback Controls & Speed */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Play/Pause Button */}
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="inline-flex items-center gap-1.5 border border-accent bg-accent px-3 py-1.5 text-xs font-semibold text-text-on-accent transition-all hover:bg-accent-hover cursor-pointer shadow-2xs"
            title={isPlaying ? "Pause animation" : "Play step-by-step animation"}
          >
            {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 fill-current" />}
            <span>{isPlaying ? "Pause" : "Play"}</span>
          </button>

          {/* Prev / Next */}
          <button
            type="button"
            onClick={handlePrev}
            className="flex h-8 w-8 items-center justify-center border border-border bg-surface text-text hover:border-accent hover:text-accent transition-colors cursor-pointer"
            title="Previous step"
            aria-label="Previous step"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="flex h-8 w-8 items-center justify-center border border-border bg-surface text-text hover:border-accent hover:text-accent transition-colors cursor-pointer"
            title="Next step"
            aria-label="Next step"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          {/* Restart */}
          <button
            type="button"
            onClick={handleRestart}
            className="flex h-8 w-8 items-center justify-center border border-border bg-surface text-text hover:border-accent hover:text-accent transition-colors cursor-pointer"
            title="Restart from Step 1"
            aria-label="Restart flow"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>

          {/* Speed Selector */}
          <div className="hidden sm:flex items-center border border-border bg-surface px-1 py-0.5 text-[10px] font-mono text-text">
            <Gauge className="h-3 w-3 text-accent mr-1 ml-0.5" />
            {[1, 1.5, 2].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setPlaybackSpeed(s)}
                className={`px-1.5 py-0.5 font-bold transition-colors ${
                  playbackSpeed === s ? "text-accent bg-accent/10" : "text-text-muted hover:text-text"
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-1 border-l border-border pl-1.5 ml-1">
            <button
              type="button"
              onClick={handleZoomIn}
              className="flex h-7 w-7 items-center justify-center border border-border bg-surface text-text hover:text-accent cursor-pointer"
              title="Zoom in"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={handleZoomOut}
              className="flex h-7 w-7 items-center justify-center border border-border bg-surface text-text hover:text-accent cursor-pointer"
              title="Zoom out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={handleResetView}
              className="flex h-7 w-7 items-center justify-center border border-border bg-surface text-text hover:text-accent cursor-pointer text-[10px] font-mono"
              title="Reset view"
            >
              Fit
            </button>
          </div>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="relative h-[360px] sm:h-[400px] w-full overflow-hidden bg-[#FAFAF8] select-none cursor-grab active:cursor-grabbing"
      >
        <svg
          viewBox="0 0 960 380"
          className="h-full w-full transition-transform duration-100 ease-out"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoomLevel})`,
            transformOrigin: "center center",
          }}
        >
          <defs>
            <marker id="linux-arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#0D9488" />
            </marker>
            <marker id="linux-arrow-inactive" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#CBD5E1" />
            </marker>
          </defs>

          {/* Lane 1: Deployment Pipeline (Top Row) */}
          <rect
            x="20"
            y="20"
            width="920"
            height="145"
            rx="6"
            fill="#EEF2FF"
            stroke="#C7D2FE"
            strokeWidth="1.2"
            strokeDasharray="4 4"
          />
          <text x="35" y="42" fill="#3730A3" fontSize="11" fontFamily="monospace" fontWeight="700">
            LANE 1: DEPLOYMENT PIPELINE (Developer Updates → Ubuntu Server)
          </text>

          {/* Node 1: Developer */}
          <g
            className="cursor-pointer"
            onClick={() => {
              setIsPlaying(false);
              setCurrentStepIndex(0);
            }}
          >
            <rect
              x="50"
              y="60"
              width="170"
              height="74"
              rx="6"
              fill={step.activeNodeId === "developer" ? "#FFFFFF" : "#F8FAFC"}
              stroke={step.activeNodeId === "developer" ? "#0D9488" : "#CBD5E1"}
              strokeWidth={step.activeNodeId === "developer" ? 2.5 : 1.2}
              filter={step.activeNodeId === "developer" ? "drop-shadow(0 4px 6px rgba(13, 148, 136, 0.2))" : undefined}
            />
            <circle cx="68" cy="85" r="4" fill={step.activeNodeId === "developer" ? "#0D9488" : "#10B981"} />
            <text x="82" y="82" fill="#0F172A" fontSize="12" fontWeight="700">
              Developer Workstation
            </text>
            <text x="82" y="100" fill="#64748B" fontSize="10" fontFamily="monospace">
              git push origin main
            </text>
          </g>

          {/* Node 2: GitHub Repository */}
          <g
            className="cursor-pointer"
            onClick={() => {
              setIsPlaying(false);
              setCurrentStepIndex(1);
            }}
          >
            <rect
              x="285"
              y="60"
              width="170"
              height="74"
              rx="6"
              fill={step.activeNodeId === "github" ? "#FFFFFF" : "#F8FAFC"}
              stroke={step.activeNodeId === "github" ? "#0D9488" : "#CBD5E1"}
              strokeWidth={step.activeNodeId === "github" ? 2.5 : 1.2}
              filter={step.activeNodeId === "github" ? "drop-shadow(0 4px 6px rgba(13, 148, 136, 0.2))" : undefined}
            />
            <circle cx="303" cy="85" r="4" fill={step.activeNodeId === "github" ? "#0D9488" : "#10B981"} />
            <text x="317" y="82" fill="#0F172A" fontSize="12" fontWeight="700">
              GitHub Repository
            </text>
            <text x="317" y="100" fill="#64748B" fontSize="10" fontFamily="monospace">
              Version Control &amp; CI
            </text>
          </g>

          {/* Node 3: Ubuntu Server */}
          <g
            className="cursor-pointer"
            onClick={() => {
              setIsPlaying(false);
              setCurrentStepIndex(2);
            }}
          >
            <rect
              x="520"
              y="60"
              width="170"
              height="74"
              rx="6"
              fill={step.activeNodeId === "ubuntu" ? "#FFFFFF" : "#F8FAFC"}
              stroke={step.activeNodeId === "ubuntu" ? "#0D9488" : "#CBD5E1"}
              strokeWidth={step.activeNodeId === "ubuntu" ? 2.5 : 1.2}
              filter={step.activeNodeId === "ubuntu" ? "drop-shadow(0 4px 6px rgba(13, 148, 136, 0.2))" : undefined}
            />
            <circle cx="538" cy="85" r="4" fill={step.activeNodeId === "ubuntu" ? "#0D9488" : "#10B981"} />
            <text x="552" y="82" fill="#0F172A" fontSize="12" fontWeight="700">
              Ubuntu Server Host
            </text>
            <text x="552" y="100" fill="#64748B" fontSize="10" fontFamily="monospace">
              /var/www/website
            </text>
          </g>

          {/* Node 4: Nginx Server (Top Row) */}
          <g
            className="cursor-pointer"
            onClick={() => {
              setIsPlaying(false);
              setCurrentStepIndex(3);
            }}
          >
            <rect
              x="755"
              y="60"
              width="160"
              height="74"
              rx="6"
              fill={step.activeNodeId === "nginx" && currentStepIndex <= 3 ? "#FFFFFF" : "#F8FAFC"}
              stroke={step.activeNodeId === "nginx" && currentStepIndex <= 3 ? "#0D9488" : "#CBD5E1"}
              strokeWidth={step.activeNodeId === "nginx" && currentStepIndex <= 3 ? 2.5 : 1.2}
              filter={step.activeNodeId === "nginx" && currentStepIndex <= 3 ? "drop-shadow(0 4px 6px rgba(13, 148, 136, 0.2))" : undefined}
            />
            <circle cx="773" cy="85" r="4" fill={step.activeNodeId === "nginx" && currentStepIndex <= 3 ? "#0D9488" : "#10B981"} />
            <text x="787" y="82" fill="#0F172A" fontSize="12" fontWeight="700">
              Nginx Web Server
            </text>
            <text x="787" y="100" fill="#64748B" fontSize="10" fontFamily="monospace">
              Zero-Downtime Reload
            </text>
          </g>

          {/* Deployment Lines */}
          <line
            x1="220"
            y1="97"
            x2="285"
            y2="97"
            stroke={currentStepIndex >= 1 && currentStepIndex <= 3 ? "#0D9488" : "#CBD5E1"}
            strokeWidth={currentStepIndex === 1 ? 2.5 : 1.5}
            strokeDasharray={currentStepIndex === 1 ? "4 4" : undefined}
            markerEnd={currentStepIndex >= 1 && currentStepIndex <= 3 ? "url(#linux-arrow)" : "url(#linux-arrow-inactive)"}
          />
          <line
            x1="455"
            y1="97"
            x2="520"
            y2="97"
            stroke={currentStepIndex >= 2 && currentStepIndex <= 3 ? "#0D9488" : "#CBD5E1"}
            strokeWidth={currentStepIndex === 2 ? 2.5 : 1.5}
            strokeDasharray={currentStepIndex === 2 ? "4 4" : undefined}
            markerEnd={currentStepIndex >= 2 && currentStepIndex <= 3 ? "url(#linux-arrow)" : "url(#linux-arrow-inactive)"}
          />
          <line
            x1="690"
            y1="97"
            x2="755"
            y2="97"
            stroke={currentStepIndex >= 3 && currentStepIndex <= 3 ? "#0D9488" : "#CBD5E1"}
            strokeWidth={currentStepIndex === 3 ? 2.5 : 1.5}
            strokeDasharray={currentStepIndex === 3 ? "4 4" : undefined}
            markerEnd={currentStepIndex >= 3 && currentStepIndex <= 3 ? "url(#linux-arrow)" : "url(#linux-arrow-inactive)"}
          />

          {/* Lane 2: Live Website Visitor Traffic (Bottom Row) */}
          <rect
            x="20"
            y="195"
            width="920"
            height="155"
            rx="6"
            fill="#F0FDF4"
            stroke="#BBF7D0"
            strokeWidth="1.2"
            strokeDasharray="4 4"
          />
          <text x="35" y="217" fill="#166534" fontSize="11" fontFamily="monospace" fontWeight="700">
            LANE 2: LIVE VISITOR TRAFFIC (DNS Resolution &amp; HTTPS Nginx Serving)
          </text>

          {/* Visitor Card */}
          <g
            className="cursor-pointer"
            onClick={() => {
              setIsPlaying(false);
              setCurrentStepIndex(4);
            }}
          >
            <rect
              x="50"
              y="240"
              width="170"
              height="74"
              rx="6"
              fill={step.activeNodeId === "visitor" ? "#FFFFFF" : "#F8FAFC"}
              stroke={step.activeNodeId === "visitor" ? "#0D9488" : "#CBD5E1"}
              strokeWidth={step.activeNodeId === "visitor" ? 2.5 : 1.2}
              filter={step.activeNodeId === "visitor" ? "drop-shadow(0 4px 6px rgba(13, 148, 136, 0.2))" : undefined}
            />
            <circle cx="68" cy="265" r="4" fill={step.activeNodeId === "visitor" ? "#0D9488" : "#10B981"} />
            <text x="82" y="262" fill="#0F172A" fontSize="12" fontWeight="700">
              Website Visitor
            </text>
            <text x="82" y="280" fill="#64748B" fontSize="10" fontFamily="monospace">
              Enters Domain
            </text>
          </g>

          {/* DNS Lookup Card */}
          <g
            className="cursor-pointer"
            onClick={() => {
              setIsPlaying(false);
              setCurrentStepIndex(5);
            }}
          >
            <rect
              x="285"
              y="240"
              width="170"
              height="74"
              rx="6"
              fill={step.activeNodeId === "dns" ? "#FFFFFF" : "#F8FAFC"}
              stroke={step.activeNodeId === "dns" ? "#0D9488" : "#CBD5E1"}
              strokeWidth={step.activeNodeId === "dns" ? 2.5 : 1.2}
              filter={step.activeNodeId === "dns" ? "drop-shadow(0 4px 6px rgba(13, 148, 136, 0.2))" : undefined}
            />
            <circle cx="303" cy="265" r="4" fill={step.activeNodeId === "dns" ? "#0D9488" : "#0284C7"} />
            <text x="317" y="262" fill="#0F172A" fontSize="12" fontWeight="700">
              DNS Resolution
            </text>
            <text x="317" y="280" fill="#64748B" fontSize="10" fontFamily="monospace">
              Finds Server IP
            </text>
          </g>

          {/* Nginx Live Traffic Card */}
          <g
            className="cursor-pointer"
            onClick={() => {
              setIsPlaying(false);
              setCurrentStepIndex(6);
            }}
          >
            <rect
              x="520"
              y="240"
              width="170"
              height="74"
              rx="6"
              fill={step.activeNodeId === "nginx" && currentStepIndex >= 6 ? "#FFFFFF" : "#F8FAFC"}
              stroke={step.activeNodeId === "nginx" && currentStepIndex >= 6 ? "#0D9488" : "#CBD5E1"}
              strokeWidth={step.activeNodeId === "nginx" && currentStepIndex >= 6 ? 2.5 : 1.2}
              filter={step.activeNodeId === "nginx" && currentStepIndex >= 6 ? "drop-shadow(0 4px 6px rgba(13, 148, 136, 0.2))" : undefined}
            />
            <circle cx="538" cy="265" r="4" fill={step.activeNodeId === "nginx" && currentStepIndex >= 6 ? "#0D9488" : "#10B981"} />
            <text x="552" y="262" fill="#0F172A" fontSize="12" fontWeight="700">
              Nginx (Port 443)
            </text>
            <text x="552" y="280" fill="#64748B" fontSize="10" fontFamily="monospace">
              SSL / Reverse Proxy
            </text>
          </g>

          {/* Website Opens Card */}
          <g
            className="cursor-pointer"
            onClick={() => {
              setIsPlaying(false);
              setCurrentStepIndex(7);
            }}
          >
            <rect
              x="755"
              y="240"
              width="160"
              height="74"
              rx="6"
              fill={currentStepIndex === 7 ? "#FFFFFF" : "#F8FAFC"}
              stroke={currentStepIndex === 7 ? "#0D9488" : "#CBD5E1"}
              strokeWidth={currentStepIndex === 7 ? 2.5 : 1.2}
              filter={currentStepIndex === 7 ? "drop-shadow(0 4px 6px rgba(13, 148, 136, 0.2))" : undefined}
            />
            <circle cx="773" cy="265" r="4" fill={currentStepIndex === 7 ? "#0D9488" : "#10B981"} />
            <text x="787" y="262" fill="#0F172A" fontSize="12" fontWeight="700">
              Website Displays!
            </text>
            <text x="787" y="280" fill="#64748B" fontSize="10" fontFamily="monospace">
              Secure HTTPS Render
            </text>
          </g>

          {/* Visitor Traffic Lines */}
          <line
            x1="220"
            y1="277"
            x2="285"
            y2="277"
            stroke={currentStepIndex >= 5 ? "#0D9488" : "#CBD5E1"}
            strokeWidth={currentStepIndex === 5 ? 2.5 : 1.5}
            strokeDasharray={currentStepIndex === 5 ? "4 4" : undefined}
            markerEnd={currentStepIndex >= 5 ? "url(#linux-arrow)" : "url(#linux-arrow-inactive)"}
          />
          <line
            x1="455"
            y1="277"
            x2="520"
            y2="277"
            stroke={currentStepIndex >= 6 ? "#0D9488" : "#CBD5E1"}
            strokeWidth={currentStepIndex === 6 ? 2.5 : 1.5}
            strokeDasharray={currentStepIndex === 6 ? "4 4" : undefined}
            markerEnd={currentStepIndex >= 6 ? "url(#linux-arrow)" : "url(#linux-arrow-inactive)"}
          />
          <line
            x1="690"
            y1="277"
            x2="755"
            y2="277"
            stroke={currentStepIndex >= 7 ? "#0D9488" : "#CBD5E1"}
            strokeWidth={currentStepIndex === 7 ? 2.5 : 1.5}
            strokeDasharray={currentStepIndex === 7 ? "4 4" : undefined}
            markerEnd={currentStepIndex >= 7 ? "url(#linux-arrow)" : "url(#linux-arrow-inactive)"}
          />

          {/* Moving Indicator Pulses */}
          {currentStepIndex === 1 && <circle cx="250" cy="97" r="5" fill="#0D9488" className="animate-ping" />}
          {currentStepIndex === 2 && <circle cx="488" cy="97" r="5" fill="#0D9488" className="animate-ping" />}
          {currentStepIndex === 3 && <circle cx="720" cy="97" r="5" fill="#0D9488" className="animate-ping" />}
          {currentStepIndex === 5 && <circle cx="250" cy="277" r="5" fill="#0D9488" className="animate-ping" />}
          {currentStepIndex === 6 && <circle cx="488" cy="277" r="5" fill="#0D9488" className="animate-ping" />}
          {currentStepIndex === 7 && <circle cx="720" cy="277" r="5" fill="#0D9488" className="animate-ping" />}
        </svg>

        {/* Step Progression Bar at Bottom of Canvas */}
        <div className="absolute bottom-2 left-4 right-4 flex items-center justify-between text-[11px] font-mono text-text-muted bg-white/90 backdrop-blur-xs px-3 py-1.5 border border-border shadow-2xs">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-accent">STEP {step.stepNumber}:</span>
            <span className="text-text font-medium">{step.title}</span>
          </div>
          <div className="flex items-center gap-1">
            {LINUX_STEPS.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentStepIndex(i);
                }}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  i === currentStepIndex
                    ? "w-6 bg-accent"
                    : i < currentStepIndex
                    ? "w-2 bg-accent/40"
                    : "w-2 bg-border"
                }`}
                title={`Go to step ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Structured Explanation Panel (Requirement 8) */}
      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border border-t border-border bg-surface p-5 sm:p-6 gap-4 md:gap-0">
        <div className="md:pr-5 space-y-1.5">
          <div className="mono text-[10px] font-bold uppercase tracking-wider text-accent flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            <span>WHAT IS HAPPENING?</span>
          </div>
          <p className="text-xs text-text leading-relaxed">
            {step.whatIsHappening}
          </p>
        </div>

        <div className="md:px-5 space-y-1.5 pt-3 md:pt-0">
          <div className="mono text-[10px] font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-text-muted" />
            <span>WHY IS THIS IMPORTANT?</span>
          </div>
          <p className="text-xs text-text-muted leading-relaxed">
            {step.whyImportant}
          </p>
        </div>

        <div className="md:pl-5 space-y-1.5 pt-3 md:pt-0">
          <div className="mono text-[10px] font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
            <span>REAL-WORLD ANALOGY</span>
          </div>
          <p className="text-xs text-text-muted leading-relaxed">
            {step.realWorldExample}
          </p>
        </div>
      </div>
    </div>
  );
}
