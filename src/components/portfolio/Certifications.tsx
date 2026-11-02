import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { SectionHeader } from "./SectionHeader";
import {
  ArrowUpRight,
  Award,
  GraduationCap,
  ExternalLink,
  Calendar,
  CheckCircle2,
  ShieldCheck,
  Tag,
} from "lucide-react";
import { fetchPublishedBadges, type CredlyBadge } from "@/lib/credly-badges";

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

function PortfolioBadgeArtwork({ src, alt }: { src?: string; alt: string }) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div className="relative flex h-20 w-20 sm:h-22 sm:w-22 shrink-0 items-center justify-center border border-border bg-[#FAF9F6] p-2 shadow-2xs">
        <Award className="h-8 w-8 text-cobalt/60" />
      </div>
    );
  }

  return (
    <div className="relative flex h-20 w-20 sm:h-22 sm:w-22 shrink-0 items-center justify-center border border-border bg-white p-2.5 shadow-2xs transition-all duration-300 group-hover:scale-105 group-hover:border-cobalt">
      <img
        src={src}
        alt={alt}
        className="max-h-full max-w-full object-contain drop-shadow-xs transition-transform duration-300"
        loading="lazy"
        onError={() => setHasError(true)}
      />
    </div>
  );
}

export function Certifications() {
  const [showAllCerts, setShowAllCerts] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const { data: credlyBadges = [] } = useQuery({
    queryKey: ["public-credly-badges"],
    queryFn: fetchPublishedBadges,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });

  const displayedCerts = showAllCerts ? CERTS_DATA : CERTS_DATA.slice(0, 5);

  return (
    <section
      id="certifications"
      className="relative border-b border-border bg-[#FAF9F6] py-20 md:py-28"
    >
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
                  {/* Issuer Logo or Monogram with dynamic hover micro-interaction */}
                  <div className="relative flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center overflow-hidden border border-border bg-white p-1 shadow-2xs transition-all duration-300 ease-out hover:scale-110 hover:-translate-y-0.5 hover:border-cobalt hover:shadow-md hover:ring-2 hover:ring-cobalt/20 group-hover:border-cobalt/70 cursor-pointer">
                    {cert.logo ? (
                      <img
                        src={cert.logo}
                        alt={cert.issuer}
                        className={`h-full w-full transition-transform duration-300 ease-out group-hover:scale-105 hover:scale-115 ${
                          cert.logo === mibLogo ? "object-contain p-0.5" : "object-cover"
                        }`}
                      />
                    ) : (
                      <span className="mono text-cobalt font-bold text-[10px] transition-transform duration-300 group-hover:scale-110">
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
              <span className="mono text-[10px] text-muted-foreground">3 MILESTONES</span>
            </div>

            <div className="space-y-4">
              {EDUCATION_DATA.map((edu) => (
                <div
                  key={edu.degree}
                  className="group border border-border bg-white p-5 sm:p-6 transition-all hover:border-cobalt/60 hover:shadow-2xs"
                >
                  <div className="mono text-[10px] font-bold text-cobalt mb-2">{edu.period}</div>

                  <div className="flex items-start gap-3.5">
                    {edu.logo && (
                      <div className="relative flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center overflow-hidden border border-border bg-white p-1 shadow-2xs transition-all duration-300 ease-out hover:scale-110 hover:-translate-y-0.5 hover:border-cobalt hover:shadow-md hover:ring-2 hover:ring-cobalt/20 group-hover:border-cobalt/70 cursor-pointer">
                        <img
                          src={edu.logo}
                          alt={edu.school}
                          className="h-full w-full object-contain transition-transform duration-300 ease-out group-hover:scale-105 hover:scale-115"
                        />
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="text-base font-bold text-carbon">{edu.degree}</div>
                      <div className="mt-1 text-sm text-carbon/80 leading-snug">{edu.school}</div>
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

        {/* Credly Digital Badges Section */}
        {credlyBadges.length > 0 && (
          <div className="mt-16 md:mt-24 border-t border-border pt-12 md:pt-16">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Award className="h-4 w-4 text-cobalt" />
                  <span className="mono text-[11px] font-bold tracking-wider text-cobalt uppercase">
                    CREDENTIAL VERIFICATION
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-carbon">
                  Credly Digital Badges
                </h3>
                <p className="mt-1.5 text-xs text-muted-foreground max-w-2xl leading-relaxed">
                  Cryptographically verifiable digital credentials earned through Credly, validating
                  skills in cloud architecture, infrastructure automation, and modern systems
                  engineering.
                </p>
              </div>
              <span className="mono text-[10px] text-muted-foreground uppercase shrink-0">
                {credlyBadges.length} {credlyBadges.length === 1 ? "BADGE" : "BADGES"} VERIFIED
              </span>
            </div>

            {/* Badges Responsive Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {credlyBadges.map((badge, index) => (
                <motion.div
                  key={badge.id || badge.name}
                  initial={shouldReduceMotion ? {} : { opacity: 0, y: 12 }}
                  whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: index * 0.08 }}
                  whileHover={shouldReduceMotion ? {} : { y: -4 }}
                  className="group relative flex flex-col justify-between border border-border bg-white p-6 transition-all duration-300 hover:border-cobalt hover:shadow-md"
                >
                  <div>
                    {/* Top row: Badge Artwork & Issuer */}
                    <div className="flex items-start gap-4 mb-5">
                      <PortfolioBadgeArtwork
                        src={badge.badge_image_url}
                        alt={badge.name}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="mono text-[10px] font-semibold text-cobalt uppercase tracking-wide truncate">
                          {badge.issuer}
                        </div>
                        <h4 className="mt-1 text-sm sm:text-base font-bold text-carbon leading-snug group-hover:text-cobalt transition-colors">
                          {badge.name}
                        </h4>
                      </div>
                    </div>

                    {/* Description if present */}
                    {badge.description && (
                      <p className="text-xs text-carbon/75 leading-relaxed line-clamp-3 mb-4">
                        {badge.description}
                      </p>
                    )}

                    {/* Associated Skills */}
                    {badge.skills && badge.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-5">
                        {badge.skills.map((skill) => (
                          <span
                            key={skill}
                            className="mono inline-flex items-center gap-1 border border-border bg-[#FAF9F6] px-2 py-0.5 text-[9px] font-medium text-carbon"
                          >
                            <Tag className="h-2 w-2 text-cobalt/70" />
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Bottom Row: Issue Date & Verify Button */}
                  <div className="flex items-center justify-between border-t border-border pt-4 mt-auto">
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-mono">
                      <Calendar className="h-3 w-3 text-carbon/40" />
                      <span>{badge.issue_date}</span>
                    </div>

                    <a
                      href={badge.credly_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group/link inline-flex items-center gap-1 text-xs font-semibold text-cobalt hover:text-cobalt/80 transition-colors"
                    >
                      <span>Verify Credential</span>
                      <ExternalLink className="h-3 w-3 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
