interface TocSection {
  id: string;
  label: string;
}

interface ProjectTableOfContentsProps {
  sections: TocSection[];
  activeSection: string;
}

export function ProjectTableOfContents({ sections, activeSection }: ProjectTableOfContentsProps) {
  return (
    <aside className="hidden lg:block w-[280px] shrink-0 sticky top-[88px] self-start">
      <div className="rounded-xl border border-[#E5E5DF] dark:border-white/10 bg-white dark:bg-neutral-900 p-4 shadow-2xs">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#E5E5DF] dark:border-white/10">
          <span className="mono text-[10px] font-bold uppercase tracking-widest text-cobalt">
            Case Study Navigation
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-cobalt animate-pulse" />
        </div>

        <nav aria-label="Table of contents" className="space-y-1">
          {sections.map((section) => {
            const isActive = activeSection === section.id;
            return (
              <a
                key={section.id}
                href={`#${section.id}`}
                className={`group flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
                  isActive
                    ? "bg-cobalt/10 text-cobalt font-bold dark:bg-cobalt/20"
                    : "text-muted-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-carbon dark:hover:text-white font-medium"
                }`}
              >
                <span className="truncate">{section.label}</span>
                {isActive && <span className="h-1.5 w-1.5 rounded-full bg-cobalt shrink-0" />}
              </a>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
