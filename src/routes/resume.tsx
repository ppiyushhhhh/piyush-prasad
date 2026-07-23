import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/resume")({
  head: () => ({
    meta: [
      { title: "Resume — Piyush Prasad" },
      { name: "description", content: "View the full resume of Piyush Prasad — Cloud & DevOps engineer skilled in AWS, CI/CD, Docker, Nginx, and GitHub Actions." },
      { property: "og:title", content: "Resume — Piyush Prasad" },
      { property: "og:description", content: "View the full resume of Piyush Prasad — Cloud & DevOps engineer skilled in AWS, CI/CD, Docker, Nginx, and GitHub Actions." },
      { property: "og:url", content: "https://simply-profile-plain.lovable.app/resume" },
      { name: "twitter:description", content: "View the full resume of Piyush Prasad — Cloud & DevOps engineer skilled in AWS, CI/CD, Docker, Nginx, and GitHub Actions." },
      { name: "robots", content: "noindex" },
    ],
    links: [
      { rel: "canonical", href: "https://simply-profile-plain.lovable.app/resume" },
      // Kick off the PDF fetch in parallel with the JS bundle so the viewer
      // has bytes ready the moment it mounts.
      {
        rel: "preload",
        as: "fetch",
        href: "/resume.pdf",
        type: "application/pdf",
        crossOrigin: "anonymous",
      },
    ],
  }),
  component: ResumeViewer,
});

function ResumeViewer() {
  const [loaded, setLoaded] = useState(false);

  // Safety net: some browsers (Firefox, mobile Safari) don't reliably fire
  // `onLoad` on <object>/<iframe> when rendering a PDF via the built-in
  // viewer, so the spinner could hang forever. Hide it after a short window.
  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 1500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="fixed inset-0 bg-[#1a1a1a] flex flex-col h-[100dvh]"
      onContextMenu={(e) => e.preventDefault()}
    >
      <header className="flex items-center justify-between gap-3 border-b border-white/10 bg-black px-4 py-3 text-white sm:px-6">
        <div className="min-w-0 truncate font-mono text-[10px] uppercase tracking-widest sm:text-[11px]">
          Piyush Prasad · Resume
        </div>
        <div className="shrink-0 font-mono text-[9px] uppercase tracking-wider text-white/75 sm:text-[10px]">
          View Only
        </div>
      </header>
      <div className="relative flex-1 min-h-0 overflow-hidden">
        {!loaded && (
          <div
            className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-[#1a1a1a] text-white/70"
            role="status"
            aria-live="polite"
          >
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white/80" />
            <div className="font-mono text-[10px] uppercase tracking-widest text-white/75">
              Loading resume…
            </div>
          </div>
        )}
        <object
          data="/resume.pdf#toolbar=0&navpanes=0&scrollbar=0&view=FitH"
          type="application/pdf"
          className="w-full h-full border-0 block"
          aria-label="Piyush Prasad Resume"
          onLoad={() => setLoaded(true)}
        >
          <iframe
            src="/resume.pdf#toolbar=0&navpanes=0&scrollbar=0&view=FitH"
            title="Piyush Prasad Resume"
            className="w-full h-full border-0 block"
            onLoad={() => setLoaded(true)}
          />
        </object>
      </div>
    </div>
  );
}
