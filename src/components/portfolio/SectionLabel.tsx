export function SectionLabel({
  n,
  label,
  dark = false,
}: {
  n: string;
  label: string;
  dark?: boolean;
}) {
  return (
    <div
      className={`mono mb-16 flex items-center gap-4 text-[11px] ${dark ? "text-text-muted" : "text-text-muted"}`}
    >
      <span className="text-accent">{n}</span>
      <span>/ {label}</span>
      <span className={`ml-4 h-px flex-1 ${dark ? "bg-border" : "bg-border"}`} />
    </div>
  );
}
