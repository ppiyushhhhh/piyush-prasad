import type { ReactNode } from "react";

/**
 * StatusTag: Rectilinear monospace indicator (replaces playful/soft rounded pills).
 * Modeled after hardware instrumentation markers and aeronautics readouts.
 */
export function StatusTag({
  status = "neutral",
  children,
  code,
}: {
  status?: "optimal" | "warning" | "critical" | "neutral" | "cobalt";
  children: ReactNode;
  code?: string;
}) {
  const styles = {
    optimal: "border-emerald-300 bg-emerald-50 text-emerald-800",
    warning: "border-amber-300 bg-amber-50 text-amber-800",
    critical: "border-rose-300 bg-rose-50 text-rose-800",
    cobalt: "border-cobalt/30 bg-cobalt/5 text-cobalt",
    neutral: "border-[#E5E5DF] bg-[#FAF9F6] text-carbon",
  }[status];

  const dot = {
    optimal: "bg-emerald-600",
    warning: "bg-amber-600",
    critical: "bg-rose-600",
    cobalt: "bg-cobalt",
    neutral: "bg-carbon/60",
  }[status];

  return (
    <span
      className={`mono inline-flex items-center gap-1.5 border px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase transition-colors ${styles}`}
    >
      <span className={`h-1.5 w-1.5 shrink-0 ${dot}`} />
      {code && <span className="opacity-60">{code} //</span>}
      <span>{children}</span>
    </span>
  );
}

/**
 * TelemetryMatrix: Continuous architectural grid with internal hairline rules.
 * Replaces disconnected islands of floating cards.
 */
export function TelemetryMatrix({
  children,
  columns = 4,
}: {
  children: ReactNode;
  columns?: 2 | 3 | 4 | 5 | 6;
}) {
  const colClass = {
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-3",
    4: "sm:grid-cols-2 lg:grid-cols-4",
    5: "sm:grid-cols-2 lg:grid-cols-5",
    6: "sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6",
  }[columns];

  return (
    <div
      className={`grid ${colClass} border border-[#E5E5DF] bg-white divide-y sm:divide-y-0 sm:divide-x divide-[#E5E5DF] overflow-hidden`}
    >
      {children}
    </div>
  );
}

/**
 * TelemetryCell: Precision cell inside a TelemetryMatrix or individual block.
 */
export function TelemetryCell({
  index,
  label,
  value,
  hint,
  status = "neutral",
}: {
  index?: string | number;
  label: string;
  value?: string | number | null;
  hint?: string;
  status?: "optimal" | "warning" | "critical" | "neutral" | "cobalt";
}) {
  const empty = value === null || value === undefined || value === "";
  const indexStr =
    typeof index === "number" ? String(index).padStart(2, "0") : index;

  const valueColor = {
    optimal: "text-emerald-700",
    warning: "text-amber-700",
    critical: "text-rose-700",
    cobalt: "text-cobalt",
    neutral: "text-carbon",
  }[status];

  return (
    <div className="relative bg-white p-5 transition-colors hover:bg-[#FAF9F6]/50">
      <div className="flex items-start justify-between gap-2">
        <span className="mono text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          {label}
        </span>
        {indexStr && (
          <span className="mono text-[9px] font-semibold text-muted-foreground/60 select-none">
            [{indexStr}]
          </span>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span
          className={`mono text-2xl sm:text-3xl font-bold tracking-tight ${empty ? "text-muted-foreground/40 font-normal" : valueColor}`}
        >
          {empty ? "—" : value}
        </span>
      </div>

      {hint && (
        <p className="mt-2 mono text-[10px] text-muted-foreground truncate border-t border-[#E5E5DF]/60 pt-2">
          {hint}
        </p>
      )}
    </div>
  );
}

/**
 * MetricCard: Backward-compatible wrapper that now renders with crisp architectural styling.
 */
export function MetricCard({
  label,
  value,
  hint,
}: {
  label: string;
  value?: string | number | null;
  hint?: string;
}) {
  return (
    <div className="border border-[#E5E5DF] bg-white transition-colors hover:border-cobalt/40">
      <TelemetryCell label={label} value={value} hint={hint} />
    </div>
  );
}

/**
 * Panel: Architectural console container with technical coordinate headers.
 */
export function Panel({
  title,
  tag,
  children,
  action,
}: {
  title: string;
  tag?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="border border-[#E5E5DF] bg-white">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E5DF] bg-[#FAF9F6] px-5 py-3">
        <div className="flex items-center gap-2.5">
          {tag && (
            <span className="mono text-[9px] font-bold uppercase tracking-[0.2em] text-cobalt">
              {tag} //
            </span>
          )}
          <h2 className="mono text-[11px] font-bold uppercase tracking-[0.16em] text-carbon">
            {title}
          </h2>
        </div>
        {action}
      </header>
      <div className="p-5 md:p-6">{children}</div>
    </section>
  );
}

export function EmptyState({
  title = "No telemetry recorded",
  description,
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="border border-dashed border-[#E5E5DF] bg-[#FAF9F6]/60 px-6 py-12 text-center">
      <p className="mono text-xs font-bold uppercase tracking-wider text-carbon">
        // {title}
      </p>
      <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-muted-foreground font-sans">
        {description ??
          "Data collection is not connected yet. Telemetry will register automatically when monitoring cycles trigger."}
      </p>
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  badge,
}: {
  title: string;
  subtitle: string;
  badge?: string;
}) {
  return (
    <header className="mb-8 border-b border-[#E5E5DF] pb-5">
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <span className="mono text-[9px] font-bold uppercase tracking-[0.22em] text-cobalt">
          SYS // DEVOPS CONSOLE
        </span>
        <span className="text-muted-foreground/40">•</span>
        <span className="mono text-[9px] uppercase tracking-wider text-muted-foreground">
          HOST: PIYUSHPRASAD.IN
        </span>
        {badge && (
          <>
            <span className="text-muted-foreground/40">•</span>
            <span className="mono text-[9px] uppercase font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2">
              {badge}
            </span>
          </>
        )}
      </div>
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-carbon">
        {title}
      </h1>
      <p className="mt-1 text-xs text-muted-foreground leading-relaxed max-w-3xl">
        {subtitle}
      </p>
    </header>
  );
}
