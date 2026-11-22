import React, { useState, useEffect, useRef, useCallback, useId } from "react";
import {
  Play,
  Pause,
  Loader2,
  CheckCircle2,
  Globe,
  Terminal,
  Lock,
  Server,
  User,
} from "lucide-react";
import { TechLogo } from "./TechLogos";

/**
 * Timing configuration for the 10-second reference workflow loop.
 * Tunable values for step progression, packet travel, and pause delays.
 */
export const MINI_INFRA_TIMING = {
  totalDurationMs: 10000,
  steps: [
    {
      id: 1,
      name: "git push",
      label: "01: GIT PUSH",
      startMs: 0,
      endMs: 2000,
      tooltip: "Developer pushes commit; GitHub Actions triggers build & test workflow",
    },
    {
      id: 2,
      name: "terraform apply",
      label: "02: TF APPLY",
      startMs: 2000,
      endMs: 4000,
      tooltip: "GitHub Actions runs Terraform plan & apply to provision infrastructure as code",
    },
    {
      id: 3,
      name: "provision",
      label: "03: PROVISION",
      startMs: 4000,
      endMs: 6500,
      tooltip: "Terraform provisions AWS EC2 instance and Docker container topology",
    },
    {
      id: 4,
      name: "deploy & serve",
      label: "04: DEPLOY & SERVE",
      startMs: 6500,
      endMs: 9000,
      tooltip: "GitHub Actions deploys via SSH; end users reach running service over HTTPS",
    },
  ],
  settleStartMs: 9000,
  packetSpeedMs: 1400,
  manualPauseMs: 8000,
  hoverResumeDelayMs: 1000,
};

interface Point {
  x: number;
  y: number;
}

interface ConnectionGeometry {
  d: string;
  badgePoint: Point;
  length: number;
}

export function MiniInfrastructureCard() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardId = useId().replace(/:/g, "_");

  // Node DOM element references for real getBoundingClientRect measurements
  const devNodeRef = useRef<HTMLDivElement>(null);
  const ghNodeRef = useRef<HTMLDivElement>(null);
  const tfNodeRef = useRef<HTMLDivElement>(null);
  const awsNodeRef = useRef<HTMLDivElement>(null);
  const dockerNodeRef = useRef<HTMLDivElement>(null);
  const browserNodeRef = useRef<HTMLDivElement>(null);
  const nginxNodeRef = useRef<HTMLDivElement>(null);

  // Connection geometry computed from actual rendered bounding rects
  const [connections, setConnections] = useState<Record<string, ConnectionGeometry>>({});

  // Animation & Loop State
  const [isPlaying, setIsPlaying] = useState(true);
  const [isInViewport, setIsInViewport] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [activeStep, setActiveStep] = useState<number | null>(1);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [manualPauseUntil, setManualPauseUntil] = useState<number | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [tooltipText, setTooltipText] = useState<string | null>(null);

  // Packet animation coordinates along SVG path
  const [packet1Pos, setPacket1Pos] = useState<Point | null>(null);
  const [packet2Pos, setPacket2Pos] = useState<Point | null>(null);
  const [packet3Pos, setPacket3Pos] = useState<Point | null>(null);
  const [packet4Pos, setPacket4Pos] = useState<Point | null>(null);
  const [userPacketPos, setUserPacketPos] = useState<Point | null>(null);

  // Hidden path refs to call getPointAtLength
  const path1Ref = useRef<SVGPathElement | null>(null);
  const path2Ref = useRef<SVGPathElement | null>(null);
  const path3Ref = useRef<SVGPathElement | null>(null);
  const path4Ref = useRef<SVGPathElement | null>(null);
  const userPathRef = useRef<SVGPathElement | null>(null);

  // Check prefers-reduced-motion
  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(media.matches);
    const onChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  // IntersectionObserver: auto-play only when at least 40% visible in viewport
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInViewport(entry.isIntersecting);
      },
      { threshold: 0.4 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Tab visibility detection
  useEffect(() => {
    if (typeof document === "undefined") return;
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsPlaying(false);
      } else {
        setIsPlaying(true);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // Measure rendered node rects and compute exact connection geometry
  const measureGeometry = useCallback(() => {
    if (!containerRef.current) return;
    const cRect = containerRef.current.getBoundingClientRect();

    const getCenter = (el: HTMLElement | null) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return {
        x: r.left - cRect.left + r.width / 2,
        y: r.top - cRect.top + r.height / 2,
        left: r.left - cRect.left,
        right: r.right - cRect.left,
        top: r.top - cRect.top,
        bottom: r.bottom - cRect.top,
        width: r.width,
        height: r.height,
      };
    };

    const dev = getCenter(devNodeRef.current);
    const gh = getCenter(ghNodeRef.current);
    const tf = getCenter(tfNodeRef.current);
    const aws = getCenter(awsNodeRef.current);
    const docker = getCenter(dockerNodeRef.current);
    const browser = getCenter(browserNodeRef.current);
    const nginx = getCenter(nginxNodeRef.current);

    if (!dev || !gh || !tf || !aws || !docker || !browser || !nginx) return;

    // Helper to calculate orthogonal path with exact boundary attachments
    const newConns: Record<string, ConnectionGeometry> = {};

    // 1. Line 1: Developer (right) -> GitHub (left)
    const p1Start = { x: dev.right, y: dev.y };
    const p1End = { x: gh.left, y: gh.y };
    const d1 = `M ${p1Start.x} ${p1Start.y} L ${p1End.x} ${p1End.y}`;
    newConns["line1"] = {
      d: d1,
      badgePoint: { x: (p1Start.x + p1End.x) / 2, y: p1Start.y },
      length: Math.abs(p1End.x - p1Start.x),
    };

    // 2. Line 2: GitHub (bottom) -> Terraform (top)
    const p2Start = { x: gh.x, y: gh.bottom };
    const p2End = { x: tf.x, y: tf.top };
    const d2 = `M ${p2Start.x} ${p2Start.y} L ${p2End.x} ${p2End.y}`;
    newConns["line2"] = {
      d: d2,
      badgePoint: { x: p2Start.x, y: (p2Start.y + p2End.y) / 2 },
      length: Math.abs(p2End.y - p2Start.y),
    };

    // 3. Line 3: Terraform (bottom) -> AWS Box (top)
    const p3Start = { x: tf.x, y: tf.bottom };
    const p3End = { x: aws.x, y: aws.top };
    const d3 = `M ${p3Start.x} ${p3Start.y} L ${p3End.x} ${p3End.y}`;
    newConns["line3"] = {
      d: d3,
      badgePoint: { x: p3Start.x, y: (p3Start.y + p3End.y) / 2 },
      length: Math.abs(p3End.y - p3Start.y),
    };

    // 4. Line 4: GitHub (bottom-left) -> Docker (left curved bus)
    // Runs down along the left margin to enter Docker
    const p4Start = { x: gh.left + 24, y: gh.bottom };
    const p4MidX = Math.min(dev.left, gh.left) - 14;
    const p4End = { x: docker.left, y: docker.y };
    const d4 = `M ${p4Start.x} ${p4Start.y} L ${p4MidX} ${p4Start.y} L ${p4MidX} ${p4End.y} L ${p4End.x} ${p4End.y}`;
    newConns["line4"] = {
      d: d4,
      badgePoint: { x: p4MidX, y: (p4Start.y + p4End.y) / 2 },
      length: 100, // will be measured precisely via getPointAtLength
    };

    // 5. User Line: Browser (top) -> Nginx (bottom)
    const pUserStart = { x: browser.x, y: browser.top };
    const pUserEnd = { x: nginx.x, y: nginx.bottom };
    const dUser = `M ${pUserStart.x} ${pUserStart.y} L ${pUserEnd.x} ${pUserEnd.y}`;
    newConns["userLine"] = {
      d: dUser,
      badgePoint: { x: pUserStart.x, y: (pUserStart.y + pUserEnd.y) / 2 },
      length: Math.abs(pUserEnd.y - pUserStart.y),
    };

    setConnections(newConns);
  }, []);

  // Observe container & window resize
  useEffect(() => {
    measureGeometry();
    const ro = new ResizeObserver(() => measureGeometry());
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener("resize", measureGeometry);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measureGeometry);
    };
  }, [measureGeometry]);

  // Main 10-Second Animation Loop (single requestAnimationFrame, zero CLS)
  useEffect(() => {
    if (prefersReducedMotion) {
      setActiveStep(null);
      setElapsedMs(0);
      return;
    }

    let animationFrameId: number;
    let lastTimestamp = performance.now();

    const loop = (currentTimestamp: number) => {
      const delta = currentTimestamp - lastTimestamp;
      lastTimestamp = currentTimestamp;

      const isPaused = !isPlaying || !isInViewport || isHovered || (manualPauseUntil !== null && Date.now() < manualPauseUntil);

      if (!isPaused) {
        setElapsedMs((prev) => {
          const next = (prev + delta) % MINI_INFRA_TIMING.totalDurationMs;

          // Determine active step based on timing boundaries
          if (next >= 0 && next < 2000) {
            setActiveStep(1);
          } else if (next >= 2000 && next < 4000) {
            setActiveStep(2);
          } else if (next >= 4000 && next < 6500) {
            setActiveStep(3);
          } else if (next >= 6500 && next < 9000) {
            setActiveStep(4);
          } else {
            setActiveStep(null); // Settle / idle phase 9s - 10s
          }

          // Compute packet positions along actual SVG paths
          if (path1Ref.current && next >= 0 && next < 2000) {
            const progress = (next - 0) / 1600;
            if (progress <= 1) {
              const len = path1Ref.current.getTotalLength();
              setPacket1Pos(path1Ref.current.getPointAtLength(len * progress));
            } else {
              setPacket1Pos(null);
            }
          } else {
            setPacket1Pos(null);
          }

          if (path2Ref.current && next >= 2000 && next < 4000) {
            const progress = (next - 2000) / 1400;
            if (progress <= 1) {
              const len = path2Ref.current.getTotalLength();
              setPacket2Pos(path2Ref.current.getPointAtLength(len * progress));
            } else {
              setPacket2Pos(null);
            }
          } else {
            setPacket2Pos(null);
          }

          if (path3Ref.current && next >= 4000 && next < 6500) {
            const progress = (next - 4000) / 1600;
            if (progress <= 1) {
              const len = path3Ref.current.getTotalLength();
              setPacket3Pos(path3Ref.current.getPointAtLength(len * progress));
            } else {
              setPacket3Pos(null);
            }
          } else {
            setPacket3Pos(null);
          }

          if (path4Ref.current && next >= 6500 && next < 9000) {
            const progress = (next - 6500) / 1400;
            if (progress <= 1) {
              const len = path4Ref.current.getTotalLength();
              setPacket4Pos(path4Ref.current.getPointAtLength(len * progress));
            } else {
              setPacket4Pos(null);
            }
          } else {
            setPacket4Pos(null);
          }

          if (userPathRef.current && next >= 7500 && next < 9000) {
            const progress = (next - 7500) / 1400;
            if (progress <= 1) {
              const len = userPathRef.current.getTotalLength();
              setUserPacketPos(userPathRef.current.getPointAtLength(len * progress));
            } else {
              setUserPacketPos(null);
            }
          } else {
            setUserPacketPos(null);
          }

          return next;
        });
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, isInViewport, isHovered, manualPauseUntil, prefersReducedMotion]);

  // Jump directly to step and pause for manual tuning/inspection
  const handleStepJump = (stepId: number) => {
    const step = MINI_INFRA_TIMING.steps.find((s) => s.id === stepId);
    if (!step) return;
    setActiveStep(stepId);
    setElapsedMs(step.startMs + 100);
    setManualPauseUntil(Date.now() + MINI_INFRA_TIMING.manualPauseMs);
  };

  // Hover node pause with 1s resume delay
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);
  const handleNodeMouseEnter = (tooltip: string) => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    setIsHovered(true);
    setTooltipText(tooltip);
  };
  const handleNodeMouseLeave = () => {
    setTooltipText(null);
    hoverTimerRef.current = setTimeout(() => {
      setIsHovered(false);
    }, MINI_INFRA_TIMING.hoverResumeDelayMs);
  };

  // Step opacity calculation (60% dimmed when another step is active)
  const getStepOpacity = (stepId: number) => {
    if (prefersReducedMotion || activeStep === null) return "opacity-100";
    return activeStep === stepId ? "opacity-100" : "opacity-60";
  };

  // Progress segment fill percentage
  const getProgressWidth = (step: (typeof MINI_INFRA_TIMING.steps)[0]) => {
    if (prefersReducedMotion) return "100%";
    if (elapsedMs < step.startMs) return "0%";
    if (elapsedMs >= step.endMs) return "100%";
    const p = ((elapsedMs - step.startMs) / (step.endMs - step.startMs)) * 100;
    return `${Math.min(100, Math.max(0, p))}%`;
  };

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label="Reference deployment workflow: Git push triggers GitHub Actions, running Terraform to provision AWS EC2 with Docker containers, served to clients over HTTPS."
      className="relative flex flex-col justify-between border border-border bg-surface p-5 md:p-6 shadow-2xs h-full select-none"
    >
      {/* Top Header & Interactive Controls */}
      <div className="flex items-center justify-between border-b border-border/70 pb-3 mb-4">
        <div>
          <div className="mono text-[10px] text-accent font-semibold tracking-wider uppercase">
            REFERENCE WORKFLOW
          </div>
          <div className="text-sm font-bold text-text">How it runs</div>
        </div>

        <div className="flex items-center gap-2">
          {/* Pause / Play Loop Toggle */}
          <button
            type="button"
            onClick={() => {
              setIsPlaying(!isPlaying);
              setManualPauseUntil(null);
            }}
            aria-label={isPlaying ? "Pause deployment animation loop" : "Resume deployment animation loop"}
            aria-pressed={!isPlaying}
            className="flex h-7 w-7 items-center justify-center border border-border bg-surface-muted text-text hover:border-accent hover:text-accent transition-colors cursor-pointer"
          >
            {isPlaying && !manualPauseUntil ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* 4 Small Progress Segments */}
      <div className="mb-4 grid grid-cols-4 gap-1.5" role="tablist" aria-label="Workflow progress steps">
        {MINI_INFRA_TIMING.steps.map((s) => {
          const isActive = activeStep === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => handleStepJump(s.id)}
              className="group flex flex-col gap-1 text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-accent"
              title={`Click to jump to Step ${s.id}: ${s.name}`}
            >
              <div className="h-1.5 w-full bg-surface-muted overflow-hidden border border-border/50">
                <div
                  className="h-full bg-accent transition-[width] duration-75"
                  style={{ width: getProgressWidth(s) }}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className={`mono text-[9px] font-bold ${isActive ? "text-accent" : "text-text-muted"}`}>
                  0{s.id}
                </span>
                <span className="mono text-[8px] text-text-muted uppercase truncate hidden sm:inline">
                  {s.name}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Step Live Tooltip Banner */}
      <div className="h-6 mb-2 flex items-center">
        <span className="mono text-[11px] text-text-muted truncate">
          {tooltipText || (activeStep ? MINI_INFRA_TIMING.steps.find((s) => s.id === activeStep)?.tooltip : "Workflow idle · Click a step to inspect")}
        </span>
      </div>

      {/* Node Hierarchy & Layout Canvas */}
      <div className="relative flex-1 flex flex-col justify-between gap-3 pt-1 pb-2">
        {/* SVG Connector Layer */}
        <svg
          className="absolute inset-0 pointer-events-none w-full h-full z-10 overflow-visible"
          aria-hidden="true"
        >
          <defs>
            <marker
              id={`arrow-${cardId}`}
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 2 L 8 5 L 0 8 z" fill="var(--border)" />
            </marker>
            <marker
              id={`arrow-active-${cardId}`}
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 2 L 8 5 L 0 8 z" fill="var(--accent)" />
            </marker>
          </defs>

          {/* Line 1: Developer -> GitHub */}
          {connections["line1"] && (
            <path
              ref={path1Ref}
              d={connections["line1"].d}
              fill="none"
              stroke={activeStep === 1 ? "var(--accent)" : "var(--border)"}
              strokeWidth="1.75"
              strokeDasharray="6 4"
              markerEnd={activeStep === 1 ? `url(#arrow-active-${cardId})` : `url(#arrow-${cardId})`}
              className={!prefersReducedMotion ? "animate-[dash_12s_linear_infinite]" : ""}
            />
          )}

          {/* Line 2: GitHub -> Terraform */}
          {connections["line2"] && (
            <path
              ref={path2Ref}
              d={connections["line2"].d}
              fill="none"
              stroke={activeStep === 2 ? "var(--accent)" : "var(--border)"}
              strokeWidth="1.75"
              strokeDasharray="6 4"
              markerEnd={activeStep === 2 ? `url(#arrow-active-${cardId})` : `url(#arrow-${cardId})`}
              className={!prefersReducedMotion ? "animate-[dash_12s_linear_infinite]" : ""}
            />
          )}

          {/* Line 3: Terraform -> AWS */}
          {connections["line3"] && (
            <path
              ref={path3Ref}
              d={connections["line3"].d}
              fill="none"
              stroke={activeStep === 3 ? "var(--accent)" : "var(--border)"}
              strokeWidth="1.75"
              strokeDasharray="6 4"
              markerEnd={activeStep === 3 ? `url(#arrow-active-${cardId})` : `url(#arrow-${cardId})`}
              className={!prefersReducedMotion ? "animate-[dash_12s_linear_infinite]" : ""}
            />
          )}

          {/* Line 4: GitHub Actions -> Docker Compose */}
          {connections["line4"] && (
            <path
              ref={path4Ref}
              d={connections["line4"].d}
              fill="none"
              stroke={activeStep === 4 ? "var(--accent)" : "var(--border)"}
              strokeWidth="1.75"
              strokeDasharray="6 4"
              markerEnd={activeStep === 4 ? `url(#arrow-active-${cardId})` : `url(#arrow-${cardId})`}
              className={!prefersReducedMotion ? "animate-[dash_12s_linear_infinite]" : ""}
            />
          )}

          {/* User Line: Browser -> Nginx */}
          {connections["userLine"] && (
            <path
              ref={userPathRef}
              d={connections["userLine"].d}
              fill="none"
              stroke={activeStep === 4 ? "var(--accent)" : "var(--border)"}
              strokeWidth="1.75"
              strokeDasharray="6 4"
              markerEnd={activeStep === 4 ? `url(#arrow-active-${cardId})` : `url(#arrow-${cardId})`}
            />
          )}

          {/* 6px Glowing Packets */}
          {packet1Pos && (
            <circle
              cx={packet1Pos.x}
              cy={packet1Pos.y}
              r="3.5"
              fill="var(--accent)"
              filter="drop-shadow(0 0 6px var(--accent))"
            />
          )}
          {packet2Pos && (
            <circle
              cx={packet2Pos.x}
              cy={packet2Pos.y}
              r="3.5"
              fill="var(--accent)"
              filter="drop-shadow(0 0 6px var(--accent))"
            />
          )}
          {packet3Pos && (
            <circle
              cx={packet3Pos.x}
              cy={packet3Pos.y}
              r="3.5"
              fill="var(--accent)"
              filter="drop-shadow(0 0 6px var(--accent))"
            />
          )}
          {packet4Pos && (
            <circle
              cx={packet4Pos.x}
              cy={packet4Pos.y}
              r="3.5"
              fill="var(--accent)"
              filter="drop-shadow(0 0 6px var(--accent))"
            />
          )}
          {userPacketPos && (
            <circle
              cx={userPacketPos.x}
              cy={userPacketPos.y}
              r="3.5"
              fill="var(--accent)"
              filter="drop-shadow(0 0 6px var(--accent))"
            />
          )}
        </svg>

        {/* 20px Numbered Badges (Sitting ON lines, not overlapping nodes) */}
        {connections["line1"] && (
          <div
            style={{
              position: "absolute",
              left: `${connections["line1"].badgePoint.x}px`,
              top: `${connections["line1"].badgePoint.y}px`,
              transform: `translate(-50%, -50%) scale(${activeStep === 1 ? 1.15 : 1})`,
            }}
            className={`z-20 flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-bold transition-all ${
              activeStep === 1
                ? "border-accent bg-accent text-text-on-accent ring-2 ring-accent/30 shadow-xs"
                : "border-border bg-surface text-text-muted"
            }`}
          >
            1
          </div>
        )}

        {connections["line2"] && (
          <div
            style={{
              position: "absolute",
              left: `${connections["line2"].badgePoint.x}px`,
              top: `${connections["line2"].badgePoint.y}px`,
              transform: `translate(-50%, -50%) scale(${activeStep === 2 ? 1.15 : 1})`,
            }}
            className={`z-20 flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-bold transition-all ${
              activeStep === 2
                ? "border-accent bg-accent text-text-on-accent ring-2 ring-accent/30 shadow-xs"
                : "border-border bg-surface text-text-muted"
            }`}
          >
            2
          </div>
        )}

        {connections["line3"] && (
          <div
            style={{
              position: "absolute",
              left: `${connections["line3"].badgePoint.x}px`,
              top: `${connections["line3"].badgePoint.y}px`,
              transform: `translate(-50%, -50%) scale(${activeStep === 3 ? 1.15 : 1})`,
            }}
            className={`z-20 flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-bold transition-all ${
              activeStep === 3
                ? "border-accent bg-accent text-text-on-accent ring-2 ring-accent/30 shadow-xs"
                : "border-border bg-surface text-text-muted"
            }`}
          >
            3
          </div>
        )}

        {connections["line4"] && (
          <div
            style={{
              position: "absolute",
              left: `${connections["line4"].badgePoint.x}px`,
              top: `${connections["line4"].badgePoint.y}px`,
              transform: `translate(-50%, -50%) scale(${activeStep === 4 ? 1.15 : 1})`,
            }}
            className={`z-20 flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-bold transition-all ${
              activeStep === 4
                ? "border-accent bg-accent text-text-on-accent ring-2 ring-accent/30 shadow-xs"
                : "border-border bg-surface text-text-muted"
            }`}
          >
            4
          </div>
        )}

        {/* --- STEP 1: Developer -> GitHub --- */}
        <div className={`transition-opacity duration-300 ${getStepOpacity(1)}`}>
          <div className="flex items-center justify-between gap-4">
            {/* Developer Node */}
            <div
              ref={devNodeRef}
              onMouseEnter={() => handleNodeMouseEnter("Developer triggers git push to remote repository")}
              onMouseLeave={handleNodeMouseLeave}
              className={`flex items-center gap-2.5 border bg-surface p-2.5 shadow-2xs transition-all ${
                activeStep === 1 ? "border-accent ring-1 ring-accent/40" : "border-border"
              }`}
            >
              <div className="flex h-7 w-7 items-center justify-center border border-border bg-surface-muted text-text">
                <User className="h-4 w-4" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-text">Developer</div>
                <div className="mono text-[9px] text-accent font-medium">git push</div>
              </div>
            </div>

            {/* GitHub & GitHub Actions Node */}
            <div
              ref={ghNodeRef}
              onMouseEnter={() => handleNodeMouseEnter("GitHub Actions triggers automated build, test & SAST scan")}
              onMouseLeave={handleNodeMouseLeave}
              className={`flex items-center gap-2.5 border bg-surface p-2.5 shadow-2xs transition-all ${
                activeStep === 1 ? "border-accent ring-1 ring-accent/40" : "border-border"
              }`}
            >
              <div className="flex h-7 w-7 items-center justify-center border border-border bg-surface-muted">
                <TechLogo name="GitHub" className="h-4 w-4" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-text flex items-center gap-1.5">
                  GitHub
                  <span className="mono text-[8px] border border-border bg-surface-muted px-1 py-0.2 text-text-muted">
                    REPO
                  </span>
                </div>
                <div className="mono text-[9px] text-text-muted flex items-center gap-1">
                  {activeStep === 1 ? (
                    <span className="flex items-center gap-1 text-accent font-semibold">
                      <Loader2 className="h-2.5 w-2.5 animate-spin" />
                      Actions: running
                    </span>
                  ) : (
                    "Actions: ready"
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- STEP 2: Terraform (IaC Plan/Apply) --- */}
        <div className={`flex justify-end transition-opacity duration-300 ${getStepOpacity(2)}`}>
          <div
            ref={tfNodeRef}
            onMouseEnter={() => handleNodeMouseEnter("Terraform computes execution plan and applies infrastructure")}
            onMouseLeave={handleNodeMouseLeave}
            className={`w-[210px] border bg-surface p-2.5 shadow-2xs transition-all ${
              activeStep === 2 ? "border-accent ring-1 ring-accent/40" : "border-border"
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center border border-border bg-surface-muted">
                  <TechLogo name="Terraform" className="h-3.5 w-3.5" />
                </div>
                <span className="text-[11px] font-bold text-text">Terraform</span>
              </div>
              <span className="mono text-[8px] text-text-muted border border-border px-1">IaC</span>
            </div>

            {/* Mini Log Simulation */}
            <div className="mono text-[9px] bg-surface-muted border border-border/60 p-1.5 space-y-0.5">
              <div className="flex items-center justify-between text-text-muted">
                <span>$ tf plan</span>
                <span className={activeStep === 2 ? "text-accent font-bold" : ""}>OK</span>
              </div>
              <div className="flex items-center justify-between text-text-muted">
                <span>$ tf apply</span>
                {activeStep === 2 ? (
                  <span className="text-success font-bold flex items-center gap-0.5">
                    <CheckCircle2 className="h-2.5 w-2.5" /> done
                  </span>
                ) : (
                  <span>synced</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* --- STEP 3: AWS Group -> EC2 -> Docker Containers --- */}
        <div className={`transition-opacity duration-300 ${getStepOpacity(3)}`}>
          <div
            ref={awsNodeRef}
            onMouseEnter={() => handleNodeMouseEnter("AWS Cloud hosts EC2 instance in ap-south-1")}
            onMouseLeave={handleNodeMouseLeave}
            className={`border rounded-xs p-3 transition-all ${
              activeStep === 3
                ? "border-accent bg-accent/5 ring-1 ring-accent/30"
                : "border-border bg-surface-muted/50"
            }`}
          >
            {/* AWS Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <TechLogo name="AWS" className="h-4 w-4" />
                <span className="mono text-[10px] font-bold text-text uppercase tracking-wider">
                  AWS Cloud
                </span>
              </div>
              <span className="mono text-[8px] text-text-muted font-medium">ap-south-1</span>
            </div>

            {/* EC2 Host Box */}
            <div className="border border-border bg-surface p-2.5 shadow-2xs mb-2">
              <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-border/60">
                <div className="flex items-center gap-1.5">
                  <div className="flex h-5 w-5 items-center justify-center border border-border bg-surface-muted">
                    <TechLogo name="AWS EC2" className="h-3 w-3" />
                  </div>
                  <span className="text-[11px] font-bold text-text">EC2 Host</span>
                </div>
                <span className="mono text-[8px] text-text-muted">Ubuntu 24.04 LTS</span>
              </div>

              {/* Docker Group with 3 Container Chips */}
              <div
                ref={dockerNodeRef}
                className="space-y-1.5"
              >
                <div className="flex items-center justify-between text-[9px] mono text-text-muted">
                  <div className="flex items-center gap-1">
                    <TechLogo name="Docker" className="h-3 w-3" />
                    <span>docker compose</span>
                  </div>
                  <span className="text-success font-semibold">3 CONTAINERS</span>
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  {/* Container Chip 1: Nginx */}
                  <div
                    ref={nginxNodeRef}
                    className={`flex items-center gap-1 border bg-surface-muted px-1.5 py-1 text-[10px] transition-all ${
                      activeStep === 4 ? "border-accent bg-accent/10" : "border-border"
                    }`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                    <TechLogo name="Nginx" className="h-3 w-3" />
                    <span className="font-mono text-[9px] font-bold text-text truncate">Nginx</span>
                  </div>

                  {/* Container Chip 2: App */}
                  <div
                    className={`flex items-center gap-1 border bg-surface-muted px-1.5 py-1 text-[10px] transition-all ${
                      activeStep === 4 ? "border-accent bg-accent/10" : "border-border"
                    }`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                    <Server className="h-3 w-3 text-text" />
                    <span className="font-mono text-[9px] font-bold text-text truncate">App</span>
                  </div>

                  {/* Container Chip 3: Database */}
                  <div
                    className={`flex items-center gap-1 border bg-surface-muted px-1.5 py-1 text-[10px] transition-all ${
                      activeStep === 4 ? "border-accent bg-accent/10" : "border-border"
                    }`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                    <div className="h-3 w-3 rounded-xs bg-accent/20 flex items-center justify-center text-[7px] font-bold text-accent">
                      DB
                    </div>
                    <span className="font-mono text-[9px] font-bold text-text truncate">Data</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- STEP 4: Client Browser & HTTPS Termination --- */}
        <div className={`transition-opacity duration-300 ${getStepOpacity(4)}`}>
          <div className="flex items-center justify-between border border-border bg-surface p-2.5 shadow-2xs">
            <div
              ref={browserNodeRef}
              className="flex items-center gap-2"
            >
              <div className="flex h-6 w-6 items-center justify-center border border-border bg-surface-muted text-text">
                <Globe className="h-3.5 w-3.5" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-text">Client / Browser</div>
                <div className="mono text-[8px] text-text-muted">Edge User Ingress</div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 border border-accent/40 bg-accent/10 px-2 py-0.5 text-accent">
              <Lock className="h-2.5 w-2.5" />
              <span className="mono text-[9px] font-bold tracking-wider">HTTPS</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Status Bar */}
      <div className="mono mt-2 pt-2 border-t border-border flex items-center justify-between text-[10px] text-text-muted">
        <span>STATUS: <span className="text-success font-semibold">ALL RUNNERS ACTIVE</span></span>
        <span>ZERO DOWNTIME RELOAD</span>
      </div>
    </div>
  );
}
