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
  Cloud,
  Database,
  ShieldCheck,
  HardDrive,
  Cpu,
  Layers,
  Network,
  CheckCircle2,
} from "lucide-react";

interface AwsNode {
  id: string;
  name: string;
  category: "DNS & Entry" | "Networking" | "Load Balancing" | "Compute" | "Database" | "Storage" | "Security";
  subnet: string;
  securityGroup: string;
  inbound: string;
  outbound: string;
  role: string;
  description: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

const AWS_NODES: AwsNode[] = [
  {
    id: "user",
    name: "Internet User",
    category: "DNS & Entry",
    subnet: "Public Internet",
    securityGroup: "N/A",
    inbound: "None",
    outbound: "HTTPS (TCP 443), DNS (UDP 53)",
    role: "Global client initiating web visits.",
    description: "Visitors browsing the web application from desktop or mobile devices.",
    x: 30,
    y: 100,
    w: 140,
    h: 70,
  },
  {
    id: "route53",
    name: "Amazon Route 53",
    category: "DNS & Entry",
    subnet: "AWS Edge Network",
    securityGroup: "Global AWS",
    inbound: "DNS (UDP/TCP 53)",
    outbound: "DNS Answers (Alias to ALB)",
    role: "Highly available and scalable cloud Domain Name System (DNS).",
    description: "Resolves domain names and uses Latency / Health-check routing to route users to the nearest Application Load Balancer.",
    x: 30,
    y: 220,
    w: 140,
    h: 70,
  },
  {
    id: "igw",
    name: "Internet Gateway (IGW)",
    category: "Networking",
    subnet: "VPC Ingress Boundary",
    securityGroup: "VPC Route Table",
    inbound: "Internet Ingress (0.0.0.0/0)",
    outbound: "VPC Public Subnets",
    role: "Horizontally scaled, redundant VPC component that enables communication with the internet.",
    description: "Performs 1-to-1 NAT translation and allows bidirectional communication between public subnet resources and the internet.",
    x: 30,
    y: 350,
    w: 140,
    h: 70,
  },
  {
    id: "alb",
    name: "Application Load Balancer",
    category: "Load Balancing",
    subnet: "Public Subnets (AZ-a & AZ-b)",
    securityGroup: "sg-alb (Allow 80, 443 from 0.0.0.0/0)",
    inbound: "HTTPS 443, HTTP 80 (Redirect to 443)",
    outbound: "HTTP 3000 to sg-ec2",
    role: "Distributes incoming application traffic across EC2 targets in multiple Availability Zones.",
    description: "Terminates TLS/SSL using ACM certificates, inspects HTTP headers, executes health checks, and balances load across backend compute nodes.",
    x: 230,
    y: 190,
    w: 180,
    h: 84,
  },
  {
    id: "nat",
    name: "NAT Gateway",
    category: "Networking",
    subnet: "Public Subnet (10.0.1.0/24)",
    securityGroup: "Public Subnet Route",
    inbound: "Outbound queries from Private Subnets",
    outbound: "Egress to Internet Gateway (EIP)",
    role: "Enables outbound internet access for private EC2 instances without exposing them to inbound connections.",
    description: "Allows private EC2 instances to download OS security patches, package updates, and third-party API dependencies safely.",
    x: 230,
    y: 340,
    w: 180,
    h: 80,
  },
  {
    id: "ec2-1",
    name: "EC2 Instance 1 (AZ-a)",
    category: "Compute",
    subnet: "Private App Subnet (10.0.10.0/24)",
    securityGroup: "sg-ec2 (Allow 3000 from sg-alb only)",
    inbound: "TCP 3000 from sg-alb",
    outbound: "TCP 5432 to sg-rds, S3 via Endpoint",
    role: "Runs Node.js / Dockerized web application runtime in an isolated private subnet.",
    description: "Has no public IP address. Accessible only through the load balancer or private Systems Manager (SSM) Session Manager.",
    x: 480,
    y: 140,
    w: 190,
    h: 84,
  },
  {
    id: "ec2-2",
    name: "EC2 Instance 2 (AZ-b)",
    category: "Compute",
    subnet: "Private App Subnet (10.0.20.0/24)",
    securityGroup: "sg-ec2 (Allow 3000 from sg-alb only)",
    inbound: "TCP 3000 from sg-alb",
    outbound: "TCP 5432 to sg-rds, S3 via Endpoint",
    role: "Redundant compute instance in a secondary Availability Zone providing fault tolerance.",
    description: "If AZ-a suffers an infrastructure failure, the ALB instantly shifts 100% of incoming requests to this instance with zero user impact.",
    x: 480,
    y: 260,
    w: 190,
    h: 84,
  },
  {
    id: "rds",
    name: "Amazon RDS Multi-AZ",
    category: "Database",
    subnet: "Private DB Subnets (10.0.100.0/24)",
    securityGroup: "sg-rds (Allow 5432 from sg-ec2 only)",
    inbound: "TCP 5432 (Postgres) from sg-ec2",
    outbound: "Automated snapshots to S3",
    role: "Fully managed relational database cluster with synchronous standby replication.",
    description: "Stores transactional application state. Strictly isolated from public internet: accepts connections ONLY from compute security group.",
    x: 740,
    y: 190,
    w: 220,
    h: 88,
  },
  {
    id: "s3",
    name: "Amazon S3 Bucket",
    category: "Storage",
    subnet: "Global AWS Storage (VPC Gateway Endpoint)",
    securityGroup: "IAM Bucket Policy + VPC Endpoint",
    inbound: "HTTPS via S3 Gateway VPC Endpoint",
    outbound: "None",
    role: "Object storage for media uploads, document storage, and automated database backups.",
    description: "S3 resides in AWS regional space. Private EC2 instances communicate with S3 over private AWS networking via an S3 Gateway VPC Endpoint, without traversing the public internet.",
    x: 740,
    y: 350,
    w: 220,
    h: 84,
  },
];

const AWS_JOURNEY_STEPS = [
  {
    step: 1,
    title: "1. DNS Resolution (Route 53)",
    summary: "User queries Route 53 for application URL.",
    detail: "Route 53 resolves the domain using an Alias record pointing to the Application Load Balancer DNS name.",
    activeNodes: ["user", "route53"],
  },
  {
    step: 2,
    title: "2. Ingress Traffic via IGW to ALB",
    summary: "HTTPS request enters VPC via Internet Gateway to the ALB.",
    detail: "The Application Load Balancer on public subnets terminates TLS 1.3 encryption using an ACM SSL certificate.",
    activeNodes: ["igw", "alb"],
  },
  {
    step: 3,
    title: "3. Traffic Distribution to Private EC2",
    summary: "ALB balances traffic across EC2 instances in private subnets.",
    detail: "ALB evaluates target health check responses on /health and routes the HTTP request to healthy compute targets.",
    activeNodes: ["alb", "ec2-1", "ec2-2"],
  },
  {
    step: 4,
    title: "4. Database Query to Amazon RDS",
    summary: "Backend app executes SQL query against private RDS cluster.",
    detail: "Traffic flows over private VPC routing on port 5432. The database is strictly isolated from all external ingress.",
    activeNodes: ["ec2-1", "ec2-2", "rds"],
  },
  {
    step: 5,
    title: "5. Object Storage Access (Amazon S3)",
    summary: "EC2 uploads / fetches static assets and backups from S3.",
    detail: "Requests route through the VPC Gateway Endpoint for S3 directly over AWS internal backbone with zero NAT transfer fees.",
    activeNodes: ["ec2-1", "ec2-2", "s3"],
  },
  {
    step: 6,
    title: "6. Response Returned to Visitor",
    summary: "The application response streams back to the visitor.",
    detail: "Data passes through ALB, out through the Internet Gateway, and renders securely on the visitor's browser.",
    activeNodes: ["alb", "user"],
  },
];

export function AwsArchitectureDiagram() {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [selectedNode, setSelectedNode] = useState<AwsNode>(AWS_NODES[3]); // Default ALB
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentStep((prev) => (prev + 1) % AWS_JOURNEY_STEPS.length);
      }, 3000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying]);

  const activeStep = AWS_JOURNEY_STEPS[currentStep];

  const handleNext = () => {
    setIsPlaying(false);
    setCurrentStep((prev) => (prev + 1) % AWS_JOURNEY_STEPS.length);
  };

  const handlePrev = () => {
    setIsPlaying(false);
    setCurrentStep((prev) => (prev - 1 + AWS_JOURNEY_STEPS.length) % AWS_JOURNEY_STEPS.length);
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
            <Cloud className="h-4 w-4 text-accent" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-text">
              AWS Cloud Reference Architecture: EC2, S3, RDS, VPC &amp; ALB
            </h3>
          </div>
          <p className="text-xs text-text-muted mt-0.5">
            Journey Step {activeStep.step} of 6:{" "}
            <span className="font-semibold text-accent">{activeStep.title}</span>
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
                <span>Play Journey</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handlePrev}
            className="inline-flex h-8 w-8 items-center justify-center border border-border bg-surface text-text hover:border-accent cursor-pointer"
            title="Previous Step"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="inline-flex h-8 w-8 items-center justify-center border border-border bg-surface text-text hover:border-accent cursor-pointer"
            title="Next Step"
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
        {AWS_JOURNEY_STEPS.map((s, idx) => {
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

      {/* Canvas & Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
        {/* SVG Canvas */}
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
              viewBox="0 0 1000 520"
              className="w-full h-auto select-none font-sans"
              style={{ minWidth: "800px" }}
            >
              <defs>
                <marker
                  id="aws-arrow"
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
                  id="aws-success-arrow"
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
              <pattern id="aws-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E5E5DF" strokeWidth="0.5" />
              </pattern>
              <rect width="1000" height="520" fill="url(#aws-grid)" opacity="0.4" />

              {/* VPC Boundary Box */}
              <rect
                x="200"
                y="30"
                width="780"
                height="460"
                fill="#FAF9F6"
                stroke="#1A4BFF"
                strokeWidth="1.5"
                strokeDasharray="6 4"
                rx="12"
              />
              <text x="215" y="55" className="mono text-[11px] font-bold fill-accent">
                Amazon VPC (10.0.0.0/16) · Isolated Cloud Network
              </text>

              {/* Public Subnet Tier */}
              <rect
                x="215"
                y="70"
                width="210"
                height="400"
                fill="#FFFFFF"
                stroke="#E5E5DF"
                rx="8"
              />
              <text x="225" y="92" className="mono text-[10px] font-semibold fill-text-muted">
                PUBLIC SUBNETS (10.0.1.0/24)
              </text>

              {/* Private App Subnet Tier */}
              <rect
                x="450"
                y="70"
                width="250"
                height="400"
                fill="#FFFFFF"
                stroke="#E5E5DF"
                rx="8"
              />
              <text x="460" y="92" className="mono text-[10px] font-semibold fill-text-muted">
                PRIVATE COMPUTE SUBNETS (10.0.10.0/24)
              </text>

              {/* Private DB Subnet Tier */}
              <rect
                x="720"
                y="70"
                width="245"
                height="240"
                fill="#FFFFFF"
                stroke="#E5E5DF"
                rx="8"
              />
              <text x="730" y="92" className="mono text-[10px] font-semibold fill-text-muted">
                PRIVATE DB SUBNETS (10.0.100.0/24)
              </text>

              {/* S3 Regional Gateway Endpoint Connection Note */}
              <rect
                x="720"
                y="325"
                width="245"
                height="145"
                fill="#F8FAFC"
                stroke="#E5E5DF"
                strokeDasharray="4 3"
                rx="8"
              />
              <text x="730" y="342" className="mono text-[9px] font-bold fill-accent">
                REGIONAL AWS SERVICE (S3 GATEWAY ENDPOINT)
              </text>

              {/* Connectors */}
              {/* User -> Route53 */}
              <path
                d="M 100 170 L 100 220"
                stroke="#1A4BFF"
                strokeWidth="2"
                markerEnd="url(#aws-arrow)"
                opacity={currentStep === 0 ? 1 : 0.3}
              />

              {/* User -> IGW */}
              <path
                d="M 100 290 L 100 350"
                stroke="#1A4BFF"
                strokeWidth="2"
                markerEnd="url(#aws-arrow)"
                opacity={currentStep === 1 ? 1 : 0.3}
              />

              {/* IGW -> ALB */}
              <path
                d="M 170 385 C 200 385, 200 232, 230 232"
                stroke="#1A4BFF"
                strokeWidth="2.5"
                fill="none"
                markerEnd="url(#aws-arrow)"
                opacity={currentStep === 1 || currentStep === 2 ? 1 : 0.35}
              />

              {/* ALB -> EC2-1 & EC2-2 */}
              <path
                d="M 410 215 L 480 182"
                stroke="#1A4BFF"
                strokeWidth="2"
                markerEnd="url(#aws-arrow)"
                opacity={currentStep === 2 ? 1 : 0.4}
              />
              <path
                d="M 410 250 L 480 282"
                stroke="#1A4BFF"
                strokeWidth="2"
                markerEnd="url(#aws-arrow)"
                opacity={currentStep === 2 ? 1 : 0.4}
              />

              {/* EC2 -> RDS */}
              <path
                d="M 670 182 L 740 215"
                stroke="#1A4BFF"
                strokeWidth="2"
                markerEnd="url(#aws-arrow)"
                opacity={currentStep === 3 ? 1 : 0.4}
              />
              <path
                d="M 670 282 L 740 245"
                stroke="#1A4BFF"
                strokeWidth="2"
                markerEnd="url(#aws-arrow)"
                opacity={currentStep === 3 ? 1 : 0.4}
              />

              {/* EC2 -> S3 (via Endpoint) */}
              <path
                d="M 670 310 C 700 310, 710 392, 740 392"
                stroke="#16A34A"
                strokeWidth="2"
                strokeDasharray="4 4"
                fill="none"
                markerEnd="url(#aws-success-arrow)"
                opacity={currentStep === 4 ? 1 : 0.4}
              />

              {/* EC2 -> NAT Gateway (Outbound updates) */}
              <path
                d="M 480 320 C 440 320, 430 380, 410 380"
                stroke="#94A3B8"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                fill="none"
                markerEnd="url(#aws-arrow)"
                opacity="0.5"
              />

              {/* NAT -> IGW */}
              <path
                d="M 230 390 L 170 390"
                stroke="#94A3B8"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                fill="none"
                opacity="0.5"
              />

              {/* Render Nodes */}
              {AWS_NODES.map((node) => {
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

                    {/* Subnet / Category */}
                    <text
                      x={node.x + 8}
                      y={node.y + 36}
                      className="mono text-[9px] font-semibold"
                      fill="#5A5C66"
                    >
                      {node.category}
                    </text>

                    {/* Security Group or Inbound preview */}
                    <text
                      x={node.x + 8}
                      y={node.y + 52}
                      className="mono text-[8.5px] truncate"
                      fill="#1A4BFF"
                    >
                      {node.securityGroup.split(" (")[0]}
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
                AWS Inspector
              </h4>
            </div>
            <span className="mono text-[10px] px-2 py-0.5 border border-border bg-surface-muted text-accent">
              CLICK ANY COMPONENT
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <span className="mono text-[10px] uppercase text-text-muted">Resource</span>
              <h3 className="text-sm font-bold text-text mt-0.5">{selectedNode.name}</h3>
              <p className="text-xs text-accent font-medium">{selectedNode.category}</p>
            </div>

            <div className="p-2.5 border border-border bg-surface-muted/40 space-y-1">
              <span className="mono text-[9px] uppercase text-text-muted block">VPC Subnet Placement</span>
              <div className="mono text-xs font-bold text-text">{selectedNode.subnet}</div>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="p-2 border border-border bg-surface-muted/40">
                <span className="mono text-[9px] uppercase text-text-muted block">Security Group / Policy</span>
                <span className="font-mono text-[11px] font-semibold text-text">
                  {selectedNode.securityGroup}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 border border-border bg-surface-muted/40">
                  <span className="mono text-[9px] uppercase text-text-muted block">Inbound Ingress</span>
                  <span className="font-mono text-[10px] font-medium text-text">
                    {selectedNode.inbound}
                  </span>
                </div>
                <div className="p-2 border border-border bg-surface-muted/40">
                  <span className="mono text-[9px] uppercase text-text-muted block">Outbound Egress</span>
                  <span className="font-mono text-[10px] font-medium text-text">
                    {selectedNode.outbound}
                  </span>
                </div>
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

          {/* Current Request Journey Step */}
          <div className="mt-4 pt-4 border-t border-border">
            <span className="mono text-[10px] font-bold uppercase tracking-wider text-accent block mb-1">
              Current Journey Stage
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

      {/* Footer Notes */}
      <div className="flex flex-wrap items-center justify-between border-t border-border bg-surface-muted/30 px-4 py-2.5 text-xs text-text-muted gap-3">
        <div className="flex items-center gap-4 text-[11px] font-mono">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-accent" />
            <span>ALB Ingress (Port 443)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-success" />
            <span>VPC Gateway Endpoint (S3)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-slate-400" />
            <span>Private DB Isolation (Port 5432)</span>
          </span>
        </div>
        <div className="mono text-[11px] text-text-muted italic">
          Reference Architecture · Multi-AZ High Availability
        </div>
      </div>
    </div>
  );
}
