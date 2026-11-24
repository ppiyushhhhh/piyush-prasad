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
  Cloud,
  Server,
  Database,
  HardDrive,
  Users,
  ShieldCheck,
  CheckCircle2,
  Layers,
  Gauge,
  Workflow,
} from "lucide-react";

interface AwsStep {
  stepNumber: number;
  activeNodeId: string;
  sourceNodeId?: string;
  targetNodeId?: string;
  title: string;
  whatIsHappening: string;
  whyImportant: string;
  realWorldExample: string;
}

const AWS_STEPS: AwsStep[] = [
  {
    stepNumber: 1,
    activeNodeId: "user",
    title: "1. Visitor Opens Website",
    whatIsHappening:
      "A visitor accesses the web application from their computer or mobile phone. Their browser sends an HTTPS web request across the public internet.",
    whyImportant:
      "Every web interaction begins with an end-user request that needs to be securely routed to cloud infrastructure.",
    realWorldExample:
      "A customer walks up to the entrance of a busy shopping department store.",
  },
  {
    stepNumber: 2,
    activeNodeId: "alb",
    sourceNodeId: "user",
    targetNodeId: "alb",
    title: "2. Load Balancer Receives Request",
    whatIsHappening:
      "The request arrives at the Application Load Balancer in the public subnet. The Load Balancer checks health status of backend servers and inspects incoming traffic.",
    whyImportant:
      "The load balancer protects backend servers from direct internet exposure and prevents any single server from becoming overwhelmed.",
    realWorldExample:
      "A front-desk greeter directs visitors to available service counters so no single counter gets an endless queue.",
  },
  {
    stepNumber: 3,
    activeNodeId: "ec2-1",
    sourceNodeId: "alb",
    targetNodeId: "ec2-1",
    title: "3. Balancer Routes to EC2 Instance",
    whatIsHappening:
      "The load balancer routes the request forward across the private subnet boundary to an active EC2 virtual server instance.",
    whyImportant:
      "EC2 servers stay securely inside a private subnet, shielded away from direct public internet exposure.",
    realWorldExample:
      "The greeter leads the customer into a private consultation booth to discuss their order.",
  },
  {
    stepNumber: 4,
    activeNodeId: "ec2-1",
    title: "4. EC2 Processes the Request",
    whatIsHappening:
      "The EC2 virtual server runs the application backend (Node.js, Python, or Go). It computes the business logic, renders templates, and determines what data is needed.",
    whyImportant:
      "EC2 provides scalable computing power that can be resized or duplicated as traffic increases.",
    realWorldExample:
      "The customer service agent types your request into their computer and figures out what details are needed.",
  },
  {
    stepNumber: 5,
    activeNodeId: "rds",
    sourceNodeId: "ec2-1",
    targetNodeId: "rds",
    title: "5. EC2 Queries RDS Database",
    whatIsHappening:
      "When user data, account records, or orders are needed, the EC2 server communicates securely with the Amazon RDS managed database.",
    whyImportant:
      "Amazon RDS automatically handles database backups, security patches, and hardware maintenance so your records remain safe.",
    realWorldExample:
      "The agent checks the secure internal filing cabinet to retrieve your account history.",
  },
  {
    stepNumber: 6,
    activeNodeId: "s3",
    sourceNodeId: "ec2-1",
    targetNodeId: "s3",
    title: "6. EC2 Accesses S3 File Storage",
    whatIsHappening:
      "When product photos, PDF reports, or media attachments are requested, EC2 fetches the files directly from Amazon S3 object storage outside the VPC.",
    whyImportant:
      "Amazon S3 offers practically unlimited, highly durable file storage without taking up disk space on your compute servers.",
    realWorldExample:
      "The agent pulls a product catalog from a central storage warehouse.",
  },
  {
    stepNumber: 7,
    activeNodeId: "user",
    sourceNodeId: "ec2-1",
    targetNodeId: "user",
    title: "7. Application Returns Response",
    whatIsHappening:
      "The EC2 server compiles the data into the final webpage or API response and returns it back to the visitor's browser in under a fraction of a second.",
    whyImportant:
      "All services successfully collaborated: computing (EC2), data (RDS), files (S3), and networking (VPC & ALB).",
    realWorldExample:
      "The agent hands you the completed order receipt and answers your questions with a smile.",
  },
];

export function AwsArchitectureDiagram() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const step = AWS_STEPS[currentStepIndex];

  // Auto-play timer
  useEffect(() => {
    if (!isPlaying) return;

    const delay = 3800 / playbackSpeed;
    const timer = setTimeout(() => {
      setCurrentStepIndex((prev) => (prev + 1) % AWS_STEPS.length);
    }, delay);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStepIndex, playbackSpeed]);

  const handleNext = () => {
    setIsPlaying(false);
    setCurrentStepIndex((prev) => (prev + 1) % AWS_STEPS.length);
  };

  const handlePrev = () => {
    setIsPlaying(false);
    setCurrentStepIndex((prev) => (prev - 1 + AWS_STEPS.length) % AWS_STEPS.length);
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
            <Cloud className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="mono text-xs font-bold uppercase tracking-wider text-text">
                Live AWS Reference Architecture
              </span>
              <span className="mono text-[9px] font-bold px-2 py-0.5 rounded-full uppercase border border-amber-500/30 bg-amber-500/10 text-amber-700">
                Multi-Tier Cloud
              </span>
            </div>
            <div className="mono text-[10px] text-text-muted">
              Step {step.stepNumber} of {AWS_STEPS.length} &bull; {step.title}
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
        className="relative h-[380px] sm:h-[420px] w-full overflow-hidden bg-[#FAFAF8] select-none cursor-grab active:cursor-grabbing"
      >
        <svg
          viewBox="0 0 980 430"
          className="h-full w-full transition-transform duration-100 ease-out"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoomLevel})`,
            transformOrigin: "center center",
          }}
        >
          <defs>
            <marker id="aws-arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#0D9488" />
            </marker>
            <marker id="aws-arrow-inactive" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#CBD5E1" />
            </marker>
          </defs>

          {/* 1. Internet User (Top Center) */}
          <g
            className="cursor-pointer"
            onClick={() => {
              setIsPlaying(false);
              setCurrentStepIndex(0);
            }}
          >
            <rect
              x="390"
              y="15"
              width="200"
              height="58"
              rx="6"
              fill={step.activeNodeId === "user" ? "#FFFFFF" : "#F8FAFC"}
              stroke={step.activeNodeId === "user" ? "#0D9488" : "#CBD5E1"}
              strokeWidth={step.activeNodeId === "user" ? 2.5 : 1.2}
              filter={step.activeNodeId === "user" ? "drop-shadow(0 4px 6px rgba(13, 148, 136, 0.2))" : undefined}
            />
            <circle cx="408" cy="44" r="4" fill={step.activeNodeId === "user" ? "#0D9488" : "#10B981"} />
            <text x="422" y="38" fill="#0F172A" fontSize="12" fontWeight="700" fontFamily="system-ui, sans-serif">
              Internet Visitor
            </text>
            <text x="422" y="54" fill="#64748B" fontSize="10" fontFamily="monospace">
              Public HTTPS Traffic
            </text>
          </g>

          {/* 2. AWS VPC Boundary (Big outer box) */}
          <rect
            x="30"
            y="95"
            width="680"
            height="315"
            rx="8"
            fill="#FFFFFF"
            stroke="#94A3B8"
            strokeWidth="1.2"
            strokeDasharray="5 5"
          />
          <text x="45" y="115" fill="#475569" fontSize="11" fontFamily="monospace" fontWeight="700">
            AWS VPC (Virtual Private Cloud — 10.0.0.0/16)
          </text>

          {/* 2a. Public Subnet Box */}
          <rect
            x="50"
            y="125"
            width="640"
            height="78"
            rx="6"
            fill="#F0FDF4"
            stroke="#BBF7D0"
            strokeWidth="1"
          />
          <text x="65" y="142" fill="#166534" fontSize="10" fontFamily="monospace" fontWeight="600">
            PUBLIC SUBNET (Internet-Facing)
          </text>

          {/* Load Balancer Card inside Public Subnet */}
          <g
            className="cursor-pointer"
            onClick={() => {
              setIsPlaying(false);
              setCurrentStepIndex(1);
            }}
          >
            <rect
              x="390"
              y="140"
              width="200"
              height="52"
              rx="5"
              fill="#FFFFFF"
              stroke={step.activeNodeId === "alb" ? "#0D9488" : "#94A3B8"}
              strokeWidth={step.activeNodeId === "alb" ? 2.5 : 1.2}
              filter={step.activeNodeId === "alb" ? "drop-shadow(0 4px 6px rgba(13, 148, 136, 0.2))" : undefined}
            />
            <circle cx="408" cy="166" r="4" fill={step.activeNodeId === "alb" ? "#0D9488" : "#0284C7"} />
            <text x="422" y="161" fill="#0F172A" fontSize="12" fontWeight="700">
              Application Load Balancer
            </text>
            <text x="422" y="177" fill="#64748B" fontSize="10" fontFamily="monospace">
              Traffic Distributor
            </text>
          </g>

          {/* 2b. Private Subnet Box */}
          <rect
            x="50"
            y="215"
            width="640"
            height="180"
            rx="6"
            fill="#F8FAFC"
            stroke="#E2E8F0"
            strokeWidth="1"
          />
          <text x="65" y="232" fill="#334155" fontSize="10" fontFamily="monospace" fontWeight="600">
            PRIVATE SUBNET (Isolated Compute &amp; Database)
          </text>

          {/* EC2 Server 1 Card */}
          <g
            className="cursor-pointer"
            onClick={() => {
              setIsPlaying(false);
              setCurrentStepIndex(2);
            }}
          >
            <rect
              x="160"
              y="245"
              width="190"
              height="60"
              rx="5"
              fill="#FFFFFF"
              stroke={step.activeNodeId === "ec2-1" ? "#0D9488" : "#CBD5E1"}
              strokeWidth={step.activeNodeId === "ec2-1" ? 2.5 : 1.2}
              filter={step.activeNodeId === "ec2-1" ? "drop-shadow(0 4px 6px rgba(13, 148, 136, 0.2))" : undefined}
            />
            <circle cx="178" cy="275" r="4" fill={step.activeNodeId === "ec2-1" ? "#0D9488" : "#10B981"} />
            <text x="192" y="270" fill="#0F172A" fontSize="12" fontWeight="700">
              EC2 Server (Primary)
            </text>
            <text x="192" y="286" fill="#64748B" fontSize="10" fontFamily="monospace">
              Ubuntu Virtual Server
            </text>
          </g>

          {/* EC2 Server 2 Card */}
          <g
            className="cursor-pointer"
            onClick={() => {
              setIsPlaying(false);
              setCurrentStepIndex(2);
            }}
          >
            <rect
              x="430"
              y="245"
              width="190"
              height="60"
              rx="5"
              fill="#FFFFFF"
              stroke="#CBD5E1"
              strokeWidth="1.2"
            />
            <circle cx="448" cy="275" r="4" fill="#10B981" />
            <text x="462" y="270" fill="#0F172A" fontSize="12" fontWeight="700">
              EC2 Server (Standby)
            </text>
            <text x="462" y="286" fill="#64748B" fontSize="10" fontFamily="monospace">
              Auto-Scaling Target
            </text>
          </g>

          {/* RDS Database Card */}
          <g
            className="cursor-pointer"
            onClick={() => {
              setIsPlaying(false);
              setCurrentStepIndex(4);
            }}
          >
            <rect
              x="295"
              y="325"
              width="210"
              height="58"
              rx="5"
              fill="#FFFFFF"
              stroke={step.activeNodeId === "rds" ? "#0D9488" : "#CBD5E1"}
              strokeWidth={step.activeNodeId === "rds" ? 2.5 : 1.2}
              filter={step.activeNodeId === "rds" ? "drop-shadow(0 4px 6px rgba(13, 148, 136, 0.2))" : undefined}
            />
            <circle cx="313" cy="354" r="4" fill={step.activeNodeId === "rds" ? "#0D9488" : "#0284C7"} />
            <text x="327" y="348" fill="#0F172A" fontSize="12" fontWeight="700">
              Amazon RDS Database
            </text>
            <text x="327" y="364" fill="#64748B" fontSize="10" fontFamily="monospace">
              PostgreSQL / MySQL Data
            </text>
          </g>

          {/* 3. Outside VPC: Amazon S3 File Storage */}
          <rect
            x="740"
            y="95"
            width="210"
            height="315"
            rx="8"
            fill="#FEF3C7"
            stroke="#FDE68A"
            strokeWidth="1.2"
            strokeDasharray="4 4"
          />
          <text x="755" y="118" fill="#92400E" fontSize="11" fontFamily="monospace" fontWeight="700">
            AWS REGIONAL STORAGE
          </text>
          <text x="755" y="134" fill="#B45309" fontSize="9" fontFamily="monospace">
            (Outside VPC Subnets)
          </text>

          {/* S3 Storage Card */}
          <g
            className="cursor-pointer"
            onClick={() => {
              setIsPlaying(false);
              setCurrentStepIndex(5);
            }}
          >
            <rect
              x="755"
              y="180"
              width="180"
              height="80"
              rx="6"
              fill="#FFFFFF"
              stroke={step.activeNodeId === "s3" ? "#0D9488" : "#D97706"}
              strokeWidth={step.activeNodeId === "s3" ? 2.5 : 1.2}
              filter={step.activeNodeId === "s3" ? "drop-shadow(0 4px 6px rgba(13, 148, 136, 0.2))" : undefined}
            />
            <circle cx="773" cy="210" r="4" fill={step.activeNodeId === "s3" ? "#0D9488" : "#D97706"} />
            <text x="787" y="206" fill="#0F172A" fontSize="12" fontWeight="700">
              Amazon S3 Storage
            </text>
            <text x="787" y="224" fill="#64748B" fontSize="10" fontFamily="monospace">
              Static Assets &amp; Media
            </text>
            <text x="787" y="240" fill="#94A3B8" fontSize="9" fontFamily="monospace">
              Unlimited File Storage
            </text>
          </g>

          {/* Connections & Paths */}
          {/* User -> Load Balancer */}
          <line
            x1="490"
            y1="73"
            x2="490"
            y2="140"
            stroke={currentStepIndex >= 1 ? "#0D9488" : "#CBD5E1"}
            strokeWidth={currentStepIndex === 1 ? 2.5 : 1.5}
            strokeDasharray={currentStepIndex === 1 ? "4 4" : undefined}
            markerEnd={currentStepIndex >= 1 ? "url(#aws-arrow)" : "url(#aws-arrow-inactive)"}
          />

          {/* Load Balancer -> EC2 Primary */}
          <path
            d="M 460 192 L 460 215 L 255 215 L 255 245"
            fill="none"
            stroke={currentStepIndex >= 2 ? "#0D9488" : "#CBD5E1"}
            strokeWidth={currentStepIndex === 2 ? 2.5 : 1.5}
            strokeDasharray={currentStepIndex === 2 ? "4 4" : undefined}
            markerEnd={currentStepIndex >= 2 ? "url(#aws-arrow)" : "url(#aws-arrow-inactive)"}
          />

          {/* Load Balancer -> EC2 Standby (Inactive path) */}
          <path
            d="M 520 192 L 520 215 L 525 215 L 525 245"
            fill="none"
            stroke="#CBD5E1"
            strokeWidth="1.2"
            markerEnd="url(#aws-arrow-inactive)"
          />

          {/* EC2 Primary -> RDS Database */}
          <path
            d="M 255 305 L 255 354 L 295 354"
            fill="none"
            stroke={currentStepIndex === 4 ? "#0D9488" : "#CBD5E1"}
            strokeWidth={currentStepIndex === 4 ? 2.5 : 1.5}
            strokeDasharray={currentStepIndex === 4 ? "4 4" : undefined}
            markerEnd={currentStepIndex === 4 ? "url(#aws-arrow)" : "url(#aws-arrow-inactive)"}
          />

          {/* EC2 Primary -> S3 File Storage (Accessing outside VPC) */}
          <path
            d="M 350 275 L 755 220"
            fill="none"
            stroke={currentStepIndex === 5 ? "#0D9488" : "#CBD5E1"}
            strokeWidth={currentStepIndex === 5 ? 2.5 : 1.5}
            strokeDasharray={currentStepIndex === 5 ? "4 4" : undefined}
            markerEnd={currentStepIndex === 5 ? "url(#aws-arrow)" : "url(#aws-arrow-inactive)"}
          />

          {/* Animated Indicators */}
          {currentStepIndex === 1 && <circle cx="490" cy="105" r="5" fill="#0D9488" className="animate-ping" />}
          {currentStepIndex === 2 && <circle cx="340" cy="215" r="5" fill="#0D9488" className="animate-ping" />}
          {currentStepIndex === 3 && <circle cx="255" cy="275" r="5" fill="#0D9488" className="animate-ping" />}
          {currentStepIndex === 4 && <circle cx="255" cy="335" r="5" fill="#0D9488" className="animate-ping" />}
          {currentStepIndex === 5 && <circle cx="550" cy="248" r="5" fill="#0D9488" className="animate-ping" />}
          {currentStepIndex === 6 && <circle cx="490" cy="90" r="5" fill="#0D9488" className="animate-ping" />}
        </svg>

        {/* Step Progression Bar at Bottom of Canvas */}
        <div className="absolute bottom-2 left-4 right-4 flex items-center justify-between text-[11px] font-mono text-text-muted bg-white/90 backdrop-blur-xs px-3 py-1.5 border border-border shadow-2xs">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-accent">STEP {step.stepNumber}:</span>
            <span className="text-text font-medium">{step.title}</span>
          </div>
          <div className="flex items-center gap-1">
            {AWS_STEPS.map((_, i) => (
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
          <div className="mono text-[10px] font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-600" />
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
