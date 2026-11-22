import { Award, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { PortfolioProject } from "@/lib/portfolio-projects";
import { ProjectCard } from "@/components/portfolio/ProjectCard";
import { CaseStudySectionHeader } from "./CaseStudySectionHeader";

interface ProjectResultsNextStepsProps {
  project: PortfolioProject;
  prevProject: PortfolioProject | null;
  nextProject: PortfolioProject | null;
  relatedProjects: PortfolioProject[];
}

export function ProjectResultsNextSteps({
  project,
  prevProject,
  nextProject,
  relatedProjects,
}: ProjectResultsNextStepsProps) {
  return (
    <div className="space-y-12 pb-12">
      {/* Challenges & Results */}
      {(project.challenges || project.results) && (
        <section id="results" className="space-y-4 scroll-mt-24">
          <CaseStudySectionHeader
            label="07 / OUTCOMES"
            title="Measurable Results &amp; Impact"
          />

          <div className="space-y-6">
            {project.results && (
              <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/40 dark:border-emerald-900/40 dark:bg-emerald-950/20 p-6 shadow-2xs">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <Award className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="mono text-[10px] font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400 block">
                      Production Outcomes
                    </span>
                    <h3 className="text-base font-bold text-carbon dark:text-white">
                      Measurable Results
                    </h3>
                  </div>
                </div>
                <p className="text-xs md:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-line">
                  {project.results}
                </p>
              </div>
            )}

            {project.challenges && (
              <div id="challenges" className="rounded-xl border border-[#E5E5DF] dark:border-white/10 bg-white dark:bg-neutral-900 p-6 shadow-2xs scroll-mt-24">
                <span className="mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-2">
                  Lessons Learned &amp; Challenges Overcome
                </span>
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {project.challenges}
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Screenshots / Artifacts */}
      {project.screenshots && project.screenshots.length > 0 && (
        <section id="screenshots" className="space-y-4 scroll-mt-24">
          <CaseStudySectionHeader
            label="08 / ARTIFACTS"
            title="Technical Verification &amp; Screenshots"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {project.screenshots.map((url, idx) => (
              <div
                key={idx}
                className="overflow-hidden rounded-xl border border-[#E5E5DF] dark:border-white/10 bg-white dark:bg-neutral-900 shadow-2xs"
              >
                <img
                  src={url}
                  alt={`${project.title} technical artifact ${idx + 1}`}
                  className="w-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Prev / Next Case Study Links */}
      <nav aria-label="Previous and Next Case Studies" className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-8 border-t border-[#E5E5DF] dark:border-white/10">
        {prevProject ? (
          <Link
            to="/projects/$slug"
            params={{ slug: prevProject.slug }}
            className="group flex flex-col p-5 rounded-xl border border-[#E5E5DF] dark:border-white/10 bg-white dark:bg-neutral-900 shadow-2xs hover:border-cobalt transition-colors"
          >
            <span className="mono text-[10px] text-muted-foreground uppercase font-semibold">
              &larr; Previous Case Study
            </span>
            <span className="text-sm font-bold text-carbon dark:text-white group-hover:text-cobalt transition-colors truncate mt-1">
              {prevProject.title}
            </span>
          </Link>
        ) : (
          <div />
        )}

        {nextProject ? (
          <Link
            to="/projects/$slug"
            params={{ slug: nextProject.slug }}
            className="group flex flex-col items-end p-5 rounded-xl border border-[#E5E5DF] dark:border-white/10 bg-white dark:bg-neutral-900 shadow-2xs hover:border-cobalt transition-colors text-right"
          >
            <span className="mono text-[10px] text-muted-foreground uppercase font-semibold">
              Next Case Study &rarr;
            </span>
            <span className="text-sm font-bold text-carbon dark:text-white group-hover:text-cobalt transition-colors truncate mt-1">
              {nextProject.title}
            </span>
          </Link>
        ) : (
          <div />
        )}
      </nav>

      {/* Related Projects Showcase */}
      {relatedProjects.length > 0 && (
        <section id="related" className="space-y-4 pt-4 scroll-mt-24">
          <div className="flex items-center justify-between">
            <CaseStudySectionHeader
              label="RELATED WORK"
              title="More Cloud &amp; DevOps Case Studies"
            />
            <Link
              to="/projects"
              className="mono text-xs font-semibold text-cobalt hover:underline inline-flex items-center gap-1 shrink-0 pt-8"
            >
              <span>All Projects</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedProjects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
