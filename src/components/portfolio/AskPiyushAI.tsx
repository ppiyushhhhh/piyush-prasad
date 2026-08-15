import { lazy, Suspense, useState } from "react";
import { MessageSquare } from "lucide-react";

// Lazy-loaded so the chat UI is not part of the initial portfolio bundle.
const ChatPanel = lazy(() => import("./ChatPanel"));

export function AskPiyushAI() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open Piyush AI assistant"
          className="mono fixed right-4 bottom-4 z-[60] inline-flex items-center gap-2 border border-carbon bg-carbon px-4 py-3 text-[11px] tracking-[0.12em] text-white uppercase shadow-[0_12px_30px_-12px_rgba(15,17,21,0.6)] transition-colors hover:bg-cobalt hover:border-cobalt focus-visible:ring-2 focus-visible:ring-cobalt focus-visible:ring-offset-2 focus-visible:outline-none sm:right-6 sm:bottom-6"
        >
          <MessageSquare className="h-4 w-4" aria-hidden="true" />
          Ask Piyush AI
        </button>
      )}
      {open && (
        <Suspense fallback={null}>
          <ChatPanel onClose={() => setOpen(false)} />
        </Suspense>
      )}
    </>
  );
}
