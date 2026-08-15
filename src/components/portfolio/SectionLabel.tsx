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
      className={`mono mb-16 flex items-center gap-4 text-[11px] ${dark ? "text-white/80" : "text-carbon/70"}`}
    >
      <span className="text-cobalt">{n}</span>
      <span>/ {label}</span>
      <span className={`ml-4 h-px flex-1 ${dark ? "bg-white/20" : "bg-[#D1D1CB]"}`} />
    </div>
  );
}
