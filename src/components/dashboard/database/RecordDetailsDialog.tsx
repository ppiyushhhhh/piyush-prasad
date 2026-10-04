import { useState } from "react";
import { Copy, Check, X, FileJson } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface RecordDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  data: Record<string, any> | null;
}

export function RecordDetailsDialog({
  isOpen,
  onClose,
  title,
  data,
}: RecordDetailsDialogProps) {
  const [copied, setCopied] = useState(false);

  if (!data) return null;

  const jsonString = JSON.stringify(data, null, 2);

  function handleCopy() {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col bg-slate-900 border-slate-800 text-slate-100 p-0 overflow-hidden shadow-2xl">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-cyan-400">
                <FileJson className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-semibold text-slate-100">
                  {title}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-400 mt-0.5">
                  Detailed inspection of record attributes and values
                </DialogDescription>
              </div>
            </div>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-mono text-slate-300 hover:bg-slate-700 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-slate-400" />
                  <span>Copy JSON</span>
                </>
              )}
            </button>
          </div>
        </DialogHeader>

        {/* Formatted Key-Value Grid and JSON view */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 font-mono text-xs">
          <div className="rounded-lg border border-slate-800/90 bg-slate-950 p-4 divide-y divide-slate-800/60">
            {Object.entries(data).map(([key, value]) => {
              const isObj = typeof value === "object" && value !== null;
              return (
                <div key={key} className="py-2.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4">
                  <span className="text-slate-400 font-semibold w-40 shrink-0 uppercase tracking-wider text-[11px]">
                    {key}
                  </span>
                  <div className="flex-1 text-slate-200 break-all overflow-x-auto">
                    {isObj ? (
                      <pre className="text-[11px] p-2 rounded bg-slate-900/80 border border-slate-800 text-cyan-300 whitespace-pre-wrap">
                        {JSON.stringify(value, null, 2)}
                      </pre>
                    ) : value === null || value === undefined ? (
                      <span className="text-slate-600 italic">null</span>
                    ) : typeof value === "boolean" ? (
                      <span className={value ? "text-emerald-400" : "text-rose-400"}>
                        {value ? "true" : "false"}
                      </span>
                    ) : (
                      <span>{String(value)}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <details className="mt-4 group">
            <summary className="cursor-pointer text-[11px] text-slate-400 hover:text-slate-200 select-none pb-2 font-sans font-medium">
              ▸ View Raw JSON Payload
            </summary>
            <pre className="mt-2 p-4 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-[11px] overflow-x-auto leading-relaxed">
              {jsonString}
            </pre>
          </details>
        </div>
      </DialogContent>
    </Dialog>
  );
}
