import type { ReactNode } from "react";

export function Panel({
  title,
  children,
  action,
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="rounded-sm border border-[#E5E5DF] bg-white shadow-2xs">
      <header className="flex items-center justify-between border-b border-[#E5E5DF] bg-[#FAF9F6]/60 px-5 py-3">
        <h2 className="mono text-[11px] font-semibold uppercase tracking-[0.14em] text-carbon">
          {title}
        </h2>
        {action}
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}

export function MetricCard({
  label,
  value,
  hint,
}: {
  label: string;
  value?: string | number | null;
  hint?: string;
}) {
  const empty = value === null || value === undefined || value === "";
  return (
    <div className="rounded-sm border border-[#E5E5DF] bg-white p-4 shadow-2xs transition-colors hover:border-cobalt/40">
      <p className="mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <p
        className={`mt-2 font-mono text-2xl font-bold ${empty ? "text-muted-foreground/60" : "text-carbon"}`}
      >
        {empty ? "—" : value}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{hint ?? "No data yet"}</p>
    </div>
  );
}

export function EmptyState({
  title = "No monitoring data yet",
  description,
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="rounded-sm border border-dashed border-[#E5E5DF] bg-[#FAF9F6]/60 px-6 py-10 text-center">
      <p className="text-sm font-semibold text-carbon">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-muted-foreground">
        {description ??
          "Data collection is not connected yet. Values appear here once monitoring starts writing results."}
      </p>
    </div>
  );
}

export function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <header className="mb-8">
      <h1 className="text-2xl font-bold tracking-tight text-carbon">{title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
    </header>
  );
}

