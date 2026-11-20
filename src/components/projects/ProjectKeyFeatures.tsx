import { CheckCircle2, Sparkles } from "lucide-react";
import type { PortfolioProject } from "@/lib/portfolio-projects";

interface ProjectKeyFeaturesProps {
  project: PortfolioProject;
}

export function ProjectKeyFeatures({ project }: ProjectKeyFeaturesProps) {
  if (!project.key_features || project.key_features.length === 0) return null;

  return (
    <section id="features" className="space-y-4 scroll-mt-24">
      <div className="flex items-center gap-2 mb-2">
        <span className="mono text-[11px] font-bold uppercase tracking-widest text-cobalt">
          Capabilities
        </span>
        <span className="h-1 w-1 rounded-full bg-cobalt" />
        <h2 className="text-xl md:text-2xl font-bold text-carbon dark:text-white">
          Key Engineering Features
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {project.key_features.map((feature, idx) => (
          <div
            key={idx}
            className="flex items-start gap-3 p-4 rounded-xl border border-[#E5E5DF] dark:border-white/10 bg-white dark:bg-neutral-900 shadow-2xs hover:border-cobalt/40 transition-colors"
          >
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50 text-cobalt dark:bg-blue-950/50 mt-0.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-cobalt" />
            </div>
            <span className="text-xs md:text-sm text-carbon dark:text-neutral-200 font-medium leading-relaxed">
              {feature}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
