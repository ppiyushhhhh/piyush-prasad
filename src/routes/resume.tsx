import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/resume")({
  head: () => ({
    meta: [
      { title: "Resume — Piyush Prasad" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResumeViewer,
});

function ResumeViewer() {
  return (
    <div
      className="fixed inset-0 bg-[#1a1a1a] flex flex-col h-[100dvh]"
      onContextMenu={(e) => e.preventDefault()}
    >
      <header className="flex items-center justify-between gap-3 border-b border-white/10 bg-black px-4 py-3 text-white sm:px-6">
        <div className="min-w-0 truncate font-mono text-[10px] uppercase tracking-widest sm:text-[11px]">
          Piyush Prasad · Resume
        </div>
        <div className="shrink-0 font-mono text-[9px] uppercase tracking-wider text-white/50 sm:text-[10px]">
          View Only
        </div>
      </header>
      <div className="flex-1 min-h-0 overflow-hidden">
        <object
          data="/resume.pdf#toolbar=0&navpanes=0&scrollbar=0&view=FitH"
          type="application/pdf"
          className="w-full h-full border-0 block"
          aria-label="Piyush Prasad Resume"
        >
          <iframe
            src="/resume.pdf#toolbar=0&navpanes=0&scrollbar=0&view=FitH"
            title="Piyush Prasad Resume"
            className="w-full h-full border-0 block"
          />
        </object>
      </div>
    </div>
  );
}
