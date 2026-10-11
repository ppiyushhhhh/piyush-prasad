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
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col bg-white border-[#E5E5DF] text-carbon p-0 overflow-hidden shadow-xl rounded-sm">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-[#E5E5DF] shrink-0 bg-[#FAF9F6]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-sm bg-white border border-[#E5E5DF] text-cobalt shadow-2xs">
                <FileJson className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-semibold text-carbon">
                  {title}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Detailed inspection of record attributes and values
                </DialogDescription>
              </div>
            </div>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 rounded-sm border border-[#E5E5DF] bg-white px-3 py-1.5 text-xs font-mono text-carbon hover:bg-[#FAF9F6] transition-colors shadow-2xs"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-semibold">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Copy JSON</span>
                </>
              )}
            </button>
          </div>
        </DialogHeader>

        {/* Formatted Key-Value Grid and JSON view */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 font-mono text-xs bg-white">
          <div className="rounded-sm border border-[#E5E5DF] bg-white p-4 divide-y divide-[#E5E5DF] shadow-2xs">
            {Object.entries(data).map(([key, value]) => {
              const isObj = typeof value === "object" && value !== null;
              return (
                <div key={key} className="py-2.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4">
                  <span className="text-muted-foreground font-semibold w-40 shrink-0 uppercase tracking-wider text-[11px]">
                    {key}
                  </span>
                  <div className="flex-1 text-carbon break-all overflow-x-auto">
                    {isObj ? (
                      <pre className="text-[11px] p-2 rounded-sm bg-[#FAF9F6] border border-[#E5E5DF] text-cobalt whitespace-pre-wrap">
                        {JSON.stringify(value, null, 2)}
                      </pre>
                    ) : value === null || value === undefined ? (
                      <span className="text-muted-foreground/60 italic">null</span>
                    ) : typeof value === "boolean" ? (
                      <span className={value ? "text-emerald-700 font-semibold" : "text-rose-700 font-semibold"}>
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
            <summary className="cursor-pointer text-[11px] text-muted-foreground hover:text-carbon select-none pb-2 font-sans font-medium">
              ▸ View Raw JSON Payload
            </summary>
            <pre className="mt-2 p-4 rounded-sm bg-[#FAF9F6] border border-[#E5E5DF] text-carbon text-[11px] overflow-x-auto leading-relaxed shadow-2xs">
              {jsonString}
            </pre>
          </details>
        </div>
      </DialogContent>
    </Dialog>
  );
}
