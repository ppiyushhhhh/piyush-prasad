import { CheckCircle2 } from "lucide-react";
import type { PortfolioProject } from "@/lib/portfolio-projects";
import { CaseStudySectionHeader } from "./CaseStudySectionHeader";

interface ProjectKeyFeaturesProps {
  project: PortfolioProject;
}

export function ProjectKeyFeatures({ project }: ProjectKeyFeaturesProps) {
  if (!project.key_features || project.key_features.length === 0) return null;

  const count = project.key_features.length;
  const isOdd = count % 2 !== 0;

  return (
    <section id="features" className="space-y-4 scroll-mt-24">
      <CaseStudySectionHeader
        label="03 / CAPABILITIES"
        title="Key Engineering Features"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
        {project.key_features.map((feature, idx) => {
          const isLastAndOdd = isOdd && idx === count - 1;
          return (
            <div
              key={idx}
              className={`flex items-start gap-3.5 p-5 rounded-xl border border-[#E5E5DF] dark:border-white/10 bg-white dark:bg-neutral-900 shadow-2xs hover:border-cobalt/40 transition-colors h-full ${isLastAndOdd ? "md:col-span-2" : ""
                }`}
            >
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50 text-cobalt dark:bg-blue-950/50 mt-0.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-cobalt" />
              </div>
              <span className="text-xs md:text-sm text-carbon dark:text-neutral-200 font-medium leading-relaxed">
                {feature}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
