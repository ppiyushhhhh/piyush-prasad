import { motion, useReducedMotion } from "framer-motion";
import { SectionHeader } from "./SectionHeader";
import { ArrowUpRight, Building2, Briefcase, Calendar, CheckCircle2 } from "lucide-react";
import runtimeLogo from "@/assets/runtime-logo.png";
const credenceLogo = { url: "/credence-logo.webp" };

interface Position {
  role: string;
  type: string;
  period: string;
  isCurrent?: boolean;
  bullets: string[];
}

interface CompanyExperience {
  company: string;
  logo?: any;
  url: string;
  period: string;
  positions: Position[];
}

export const EXPERIENCE_DATA: CompanyExperience[] = [
  {
    company: "Runtime Solutions",
    logo: runtimeLogo,
    url: "https://www.runtimesolutions.in/",
    period: "Dec 2024 — Present",
    positions: [
      {
        role: "Junior Cloud Engineer",
        type: "Full-Time",
        period: "Sep 2026 — PRESENT",
        isCurrent: true,
        bullets: [
          "Administer Google Workspace for organizational users, including creating and deleting user accounts, configuring email, and managing groups, aliases, and access permissions.",
          "Manage domain registration, DNS, and hosting infrastructure across JaguarPC, ResellerClub, Tasjeel, and SiteGround platforms for client accounts, including client Cosmos, plus domain renewals for client Runwal.",
          "Run Windows patching cycles end to end: apply patches, verify system status, and produce infrastructure and patching reports.",
        ],
      },
      {
        role: "IT Support & Service Management",
        type: "Full-Time",
        period: "JUL 2025 — AUG 2026",
        bullets: [
          "Managed end-to-end ITSM ticket lifecycle including incidents, service requests, and escalations across multiple locations using ManageEngine ServiceDesk Plus.",
          "Maintained SLA compliance by prioritizing critical issues, minimizing downtime, and ensuring timely resolution.",
          "Administered IT asset lifecycle for laptops, desktops, access points, and biometric devices with accurate tracking and documentation.",
          "Coordinated with internal teams and external vendors to resolve hardware, network, and system issues within defined SLAs.",
          "Supported daily IT operations including ticket logging, categorization, escalation handling, and documentation.",
        ],
      },
      {
        role: "I.T Office Assistant - Intern",
        type: "Internship",
        period: "Dec 2024 — Jun 2025",
        bullets: [
          "Assisted the IT support desk with first-level troubleshooting of desktops, laptops, printers, and peripherals across office locations.",
          "Logged, categorized, and tracked support tickets in ManageEngine ServiceDesk Plus, escalating complex issues to senior engineers.",
          "Supported user onboarding including system setup, account provisioning, software installation, and access configuration.",
          "Helped maintain IT asset inventory and documentation, keeping hardware records and warranty details up to date.",
          "Performed routine checks on network connectivity, access points, and biometric devices to keep daily operations running smoothly.",
        ],
      },
    ],
  },
  {
    company: "Credence Infotech",
    logo: credenceLogo,
    url: "https://credenceinfotech.com/",
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
    <section id="experience" className="relative border-b border-border bg-[#FAF9F6] py-20 md:py-28">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <SectionHeader
          n="03"
          label="EXPERIENCE"
          title="My Journey"
          description="A chronological record of hands-on infrastructure administration, ITSM operations, and evolution into production Cloud & DevOps engineering."
        />

        {/* Editorial Vertical Timeline */}
        <div className="space-y-16">
          {EXPERIENCE_DATA.map((companyExp, companyIndex) => (
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
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-border bg-white p-1.5 shadow-2xs">
                      <img
                        src={companyExp.logo?.url ?? companyExp.logo}
                        alt={companyExp.company}
                        className="h-full w-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-border bg-[#FAF9F6] text-cobalt font-mono font-bold">
                      {companyExp.company.slice(0, 2).toUpperCase()}
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl sm:text-2xl font-bold text-carbon">
                        {companyExp.company}
                      </h3>
                      <a
                        href={companyExp.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-carbon/40 hover:text-cobalt transition-colors"
                        title={`Visit ${companyExp.company}`}
                      >
                        <ArrowUpRight className="h-4 w-4" />
                      </a>
                    </div>
                    <span className="mono text-[11px] text-muted-foreground">
                      {companyExp.period}
                    </span>
                  </div>
                </div>

                <div className="mono text-[11px] text-cobalt font-medium">
                  {companyExp.positions.length}{" "}
                  {companyExp.positions.length === 1 ? "ROLE" : "PROGRESSIVE ROLES"}
                </div>
              </div>

              {/* Roles Timeline within this company */}
              <div className="relative mt-8 ml-2 sm:ml-4 border-l-2 border-border pl-6 sm:pl-8 space-y-12">
                {companyExp.positions.map((pos, posIndex) => (
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
                      <h4 className="text-lg sm:text-xl font-bold text-carbon">
                        {pos.role}
                      </h4>

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

                    <div className="mono mt-1 text-[11px] text-muted-foreground font-medium">
                      {pos.period}
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
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
