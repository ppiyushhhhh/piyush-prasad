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
      className="fixed inset-0 bg-[#1a1a1a] flex flex-col"
      onContextMenu={(e) => e.preventDefault()}
    >
      <header className="flex items-center justify-between px-6 py-3 bg-black text-white border-b border-white/10">
        <div className="font-mono text-[11px] tracking-widest uppercase">
          Piyush Prasad · Resume
        </div>
        <div className="font-mono text-[10px] tracking-wider uppercase text-white/50">
          View Only
        </div>
      </header>
      <div className="flex-1 overflow-hidden">
        <iframe
          src="/resume.pdf#toolbar=0&navpanes=0&scrollbar=0&view=FitH"
          title="Piyush Prasad Resume"
          className="w-full h-full border-0"
        />
      </div>
    </div>
  );
}
