import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";

/** Shared loading / error presentation for dashboard panels. */

export function LoadingState({ label = "Loading data…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-slate-800 bg-slate-950/40 px-6 py-10 text-sm text-slate-500">
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      {label}
    </div>
  );
}

export function ErrorState({ message }: { message?: string }) {
  return (
    <div className="rounded-lg border border-red-900/60 bg-red-950/20 px-6 py-8 text-center">
      <p className="text-sm font-medium text-red-300">Could not load data</p>
      <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-red-400/80">
        {message ?? "The monitoring database did not respond. Try again shortly."}
      </p>
    </div>
  );
}

export function DataTable({
  headers,
  children,
}: {
  headers: string[];
  children: ReactNode;
}) {
  return (
    <div className="-mx-5 overflow-x-auto px-5">
      <table className="w-full min-w-[640px] border-collapse text-left text-xs">
        <thead>
          <tr className="border-b border-slate-800">
            {headers.map((h) => (
              <th
                key={h}
                className="py-2 pr-4 font-semibold uppercase tracking-[0.14em] text-slate-500"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="font-mono text-slate-300">{children}</tbody>
      </table>
    </div>
  );
}

export const fmtDateTime = (value?: string | null) =>
  value ? new Date(value).toLocaleString() : null;

export const fmtDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString() : null;

export const boolLabel = (value?: boolean | null) =>
  value === null || value === undefined ? null : value ? "OK" : "Failing";
