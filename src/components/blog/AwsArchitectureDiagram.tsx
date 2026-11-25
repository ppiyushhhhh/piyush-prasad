import { useState, useEffect, useRef, useMemo } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  ZoomIn,
  ZoomOut,
  Cloud,
  Server,
  Database,
  Users,
  ShieldCheck,
  Lock,
  Workflow,
  Boxes,
  Activity,
  DollarSign,
  Trash2,
  CheckCircle2,
  Info,
  Layers,
  ArrowRight,
} from "lucide-react";
import { TECH_LOGO_REGISTRY } from "@/lib/tech-logo-registry";

export type ArchitectureFlowType = "all" | "cicd" | "traffic" | "data" | "monitoring";

interface AwsStep {
  stepNumber: number;
  flow: ArchitectureFlowType;
  activeNodeId: string;
  sourceNodeId?: string;
  targetNodeId?: string;
  title: string;
  flowCategory: "CI/CD & OIDC" | "Networking & Ingress" | "Compute (EKS)" | "Database & Secrets" | "Observability";
  whatIsHappening: string;
  whyImportant: string;
  realWorldAnalogy: string;
}

const AWS_STEPS: AwsStep[] = [
  {
    stepNumber: 1,
    flow: "cicd",
    activeNodeId: "github-actions",
    sourceNodeId: "github-actions",
    targetNodeId: "ecr",
    title: "1. GitHub Actions Builds & Pushes via OIDC",
    flowCategory: "CI/CD & OIDC",
    whatIsHappening:
      "GitHub Actions compiles the containerized web app, builds a Docker image, and assumes an AWS IAM role using OpenID Connect (OIDC). It pushes the authenticated container image to Amazon ECR without storing long-lived AWS secret access keys.",
    whyImportant:
      "GitHub OIDC eliminates static AWS credential leaks. Temporary security tokens expire automatically after the build completes.",
    realWorldAnalogy:
      "A security badge kiosk issues a 15-minute visitor pass with zero master keys stored in desk drawers.",
  },
  {
    stepNumber: 2,
    flow: "cicd",
    activeNodeId: "terraform",
    sourceNodeId: "terraform",
    targetNodeId: "vpc",
    title: "2. Terraform Provisions Multi-AZ VPC Network",
    flowCategory: "Networking & Ingress",
    whatIsHappening:
      "Terraform provisions the AWS Virtual Private Cloud (10.0.0.0/16) across multiple Availability Zones (ap-south-1a and ap-south-1b). It configures public subnets with Internet Gateways and isolated private subnets with NAT Gateways.",
    whyImportant:
      "Infrastructure as Code ensures the entire network topology is reproducible, audited, and isolated against single-datacenter outages.",
    realWorldAnalogy:
      "Civil engineers lay out zoned city districts: public storefronts out front and secure storage vaults in private access-only alleys.",
  },
  {
    stepNumber: 3,
    flow: "traffic",
    activeNodeId: "alb",
    sourceNodeId: "user",
    targetNodeId: "alb",
    title: "3. Public Ingress via Application Load Balancer",
    flowCategory: "Networking & Ingress",
    whatIsHappening:
      "Internet visitors query Amazon Route 53 DNS and establish TLS 1.3 connections to the Application Load Balancer (ALB) distributed across public subnets. The ALB terminates HTTPS and inspects incoming HTTP headers.",
    whyImportant:
      "The ALB shields backend workloads from direct public exposure, absorbs Layer 7 traffic spikes, and performs continuous health checks.",
    realWorldAnalogy:
      "A reception desk in the public lobby screens visitors before directing them through security turnstiles.",
  },
  {
    stepNumber: 4,
    flow: "traffic",
    activeNodeId: "eks",
    sourceNodeId: "alb",
    targetNodeId: "eks",
    title: "4. Traffic Routes to EKS Pods in Private Subnets",
    flowCategory: "Compute (EKS)",
    whatIsHappening:
      "The ALB routes requests across the private subnet boundary into the Amazon EKS cluster. Kubernetes Worker Nodes run Docker container pods across multiple AZs without public IP addresses.",
    whyImportant:
      "Running compute inside private subnets prevents direct internet scanning and brute-force intrusion attempts.",
    realWorldAnalogy:
      "Lobby staff guides approved visitors to dedicated conference pods located on private interior floors.",
  },
  {
    stepNumber: 5,
    flow: "data",
    activeNodeId: "secrets",
    sourceNodeId: "eks",
    targetNodeId: "secrets",
    title: "5. Workload IAM Role Retrieves Secrets",
    flowCategory: "Database & Secrets",
    whatIsHappening:
      "EKS application pods use IAM Roles for Service Accounts (IRSA) to authenticate with AWS Secrets Manager. Pods fetch encrypted database credentials on startup without hardcoding passwords in code or environment variables.",
    whyImportant:
      "Least-privilege workload identity guarantees only authorized pods can decrypt database credentials, with full CloudTrail audit logging.",
    realWorldAnalogy:
      "An employee scans their biometric thumbprint to open an encrypted key safe holding the database room key.",
  },
  {
    stepNumber: 6,
    flow: "data",
    activeNodeId: "rds",
    sourceNodeId: "eks",
    targetNodeId: "rds",
    title: "6. Application Connects to Private Amazon RDS",
    flowCategory: "Database & Secrets",
    whatIsHappening:
      "With authenticated credentials, EKS pods establish secure TCP connections to Amazon RDS (PostgreSQL/MySQL) running in dedicated private database subnets with synchronous Multi-AZ standby replication.",
    whyImportant:
      "The database is completely inaccessible from the internet. Even if public endpoints were attacked, database subnets reject any external route.",
    realWorldAnalogy:
      "A bank teller accesses the reinforced vault located deep within the building's subterranean foundation.",
  },
  {
    stepNumber: 7,
    flow: "monitoring",
    activeNodeId: "monitoring",
    sourceNodeId: "eks",
    targetNodeId: "monitoring",
    title: "7. Prometheus, Grafana & CloudWatch Observability",
    flowCategory: "Observability",
    whatIsHappening:
      "In-cluster Prometheus scrapes container metrics and pod health, feeding visual dashboards in Grafana. The AWS CloudWatch agent streams host and container logs, triggering automated alerts on error rate spikes.",
    whyImportant:
      "Full-stack telemetry enables rapid root-cause diagnosis, capacity planning, and proactive response before users notice degradation.",
    realWorldAnalogy:
      "Building operations continuously monitors electrical currents, air quality, and security alarms on a central control panel.",
  },
];

interface ServiceMetadata {
  id: string;
  name: string;
  sub: string;
  category: "cicd" | "networking" | "compute" | "database" | "security" | "observability";
  status: "implemented" | "reference" | "planned";
  statusLabel: string;
  location: "github" | "aws-regional" | "public-subnet" | "private-subnet" | "private-data-subnet";
  logoKey?: string;
  fallbackText: string;
}

const SERVICES: Record<string, ServiceMetadata> = {
  github: {
    id: "github",
    name: "GitHub Repository",
    sub: "Source Code & Webhooks",
    category: "cicd",
    status: "implemented",
    statusLabel: "Implemented",
    location: "github",
    logoKey: "github",
    fallbackText: "GH",
  },
  "github-actions": {
    id: "github-actions",
    name: "GitHub Actions",
    sub: "CI/CD & OIDC Auth",
    category: "cicd",
    status: "implemented",
    statusLabel: "Implemented",
    location: "github",
    logoKey: "githubactions",
    fallbackText: "CI",
  },
  terraform: {
    id: "terraform",
    name: "Terraform IaC",
    sub: "Multi-AZ VPC Provisioner",
    category: "cicd",
    status: "implemented",
    statusLabel: "Implemented",
    location: "github",
    logoKey: "terraform",
    fallbackText: "TF",
  },
  ecr: {
    id: "ecr",
    name: "Amazon ECR",
    sub: "Container Image Registry",
    category: "cicd",
    status: "reference",
    statusLabel: "Reference Architecture",
    location: "aws-regional",
    logoKey: "aws-ecr",
    fallbackText: "ECR",
  },
  secrets: {
    id: "secrets",
    name: "AWS Secrets Manager",
    sub: "Encrypted DB Credentials",
    category: "security",
    status: "reference",
    statusLabel: "Reference Architecture",
    location: "aws-regional",
    logoKey: "aws-secrets-manager",
    fallbackText: "SM",
  },
  cloudwatch: {
    id: "cloudwatch",
    name: "Amazon CloudWatch",
    sub: "Logs, Metrics & Alarms",
    category: "observability",
    status: "implemented",
    statusLabel: "Implemented",
    location: "aws-regional",
    logoKey: "aws-cloudwatch",
    fallbackText: "CW",
  },
  user: {
    id: "user",
    name: "Internet Visitors",
    sub: "Public HTTPS 443",
    category: "networking",
    status: "implemented",
    statusLabel: "Production Ingress",
    location: "github",
    fallbackText: "WEB",
  },
  alb: {
    id: "alb",
    name: "Application Load Balancer",
    sub: "Multi-AZ Public Ingress (ALB)",
    category: "networking",
    status: "reference",
    statusLabel: "Reference Architecture",
    location: "public-subnet",
    logoKey: "aws-elb",
    fallbackText: "ALB",
  },
  nat: {
    id: "nat",
    name: "NAT Gateways (AZ-a/b)",
    sub: "Outbound Egress Only",
    category: "networking",
    status: "reference",
    statusLabel: "Reference Architecture",
    location: "public-subnet",
    logoKey: "aws-vpc",
    fallbackText: "NAT",
  },
  eks: {
    id: "eks",
    name: "Amazon EKS Cluster",
    sub: "Private Kubernetes Pods",
    category: "compute",
    status: "reference",
    statusLabel: "Proposed Cloud Target",
    location: "private-subnet",
    logoKey: "aws-eks",
    fallbackText: "EKS",
  },
  iam: {
    id: "iam",
    name: "IAM Workload Roles (IRSA)",
    sub: "Least-Privilege Pod Identity",
    category: "security",
    status: "implemented",
    statusLabel: "Implemented in IaC",
    location: "private-subnet",
    logoKey: "aws-iam",
    fallbackText: "IAM",
  },
  monitoring: {
    id: "monitoring",
    name: "Prometheus & Grafana",
    sub: "Cluster Metrics & Dashboards",
    category: "observability",
    status: "implemented",
    statusLabel: "Implemented in Stack",
    location: "private-subnet",
    logoKey: "prometheus",
    fallbackText: "PROM",
  },
  rds: {
    id: "rds",
    name: "Amazon RDS Multi-AZ",
    sub: "PostgreSQL / MySQL Private",
    category: "database",
    status: "reference",
    statusLabel: "Reference Architecture",
    location: "private-data-subnet",
    logoKey: "aws-rds",
    fallbackText: "RDS",
  },
};

const logoSrc = (key?: string) => (key ? TECH_LOGO_REGISTRY[key]?.src : undefined);

export function AwsArchitectureDiagram() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeFlow, setActiveFlow] = useState<ArchitectureFlowType>("all");
  const [zoomLevel, setZoomLevel] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showCostPanel, setShowCostPanel] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const step = AWS_STEPS[currentStepIndex];

  // Filtered steps based on active flow selection
  const visibleSteps = useMemo(() => {
    if (activeFlow === "all") return AWS_STEPS;
    return AWS_STEPS.filter((s) => s.flow === activeFlow);
  }, [activeFlow]);

  // Sync step index when flow filter changes
  useEffect(() => {
    if (activeFlow !== "all") {
      const matchIndex = AWS_STEPS.findIndex((s) => s.flow === activeFlow);
      if (matchIndex !== -1) setCurrentStepIndex(matchIndex);
    }
  }, [activeFlow]);

  // Auto-play timer
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setTimeout(() => {
      setCurrentStepIndex((prev) => (prev + 1) % AWS_STEPS.length);
    }, 4200);
    return () => clearTimeout(timer);
  }, [isPlaying, currentStepIndex]);

  const handleNext = () => {
    setIsPlaying(false);
    setCurrentStepIndex((prev) => (prev + 1) % AWS_STEPS.length);
  };

  const handlePrev = () => {
    setIsPlaying(false);
    setCurrentStepIndex((prev) => (prev - 1 + AWS_STEPS.length) % AWS_STEPS.length);
  };

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

  const isNodeActive = (id: string) => {
    return step.activeNodeId === id || step.sourceNodeId === id || step.targetNodeId === id;
  };

  return (
    <div className="my-8 overflow-hidden rounded-xs border border-border bg-surface shadow-xs">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface-muted/60 px-4 py-3 sm:px-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="mono text-xs font-bold uppercase tracking-wider text-text">
              Containerized AWS Web Architecture
            </span>
            <span className="mono text-[9px] font-bold px-2 py-0.5 rounded-full uppercase border border-teal-500/30 bg-teal-500/10 text-teal-800">
              EKS &bull; Multi-AZ VPC &bull; RDS
            </span>
          </div>
          <div className="mono text-[10px] text-text-muted mt-0.5">
            Step {step.stepNumber} of {AWS_STEPS.length} &bull; {step.title}
          </div>
        </div>

        {/* Playback Controls & Zoom */}
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

          {/* Reset */}
          <button
            type="button"
            onClick={() => {
              setCurrentStepIndex(0);
              setIsPlaying(true);
            }}
            className="flex h-8 w-8 items-center justify-center border border-border bg-surface text-text hover:border-accent hover:text-accent transition-colors cursor-pointer"
            title="Restart flow"
            aria-label="Restart flow"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>

          {/* Zoom controls */}
          <div className="flex items-center gap-1 border-l border-border pl-1.5 ml-1">
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(1.5, z + 0.15))}
              className="flex h-7 w-7 items-center justify-center border border-border bg-surface text-text hover:text-accent cursor-pointer"
              title="Zoom in"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.15))}
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

      {/* Flow View Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-surface px-4 py-2 text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="mono text-[10px] font-bold uppercase tracking-wider text-text-muted mr-1">
            Filter Flow:
          </span>
          {[
            { id: "all", label: "All Flows (Complete)" },
            { id: "cicd", label: "1. CI/CD & OIDC" },
            { id: "traffic", label: "2. Traffic & Ingress" },
            { id: "data", label: "3. Database & Secrets" },
            { id: "monitoring", label: "4. Observability" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveFlow(tab.id as ArchitectureFlowType)}
              className={`px-2.5 py-1 font-mono text-[11px] font-semibold border transition-all cursor-pointer whitespace-nowrap ${
                activeFlow === tab.id
                  ? "bg-accent text-text-on-accent border-accent"
                  : "bg-surface text-text-muted border-border hover:border-accent/50 hover:text-text"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Cost & Cleanup Toggle */}
        <button
          type="button"
          onClick={() => setShowCostPanel(!showCostPanel)}
          className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-accent hover:underline cursor-pointer"
        >
          <DollarSign className="h-3.5 w-3.5" />
          <span>{showCostPanel ? "Hide Cost & Cleanup" : "Estimated Cost & Cleanup"}</span>
        </button>
      </div>

      {/* SVG Canvas Container */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="relative h-[480px] sm:h-[540px] w-full overflow-hidden bg-[#FAFAF8] select-none cursor-grab active:cursor-grabbing border-b border-border"
      >
        <svg
          viewBox="0 0 1020 540"
          className="h-full w-full transition-transform duration-100 ease-out"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoomLevel})`,
            transformOrigin: "center center",
          }}
        >
          <defs>
            <marker
              id="aws-arrow-traffic"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#0D9488" />
            </marker>
            <marker
              id="aws-arrow-deploy"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#4F46E5" />
            </marker>
            <marker
              id="aws-arrow-data"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#D97706" />
            </marker>
            <marker
              id="aws-arrow-obs"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#7C3AED" />
            </marker>
            <marker
              id="aws-arrow-mute"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#CBD5E1" />
            </marker>
          </defs>

          {/* ============================================================== */}
          {/* TIER 1: CLIENTS & CI/CD ORIGINS (Left Column, x: 25)            */}
          {/* ============================================================== */}
          <rect
            x="15"
            y="20"
            width="200"
            height="490"
            rx="8"
            fill="#FFFFFF"
            stroke="#E2E8F0"
            strokeWidth="1.2"
          />
          <text x="28" y="42" fill="#475569" fontSize="10.5" fontFamily="monospace" fontWeight="700">
            ORIGIN &amp; CI/CD AUTOMATION
          </text>

          {/* 1a. Internet Visitors */}
          <g
            className="cursor-pointer"
            onClick={() => {
              setIsPlaying(false);
              setCurrentStepIndex(2);
            }}
          >
            <rect
              x="25"
              y="60"
              width="180"
              height="60"
              rx="6"
              fill={isNodeActive("user") ? "#F0FDFA" : "#FFFFFF"}
              stroke={isNodeActive("user") ? "#0D9488" : "#CBD5E1"}
              strokeWidth={isNodeActive("user") ? 2 : 1}
            />
            <circle cx="42" cy="90" r="4" fill="#0D9488" />
            <text x="54" y="84" fill="#0F172A" fontSize="11" fontWeight="700">
              Internet Visitors
            </text>
            <text x="54" y="98" fill="#64748B" fontSize="9" fontFamily="monospace">
              Public HTTPS (Port 443)
            </text>
            <text x="54" y="110" fill="#0D9488" fontSize="8" fontFamily="monospace" fontWeight="600">
              ● Production Ingress
            </text>
          </g>

          {/* 1b. GitHub Actions & OIDC */}
          <g
            className="cursor-pointer"
            onClick={() => {
              setIsPlaying(false);
              setCurrentStepIndex(0);
            }}
          >
            <rect
              x="25"
              y="140"
              width="180"
              height="75"
              rx="6"
              fill={isNodeActive("github-actions") ? "#EEF2FF" : "#FFFFFF"}
              stroke={isNodeActive("github-actions") ? "#4F46E5" : "#CBD5E1"}
              strokeWidth={isNodeActive("github-actions") ? 2 : 1}
            />
            <image href={logoSrc("githubactions")} x="35" y="152" width="18" height="18" />
            <text x="60" y="165" fill="#0F172A" fontSize="11" fontWeight="700">
              GitHub Actions
            </text>
            <text x="60" y="179" fill="#64748B" fontSize="9" fontFamily="monospace">
              Docker Build &amp; Test Runner
            </text>
            <rect x="35" y="190" width="160" height="18" rx="3" fill="#E0E7FF" />
            <text x="115" y="202" fill="#3730A3" fontSize="8.5" fontFamily="monospace" fontWeight="700" textAnchor="middle">
              OIDC Federated AWS Access
            </text>
          </g>

          {/* 1c. Terraform IaC */}
          <g
            className="cursor-pointer"
            onClick={() => {
              setIsPlaying(false);
              setCurrentStepIndex(1);
            }}
          >
            <rect
              x="25"
              y="235"
              width="180"
              height="65"
              rx="6"
              fill={isNodeActive("terraform") ? "#F5F3FF" : "#FFFFFF"}
              stroke={isNodeActive("terraform") ? "#7C3AED" : "#CBD5E1"}
              strokeWidth={isNodeActive("terraform") ? 2 : 1}
            />
            <image href={logoSrc("terraform")} x="35" y="247" width="18" height="18" />
            <text x="60" y="260" fill="#0F172A" fontSize="11" fontWeight="700">
              Terraform Engine
            </text>
            <text x="60" y="274" fill="#64748B" fontSize="9" fontFamily="monospace">
              Multi-AZ VPC &amp; Subnet IaC
            </text>
            <text x="60" y="288" fill="#16A34A" fontSize="8" fontFamily="monospace" fontWeight="600">
              ● Implemented in Repo
            </text>
          </g>

          {/* 1d. Observability Dashboards (Grafana) */}
          <g
            className="cursor-pointer"
            onClick={() => {
              setIsPlaying(false);
              setCurrentStepIndex(6);
            }}
          >
            <rect
              x="25"
              y="320"
              width="180"
              height="65"
              rx="6"
              fill={isNodeActive("monitoring") ? "#FFFBEB" : "#FFFFFF"}
              stroke={isNodeActive("monitoring") ? "#D97706" : "#CBD5E1"}
              strokeWidth={isNodeActive("monitoring") ? 2 : 1}
            />
            <image href={logoSrc("grafana")} x="35" y="332" width="18" height="18" />
            <text x="60" y="345" fill="#0F172A" fontSize="11" fontWeight="700">
              Grafana Dashboards
            </text>
            <text x="60" y="359" fill="#64748B" fontSize="9" fontFamily="monospace">
              Visual Metric Telemetry
            </text>
            <text x="60" y="373" fill="#16A34A" fontSize="8" fontFamily="monospace" fontWeight="600">
              ● Implemented in Stack
            </text>
          </g>

          {/* ============================================================== */}
          {/* TIER 2: AWS REGIONAL MANAGED SERVICES (Middle Column, x: 235)   */}
          {/* ============================================================== */}
          <rect
            x="230"
            y="20"
            width="190"
            height="490"
            rx="8"
            fill="#FEF3C7"
            fillOpacity="0.25"
            stroke="#FDE68A"
            strokeWidth="1.2"
            strokeDasharray="4 4"
          />
          <text x="242" y="42" fill="#92400E" fontSize="10.5" fontFamily="monospace" fontWeight="700">
            AWS REGIONAL SERVICES
          </text>
          <text x="242" y="55" fill="#B45309" fontSize="8.5" fontFamily="monospace">
            (Highly Available Outside VPC)
          </text>

          {/* 2a. Amazon ECR */}
          <g
            className="cursor-pointer"
            onClick={() => {
              setIsPlaying(false);
              setCurrentStepIndex(0);
            }}
          >
            <rect
              x="240"
              y="70"
              width="170"
              height="70"
              rx="6"
              fill={isNodeActive("ecr") ? "#EEF2FF" : "#FFFFFF"}
              stroke={isNodeActive("ecr") ? "#4F46E5" : "#F59E0B"}
              strokeWidth={isNodeActive("ecr") ? 2 : 1}
            />
            <image href={logoSrc("aws-ecr")} x="250" y="82" width="18" height="18" />
            <text x="274" y="95" fill="#0F172A" fontSize="11" fontWeight="700">
              Amazon ECR
            </text>
            <text x="274" y="109" fill="#64748B" fontSize="9" fontFamily="monospace">
              Docker Container Registry
            </text>
            <text x="274" y="123" fill="#2563EB" fontSize="8" fontFamily="monospace" fontWeight="600">
              ● Reference Target
            </text>
          </g>

          {/* 2b. AWS Secrets Manager */}
          <g
            className="cursor-pointer"
            onClick={() => {
              setIsPlaying(false);
              setCurrentStepIndex(4);
            }}
          >
            <rect
              x="240"
              y="160"
              width="170"
              height="70"
              rx="6"
              fill={isNodeActive("secrets") ? "#FEF3C7" : "#FFFFFF"}
              stroke={isNodeActive("secrets") ? "#D97706" : "#F59E0B"}
              strokeWidth={isNodeActive("secrets") ? 2 : 1}
            />
            <image href={logoSrc("aws-secrets-manager")} x="250" y="172" width="18" height="18" />
            <text x="274" y="185" fill="#0F172A" fontSize="11" fontWeight="700">
              AWS Secrets Manager
            </text>
            <text x="274" y="199" fill="#64748B" fontSize="9" fontFamily="monospace">
              Database Credentials
            </text>
            <text x="274" y="213" fill="#2563EB" fontSize="8" fontFamily="monospace" fontWeight="600">
              ● Reference Target
            </text>
          </g>

          {/* 2c. Amazon CloudWatch */}
          <g
            className="cursor-pointer"
            onClick={() => {
              setIsPlaying(false);
              setCurrentStepIndex(6);
            }}
          >
            <rect
              x="240"
              y="250"
              width="170"
              height="70"
              rx="6"
              fill={isNodeActive("cloudwatch") ? "#FDF2F8" : "#FFFFFF"}
              stroke={isNodeActive("cloudwatch") ? "#DB2777" : "#F59E0B"}
              strokeWidth={isNodeActive("cloudwatch") ? 2 : 1}
            />
            <image href={logoSrc("aws-cloudwatch")} x="250" y="262" width="18" height="18" />
            <text x="274" y="275" fill="#0F172A" fontSize="11" fontWeight="700">
              Amazon CloudWatch
            </text>
            <text x="274" y="289" fill="#64748B" fontSize="9" fontFamily="monospace">
              Host Logs &amp; Metric Alarms
            </text>
            <text x="274" y="303" fill="#16A34A" fontSize="8" fontFamily="monospace" fontWeight="600">
              ● Implemented
            </text>
          </g>

          {/* ============================================================== */}
          {/* TIER 3: AWS VPC (Virtual Private Cloud — 10.0.0.0/16)          */}
          {/* ============================================================== */}
          <rect
            x="440"
            y="20"
            width="565"
            height="490"
            rx="10"
            fill="#FFFFFF"
            stroke="#64748B"
            strokeWidth="1.5"
            strokeDasharray="6 4"
          />
          <text x="456" y="44" fill="#0F172A" fontSize="11.5" fontFamily="monospace" fontWeight="700">
            AWS VPC (Virtual Private Cloud — 10.0.0.0/16)
          </text>
          <text x="456" y="58" fill="#64748B" fontSize="9" fontFamily="monospace">
            Multi-AZ Topology &bull; ap-south-1a &amp; ap-south-1b
          </text>

          {/* 3a. Public Subnets Tier (AZ-a & AZ-b) */}
          <rect
            x="455"
            y="70"
            width="535"
            height="115"
            rx="6"
            fill="#F0FDF4"
            stroke="#86EFAC"
            strokeWidth="1.2"
          />
          <text x="468" y="88" fill="#166534" fontSize="10" fontFamily="monospace" fontWeight="700">
            PUBLIC SUBNETS (10.0.1.0/24 &amp; 10.0.2.0/24) &bull; Internet-Facing
          </text>

          {/* ALB Card */}
          <g
            className="cursor-pointer"
            onClick={() => {
              setIsPlaying(false);
              setCurrentStepIndex(2);
            }}
          >
            <rect
              x="470"
              y="100"
              width="250"
              height="65"
              rx="6"
              fill={isNodeActive("alb") ? "#FFFFFF" : "#FFFFFF"}
              stroke={isNodeActive("alb") ? "#0D9488" : "#CBD5E1"}
              strokeWidth={isNodeActive("alb") ? 2 : 1}
              filter={isNodeActive("alb") ? "drop-shadow(0 4px 6px rgba(13, 148, 136, 0.2))" : undefined}
            />
            <image href={logoSrc("aws-elb")} x="482" y="114" width="22" height="22" />
            <text x="512" y="126" fill="#0F172A" fontSize="11" fontWeight="700">
              Application Load Balancer (ALB)
            </text>
            <text x="512" y="140" fill="#64748B" fontSize="9" fontFamily="monospace">
              Multi-AZ TLS Termination &bull; Ingress 443
            </text>
            <text x="512" y="154" fill="#2563EB" fontSize="8" fontFamily="monospace" fontWeight="600">
              ● Reference Target
            </text>
          </g>

          {/* NAT Gateways */}
          <g>
            <rect
              x="735"
              y="100"
              width="240"
              height="65"
              rx="6"
              fill="#FFFFFF"
              stroke="#CBD5E1"
              strokeWidth="1"
            />
            <image href={logoSrc("aws-vpc")} x="747" y="114" width="22" height="22" />
            <text x="777" y="126" fill="#0F172A" fontSize="11" fontWeight="700">
              Managed NAT Gateways
            </text>
            <text x="777" y="140" fill="#64748B" fontSize="9" fontFamily="monospace">
              AZ-a &amp; AZ-b Outbound Translation
            </text>
            <text x="777" y="154" fill="#2563EB" fontSize="8" fontFamily="monospace" fontWeight="600">
              ● Reference Target
            </text>
          </g>

          {/* 3b. Private Compute Subnets (Amazon EKS) */}
          <rect
            x="455"
            y="200"
            width="535"
            height="145"
            rx="6"
            fill="#F8FAFC"
            stroke="#CBD5E1"
            strokeWidth="1.2"
          />
          <text x="468" y="218" fill="#334155" fontSize="10" fontFamily="monospace" fontWeight="700">
            PRIVATE COMPUTE SUBNETS (10.0.10.0/24 &amp; 10.0.20.0/24) &bull; Workload Tier
          </text>

          {/* Amazon EKS Pods */}
          <g
            className="cursor-pointer"
            onClick={() => {
              setIsPlaying(false);
              setCurrentStepIndex(3);
            }}
          >
            <rect
              x="470"
              y="230"
              width="265"
              height="95"
              rx="6"
              fill={isNodeActive("eks") ? "#F0FDFA" : "#FFFFFF"}
              stroke={isNodeActive("eks") ? "#0D9488" : "#94A3B8"}
              strokeWidth={isNodeActive("eks") ? 2.2 : 1}
              filter={isNodeActive("eks") ? "drop-shadow(0 4px 6px rgba(13, 148, 136, 0.15))" : undefined}
            />
            <image href={logoSrc("aws-eks")} x="482" y="242" width="22" height="22" />
            <text x="512" y="254" fill="#0F172A" fontSize="11.5" fontWeight="700">
              Amazon EKS Workload Pods
            </text>
            <text x="512" y="268" fill="#64748B" fontSize="9" fontFamily="monospace">
              Docker App &bull; Multi-AZ ReplicaSet
            </text>
            <rect x="482" y="278" width="240" height="20" rx="3" fill="#E2E8F0" />
            <text x="602" y="291" fill="#1E293B" fontSize="8.5" fontFamily="monospace" fontWeight="600" textAnchor="middle">
              IAM Roles for Service Accounts (IRSA)
            </text>
            <text x="512" y="313" fill="#2563EB" fontSize="8" fontFamily="monospace" fontWeight="600">
              ● Reference Target
            </text>
          </g>

          {/* Prometheus & Metrics in EKS */}
          <g
            className="cursor-pointer"
            onClick={() => {
              setIsPlaying(false);
              setCurrentStepIndex(6);
            }}
          >
            <rect
              x="750"
              y="230"
              width="225"
              height="95"
              rx="6"
              fill={isNodeActive("monitoring") ? "#FFFBEB" : "#FFFFFF"}
              stroke={isNodeActive("monitoring") ? "#D97706" : "#CBD5E1"}
              strokeWidth={isNodeActive("monitoring") ? 2 : 1}
            />
            <image href={logoSrc("prometheus")} x="762" y="242" width="20" height="20" />
            <text x="790" y="254" fill="#0F172A" fontSize="11" fontWeight="700">
              Prometheus Scraper
            </text>
            <text x="790" y="268" fill="#64748B" fontSize="9" fontFamily="monospace">
              cAdvisor &bull; Pod Metrics :9090
            </text>
            <text x="790" y="284" fill="#64748B" fontSize="8.5" fontFamily="monospace">
              Scrapes EKS worker telemetry
            </text>
            <text x="790" y="313" fill="#16A34A" fontSize="8" fontFamily="monospace" fontWeight="600">
              ● Implemented in Stack
            </text>
          </g>

          {/* 3c. Private Database Subnets (Amazon RDS) */}
          <rect
            x="455"
            y="360"
            width="535"
            height="135"
            rx="6"
            fill="#FEF2F2"
            stroke="#FECACA"
            strokeWidth="1.2"
          />
          <text x="468" y="378" fill="#991B1B" fontSize="10" fontFamily="monospace" fontWeight="700">
            ISOLATED DATABASE SUBNETS (10.0.30.0/24 &amp; 10.0.40.0/24) &bull; Strictly Private
          </text>

          {/* Amazon RDS Multi-AZ */}
          <g
            className="cursor-pointer"
            onClick={() => {
              setIsPlaying(false);
              setCurrentStepIndex(5);
            }}
          >
            <rect
              x="470"
              y="390"
              width="505"
              height="90"
              rx="6"
              fill={isNodeActive("rds") ? "#FFFFFF" : "#FFFFFF"}
              stroke={isNodeActive("rds") ? "#DC2626" : "#E2E8F0"}
              strokeWidth={isNodeActive("rds") ? 2.2 : 1}
              filter={isNodeActive("rds") ? "drop-shadow(0 4px 6px rgba(220, 38, 38, 0.15))" : undefined}
            />
            <image href={logoSrc("aws-rds")} x="484" y="405" width="24" height="24" />
            <text x="516" y="418" fill="#0F172A" fontSize="12" fontWeight="700">
              Amazon RDS Multi-AZ Database
            </text>
            <text x="516" y="432" fill="#64748B" fontSize="9.5" fontFamily="monospace">
              PostgreSQL / MySQL &bull; Primary (AZ-a) with Synchronous Standby (AZ-b)
            </text>
            <text x="516" y="448" fill="#991B1B" fontSize="8.5" fontFamily="monospace" fontWeight="600">
              Security: Isolated Subnets &bull; Ingress strictly limited to EKS Workload Security Group
            </text>
            <text x="516" y="465" fill="#2563EB" fontSize="8" fontFamily="monospace" fontWeight="600">
              ● Reference Target
            </text>
          </g>

          {/* ============================================================== */}
          {/* DIRECTIONAL CONNECTOR ARROWS & LABELS                           */}
          {/* ============================================================== */}
          {/* 1. Internet Visitors -> ALB */}
          <path
            d="M 205 90 H 470"
            fill="none"
            stroke={currentStepIndex >= 2 ? "#0D9488" : "#CBD5E1"}
            strokeWidth={currentStepIndex === 2 ? 2.5 : 1.5}
            markerEnd={currentStepIndex >= 2 ? "url(#aws-arrow-traffic)" : "url(#aws-arrow-mute)"}
          />
          <rect x="290" y="78" width="90" height="15" rx="3" fill="#FFFFFF" stroke="#0D9488" strokeWidth="0.8" />
          <text x="335" y="89" fill="#0D9488" fontSize="8" fontFamily="monospace" fontWeight="700" textAnchor="middle">
            HTTPS :443
          </text>

          {/* 2. GitHub Actions -> Amazon ECR */}
          <path
            d="M 205 160 H 240"
            fill="none"
            stroke={currentStepIndex >= 0 ? "#4F46E5" : "#CBD5E1"}
            strokeWidth={currentStepIndex === 0 ? 2.5 : 1.5}
            strokeDasharray="4 3"
            markerEnd={currentStepIndex >= 0 ? "url(#aws-arrow-deploy)" : "url(#aws-arrow-mute)"}
          />

          {/* 3. ECR -> EKS Cluster (Pull image) */}
          <path
            d="M 410 105 H 430 V 250 H 470"
            fill="none"
            stroke={currentStepIndex >= 0 ? "#4F46E5" : "#CBD5E1"}
            strokeWidth={currentStepIndex === 0 ? 2.5 : 1.5}
            strokeDasharray="4 3"
            markerEnd={currentStepIndex >= 0 ? "url(#aws-arrow-deploy)" : "url(#aws-arrow-mute)"}
          />
          <rect x="380" y="240" width="80" height="15" rx="3" fill="#FFFFFF" stroke="#4F46E5" strokeWidth="0.8" />
          <text x="420" y="251" fill="#4F46E5" fontSize="8" fontFamily="monospace" fontWeight="700" textAnchor="middle">
            Image Pull
          </text>

          {/* 4. ALB -> EKS Pods */}
          <path
            d="M 590 165 V 230"
            fill="none"
            stroke={currentStepIndex >= 3 ? "#0D9488" : "#CBD5E1"}
            strokeWidth={currentStepIndex === 3 ? 2.5 : 1.5}
            markerEnd={currentStepIndex >= 3 ? "url(#aws-arrow-traffic)" : "url(#aws-arrow-mute)"}
          />
          <rect x="545" y="190" width="90" height="15" rx="3" fill="#FFFFFF" stroke="#0D9488" strokeWidth="0.8" />
          <text x="590" y="201" fill="#0D9488" fontSize="8" fontFamily="monospace" fontWeight="700" textAnchor="middle">
            Route Pod Traffic
          </text>

          {/* 5. EKS Pods -> AWS Secrets Manager */}
          <path
            d="M 470 280 H 410"
            fill="none"
            stroke={currentStepIndex >= 4 ? "#D97706" : "#CBD5E1"}
            strokeWidth={currentStepIndex === 4 ? 2.5 : 1.5}
            strokeDasharray="3 3"
            markerEnd={currentStepIndex >= 4 ? "url(#aws-arrow-data)" : "url(#aws-arrow-mute)"}
          />
          <rect x="415" y="270" width="50" height="14" rx="3" fill="#FFFFFF" stroke="#D97706" strokeWidth="0.8" />
          <text x="440" y="280" fill="#D97706" fontSize="7.5" fontFamily="monospace" fontWeight="700" textAnchor="middle">
            IRSA Auth
          </text>

          {/* 6. EKS Pods -> Amazon RDS */}
          <path
            d="M 590 325 V 390"
            fill="none"
            stroke={currentStepIndex >= 5 ? "#DC2626" : "#CBD5E1"}
            strokeWidth={currentStepIndex === 5 ? 2.5 : 1.5}
            markerEnd={currentStepIndex >= 5 ? "url(#aws-arrow-data)" : "url(#aws-arrow-mute)"}
          />
          <rect x="545" y="350" width="90" height="15" rx="3" fill="#FFFFFF" stroke="#DC2626" strokeWidth="0.8" />
          <text x="590" y="361" fill="#DC2626" fontSize="8" fontFamily="monospace" fontWeight="700" textAnchor="middle">
            Private SQL / Data
          </text>

          {/* 7. EKS -> CloudWatch Logs & Prometheus */}
          <path
            d="M 735 280 H 750"
            fill="none"
            stroke={currentStepIndex >= 6 ? "#7C3AED" : "#CBD5E1"}
            strokeWidth={currentStepIndex === 6 ? 2.5 : 1.5}
            markerEnd={currentStepIndex >= 6 ? "url(#aws-arrow-obs)" : "url(#aws-arrow-mute)"}
          />
          <path
            d="M 470 295 H 425 V 285 H 410"
            fill="none"
            stroke={currentStepIndex >= 6 ? "#DB2777" : "#CBD5E1"}
            strokeWidth={currentStepIndex === 6 ? 2.5 : 1.5}
            markerEnd={currentStepIndex >= 6 ? "url(#aws-arrow-obs)" : "url(#aws-arrow-mute)"}
          />

          {/* Active Step Indicator Pulse */}
          {currentStepIndex === 0 && <circle cx="205" cy="160" r="5" fill="#4F46E5" className="animate-ping" />}
          {currentStepIndex === 1 && <circle cx="205" cy="270" r="5" fill="#7C3AED" className="animate-ping" />}
          {currentStepIndex === 2 && <circle cx="340" cy="90" r="5" fill="#0D9488" className="animate-ping" />}
          {currentStepIndex === 3 && <circle cx="590" cy="195" r="5" fill="#0D9488" className="animate-ping" />}
          {currentStepIndex === 4 && <circle cx="440" cy="280" r="5" fill="#D97706" className="animate-ping" />}
          {currentStepIndex === 5 && <circle cx="590" cy="355" r="5" fill="#DC2626" className="animate-ping" />}
          {currentStepIndex === 6 && <circle cx="742" cy="280" r="5" fill="#7C3AED" className="animate-ping" />}
        </svg>

        {/* Step Progression Bar at Bottom of Canvas */}
        <div className="absolute bottom-2 left-4 right-4 flex items-center justify-between text-[11px] font-mono text-text-muted bg-white/95 backdrop-blur-xs px-3 py-1.5 border border-border shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-accent">STEP {step.stepNumber}:</span>
            <span className="text-text font-medium">{step.title}</span>
          </div>
          <div className="flex items-center gap-1.5">
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

      {/* Legend & Verification Summary Bar */}
      <div className="border-b border-border bg-surface-muted/40 px-4 py-2.5 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <span className="mono text-[10px] font-bold uppercase text-text-muted">Verification Status:</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-teal-800">
              <span className="h-2 w-2 rounded-full bg-teal-600" />
              <span>Implemented (Code in Repos)</span>
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-blue-800">
              <span className="h-2 w-2 rounded-full bg-blue-600" />
              <span>Reference Architecture (Cloud Target)</span>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="mono text-[10px] font-bold uppercase text-text-muted">Connectors:</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-teal-700">
              <span className="h-0.5 w-3 bg-teal-600 inline-block" /> Traffic
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-indigo-700">
              <span className="h-0.5 w-3 border-t border-dashed border-indigo-600 inline-block" /> CI/CD &bull; OIDC
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-amber-700">
              <span className="h-0.5 w-3 bg-amber-600 inline-block" /> Data &bull; Secrets
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-purple-700">
              <span className="h-0.5 w-3 bg-purple-600 inline-block" /> Observability
            </span>
          </div>
        </div>
      </div>

      {/* Structured Explanation Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border border-b border-border bg-surface p-5 sm:p-6 gap-4 md:gap-0">
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
          <div className="mono text-[10px] font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
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
            {step.realWorldAnalogy}
          </p>
        </div>
      </div>

      {/* Architecture Economics & Cleanup Panel (Requirement: Estimated Cost & Cleanup Notes) */}
      {showCostPanel && (
        <div className="bg-surface-muted/30 p-5 sm:p-6 border-t border-border space-y-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-accent" />
            <h4 className="mono text-xs font-bold uppercase tracking-wider text-text">
              Architecture Economics &amp; Teardown Guidelines
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Cost Breakdown */}
            <div className="border border-border bg-surface p-4 rounded-xs space-y-2">
              <div className="flex items-center justify-between border-b border-border pb-1.5">
                <span className="font-mono text-xs font-bold text-text">Estimated AWS Monthly Baseline</span>
                <span className="font-mono text-xs font-bold text-accent">~$180 &ndash; $240 / month</span>
              </div>
              <ul className="text-xs space-y-1.5 text-text-muted">
                <li className="flex justify-between">
                  <span>&bull; Amazon EKS Control Plane ($0.10 / hr)</span>
                  <span className="font-mono text-text font-medium">~$73.00</span>
                </li>
                <li className="flex justify-between">
                  <span>&bull; Managed EKS Node Group (2x t4g.medium)</span>
                  <span className="font-mono text-text font-medium">~$48.50</span>
                </li>
                <li className="flex justify-between">
                  <span>&bull; Application Load Balancer + LCU</span>
                  <span className="font-mono text-text font-medium">~$22.50</span>
                </li>
                <li className="flex justify-between">
                  <span>&bull; Amazon RDS PostgreSQL (db.t4g.micro Multi-AZ)</span>
                  <span className="font-mono text-text font-medium">~$29.80</span>
                </li>
                <li className="flex justify-between">
                  <span>&bull; Managed NAT Gateways (Single AZ Dev / Multi-AZ Prod)</span>
                  <span className="font-mono text-text font-medium">~$32.50 &ndash; $65.00</span>
                </li>
              </ul>
              <p className="text-[10px] text-text-muted italic pt-1">
                Note: Non-production development environments can scale EKS node groups to 0 replicas during off-hours to reduce spend by over 60%.
              </p>
            </div>

            {/* Teardown & Lifecycle Notes */}
            <div className="border border-border bg-surface p-4 rounded-xs space-y-2">
              <div className="flex items-center gap-1.5 border-b border-border pb-1.5">
                <Trash2 className="h-3.5 w-3.5 text-amber-600" />
                <span className="font-mono text-xs font-bold text-text">Teardown &amp; Resource Hygiene</span>
              </div>
              <ul className="text-xs space-y-1.5 text-text-muted">
                <li>
                  <strong className="text-text">1. Ordered Destruction:</strong> Run{" "}
                  <code className="font-mono text-[11px] bg-surface-muted px-1 py-0.5">terraform destroy -target=module.eks</code>{" "}
                  prior to VPC deletion so Load Balancers and ENIs unbind cleanly.
                </li>
                <li>
                  <strong className="text-text">2. ECR Lifecycle Policy:</strong> Keep untagged Docker images for a maximum of 7 days to eliminate storage accumulation.
                </li>
                <li>
                  <strong className="text-text">3. OIDC Role Cleanup:</strong> GitHub Actions IAM roles do not incur idle cost; only active API calls and compute nodes generate charges.
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
