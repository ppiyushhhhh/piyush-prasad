import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { SectionHeader } from "./SectionHeader";
import { ArrowUpRight, Award, GraduationCap, ExternalLink } from "lucide-react";

import packtLogo from "@/assets/packt-logo.jpg";
import googleLogo from "@/assets/google-logo.jpg";
import mibLogo from "@/assets/mib-logo.svg";
import canonicalLogo from "@/assets/canonical-logo.jpg";
import dockerLogo from "@/assets/docker-logo.jpg";
import githubLogo from "@/assets/github-logo.jpg";
import awsLogo from "@/assets/aws-logo.jpg";
import jkCollegeLogo from "@/assets/jk-college-logo.png";
import allenSwamiLogo from "@/assets/allen-swami-logo.jpg";
import tilakGlobalLogo from "@/assets/tilak-global-logo.png";

export interface CertItem {
  name: string;
  issuer: string;
  url?: string;
  logo?: string;
}

export const CERTS_DATA: CertItem[] = [
  {
    name: "Foundation Course on AI Readiness — Google & YouTube",
    issuer: "Ministry of Information and Broadcasting",
    logo: mibLogo,
    url: "/certificates/ai-readiness.pdf",
  },
  {
    name: "DevOps Complete Course Specialization",
    issuer: "Packt (Coursera)",
    url: "https://www.coursera.org/account/accomplishments/specialization/592LMXYN7KZK",
    logo: packtLogo,
  },
  {
    name: "Google AI Essentials Specialization",
    issuer: "Google (Coursera)",
    logo: googleLogo,
    url: "https://www.coursera.org/account/accomplishments/specialization/EZS8GLRIG535",
  },
  {
    name: "Ubuntu Linux Professional Certificate",
    issuer: "Canonical",
    logo: canonicalLogo,
    url: "https://www.linkedin.com/learning/certificates/9d7f2b805f126a9612c6b1be485f14f90d4362bb9f0c6875bcb7702bc1274dbf",
  },
  {
    name: "Docker Foundations Professional Certificate",
    issuer: "Docker, Inc",
    logo: dockerLogo,
    url: "https://www.linkedin.com/learning/certificates/3f8f006fe458d2f993ddba0bd0f3c357f3caf92a5e15bad0718a01e1709241e0",
  },
  {
    name: "Career Essentials in GitHub Professional Certificate",
    issuer: "GitHub",
    logo: githubLogo,
    url: "https://www.linkedin.com/learning/certificates/9a7cce8c73b57d5e8629e5ac94a454a78c5fda6957c901ca4854a7c93e13a3e7",
  },
  {
    name: "AWS Knowledge: Cloud Essentials — Training Badge",
    issuer: "Amazon Web Services",
    logo: awsLogo,
    url: "https://www.credly.com/badges/1d7245e6-ebba-4b7b-970f-ad1d214a1c91/linked_in_profile",
  },
  {
    name: "DNS",
    issuer: "Packt",
    logo: packtLogo,
    url: "https://www.coursera.org/account/accomplishments/verify/JJJLW2JGJZBS",
  },
];

export const EDUCATION_DATA = [
  {
    period: "Jan 2022 — Mar 2025",
    degree: "Bachelor of Commerce (B.Com)",
    school: "Tilak Education Society's J.K. College of Science & Commerce",
    extra: "University of Mumbai",
    logo: jkCollegeLogo,
  },
  {
    period: "Aug 2019 — Jun 2021",
    degree: "Higher Secondary (Commerce)",
    school: "Allen Swami Vivekanand Junior College",
    extra: "MSSBHS",
    logo: allenSwamiLogo,
  },
  {
    period: "Jun 2008 — Mar 2019",
    degree: "Secondary School",
    school: "Tilak Education Society's Tilak Global School",
    extra: "MSSBHS",
    logo: tilakGlobalLogo,
  },
];

export function Certifications() {
  const [showAllCerts, setShowAllCerts] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const displayedCerts = showAllCerts ? CERTS_DATA : CERTS_DATA.slice(0, 5);

  return (
    <section id="certifications" className="relative border-b border-border bg-[#FAF9F6] py-20 md:py-28">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <SectionHeader
          n="04"
          label="CREDENTIALS & EDUCATION"
          title="Certifications & Education"
          description="Verified professional certifications in cloud architecture, containerization, Linux systems, and foundational academic background."
        />

        {/* 2-Column Editorial Grid on Desktop */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-14">
          {/* Column 1: Certifications */}
          <div className="lg:col-span-7">
            <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-cobalt" />
                <h3 className="mono text-xs font-bold tracking-wider text-carbon uppercase">
                  Professional Certifications
                </h3>
              </div>
              <span className="mono text-[10px] text-muted-foreground">
                {CERTS_DATA.length} CREDENTIALS
              </span>
            </div>

            <div className="divide-y divide-border border-b border-border bg-white">
              {displayedCerts.map((cert) => (
                <div
                  key={cert.name}
                  className="group flex items-start gap-4 p-4 sm:p-5 transition-colors hover:bg-[#FAF9F6]"
                >
                  {/* Issuer Logo or Monogram */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-border bg-white p-1 shadow-2xs">
                    {cert.logo ? (
                      <img
                        src={cert.logo}
                        alt={cert.issuer}
                        className={`h-full w-full ${
                          cert.logo === mibLogo ? "object-contain p-0.5" : "object-cover"
                        }`}
                      />
                    ) : (
                      <span className="mono text-cobalt font-bold text-[10px]">
                        {cert.issuer.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* Certification Info */}
                  <div className="min-w-0 flex-1">
                    {cert.url ? (
                      <a
                        href={cert.url}
                        target="_blank"
                        rel="noreferrer"
                        className="group/link inline-flex items-center gap-1.5 text-sm sm:text-base font-semibold text-carbon hover:text-cobalt transition-colors"
                      >
                        <span className="leading-snug">{cert.name}</span>
                        <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-carbon/40 group-hover/link:text-cobalt transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                      </a>
                    ) : (
                      <div className="text-sm sm:text-base font-semibold text-carbon leading-snug">
                        {cert.name}
                      </div>
                    )}
                    <div className="mono mt-1 text-[11px] text-cobalt font-medium">
                      {cert.issuer}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {CERTS_DATA.length > 5 && (
              <button
                type="button"
                onClick={() => setShowAllCerts(!showAllCerts)}
                aria-expanded={showAllCerts}
                className="mono mt-5 inline-flex items-center gap-2 border border-border bg-white px-4 py-2.5 text-[11px] font-semibold text-cobalt transition-all hover:border-cobalt hover:bg-[#FAF9F6]"
              >
                <span>
                  {showAllCerts
                    ? "SHOW FEWER CREDENTIALS"
                    : `VIEW ALL (${CERTS_DATA.length}) CREDENTIALS`}
                </span>
                <span className="text-carbon/40">{showAllCerts ? "↑" : "↓"}</span>
              </button>
            )}
          </div>

          {/* Column 2: Education */}
          <div className="lg:col-span-5">
            <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-cobalt" />
                <h3 className="mono text-xs font-bold tracking-wider text-carbon uppercase">
                  Education History
                </h3>
              </div>
              <span className="mono text-[10px] text-muted-foreground">
                3 MILESTONES
              </span>
            </div>

            <div className="space-y-4">
              {EDUCATION_DATA.map((edu) => (
                <div
                  key={edu.degree}
                  className="border border-border bg-white p-5 sm:p-6 transition-all hover:border-cobalt/60 hover:shadow-2xs"
                >
                  <div className="mono text-[10px] font-bold text-cobalt mb-2">
                    {edu.period}
                  </div>

                  <div className="flex items-start gap-3.5">
                    {edu.logo && (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-border bg-white p-1 shadow-2xs">
                        <img
                          src={edu.logo}
                          alt={edu.school}
                          className="h-full w-full object-contain"
                        />
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="text-base font-bold text-carbon">
                        {edu.degree}
                      </div>
                      <div className="mt-1 text-sm text-carbon/80 leading-snug">
                        {edu.school}
                      </div>
                      <div className="mono mt-2 text-[10px] text-muted-foreground uppercase">
                        {edu.extra}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
