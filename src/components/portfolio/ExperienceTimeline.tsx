import { motion, useReducedMotion } from "framer-motion";
import { SectionHeader } from "./SectionHeader";
import { ArrowUpRight } from "lucide-react";
import { EXPERIENCE_DATA, calculateExperienceDuration } from "@/data/portfolio-data";

export function ExperienceTimeline() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      id="experience"
      className="relative border-b border-border bg-[#FAF9F6] py-20 md:py-28"
    >
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <SectionHeader
          n="02"
          label="EXPERIENCE"
          title="My Journey"
          description="A chronological record of hands-on infrastructure administration, ITSM operations, and evolution into production Cloud & DevOps engineering."
        />

        {/* Editorial Vertical Timeline */}
        <div className="space-y-16">
          {EXPERIENCE_DATA.map((companyExp, companyIndex) => {
            const totalExp = companyExp.showTotalExperience
              ? calculateExperienceDuration(
                  companyExp.startDate,
                  companyExp.endDate,
                  companyExp.inclusive ?? true,
                )
              : null;

            return (
              <motion.div
                key={companyExp.company}
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.45, delay: companyIndex * 0.15 }}
                className="border border-border bg-white p-6 sm:p-8 md:p-10 shadow-2xs transition-all duration-300 hover:border-carbon/30 hover:shadow-xs"
              >
                {/* Company Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
                  <div className="flex items-start sm:items-center gap-4">
                    {companyExp.logo ? (
                      <a
                        href={companyExp.url}
                        target="_blank"
                        rel="noreferrer"
                        title={`Visit ${companyExp.company}`}
                        aria-label={`Visit ${companyExp.company} website`}
                        className="group/logo relative flex h-14 w-14 shrink-0 items-center justify-center border border-border bg-white p-2 shadow-2xs transition-all duration-300 hover:border-cobalt hover:shadow-md hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt cursor-pointer"
                      >
                        <img
                          src={
                            typeof companyExp.logo === "string"
                              ? companyExp.logo
                              : companyExp.logo?.url
                          }
                          alt={companyExp.company}
                          className="h-full w-full object-contain transition-transform duration-300 group-hover/logo:scale-110"
                        />
                      </a>
                    ) : (
                      <a
                        href={companyExp.url}
                        target="_blank"
                        rel="noreferrer"
                        title={`Visit ${companyExp.company}`}
                        aria-label={`Visit ${companyExp.company} website`}
                        className="group/logo flex h-14 w-14 shrink-0 items-center justify-center border border-border bg-[#FAF9F6] text-cobalt font-mono font-bold transition-all duration-300 hover:border-cobalt hover:bg-white hover:shadow-md hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt cursor-pointer"
                      >
                        <span className="text-sm transition-transform duration-300 group-hover/logo:scale-110">
                          {companyExp.company.slice(0, 2).toUpperCase()}
                        </span>
                      </a>
                    )}

                    <div>
                      <div className="flex flex-wrap items-center gap-2.5">
                        <a
                          href={companyExp.url}
                          target="_blank"
                          rel="noreferrer"
                          className="group/name inline-flex items-center gap-1.5 text-carbon hover:text-cobalt transition-colors"
                          title={`Visit ${companyExp.company}`}
                        >
                          <h3 className="text-xl sm:text-2xl font-bold transition-colors">
                            {companyExp.company}
                          </h3>
                          <ArrowUpRight className="h-4 w-4 opacity-40 transition-all duration-200 group-hover/name:opacity-100 group-hover/name:translate-x-0.5 group-hover/name:-translate-y-0.5 text-cobalt" />
                        </a>

                        {/* Prominent LinkedIn-style company tenure badge next to company name */}
                        {totalExp && (
                          <span className="mono inline-flex items-center border border-cobalt/30 bg-cobalt/10 px-2 py-0.5 text-[11px] font-bold text-cobalt">
                            {totalExp}
                          </span>
                        )}
                      </div>

                      <div className="mono text-[11px] text-muted-foreground font-medium mt-1 flex flex-wrap items-center gap-2">
                        <span>{companyExp.period}</span>
                        {companyExp.location && (
                          <>
                            <span className="text-border select-none">•</span>
                            <span>{companyExp.location}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Role Count on the right */}
                  <div className="mono text-[11px] text-muted-foreground uppercase font-semibold shrink-0 sm:text-right">
                    <span className="text-cobalt font-bold">{companyExp.positions.length}</span>{" "}
                    {companyExp.positions.length === 1 ? "ROLE" : "PROGRESSIVE ROLES"}
                  </div>
                </div>

                {/* Roles Timeline within this company */}
                <div className="relative mt-8 ml-2 sm:ml-4 border-l-2 border-border pl-6 sm:pl-8 space-y-12">
                  {companyExp.positions.map((pos) => {
                    const roleDuration = calculateExperienceDuration(
                      pos.startDate,
                      pos.endDate,
                      pos.inclusive ?? true,
                    );

                    return (
                      <div key={pos.role} className="relative group/role">
                        {/* Timeline Node Bullet */}
                        <div
                          className={`absolute -left-[31px] sm:-left-[39px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-white ring-2 transition-all duration-200 ${
                            pos.isCurrent
                              ? "ring-cobalt shadow-xs"
                              : "ring-border group-hover/role:ring-carbon/40"
                          }`}
                        >
                          <div
                            className={`h-2 w-2 rounded-full transition-transform duration-200 ${
                              pos.isCurrent
                                ? "bg-cobalt animate-pulse"
                                : "bg-carbon/40 group-hover/role:scale-125"
                            }`}
                          />
                        </div>

                        {/* Role Header */}
                        <div className="flex flex-wrap items-center gap-2.5">
                          <h4 className="text-lg sm:text-xl font-bold text-carbon">{pos.role}</h4>

                          <span className="mono border border-border bg-[#FAF9F6] px-2.5 py-0.5 text-[10px] text-carbon/80 font-semibold uppercase">
                            {pos.type}
                          </span>

                          {pos.isCurrent && (
                            <span className="mono inline-flex items-center gap-1.5 border border-cobalt/30 bg-cobalt/10 px-2 py-0.5 text-[9px] font-bold text-cobalt">
                              <span className="h-1.5 w-1.5 rounded-full bg-cobalt" />
                              CURRENT
                            </span>
                          )}
                        </div>

                        {/* Role Dates & Role-level Duration */}
                        <div className="flex flex-wrap items-center gap-2 mt-1.5">
                          <span className="mono text-[11px] text-muted-foreground font-medium">
                            {pos.period}
                          </span>
                          {roleDuration && (
                            <>
                              <span className="text-border select-none">•</span>
                              <span className="mono border border-border bg-[#FAF9F6] px-2 py-0.5 text-[10px] font-semibold text-carbon/85">
                                {roleDuration}
                              </span>
                            </>
                          )}
                        </div>

                        {/* Bullets */}
                        <ul className="mt-4 space-y-3">
                          {pos.bullets.map((bullet, bIndex) => (
                            <li
                              key={bIndex}
                              className="flex items-start gap-3 text-sm sm:text-base leading-relaxed text-carbon/85"
                            >
                              <span className="mono mt-1 text-cobalt text-xs font-bold select-none shrink-0">
                                →
                              </span>
                              <span>{bullet}</span>
                            </li>
                          ))}
                        </ul>

                        {/* Skills */}
                        {pos.skills && pos.skills.length > 0 && (
                          <div className="mt-4 flex flex-wrap items-center gap-1.5 pt-1">
                            <span className="mono text-[10px] uppercase font-bold text-muted-foreground mr-1">
                              Skills:
                            </span>
                            {pos.skills.map((skill) => (
                              <span
                                key={skill}
                                className="mono border border-border bg-[#FAF9F6] px-2 py-0.5 text-[10px] font-semibold text-carbon/80"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
