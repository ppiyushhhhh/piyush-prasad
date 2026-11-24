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
  Globe,
  Server,
  Laptop,
  CheckCircle2,
  HardDrive,
  FileCode,
  Gauge,
} from "lucide-react";

interface DnsStep {
  stepNumber: number;
  activeNodeId: string;
  sourceNodeId?: string;
  targetNodeId?: string;
  stage: "DNS Resolution" | "Website Request";
  title: string;
  whatIsHappening: string;
  whyImportant: string;
  realWorldExample: string;
}

const DNS_STEPS: DnsStep[] = [
  {
    stepNumber: 1,
    activeNodeId: "browser",
    stage: "DNS Resolution",
    title: "1. Visitor Enters Domain",
    whatIsHappening:
      'A visitor types "piyushprasad.in" into their web browser address bar and hits Enter. The browser checks if it already knows the numerical IP address.',
    whyImportant:
      "Computers cannot route traffic using letters or words. They need numerical IP addresses (like 76.76.21.21) to connect across the internet.",
    realWorldExample:
      'Like looking for a friend\'s name "Piyush" in your contacts because you do not have their 10-digit phone number memorized.',
  },
  {
    stepNumber: 2,
    activeNodeId: "resolver",
    sourceNodeId: "browser",
    targetNodeId: "resolver",
    stage: "DNS Resolution",
    title: "2. Browser Asks DNS Resolver",
    whatIsHappening:
      "Because the browser does not have the address in memory, it sends a query to the DNS Resolver (usually run by your ISP or a public provider like 1.1.1.1).",
    whyImportant:
      "The resolver acts as a helpful assistant that does the detective work of finding where the website is located on the global web.",
    realWorldExample:
      "Asking a hotel concierge for the directions to a specific store in a large city.",
  },
  {
    stepNumber: 3,
    activeNodeId: "dnsServer",
    sourceNodeId: "resolver",
    targetNodeId: "dnsServer",
    stage: "DNS Resolution",
    title: "3. DNS Server Looks Up Record",
    whatIsHappening:
      "The resolver contacts the authoritative DNS nameserver for piyushprasad.in. The DNS server checks its DNS records table (the A Record) to find the server address.",
    whyImportant:
      "The authoritative DNS server holds the official master list of where every domain and subdomain should be routed.",
    realWorldExample:
      "Checking the official city directory to find the exact street address corresponding to a company name.",
  },
  {
    stepNumber: 4,
    activeNodeId: "ipAddress",
    sourceNodeId: "dnsServer",
    targetNodeId: "ipAddress",
    stage: "DNS Resolution",
    title: "4. DNS Returns Website IP",
    whatIsHappening:
      "The DNS server returns the IP address (e.g. 76.76.21.21) back to the resolver, which immediately hands it over to your browser.",
    whyImportant:
      "Now the browser has the exact destination coordinates it needs. DNS resolution is now complete!",
    realWorldExample:
      "The concierge gives you the exact address: 76 MG Road. You now know exactly where to travel.",
  },
  {
    stepNumber: 5,
    activeNodeId: "hostingServer",
    sourceNodeId: "browser",
    targetNodeId: "hostingServer",
    stage: "Website Request",
    title: "5. Browser Connects to Hosting Server",
    whatIsHappening:
      "Now that the browser has the IP address, it bypasses DNS and connects directly to the Hosting Server over secure HTTPS (port 443) requesting the web page.",
    whyImportant:
      "DNS resolution is only for finding the address. The actual website files (HTML, CSS, images) come directly from the hosting server.",
    realWorldExample:
      "You drive straight to the store at 76 MG Road and ask the storekeeper for the catalog.",
  },
  {
    stepNumber: 6,
    activeNodeId: "websiteOpens",
    sourceNodeId: "hostingServer",
    targetNodeId: "websiteOpens",
    stage: "Website Request",
    title: "6. Website Appears in Browser",
    whatIsHappening:
      "The hosting server responds with the website HTML, CSS, and images. The browser renders the page, and the visitor sees piyushprasad.in live on their screen!",
    whyImportant:
      "The entire round-trip from entering the domain to viewing the live website usually happens in under 200 milliseconds.",
    realWorldExample:
      "The storekeeper hands you the catalog, and you begin reading it on your phone.",
  },
];

export function DnsArchitectureDiagram() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const step = DNS_STEPS[currentStepIndex];

  // Auto-play timer
  useEffect(() => {
    if (!isPlaying) return;

    const delay = 3800 / playbackSpeed;
    const timer = setTimeout(() => {
      setCurrentStepIndex((prev) => (prev + 1) % DNS_STEPS.length);
    }, delay);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStepIndex, playbackSpeed]);

  const handleNext = () => {
    setIsPlaying(false);
    setCurrentStepIndex((prev) => (prev + 1) % DNS_STEPS.length);
  };

  const handlePrev = () => {
    setIsPlaying(false);
    setCurrentStepIndex((prev) => (prev - 1 + DNS_STEPS.length) % DNS_STEPS.length);
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

  // Diagram Node Coordinates (viewBox 0 0 960 360)
  const nodes = {
    browser: { x: 50, y: 55, w: 170, h: 74, name: "Web Browser", sub: "Visitor's Device", icon: Laptop },
    resolver: { x: 285, y: 55, w: 170, h: 74, name: "DNS Resolver", sub: "ISP / 1.1.1.1", icon: Globe },
    dnsServer: { x: 520, y: 55, w: 170, h: 74, name: "DNS Nameserver", sub: "Holds A Records", icon: Server },
    ipAddress: { x: 755, y: 55, w: 160, h: 74, name: "Website IP", sub: "e.g. 76.76.21.21", icon: HardDrive },
    hostingServer: { x: 440, y: 220, w: 180, h: 76, name: "Hosting Server", sub: "Vercel / AWS / EC2", icon: Server },
    websiteOpens: { x: 740, y: 220, w: 170, h: 76, name: "Website Opens!", sub: "Live in Browser", icon: CheckCircle2 },
  };

  return (
    <div className="my-8 overflow-hidden rounded-xs border border-border bg-surface shadow-xs">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface-muted/60 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-xs bg-accent/10 border border-accent/30 text-accent">
            <Globe className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="mono text-xs font-bold uppercase tracking-wider text-text">
                Live DNS Resolution Flow
              </span>
              <span
                className={`mono text-[9px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                  step.stage === "DNS Resolution"
                    ? "border-sky-500/30 bg-sky-500/10 text-sky-700"
                    : "border-emerald-500/30 bg-emerald-500/10 text-emerald-700"
                }`}
              >
                {step.stage}
              </span>
            </div>
            <div className="mono text-[10px] text-text-muted">
              Step {step.stepNumber} of {DNS_STEPS.length} &bull; {step.title}
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
        className="relative h-[340px] sm:h-[380px] w-full overflow-hidden bg-[#FAFAF8] select-none cursor-grab active:cursor-grabbing"
      >
        <svg
          viewBox="0 0 960 360"
          className="h-full w-full transition-transform duration-100 ease-out"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoomLevel})`,
            transformOrigin: "center center",
          }}
        >
          <defs>
            {/* Arrowhead marker */}
            <marker id="dns-arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#0D9488" />
            </marker>
            <marker id="dns-arrow-inactive" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#CBD5E1" />
            </marker>
          </defs>

          {/* Group 1 Background: DNS Resolution Zone (Top) */}
          <rect
            x="20"
            y="20"
            width="920"
            height="145"
            rx="6"
            fill="#F0FDF4"
            stroke="#BBF7D0"
            strokeWidth="1.2"
            strokeDasharray="4 4"
          />
          <text x="35" y="42" fill="#166534" fontSize="11" fontFamily="monospace" fontWeight="700">
            PHASE 1: DNS RESOLUTION (Finding Where piyushprasad.in Lives)
          </text>

          {/* Group 2 Background: Direct Web Request Zone (Bottom) */}
          <rect
            x="20"
            y="185"
            width="920"
            height="155"
            rx="6"
            fill="#F8FAFC"
            stroke="#E2E8F0"
            strokeWidth="1.2"
            strokeDasharray="4 4"
          />
          <text x="35" y="206" fill="#334155" fontSize="11" fontFamily="monospace" fontWeight="700">
            PHASE 2: HTTPS WEB TRAFFIC (Connecting to Server &amp; Loading Website)
          </text>

          {/* Connection Lines (Stage 1: Top) */}
          {/* Browser -> Resolver */}
          <line
            x1={nodes.browser.x + nodes.browser.w}
            y1={nodes.browser.y + nodes.browser.h / 2}
            x2={nodes.resolver.x}
            y2={nodes.resolver.y + nodes.resolver.h / 2}
            stroke={currentStepIndex >= 1 ? "#0D9488" : "#CBD5E1"}
            strokeWidth={currentStepIndex === 1 ? 2.5 : 1.5}
            strokeDasharray={currentStepIndex === 1 ? "4 4" : undefined}
            markerEnd={currentStepIndex >= 1 ? "url(#dns-arrow)" : "url(#dns-arrow-inactive)"}
          />
          {/* Resolver -> DNS Server */}
          <line
            x1={nodes.resolver.x + nodes.resolver.w}
            y1={nodes.resolver.y + nodes.resolver.h / 2}
            x2={nodes.dnsServer.x}
            y2={nodes.dnsServer.y + nodes.dnsServer.h / 2}
            stroke={currentStepIndex >= 2 ? "#0D9488" : "#CBD5E1"}
            strokeWidth={currentStepIndex === 2 ? 2.5 : 1.5}
            strokeDasharray={currentStepIndex === 2 ? "4 4" : undefined}
            markerEnd={currentStepIndex >= 2 ? "url(#dns-arrow)" : "url(#dns-arrow-inactive)"}
          />
          {/* DNS Server -> IP Address */}
          <line
            x1={nodes.dnsServer.x + nodes.dnsServer.w}
            y1={nodes.dnsServer.y + nodes.dnsServer.h / 2}
            x2={nodes.ipAddress.x}
            y2={nodes.ipAddress.y + nodes.ipAddress.h / 2}
            stroke={currentStepIndex >= 3 ? "#0D9488" : "#CBD5E1"}
            strokeWidth={currentStepIndex === 3 ? 2.5 : 1.5}
            strokeDasharray={currentStepIndex === 3 ? "4 4" : undefined}
            markerEnd={currentStepIndex >= 3 ? "url(#dns-arrow)" : "url(#dns-arrow-inactive)"}
          />

          {/* Connection Lines (Stage 2: Bottom) */}
          {/* Browser -> Hosting Server (Direct connection curve) */}
          <path
            d={`M ${nodes.browser.x + nodes.browser.w / 2} ${nodes.browser.y + nodes.browser.h} 
                C ${nodes.browser.x + nodes.browser.w / 2} 260, 360 260, ${nodes.hostingServer.x} ${nodes.hostingServer.y + nodes.hostingServer.h / 2}`}
            fill="none"
            stroke={currentStepIndex >= 4 ? "#0D9488" : "#CBD5E1"}
            strokeWidth={currentStepIndex === 4 ? 2.5 : 1.5}
            strokeDasharray={currentStepIndex === 4 ? "5 4" : undefined}
            markerEnd={currentStepIndex >= 4 ? "url(#dns-arrow)" : "url(#dns-arrow-inactive)"}
          />

          {/* Hosting Server -> Website Opens */}
          <line
            x1={nodes.hostingServer.x + nodes.hostingServer.w}
            y1={nodes.hostingServer.y + nodes.hostingServer.h / 2}
            x2={nodes.websiteOpens.x}
            y2={nodes.websiteOpens.y + nodes.websiteOpens.h / 2}
            stroke={currentStepIndex >= 5 ? "#0D9488" : "#CBD5E1"}
            strokeWidth={currentStepIndex === 5 ? 2.5 : 1.5}
            strokeDasharray={currentStepIndex === 5 ? "4 4" : undefined}
            markerEnd={currentStepIndex >= 5 ? "url(#dns-arrow)" : "url(#dns-arrow-inactive)"}
          />

          {/* Step Animated Indicators (Moving pulse along active path) */}
          {currentStepIndex === 1 && (
            <circle cx="250" cy="92" r="5" fill="#0D9488" className="animate-ping" />
          )}
          {currentStepIndex === 2 && (
            <circle cx="488" cy="92" r="5" fill="#0D9488" className="animate-ping" />
          )}
          {currentStepIndex === 3 && (
            <circle cx="720" cy="92" r="5" fill="#0D9488" className="animate-ping" />
          )}
          {currentStepIndex === 4 && (
            <circle cx="340" cy="245" r="5" fill="#0D9488" className="animate-ping" />
          )}
          {currentStepIndex === 5 && (
            <circle cx="680" cy="258" r="5" fill="#0D9488" className="animate-ping" />
          )}

          {/* Component Cards */}
          {Object.entries(nodes).map(([key, n]) => {
            const isActive = step.activeNodeId === key;
            const isCompleted =
              (key === "browser" && currentStepIndex >= 0) ||
              (key === "resolver" && currentStepIndex >= 1) ||
              (key === "dnsServer" && currentStepIndex >= 2) ||
              (key === "ipAddress" && currentStepIndex >= 3) ||
              (key === "hostingServer" && currentStepIndex >= 4) ||
              (key === "websiteOpens" && currentStepIndex >= 5);

            return (
              <g
                key={key}
                className="cursor-pointer transition-all duration-200"
                onClick={() => {
                  const targetIdx = DNS_STEPS.findIndex((s) => s.activeNodeId === key);
                  if (targetIdx !== -1) {
                    setIsPlaying(false);
                    setCurrentStepIndex(targetIdx);
                  }
                }}
              >
                {/* Node Box */}
                <rect
                  x={n.x}
                  y={n.y}
                  width={n.w}
                  height={n.h}
                  rx="6"
                  fill={isActive ? "#FFFFFF" : isCompleted ? "#F8FAFC" : "#FFFFFF"}
                  stroke={isActive ? "#0D9488" : isCompleted ? "#14B8A6" : "#E2E8F0"}
                  strokeWidth={isActive ? 2.5 : 1.2}
                  filter={isActive ? "drop-shadow(0 4px 6px rgba(13, 148, 136, 0.2))" : undefined}
                />

                {/* Status Dot */}
                <circle
                  cx={n.x + 16}
                  cy={n.y + 22}
                  r="4"
                  fill={isActive ? "#0D9488" : isCompleted ? "#10B981" : "#94A3B8"}
                />

                {/* Node Name */}
                <text
                  x={n.x + 28}
                  y={n.y + 26}
                  fill="#0F172A"
                  fontSize="12"
                  fontWeight="700"
                  fontFamily="system-ui, sans-serif"
                >
                  {n.name}
                </text>

                {/* Node Subtitle */}
                <text
                  x={n.x + 28}
                  y={n.y + 45}
                  fill="#64748B"
                  fontSize="10"
                  fontFamily="monospace"
                >
                  {n.sub}
                </text>

                {/* Active Indicator Tag */}
                {isActive && (
                  <rect
                    x={n.x + n.w - 52}
                    y={n.y + 8}
                    width="44"
                    height="16"
                    rx="3"
                    fill="#0D9488"
                  />
                )}
                {isActive && (
                  <text
                    x={n.x + n.w - 30}
                    y={n.y + 19}
                    fill="#FFFFFF"
                    fontSize="8"
                    fontFamily="monospace"
                    fontWeight="700"
                    textAnchor="middle"
                  >
                    ACTIVE
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Step Progression Bar at Bottom of Canvas */}
        <div className="absolute bottom-2 left-4 right-4 flex items-center justify-between text-[11px] font-mono text-text-muted bg-white/90 backdrop-blur-xs px-3 py-1.5 border border-border shadow-2xs">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-accent">STEP {step.stepNumber}:</span>
            <span className="text-text font-medium">{step.title}</span>
          </div>
          <div className="flex items-center gap-1">
            {DNS_STEPS.map((_, i) => (
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
        {/* Column 1: What is happening? */}
        <div className="md:pr-5 space-y-1.5">
          <div className="mono text-[10px] font-bold uppercase tracking-wider text-accent flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            <span>WHAT IS HAPPENING?</span>
          </div>
          <p className="text-xs text-text leading-relaxed">
            {step.whatIsHappening}
          </p>
        </div>

        {/* Column 2: Why is this important? */}
        <div className="md:px-5 space-y-1.5 pt-3 md:pt-0">
          <div className="mono text-[10px] font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-text-muted" />
            <span>WHY IS THIS IMPORTANT?</span>
          </div>
          <p className="text-xs text-text-muted leading-relaxed">
            {step.whyImportant}
          </p>
        </div>

        {/* Column 3: Real-world example */}
        <div className="md:pl-5 space-y-1.5 pt-3 md:pt-0">
          <div className="mono text-[10px] font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
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
