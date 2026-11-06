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
 * Formats a duration in months into a concise, professional LinkedIn-style string
 * Examples: '1 yr 11 mos', '1 yr 9 mos', '2 yrs 8 mos', '3 yrs', '8 mos', '1 mo'
 */
function formatLinkedInDuration(totalMonths: number): string {
  if (totalMonths <= 0) return "0 mos";
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  const parts: string[] = [];
  if (years > 0) {
    parts.push(years === 1 ? "1 yr" : `${years} yrs`);
  }
  if (months > 0) {
    parts.push(months === 1 ? "1 mo" : `${months} mos`);
  }
  return parts.join(" ");
}

/**
 * Calculates a dynamic, human-readable LinkedIn duration between a start date and an end date.
 * If endDate is omitted or set to 'PRESENT', uses the current system date dynamically.
 * When inclusive = true, both start and end months are included (standard LinkedIn convention).
 */
function calculateExperienceDuration(
  start?: DatePoint,
  end?: DatePoint | "PRESENT",
  inclusive = true,
): string | null {
  if (!start || !start.year || !start.month) return null;
  const now = new Date();
  const endYear = !end || end === "PRESENT" ? now.getFullYear() : end.year;
  const endMonth = !end || end === "PRESENT" ? now.getMonth() + 1 : end.month;

  let totalMonths = (endYear - start.year) * 12 + (endMonth - start.month);
  if (inclusive) {
    totalMonths += 1;
  }
  if (totalMonths < 0) totalMonths = 0;

  return formatLinkedInDuration(totalMonths);
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
  skills?: string[];
}

interface CompanyExperience {
  company: string;
  logo?: string | { url: string };
  url: string;
  location?: string;
  period: string;
  startDate?: DatePoint;
  endDate?: DatePoint | "PRESENT";
  inclusive?: boolean;
  showTotalExperience?: boolean;
  positions: Position[];
}

export const EXPERIENCE_DATA: CompanyExperience[] = [
  {
    company: "Runtime Solutions",
    logo: runtimeLogo,
    url: "https://www.runtime-solutions.com/",
    location: "Andheri West, Maharashtra, India · On-site",
    period: "DEC 2024 — PRESENT",
    startDate: { year: 2024, month: 12 },
    endDate: "PRESENT",
    inclusive: true,
    showTotalExperience: true,
    positions: [
      {
        role: "Junior Cloud Engineer",
        type: "FULL-TIME",
        period: "SEP 2026 — PRESENT",
        startDate: { year: 2026, month: 9 },
        endDate: "PRESENT",
        inclusive: true,
        isCurrent: true,
        bullets: [
          "Administer Google Workspace for the organization: account creation, email configuration, groups, aliases and access permissions.",
          "Own domain registration, DNS records and hosting across five providers (JaguarPC, GoDaddy, ResellerClub, Tasjeel, SiteGround) for multiple client environments, including renewals and ongoing maintenance.",
          "Run Windows patching cycles end to end: apply patches, verify system status, and produce infrastructure and patching reports.",
        ],
        skills: [
          "User Account Management",
          "DNS Management",
          "Google Workspace",
          "Windows Patching",
          "Multi-Provider Hosting",
        ],
      },
      {
        role: "IT Support & Service Management",
        type: "FULL-TIME",
        period: "DEC 2024 — AUG 2026",
        startDate: { year: 2024, month: 12 },
        endDate: { year: 2026, month: 8 },
        inclusive: true,
        bullets: [
          "Manage daily IT service operations across multiple locations, handling ticket tracking, prioritization, and resolution while maintaining proper documentation to ensure timely support delivery and consistent service availability.",
          "Provide day-to-day technical support for hardware, software, network, and system access issues, and maintain IT asset records including device allocation and inventory tracking across teams to improve employee productivity.",
          "Collaborate with internal teams and vendors to resolve technical problems and reduce downtime, contributing to a more reliable and efficient IT environment.",
        ],
        skills: [
          "Service-Level Agreements (SLA)",
          "IT Asset Management (ITAM)",
          "Incident Resolution",
          "Hardware & System Support",
          "Vendor Coordination",
        ],
      },
    ],
  },
  {
    company: "Credence Infotech",
    logo: credenceLogo,
    url: "https://www.credenceinfotech.in/",
    location: "Mumbai, Maharashtra, India · On-site",
    period: "FEB 2022 — OCT 2024",
    startDate: { year: 2022, month: 2 },
    endDate: { year: 2024, month: 10 },
    inclusive: true,
    showTotalExperience: true,
    positions: [
      {
        role: "IT Service Management Consultant",
        type: "FULL-TIME",
        period: "FEB 2022 — OCT 2024",
        startDate: { year: 2022, month: 2 },
        endDate: { year: 2024, month: 10 },
        inclusive: true,
        bullets: [
          "Provided operational support for IT infrastructure, service management, and change management processes.",
          "Acted as a coordination point between technical teams and stakeholders to ensure smooth and efficient service delivery.",
          "Monitored service performance and maintained adherence to defined operational standards and client SLAs.",
          "Contributed to process improvement initiatives to enhance service efficiency and overall customer satisfaction.",
          "Provided operational support and consultation to improve IT service quality and system reliability.",
        ],
        skills: [
          "IT Service Management (ITSM)",
          "ITIL Methodologies",
          "Change Management",
          "SLA Adherence",
          "Service Delivery Coordination",
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
