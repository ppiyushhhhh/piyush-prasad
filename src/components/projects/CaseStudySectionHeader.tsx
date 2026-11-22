interface CaseStudySectionHeaderProps {
  label: string;
  title: string;
  description?: string;
  className?: string;
}

export function CaseStudySectionHeader({
  label,
  title,
  description,
  className = "",
}: CaseStudySectionHeaderProps) {
  return (
    <div className={`pt-12 pb-4 ${className}`}>
      <span className="mono text-[11px] font-bold uppercase tracking-widest text-cobalt block mb-1.5">
        {label}
      </span>
      <h2 className="text-xl md:text-2xl font-bold tracking-tight text-carbon dark:text-white">
        {title}
      </h2>
      {description && (
        <p className="mt-2 text-xs md:text-sm text-muted-foreground leading-relaxed max-w-4xl">
          {description}
        </p>
      )}
    </div>
  );
}
