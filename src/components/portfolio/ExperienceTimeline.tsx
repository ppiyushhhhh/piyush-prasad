import { motion, useReducedMotion } from "framer-motion";
import { SectionHeader } from "./SectionHeader";
import { ArrowUpRight } from "lucide-react";
import runtimeLogo from "@/assets/runtime-logo.png";
const credenceLogo = { url: "/credence-logo.webp" };

interface DatePoint {
  year: number;
  month: number; // 1-12
}

/**
 * Calculates a human-readable duration between a start date and an end date.
 * If endDate is omitted or set to 'PRESENT', uses the current system date dynamically.
 * For fixed intervals (e.g. DEC 2025 — AUG 2026), inclusive = true counts both boundary months.
 */
function calculateExperienceDuration(
  start: DatePoint,
  end?: DatePoint | "PRESENT",
  inclusive = false,
): string {
  const now = new Date();
  const endYear = !end || end === "PRESENT" ? now.getFullYear() : end.year;
  const endMonth = !end || end === "PRESENT" ? now.getMonth() + 1 : end.month;

  let totalMonths = (endYear - start.year) * 12 + (endMonth - start.month);
  if (inclusive) {
    totalMonths += 1;
  }
  if (totalMonths < 0) totalMonths = 0;

  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  const parts: string[] = [];
  if (years > 0) {
    parts.push(`${years} ${years === 1 ? "YEAR" : "YEARS"}`);
  }
  if (months > 0 || years === 0) {
    parts.push(`${months} ${months === 1 ? "MONTH" : "MONTHS"}`);
  }

  return parts.join(" ");
}

interface Position {
  role: string;
  type: string;
  period: string;
  startDate?: DatePoint;
  endDate?: DatePoint | "PRESENT";
  inclusive?: boolean;
  isCurrent?: boolean;
  bullets: string[];
}

interface CompanyExperience {
  company: string;
  logo?: string | { url: string };
  url: string;
  period: string;
  startDate?: DatePoint;
  endDate?: DatePoint | "PRESENT";
  showTotalExperience?: boolean;
  positions: Position[];
}

export const EXPERIENCE_DATA: CompanyExperience[] = [
  {
    company: "Runtime Solutions",
    logo: runtimeLogo,
    url: "https://www.runtime-solutions.com/",
    period: "DEC 2024 — PRESENT",
    startDate: { year: 2024, month: 12 },
    endDate: "PRESENT",
    showTotalExperience: true,
    positions: [
      {
        role: "IT Support & Service Management",
        type: "FULL-TIME",
        period: "DEC 2025 — AUG 2026",
        startDate: { year: 2025, month: 12 },
        endDate: { year: 2026, month: 8 },
        inclusive: true,
        bullets: [
          "Managed end-to-end ITSM ticket lifecycle including incidents, service requests, and escalations across multiple locations using ManageEngine ServiceDesk Plus.",
          "Maintained SLA compliance by prioritizing critical issues, minimizing downtime, and ensuring timely resolution.",
          "Administered IT asset lifecycle for laptops, desktops, access points, and biometric devices with accurate tracking and documentation.",
          "Coordinated with internal teams and external vendors to resolve hardware, network, and system issues within defined SLAs.",
          "Supported daily IT operations including ticket logging, categorization, escalation handling, and documentation.",
        ],
      },
    ],
  },
  {
    company: "Credence Infotech",
    logo: credenceLogo,
    url: "https://www.credenceinfotech.in/",
    period: "Feb 2022 — Oct 2024",
    positions: [
      {
        role: "IT Service Management Consultant",
        type: "Full-Time",
        period: "Feb 2022 — Oct 2024",
        bullets: [
          "Provided operational support for IT infrastructure, service management, and change management processes.",
          "Acted as a coordination point between technical teams and stakeholders to ensure smooth and efficient service delivery.",
          "Monitored service performance and maintained adherence to defined operational standards and client SLAs.",
          "Contributed to process improvement initiatives to enhance service efficiency and overall customer satisfaction.",
          "Provided operational support and consultation to improve IT service quality and system reliability.",
        ],
      },
    ],
  },
];

export function ExperienceTimeline() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      id="experience"
      className="relative border-b border-border bg-[#FAF9F6] py-20 md:py-28"
    >
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <SectionHeader
          n="03"
          label="EXPERIENCE"
          title="My Journey"
          description="A chronological record of hands-on infrastructure administration, ITSM operations, and evolution into production Cloud & DevOps engineering."
        />

        {/* Editorial Vertical Timeline */}
        <div className="space-y-16">
          {EXPERIENCE_DATA.map((companyExp, companyIndex) => {
            const totalExp =
              companyExp.showTotalExperience && companyExp.startDate
                ? calculateExperienceDuration(companyExp.startDate, companyExp.endDate)
                : null;

            return (
              <motion.div
                key={companyExp.company}
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.45, delay: companyIndex * 0.15 }}
                className="border border-border bg-white p-6 sm:p-8 md:p-10 shadow-2xs"
              >
                {/* Company Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
                  <div className="flex items-center gap-4">
                    {companyExp.logo ? (
                      <a
                        href={companyExp.url}
                        target="_blank"
                        rel="noreferrer"
                        title={`Visit ${companyExp.company}`}
                        aria-label={`Visit ${companyExp.company} website`}
                        className="group/logo relative flex h-12 w-12 shrink-0 items-center justify-center border border-border bg-white p-1.5 shadow-2xs transition-all duration-300 hover:border-cobalt hover:shadow-md hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt cursor-pointer"
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
                        className="group/logo flex h-12 w-12 shrink-0 items-center justify-center border border-border bg-[#FAF9F6] text-cobalt font-mono font-bold transition-all duration-300 hover:border-cobalt hover:bg-white hover:shadow-md hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt cursor-pointer"
                      >
                        <span className="transition-transform duration-300 group-hover/logo:scale-110">
                          {companyExp.company.slice(0, 2).toUpperCase()}
                        </span>
                      </a>
                    )}

                    <div>
                      <div className="flex items-center gap-2">
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
                      </div>
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-1">
                        <span className="mono text-[11px] text-muted-foreground">
                          {companyExp.period}
                        </span>
                        {totalExp && (
                          <>
                            <span className="text-border select-none">•</span>
                            <div className="inline-flex items-center gap-1.5 border border-border bg-[#FAF9F6] px-2 py-0.5 shadow-2xs">
                              <span className="mono text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">
                                TOTAL EXPERIENCE
                              </span>
                              <span className="mono text-[10px] font-bold text-cobalt">
                                {totalExp}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mono text-[11px] text-cobalt font-medium">
                    {companyExp.positions.length}{" "}
                    {companyExp.positions.length === 1 ? "ROLE" : "PROGRESSIVE ROLES"}
                  </div>
                </div>

                {/* Roles Timeline within this company */}
                <div className="relative mt-8 ml-2 sm:ml-4 border-l-2 border-border pl-6 sm:pl-8 space-y-12">
                  {companyExp.positions.map((pos) => {
                    const roleDuration = pos.startDate
                      ? calculateExperienceDuration(pos.startDate, pos.endDate, pos.inclusive)
                      : null;

                    return (
                      <div key={pos.role} className="relative">
                        {/* Timeline Node Bullet */}
                        <div
                          className={`absolute -left-[31px] sm:-left-[39px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-white ring-2 ${
                            pos.isCurrent ? "ring-cobalt" : "ring-border"
                          }`}
                        >
                          <div
                            className={`h-2 w-2 rounded-full ${
                              pos.isCurrent ? "bg-cobalt animate-pulse" : "bg-carbon/40"
                            }`}
                          />
                        </div>

                        {/* Role Header */}
                        <div className="flex flex-wrap items-center gap-2.5">
                          <h4 className="text-lg sm:text-xl font-bold text-carbon">{pos.role}</h4>

                          <span className="mono border border-border bg-[#FAF9F6] px-2.5 py-0.5 text-[10px] text-carbon/80 font-semibold">
                            {pos.type}
                          </span>

                          {pos.isCurrent && (
                            <span className="mono inline-flex items-center gap-1 border border-cobalt/30 bg-cobalt/10 px-2 py-0.5 text-[9px] font-bold text-cobalt">
                              <span className="h-1.5 w-1.5 rounded-full bg-cobalt" />
                              CURRENT
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className="mono text-[11px] text-muted-foreground font-medium">
                            {pos.period}
                          </span>
                          {roleDuration && (
                            <>
                              <span className="text-border select-none">•</span>
                              <span className="mono border border-border bg-[#FAF9F6] px-2 py-0.5 text-[10px] font-bold text-carbon/85">
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
