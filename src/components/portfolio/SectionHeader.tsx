import { motion } from "framer-motion";

interface SectionHeaderProps {
  n: string;
  label: string;
  title: string;
  subtitle?: string;
  description?: string;
  className?: string;
}

export function SectionHeader({
  n,
  label,
  title,
  subtitle,
  description,
  className = "",
}: SectionHeaderProps) {
  return (
    <div className={`mb-12 md:mb-16 ${className}`}>
      {/* Category Eyebrow / Number */}
      <div className="mono mb-4 flex items-center gap-3 text-[11px] font-medium text-carbon/60">
        <span className="inline-flex items-center gap-1.5 font-bold text-cobalt">
          <span className="h-1.5 w-1.5 rounded-full bg-cobalt" />
          {n}
        </span>
        <span className="text-carbon/30">/</span>
        <span className="tracking-[0.16em] text-carbon/80">{label}</span>
        <span className="ml-3 h-px flex-1 bg-border" />
      </div>

      {/* Main Section Heading */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="display text-[32px] sm:text-[44px] md:text-[56px] text-carbon tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="mono mt-2 text-cobalt text-[11px] tracking-widest">
              {subtitle}
            </p>
          )}
        </div>
        {description && (
          <p className="max-w-xl text-sm md:text-base leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
