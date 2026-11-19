import React from "react";
import type { LucideIcon } from "lucide-react";
import { resolveLogo } from "@/lib/tech-logo-registry";

interface NodeLogoProps {
  tech?: string | null;
  provider?: string | null;
  fallbackIcon?: LucideIcon;
  alt?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * Shared NodeLogo Component
 *
 * Renders verified authentic tech brand logos (36-44px tile) on a crisp white
 * rounded tile with a 1px aluminum border (#E5E5DF) and no grayscale or tint.
 * Falls back to the provided Lucide category icon when resolveLogo returns null.
 */
export function NodeLogo({
  tech,
  provider,
  fallbackIcon: FallbackIcon,
  alt,
  size = "md",
  className = "",
}: NodeLogoProps) {
  const logo = resolveLogo(tech, provider);

  const sizeClasses = {
    sm: "h-7 w-7 p-1",
    md: "h-10 w-10 p-1.5", // 40px standard
    lg: "h-11 w-11 p-2",   // 44px
  }[size];

  const iconSizes = {
    sm: "h-3.5 w-3.5",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  }[size];

  return (
    <div
      className={`relative flex items-center justify-center rounded-lg bg-white border border-[#E5E5DF] shadow-2xs shrink-0 select-none overflow-hidden ${sizeClasses} ${className}`}
      style={{ filter: "none" }}
    >
      {logo ? (
        <img
          src={logo.src}
          alt={alt || logo.label}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-contain pointer-events-none"
        />
      ) : FallbackIcon ? (
        <FallbackIcon className={`${iconSizes} text-muted-foreground`} />
      ) : (
        <span className="mono text-[10px] font-bold text-muted-foreground">IO</span>
      )}
    </div>
  );
}
