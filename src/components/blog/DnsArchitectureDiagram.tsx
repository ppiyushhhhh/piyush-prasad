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
  Server,
  Globe,
  Laptop,
  Database,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

interface DnsNode {
  id: string;
  name: string;
  subtitle: string;
  type: "client" | "cache" | "resolver" | "root" | "tld" | "authoritative" | "hosting";
  protocol: string;
  port: string;
  address: string;
  description: string;
  role: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

const DNS_NODES: DnsNode[] = [
  {
    id: "visitor",
    name: "1. Visitor & Browser",
    subtitle: "Initiates domain request",
    type: "client",
    protocol: "HTTPS / OS API",
    port: "User Space",
    address: "Local Client",
    role: "The web browser initiates resolution when user requests https://piyushprasad.in.",
    description:
      "When you type a domain in your address bar, the browser first inspects its internal memory cache (e.g. chrome://net-internals/#dns). If not found, it asks the local Operating System resolver.",
    x: 40,
    y: 70,
    w: 180,
    h: 84,
  },
  {
    id: "os-cache",
    name: "2. OS DNS Cache",
    subtitle: "Local resolver & hosts",
    type: "cache",
    protocol: "System Calls",
    port: "Kernel / Service",
    address: "127.0.0.1 / Systemd",
    role: "Checks local OS DNS cache and /etc/hosts before querying external network.",
    description:
      "Operating systems (Windows DNS Client service, macOS mDNSResponder, or systemd-resolved) check recent cached responses. If cached and TTL is valid, resolution completes instantly without network traffic.",
    x: 40,
    y: 220,
    w: 180,
    h: 84,
  },
  {
    id: "recursive",
    name: "3. Recursive Resolver",
    subtitle: "ISP / 1.1.1.1 / 8.8.8.8",
    type: "resolver",
    protocol: "DNS (UDP/TCP)",
    port: "Port 53 / 853 (DoT)",
    address: "1.1.1.1 / 8.8.8.8",
    role: "Performs iterative queries across the global DNS hierarchy on the client's behalf.",
    description:
      "The recursive resolver acts as a digital librarian. When it does not have the answer in cache, it systematically traverses root, TLD, and authoritative nameservers to resolve the IP address.",
    x: 290,
    y: 145,
    w: 200,
    h: 94,
  },
  {
    id: "root-dns",
    name: "4. Root DNS Server",
    subtitle: "Root Zone (.)",
    type: "root",
    protocol: "DNS Anycast",
    port: "Port 53",
    address: "13 Global IP clusters (a-m)",
    role: "Directs resolvers to the Top-Level Domain (TLD) servers for .in, .com, .org, etc.",
    description:
      "Managed by 12 independent organizations coordinated by IANA/ICANN. Root servers do not know the final website IP; they reply with a referral to the nameservers responsible for the .in TLD.",
    x: 570,
    y: 40,
    w: 190,
    h: 84,
  },
  {
    id: "tld-dns",
    name: "5. TLD Nameserver",
    subtitle: ".in Registry (NIXI)",
    type: "tld",
    protocol: "DNS Anycast",
    port: "Port 53",
    address: "Registry Nameservers",
    role: "Stores delegation records (NS) for all registered domains ending in .in.",
    description:
      "Maintained by registry operators (such as the National Internet eXchange of India for .in). The TLD server replies with the authoritative nameservers configured at the domain registrar.",
    x: 770,
    y: 145,
    w: 190,
    h: 84,
  },
  {
    id: "auth-dns",
    name: "6. Authoritative DNS",
    subtitle: "Vercel / Cloudflare NS",
    type: "authoritative",
    protocol: "DNS Anycast",
    port: "Port 53",
    address: "ns1.vercel-dns.com",
    role: "Holds the official source-of-truth DNS zone file with A, AAAA, and CNAME records.",
    description:
      "This is where the domain owner manages DNS records. The authoritative nameserver reads the zone file for piyushprasad.in and responds with A = 76.76.21.21 and TTL = 300.",
    x: 570,
    y: 260,
    w: 200,
    h: 88,
  },
  {
    id: "hosting",
    name: "7. Website Hosting",
    subtitle: "Vercel Global Edge",
    type: "hosting",
    protocol: "HTTPS / TLS 1.3",
    port: "Port 443 (TCP)",
    address: "76.76.21.21 (Anycast)",
    role: "Terminates TLS handshake and delivers the website application payload.",
    description:
      "Once the browser obtains the IP address (76.76.21.21), the DNS phase is COMPLETE. The browser opens a TCP/TLS connection directly to this edge node to retrieve HTML, JS, and CSS.",
    x: 290,
    y: 460,
    w: 210,
    h: 96,
  },
  {
    id: "website-response",
    name: "8. Web Response",
    subtitle: "HTTP 200 OK Delivered",
    type: "client",
    protocol: "HTTP/2 or HTTP/3",
    port: "Browser DOM",
    address: "Render Engine",
    role: "Browser receives HTML bytes, parses the DOM, and renders the portfolio.",
    description:
      "The server returns the fully rendered webpage. The browser renders the interface and displays the secure lock icon in the address bar.",
    x: 40,
    y: 460,
    w: 180,
    h: 96,
  },
];

const RESOLUTION_STEPS = [
  {
    step: 1,
    title: "1. User Requests URL",
    summary: "User enters https://piyushprasad.in in the browser.",
    detail: "Browser checks internal cache; if expired or not found, it queries the local OS resolver.",
    activeNodes: ["visitor", "os-cache"],
    protocol: "Client Internal",
  },
  {
    step: 2,
    title: "2. Query to Recursive Resolver",
    summary: "OS sends recursive DNS query to 1.1.1.1 / 8.8.8.8 over UDP 53.",
    detail: "Recursive resolver checks its local cache. On a cache miss, it begins iterative resolution.",
    activeNodes: ["os-cache", "recursive"],
    protocol: "UDP 53 (DNS Query)",
  },
  {
    step: 3,
    title: "3. Root Server Referral",
    summary: "Resolver queries Root DNS Server (.) for .in.",
    detail: "Root nameserver responds: 'I don't know piyushprasad.in, but here are the .in TLD nameservers.'",
    activeNodes: ["recursive", "root-dns"],
    protocol: "UDP 53 (Root Referral)",
  },
  {
    step: 4,
    title: "4. TLD Server Referral",
    summary: "Resolver queries .in TLD nameserver for piyushprasad.in.",
    detail: "TLD server responds: 'Here are the authoritative nameservers for piyushprasad.in: ns1.vercel-dns.com.'",
    activeNodes: ["recursive", "tld-dns"],
    protocol: "UDP 53 (TLD Referral)",
  },
  {
    step: 5,
    title: "5. Authoritative Query & Answer",
    summary: "Resolver queries Authoritative Nameserver (ns1.vercel-dns.com).",
    detail: "Authoritative server answers with A Record: 76.76.21.21 (TTL 300 seconds).",
    activeNodes: ["recursive", "auth-dns"],
    protocol: "UDP 53 (Authoritative Answer)",
  },
  {
    step: 6,
    title: "6. Resolver Returns IP to Client",
    summary: "Resolver caches the answer and returns 76.76.21.21 to the browser.",
    detail: "DNS resolution is now complete! The browser now knows the exact server IP address.",
    activeNodes: ["recursive", "visitor"],
    protocol: "UDP 53 (DNS Response)",
  },
  {
    step: 7,
    title: "7. Direct HTTPS Connection",
    summary: "Browser connects directly to hosting server (76.76.21.21:443).",
    detail: "TCP three-way handshake + TLS 1.3 handshake. Browser issues HTTP GET / request.",
    activeNodes: ["visitor", "hosting"],
    protocol: "TCP 443 (TLS Handshake)",
  },
  {
    step: 8,
    title: "8. Website Response Rendered",
    summary: "Hosting server streams HTTP 200 OK with HTML payload.",
    detail: "The browser downloads website assets and renders the portfolio page.",
    activeNodes: ["hosting", "website-response"],
    protocol: "HTTPS (Web Response)",
  },
];

export function DnsArchitectureDiagram() {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [selectedNode, setSelectedNode] = useState<DnsNode>(DNS_NODES[0]);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-play loop
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentStep((prev) => (prev + 1) % RESOLUTION_STEPS.length);
      }, 2500);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying]);

  const activeStepData = RESOLUTION_STEPS[currentStep];

  const handleNext = () => {
    setIsPlaying(false);
    setCurrentStep((prev) => (prev + 1) % RESOLUTION_STEPS.length);
  };

  const handlePrev = () => {
    setIsPlaying(false);
    setCurrentStep((prev) => (prev - 1 + RESOLUTION_STEPS.length) % RESOLUTION_STEPS.length);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
    setZoomLevel(1);
  };

  const handleZoomIn = () => setZoomLevel((z) => Math.min(1.4, z + 0.1));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(0.75, z - 0.1));

  return (
    <div className="border border-border bg-surface my-8 overflow-hidden shadow-xs">
      {/* Header & Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between border-b border-border bg-surface-muted/50 p-4 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-text">
              Interactive DNS Resolution Architecture
            </h3>
          </div>
          <p className="text-xs text-text-muted mt-0.5">
            Step {activeStepData.step} of 8:{" "}
            <span className="font-semibold text-accent">{activeStepData.title}</span>
          </p>
        </div>

        {/* Action Controls */}
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
                <span>Play DNS Flow</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handlePrev}
            className="inline-flex h-8 w-8 items-center justify-center border border-border bg-surface text-text hover:border-accent hover:text-accent cursor-pointer"
            title="Previous Step"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="inline-flex h-8 w-8 items-center justify-center border border-border bg-surface text-text hover:border-accent hover:text-accent cursor-pointer"
            title="Next Step"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="inline-flex h-8 w-8 items-center justify-center border border-border bg-surface text-text hover:border-accent hover:text-accent cursor-pointer"
            title="Reset to Start"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>

          <div className="h-4 w-px bg-border mx-1" />

          <button
            type="button"
            onClick={handleZoomIn}
            className="inline-flex h-8 w-8 items-center justify-center border border-border bg-surface text-text hover:border-accent cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={handleZoomOut}
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

      {/* Step Progress Ticker */}
      <div className="grid grid-cols-4 sm:grid-cols-8 border-b border-border bg-background">
        {RESOLUTION_STEPS.map((s, idx) => {
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
                  0{s.step}
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

      {/* Main Visual Canvas & Inspector Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
        {/* SVG Interactive Canvas */}
        <div className="lg:col-span-8 p-4 overflow-x-auto bg-background/50 flex items-center justify-center">
          <div
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: "center center",
              transition: "transform 0.2s ease-out",
            }}
            className="w-full max-w-[1000px]"
          >
            <svg
              viewBox="0 0 1000 600"
              className="w-full h-auto select-none font-sans"
              style={{ minWidth: "750px" }}
            >
              <defs>
                <marker
                  id="dns-arrow"
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
                  id="http-arrow"
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
              <pattern id="dns-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E5E5DF" strokeWidth="0.5" />
              </pattern>
              <rect width="1000" height="600" fill="url(#dns-grid)" opacity="0.4" />

              {/* Zone Separation Boundaries */}
              <rect
                x="20"
                y="20"
                width="220"
                height="560"
                fill="none"
                stroke="#E5E5DF"
                strokeDasharray="4 4"
                rx="8"
              />
              <text x="30" y="44" className="mono text-[10px] font-semibold fill-text-muted">
                ZONE 1: CLIENT BOUNDARY
              </text>

              <rect
                x="260"
                y="20"
                width="260"
                height="340"
                fill="none"
                stroke="#E5E5DF"
                strokeDasharray="4 4"
                rx="8"
              />
              <text x="270" y="44" className="mono text-[10px] font-semibold fill-text-muted">
                ZONE 2: RESOLVER (UDP 53)
              </text>

              <rect
                x="540"
                y="20"
                width="440"
                height="340"
                fill="none"
                stroke="#E5E5DF"
                strokeDasharray="4 4"
                rx="8"
              />
              <text x="550" y="44" className="mono text-[10px] font-semibold fill-text-muted">
                ZONE 3: GLOBAL HIERARCHY
              </text>

              <rect
                x="260"
                y="390"
                width="480"
                height="190"
                fill="none"
                stroke="#16A34A"
                strokeOpacity="0.3"
                strokeDasharray="4 4"
                rx="8"
              />
              <text x="270" y="414" className="mono text-[10px] font-bold fill-success">
                ZONE 4: HOSTING RUNTIME (TCP 443 — NO DNS TRAFFIC)
              </text>

              {/* Connecting Lines */}
              {/* Visitor <-> OS cache */}
              <path
                d="M 130 154 L 130 220"
                stroke="#1A4BFF"
                strokeWidth="2"
                strokeDasharray={currentStep >= 1 ? "none" : "4 4"}
                opacity={currentStep === 0 ? 1 : 0.4}
              />

              {/* OS Cache -> Recursive */}
              <path
                d="M 220 262 L 290 200"
                stroke="#1A4BFF"
                strokeWidth="2"
                markerEnd="url(#dns-arrow)"
                strokeDasharray={currentStep === 1 ? "4 4" : "none"}
                opacity={currentStep === 1 || currentStep === 5 ? 1 : 0.3}
              />

              {/* Recursive <-> Root */}
              <path
                d="M 490 160 L 570 90"
                stroke="#1A4BFF"
                strokeWidth="2"
                markerEnd="url(#dns-arrow)"
                strokeDasharray={currentStep === 2 ? "4 4" : "none"}
                opacity={currentStep === 2 ? 1 : 0.3}
              />

              {/* Recursive <-> TLD */}
              <path
                d="M 490 190 L 770 190"
                stroke="#1A4BFF"
                strokeWidth="2"
                markerEnd="url(#dns-arrow)"
                strokeDasharray={currentStep === 3 ? "4 4" : "none"}
                opacity={currentStep === 3 ? 1 : 0.3}
              />

              {/* Recursive <-> Authoritative */}
              <path
                d="M 490 220 L 570 290"
                stroke="#1A4BFF"
                strokeWidth="2"
                markerEnd="url(#dns-arrow)"
                strokeDasharray={currentStep === 4 ? "4 4" : "none"}
                opacity={currentStep === 4 ? 1 : 0.3}
              />

              {/* Recursive -> Visitor (Direct answer delivery) */}
              <path
                d="M 290 170 C 230 170, 220 120, 220 110"
                stroke="#1A4BFF"
                strokeWidth="2"
                markerEnd="url(#dns-arrow)"
                fill="none"
                opacity={currentStep === 5 ? 1 : 0.3}
              />

              {/* HTTP Traffic: Visitor -> Hosting Server (Green Solid) */}
              <path
                d="M 130 154 C 130 400, 200 500, 290 500"
                stroke="#16A34A"
                strokeWidth="3"
                markerEnd="url(#http-arrow)"
                fill="none"
                strokeDasharray={currentStep >= 6 ? "none" : "6 6"}
                opacity={currentStep === 6 ? 1 : 0.35}
              />

              {/* HTTP Response: Hosting -> Website Response */}
              <path
                d="M 290 520 L 220 520"
                stroke="#16A34A"
                strokeWidth="3"
                markerEnd="url(#http-arrow)"
                fill="none"
                opacity={currentStep === 7 ? 1 : 0.35}
              />

              {/* Render Nodes */}
              {DNS_NODES.map((node) => {
                const isSelected = selectedNode.id === node.id;
                const isStepActive = activeStepData.activeNodes.includes(node.id);

                return (
                  <g
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    className="cursor-pointer transition-all"
                  >
                    {/* Shadow / Glow */}
                    {isStepActive && (
                      <rect
                        x={node.x - 4}
                        y={node.y - 4}
                        width={node.w + 8}
                        height={node.h + 8}
                        rx="8"
                        fill="none"
                        stroke={node.type === "hosting" ? "#16A34A" : "#1A4BFF"}
                        strokeWidth="2"
                        className="animate-pulse"
                      />
                    )}

                    {/* Node Card Box */}
                    <rect
                      x={node.x}
                      y={node.y}
                      width={node.w}
                      height={node.h}
                      rx="6"
                      fill={
                        isSelected
                          ? "#FFFFFF"
                          : isStepActive
                            ? "#FFFFFF"
                            : "#FAF9F6"
                      }
                      stroke={
                        isSelected
                          ? "#1A4BFF"
                          : isStepActive
                            ? node.type === "hosting"
                              ? "#16A34A"
                              : "#1A4BFF"
                            : "#E5E5DF"
                      }
                      strokeWidth={isSelected ? "2" : "1"}
                    />

                    {/* Header bar in node */}
                    <rect
                      x={node.x}
                      y={node.y}
                      width={node.w}
                      height="24"
                      rx="6"
                      fill={
                        node.type === "hosting"
                          ? "#F0FDF4"
                          : isStepActive
                            ? "#EEF2FF"
                            : "#F3F3ED"
                      }
                    />

                    {/* Node Title */}
                    <text
                      x={node.x + 10}
                      y={node.y + 16}
                      className="mono text-[11px] font-bold"
                      fill={
                        node.type === "hosting"
                          ? "#16A34A"
                          : isStepActive
                            ? "#1A4BFF"
                            : "#121316"
                      }
                    >
                      {node.name}
                    </text>

                    {/* Node Subtitle */}
                    <text
                      x={node.x + 10}
                      y={node.y + 42}
                      className="text-[11px] font-medium"
                      fill="#121316"
                    >
                      {node.subtitle}
                    </text>

                    {/* Node Port / Protocol Badge */}
                    <rect
                      x={node.x + 10}
                      y={node.y + 54}
                      width={node.w - 20}
                      height="18"
                      rx="3"
                      fill="#FFFFFF"
                      stroke="#E5E5DF"
                      strokeWidth="0.8"
                    />
                    <text
                      x={node.x + 16}
                      y={node.y + 67}
                      className="mono text-[9px] font-semibold"
                      fill="#5A5C66"
                    >
                      {node.protocol} · {node.port}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Technical Component Inspector Sidebar */}
        <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-border bg-surface p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-accent" />
              <h4 className="mono text-xs font-bold uppercase tracking-wider text-text">
                Component Inspector
              </h4>
            </div>
            <span className="mono text-[10px] px-2 py-0.5 border border-border bg-surface-muted text-accent">
              CLICK ANY NODE
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <span className="mono text-[10px] uppercase text-text-muted">Selected Component</span>
              <h3 className="text-sm font-bold text-text mt-0.5">{selectedNode.name}</h3>
              <p className="text-xs text-accent font-medium">{selectedNode.subtitle}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 border border-border bg-surface-muted/40">
                <span className="mono text-[9px] uppercase text-text-muted block">Protocol</span>
                <span className="font-mono text-[11px] font-semibold text-text">
                  {selectedNode.protocol}
                </span>
              </div>
              <div className="p-2 border border-border bg-surface-muted/40">
                <span className="mono text-[9px] uppercase text-text-muted block">Port / Layer</span>
                <span className="font-mono text-[11px] font-semibold text-text">
                  {selectedNode.port}
                </span>
              </div>
            </div>

            <div className="p-2.5 border border-border bg-surface-muted/40 space-y-1">
              <span className="mono text-[9px] uppercase text-text-muted block">Resolved Address</span>
              <div className="mono text-xs font-bold text-accent">{selectedNode.address}</div>
            </div>

            <div className="space-y-1">
              <span className="mono text-[10px] uppercase text-text-muted">Functional Role</span>
              <p className="text-xs text-text leading-relaxed bg-background p-2.5 border border-border">
                {selectedNode.role}
              </p>
            </div>

            <div className="space-y-1">
              <span className="mono text-[10px] uppercase text-text-muted">Technical Details</span>
              <p className="text-xs text-text-muted leading-relaxed">
                {selectedNode.description}
              </p>
            </div>
          </div>

          {/* Current Step Callout */}
          <div className="mt-4 pt-4 border-t border-border">
            <span className="mono text-[10px] font-bold uppercase tracking-wider text-accent block mb-1">
              Active Resolution State
            </span>
            <div className="border border-accent/20 bg-accent-soft p-3">
              <div className="text-xs font-bold text-accent">{activeStepData.title}</div>
              <p className="text-xs text-text mt-1">{activeStepData.summary}</p>
              <p className="text-[11px] text-text-muted mt-1.5 font-mono">
                {activeStepData.detail}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Legend Footer */}
      <div className="flex flex-wrap items-center justify-between border-t border-border bg-surface-muted/30 px-4 py-2.5 text-xs text-text-muted gap-3">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="h-0.5 w-6 bg-accent" />
            <span className="font-mono text-[11px]">DNS Resolution Flow (UDP 53)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-1 w-6 bg-success rounded-full" />
            <span className="font-mono text-[11px]">Direct Web Traffic (TCP 443 HTTPS)</span>
          </div>
        </div>
        <div className="mono text-[11px] text-accent">
          Example: <span className="font-bold">piyushprasad.in</span> → <span className="font-bold">76.76.21.21</span>
        </div>
      </div>
    </div>
  );
}
