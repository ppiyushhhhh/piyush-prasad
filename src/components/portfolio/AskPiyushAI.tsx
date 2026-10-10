import { lazy, Suspense, useState, useEffect } from "react";
import { Terminal, MessageSquare, Sparkles, X } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

// Lazy-loaded so the chat UI is not part of the initial portfolio bundle.
const ChatPanel = lazy(() => import("./ChatPanel"));

export function AskPiyushAI() {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  // Sync state with open/close events from command palette or other components
  useEffect(() => {
    const handleCloseEvent = () => setOpen(false);
    const handleOpenEvent = () => setOpen(true);
    window.addEventListener("close-ai-chat", handleCloseEvent);
    window.addEventListener("open-ai-chat", handleOpenEvent);
    return () => {
      window.removeEventListener("close-ai-chat", handleCloseEvent);
      window.removeEventListener("open-ai-chat", handleOpenEvent);
    };
  }, []);

  return (
    <>
      <AnimatePresence>
        {!open && (
          <div className="fixed right-5 bottom-5 z-50 sm:right-7 sm:bottom-7">
            {/* Tooltip on Desktop */}
            <AnimatePresence>
              {hovered && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="pointer-events-none absolute bottom-full right-0 mb-3 hidden sm:flex items-center gap-2 whitespace-nowrap border border-border bg-carbon px-3 py-1.5 text-xs font-mono font-medium text-white shadow-lg"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-cobalt animate-pulse" />
                  <span>Ask my AI assistant</span>
                  <span className="text-[10px] text-white/50 border border-white/20 px-1 py-0.2 rounded-2xs">
                    CLI
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Circular Floating Chat Launcher */}
            <motion.button
              type="button"
              onClick={() => setOpen(true)}
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
              onFocus={() => setHovered(true)}
              onBlur={() => setHovered(false)}
              aria-label="Ask Piyush's AI assistant"
              aria-haspopup="dialog"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
              whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="group relative flex h-14 w-14 items-center justify-center rounded-full border border-carbon bg-carbon text-white shadow-[0_8px_24px_-4px_rgba(18,19,22,0.4)] transition-colors hover:border-cobalt hover:bg-cobalt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt focus-visible:ring-offset-2"
            >
              {/* Online Pulse Indicator Badge */}
              <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-carbon bg-emerald-500" />
              </span>

              {/* Terminal / Assistant Icon */}
              <div className="flex items-center justify-center">
                <Terminal className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
              </div>
            </motion.button>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Chat Panel */}
      {open && (
        <Suspense fallback={null}>
          <ChatPanel onClose={() => setOpen(false)} />
        </Suspense>
      )}
    </>
  );
}
