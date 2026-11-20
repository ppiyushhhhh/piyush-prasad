import React from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  X,
  Repeat,
  Scan,
  LayoutGrid,
} from "lucide-react";
import type { JourneyStepInfo } from "./useDiagramAnimation";

interface DiagramToolbarProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onFitToScreen?: () => void;
  layoutMode?: "auto" | "preset";
  onToggleLayoutMode?: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  // Live State
  isLive: boolean;
  onToggleLive: () => void;
  // Journey State
  isJourneyActive: boolean;
  isJourneyPlaying: boolean;
  journeySpeed: 0.5 | 1 | 2;
  journeyLoop: boolean;
  currentStepInfo: JourneyStepInfo | null;
  onStartJourney: () => void;
  onStopJourney: () => void;
  onToggleJourneyPlay: () => void;
  onNextJourneyStep: () => void;
  onPrevJourneyStep: () => void;
  onSetJourneySpeed: (speed: 0.5 | 1 | 2) => void;
  onToggleJourneyLoop: () => void;
  // Optional extra buttons (e.g. Export buttons on canvas)
  extraActions?: React.ReactNode;
  className?: string;
}

export function DiagramToolbar({
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onFitToScreen,
  layoutMode,
  onToggleLayoutMode,
  isFullscreen,
  onToggleFullscreen,
  isLive,
  onToggleLive,
  isJourneyActive,
  isJourneyPlaying,
  journeySpeed,
  journeyLoop,
  currentStepInfo,
  onStartJourney,
  onStopJourney,
  onToggleJourneyPlay,
  onNextJourneyStep,
  onPrevJourneyStep,
  onSetJourneySpeed,
  onToggleJourneyLoop,
  extraActions,
  className = "",
}: DiagramToolbarProps) {
  return (
    <div className={`flex flex-col gap-2.5 w-full ${className}`}>
      {/* Top Toolbar Row */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        {/* Left: Journey Trigger or Active Playback Bar */}
        <div className="flex items-center gap-2">
          {!isJourneyActive ? (
            <button
              type="button"
              onClick={onStartJourney}
              className="mono inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-cobalt/40 bg-cobalt/5 hover:bg-cobalt/10 text-cobalt font-bold text-[10px] tracking-wider transition-all hover:border-cobalt shadow-2xs cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-cobalt"
              title="Trace the sequential end-to-end request path through the architecture"
              aria-label="Start Request Journey Playback"
            >
              <Play className="h-3 w-3 fill-cobalt text-cobalt" />
              <span>TRACE REQUEST</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 p-1 rounded-md border border-cobalt/40 bg-white dark:bg-neutral-900 shadow-2xs">
              <button
                type="button"
                onClick={onPrevJourneyStep}
                className="p-1 rounded text-muted-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-carbon transition-colors cursor-pointer"
                title="Previous Step"
                aria-label="Previous Journey Step"
              >
                <SkipBack className="h-3.5 w-3.5" />
              </button>

              <button
                type="button"
                onClick={onToggleJourneyPlay}
                className="p-1 px-1.5 rounded bg-cobalt text-white hover:bg-cobalt/90 transition-colors cursor-pointer flex items-center gap-1"
                title={isJourneyPlaying ? "Pause Journey" : "Play Journey"}
                aria-label={isJourneyPlaying ? "Pause Journey" : "Play Journey"}
              >
                {isJourneyPlaying ? (
                  <Pause className="h-3.5 w-3.5 fill-white" />
                ) : (
                  <Play className="h-3.5 w-3.5 fill-white" />
                )}
              </button>

              <button
                type="button"
                onClick={onNextJourneyStep}
                className="p-1 rounded text-muted-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-carbon transition-colors cursor-pointer"
                title="Next Step"
                aria-label="Next Journey Step"
              >
                <SkipForward className="h-3.5 w-3.5" />
              </button>

              <div className="h-3.5 w-px bg-border mx-0.5" />

              {/* Speed Buttons */}
              <div className="flex items-center gap-0.5">
                {([0.5, 1, 2] as const).map((spd) => (
                  <button
                    key={spd}
                    type="button"
                    onClick={() => onSetJourneySpeed(spd)}
                    className={`mono px-1.5 py-0.5 rounded text-[9px] font-bold transition-colors cursor-pointer ${
                      journeySpeed === spd
                        ? "bg-cobalt/15 text-cobalt"
                        : "text-muted-foreground hover:text-carbon"
                    }`}
                  >
                    {spd}×
                  </button>
                ))}
              </div>

              <div className="h-3.5 w-px bg-border mx-0.5" />

              {/* Loop Toggle */}
              <button
                type="button"
                onClick={onToggleJourneyLoop}
                className={`p-1 rounded transition-colors cursor-pointer ${
                  journeyLoop ? "text-cobalt bg-cobalt/10" : "text-muted-foreground hover:text-carbon"
                }`}
                title={journeyLoop ? "Loop Enabled" : "Loop Disabled"}
                aria-label={journeyLoop ? "Disable Loop" : "Enable Loop"}
              >
                <Repeat className="h-3.5 w-3.5" />
              </button>

              <button
                type="button"
                onClick={onStopJourney}
                className="p-1 rounded text-muted-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-red-600 transition-colors cursor-pointer"
                title="Exit Journey Mode"
                aria-label="Exit Journey Mode"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Optional Layout Mode Toggle */}
          {onToggleLayoutMode && (
            <button
              type="button"
              onClick={onToggleLayoutMode}
              className={`mono inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-[10px] font-bold tracking-wider transition-colors cursor-pointer ${
                layoutMode === "auto"
                  ? "border-cobalt/40 bg-cobalt/10 text-cobalt"
                  : "border-border bg-white dark:bg-neutral-900 text-muted-foreground hover:text-carbon"
              }`}
              title={
                layoutMode === "auto"
                  ? "Topological Tier View Active (Click for Preset)"
                  : "Preset Diagram Coordinates Active (Click for Tiered Auto-Layout)"
              }
            >
              <LayoutGrid className="h-3 w-3" />
              <span className="hidden sm:inline">
                {layoutMode === "auto" ? "TIER VIEW" : "PRESET"}
              </span>
            </button>
          )}
        </div>

        {/* Right Controls: Live/Paused + Zoom + Fit + Reset + Fullscreen */}
        <div className="flex items-center gap-1.5 p-1 rounded-md border border-border bg-white dark:bg-neutral-900 shadow-2xs">
          {/* Live / Paused Status Toggle */}
          <button
            type="button"
            onClick={onToggleLive}
            className={`mono inline-flex items-center gap-1.5 px-2 py-1 rounded text-[9.5px] font-bold tracking-wider transition-colors cursor-pointer ${
              isLive
                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40"
                : "bg-neutral-100 dark:bg-neutral-800 text-muted-foreground border border-transparent"
            }`}
            title={isLive ? "Animations Active (Click to Pause)" : "Animations Paused (Click to Resume)"}
            aria-label={isLive ? "Pause animations" : "Resume animations"}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isLive ? "bg-emerald-500 animate-pulse" : "bg-neutral-400"
              }`}
            />
            <span>{isLive ? "LIVE" : "PAUSED"}</span>
          </button>

          <div className="h-3.5 w-px bg-border mx-0.5" />

          {/* Zoom Controls */}
          <button
            type="button"
            onClick={onZoomOut}
            className="rounded p-1 text-muted-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-carbon transition-colors cursor-pointer"
            title="Zoom Out"
            aria-label="Zoom out"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          <span className="mono min-w-8 text-center text-[10px] font-semibold text-muted-foreground">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={onZoomIn}
            className="rounded p-1 text-muted-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-carbon transition-colors cursor-pointer"
            title="Zoom In"
            aria-label="Zoom in"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>

          {/* Fit to Screen */}
          {onFitToScreen && (
            <button
              type="button"
              onClick={onFitToScreen}
              className="rounded p-1 text-muted-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-cobalt transition-colors cursor-pointer"
              title="Fit to Screen"
              aria-label="Fit diagram to screen"
            >
              <Scan className="h-3.5 w-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={onResetZoom}
            className="rounded p-1 text-muted-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-carbon transition-colors cursor-pointer"
            title="Reset View"
            aria-label="Reset zoom and center"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>

          {/* Optional Extra Actions (e.g. Export buttons) */}
          {extraActions && (
            <>
              <div className="h-3.5 w-px bg-border mx-0.5" />
              {extraActions}
            </>
          )}

          <div className="h-3.5 w-px bg-border mx-0.5" />

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={onToggleFullscreen}
            className="rounded p-1 text-muted-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-carbon transition-colors cursor-pointer"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen View"}
            aria-label={isFullscreen ? "Exit Fullscreen" : "Fullscreen View"}
          >
            {isFullscreen ? (
              <Minimize2 className="h-3.5 w-3.5" />
            ) : (
              <Maximize2 className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
