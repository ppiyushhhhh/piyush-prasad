import { useState, useMemo, useRef } from "react";
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
  AlertCircle,
  RefreshCw,
  Building2,
} from "lucide-react";
import { fetchPublishedBadges, type CredlyBadge } from "@/lib/credly-badges";
import { CREDLY_PROFILE } from "@/lib/site";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

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

/**
 * Extracts a 4-digit year from issue_date or falls back to "Other Achievements"
 */
function getBadgeYear(issueDate?: string | null): string {
  if (!issueDate) return "Other Achievements";
  const str = String(issueDate).trim();
  const match = str.match(/^(\d{4})/);
  if (match) {
    const y = parseInt(match[1], 10);
    if (y >= 1990 && y <= 2100) return String(y);
  }
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    const y = parsed.getFullYear();
    if (y >= 1990 && y <= 2100) return String(y);
  }
  return "Other Achievements";
}

/**
 * Formats ISO date string (e.g. "2024-04-15") into human-readable format without timezone offset.
 */
function formatBadgeDate(dateStr?: string | null): string {
  if (!dateStr) return "Date not specified";
  const str = String(dateStr).trim();
  const match = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const y = match[1];
    const m = months[parseInt(match[2], 10) - 1] || match[2];
    const d = parseInt(match[3], 10);
    return `${m} ${d}, ${y}`;
  }
  return str;
}

/**
 * Centered, properly sized badge artwork container with error handling & fallback.
 */
function BadgeArtwork({
  src,
  alt,
  size = "md",
}: {
  src?: string;
  alt: string;
  size?: "sm" | "md" | "lg";
}) {
  const [hasError, setHasError] = useState(false);

  const containerSizes = {
    sm: "h-14 w-14",
    md: "h-20 w-20 sm:h-24 sm:w-24",
    lg: "h-28 w-28 sm:h-36 sm:w-36",
  }[size];

  if (hasError || !src) {
    return (
      <div
        className={`relative flex ${containerSizes} shrink-0 items-center justify-center border border-border bg-[#FAF9F6] p-2.5 shadow-2xs`}
        aria-hidden="true"
      >
        <Award className="h-8 w-8 text-cobalt/60" />
      </div>
    );
  }

  return (
    <div
      className={`relative flex ${containerSizes} shrink-0 items-center justify-center border border-border bg-white p-2.5 shadow-2xs transition-all duration-300 group-hover:scale-105 group-hover:border-cobalt`}
    >
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

  // Selected badge for detail modal interaction
  const [selectedBadge, setSelectedBadge] = useState<CredlyBadge | null>(null);

  const {
    data: credlyBadges = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["public-credly-badges"],
    queryFn: fetchPublishedBadges,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });

  const INITIAL_BADGE_LIMIT = 6;
  const [showAllBadges, setShowAllBadges] = useState(false);
  const credlySectionRef = useRef<HTMLDivElement>(null);

  // 1. Sort all published badges by issue date (newest first), secondary by display_order
  const sortedBadges = useMemo(() => {
    return [...credlyBadges].sort((a, b) => {
      const timeA = a.issue_date ? new Date(a.issue_date).getTime() : 0;
      const timeB = b.issue_date ? new Date(b.issue_date).getTime() : 0;
      const validTimeA = isNaN(timeA) ? 0 : timeA;
      const validTimeB = isNaN(timeB) ? 0 : timeB;
      if (validTimeA !== validTimeB) {
        return validTimeB - validTimeA; // Descending: newest first
      }
      return (a.display_order ?? 0) - (b.display_order ?? 0);
    });
  }, [credlyBadges]);

  // 2. Initial 6 badges across the entire section, or all badges when expanded
  const displayedBadges = useMemo(() => {
    if (showAllBadges) return sortedBadges;
    return sortedBadges.slice(0, INITIAL_BADGE_LIMIT);
  }, [sortedBadges, showAllBadges]);

  const remainingCount = Math.max(0, sortedBadges.length - INITIAL_BADGE_LIMIT);

  // 3. Group displayed badges by year
  const yearGroups = useMemo(() => {
    const map = new Map<string, CredlyBadge[]>();
    for (const badge of displayedBadges) {
      const year = getBadgeYear(badge.issue_date);
      if (!map.has(year)) {
        map.set(year, []);
      }
      map.get(year)!.push(badge);
    }

    const groups = Array.from(map.entries()).map(([year, badges]) => ({
      year,
      badges,
    }));

    // Sort year headings: newest year first (e.g. 2026, 2025, 2024), "Other Achievements" at end
    groups.sort((a, b) => {
      if (a.year === "Other Achievements") return 1;
      if (b.year === "Other Achievements") return -1;
      return Number(b.year) - Number(a.year);
    });

    return groups;
  }, [displayedBadges]);

  function handleToggleBadgesView() {
    if (showAllBadges) {
      setShowAllBadges(false);
      if (credlySectionRef.current) {
        credlySectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else {
      setShowAllBadges(true);
    }
  }

  const displayedCerts = showAllCerts ? CERTS_DATA : CERTS_DATA.slice(0, 5);

  return (
    <section
      id="certifications"
      className="relative border-b border-border bg-[#FAF9F6] py-20 md:py-28 scroll-mt-24"
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
                className="mono mt-5 inline-flex items-center gap-2 border border-border bg-white px-4 py-2.5 text-[11px] font-semibold text-cobalt transition-all hover:border-cobalt hover:bg-[#FAF9F6] cursor-pointer"
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

        {/* ------------------------------------------------------------- */}
        {/* Credly Digital Credentials Section */}
        {/* ------------------------------------------------------------- */}
        <div
          ref={credlySectionRef}
          id="credly-badges"
          className="mt-16 md:mt-24 border-t border-border pt-12 md:pt-16 scroll-mt-24"
        >
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <Award className="h-4 w-4 text-cobalt" />
                <span className="mono text-[11px] font-bold tracking-widest text-cobalt uppercase">
                  CREDLY DIGITAL CREDENTIALS
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-carbon">
                Professional achievements and verified digital certifications.
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
                Cryptographically verifiable digital credentials earned through Credly, validating
                competency in cloud architecture, infrastructure automation, systems engineering,
                and DevSecOps.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <span className="mono border border-border bg-white px-3 py-1.5 text-[11px] font-bold text-carbon uppercase shadow-2xs">
                <span className="text-cobalt font-extrabold">{sortedBadges.length}</span>{" "}
                {sortedBadges.length === 1 ? "CREDENTIAL VERIFIED" : "CREDENTIALS VERIFIED"}
              </span>

              {CREDLY_PROFILE && (
                <a
                  href={CREDLY_PROFILE}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/credly mono inline-flex items-center gap-1.5 border border-cobalt/30 bg-cobalt/5 hover:border-cobalt hover:bg-cobalt/10 px-3 py-1.5 text-[11px] font-bold text-cobalt transition-all shadow-2xs"
                  title="View verified profile on Credly"
                >
                  <span>View Credly Profile</span>
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover/credly:translate-x-0.5 group-hover/credly:-translate-y-0.5" />
                </a>
              )}
            </div>
          </div>

          {/* 1. Loading Skeleton State */}
          {isLoading && sortedBadges.length === 0 && (
            <div className="space-y-12">
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <Skeleton className="h-6 w-32 rounded-none" />
                  <Skeleton className="h-4 w-24 rounded-none" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((idx) => (
                    <div
                      key={idx}
                      className="flex flex-col justify-between border border-border bg-white p-6 sm:p-7 space-y-4"
                    >
                      <div className="flex justify-center mb-2">
                        <Skeleton className="h-24 w-24 rounded-none" />
                      </div>
                      <Skeleton className="h-3 w-28 rounded-none mx-auto sm:mx-0" />
                      <Skeleton className="h-5 w-4/5 rounded-none mx-auto sm:mx-0" />
                      <div className="space-y-2 pt-2">
                        <Skeleton className="h-3 w-full rounded-none" />
                        <Skeleton className="h-3 w-5/6 rounded-none" />
                        <Skeleton className="h-3 w-2/3 rounded-none" />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Skeleton className="h-5 w-16 rounded-none" />
                        <Skeleton className="h-5 w-20 rounded-none" />
                      </div>
                      <div className="flex justify-between items-center border-t border-border pt-4 mt-auto">
                        <Skeleton className="h-3 w-20 rounded-none" />
                        <Skeleton className="h-4 w-24 rounded-none" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 2. Error State with Retry Button */}
          {isError && sortedBadges.length === 0 && (
            <div className="border border-border bg-white p-8 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xs">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-border bg-[#FAF9F6] text-cobalt">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-carbon">Unable to load credentials</h4>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    A temporary network interruption prevented loading digital badges from the
                    registry.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => refetch()}
                className="mono inline-flex items-center gap-2 border border-carbon bg-white px-4 py-2.5 text-xs font-bold text-carbon transition-colors hover:bg-carbon hover:text-white shrink-0 cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Retry Connection</span>
              </button>
            </div>
          )}

          {/* 3. Empty State */}
          {!isLoading && !isError && sortedBadges.length === 0 && (
            <div className="border border-border bg-white p-10 text-center shadow-2xs">
              <div className="mx-auto flex h-14 w-14 items-center justify-center border border-border bg-[#FAF9F6] text-cobalt mb-4">
                <Award className="h-7 w-7" />
              </div>
              <h4 className="text-lg font-bold text-carbon">No Digital Badges Published Yet</h4>
              <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1.5 leading-relaxed">
                Credly digital badges are being synchronized with the portfolio registry and will
                appear here once published.
              </p>
            </div>
          )}

          {/* 4. Year-Wise Grouped Badges Showcase */}
          {sortedBadges.length > 0 && (
            <div className="space-y-14">
              <AnimatePresence mode="sync">
                {yearGroups.map((group) => (
                  <motion.div
                    key={group.year}
                    layout
                    initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={shouldReduceMotion ? undefined : { opacity: 0, y: -12 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="space-y-6"
                  >
                    {/* Year Heading & Badge Count */}
                    <div className="flex items-center justify-between border-b border-border pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="h-2 w-2 bg-cobalt shrink-0" />
                        <h4 className="mono text-base sm:text-lg font-bold tracking-tight text-carbon">
                          {group.year}
                        </h4>
                      </div>
                      <span className="mono text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">
                        {group.badges.length}{" "}
                        {group.badges.length === 1 ? "CREDENTIAL" : "CREDENTIALS"}
                      </span>
                    </div>

                    {/* Responsive Badges Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {group.badges.map((badge, idx) => (
                        <motion.div
                          key={badge.id || `${badge.name}-${idx}`}
                          layout
                          initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={shouldReduceMotion ? undefined : { opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.3, delay: idx * 0.04 }}
                          whileHover={shouldReduceMotion ? {} : { y: -4 }}
                          role="button"
                          tabIndex={0}
                          aria-haspopup="dialog"
                          aria-label={`View credential details for ${badge.name}`}
                          onClick={() => setSelectedBadge(badge)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setSelectedBadge(badge);
                            }
                          }}
                          className="group relative flex flex-col justify-between border border-border bg-white p-6 sm:p-7 transition-all duration-300 hover:border-cobalt hover:shadow-md cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt focus-visible:ring-offset-2 h-full text-left"
                        >
                          <div>
                            {/* Centered Badge Artwork */}
                            <div className="flex justify-center mb-5">
                              <BadgeArtwork
                                src={badge.badge_image_url}
                                alt={badge.name}
                                size="md"
                              />
                            </div>

                            {/* Issuer Typography */}
                            <div className="mono text-center sm:text-left text-[10px] sm:text-[11px] font-semibold text-cobalt uppercase tracking-wider mb-1.5">
                              {badge.issuer}
                            </div>

                            {/* Badge Title (Supports multiple lines) */}
                            <h5 className="text-center sm:text-left text-base sm:text-lg font-bold text-carbon leading-snug group-hover:text-cobalt transition-colors mb-3">
                              {badge.name}
                            </h5>

                            {/* Full Description (Never truncated, wraps naturally) */}
                            {badge.description && badge.description.trim() ? (
                              <p className="text-xs sm:text-[13px] text-carbon/80 leading-relaxed whitespace-pre-line break-words mb-5">
                                {badge.description}
                              </p>
                            ) : (
                              <p className="text-xs italic text-muted-foreground/70 leading-relaxed mb-5">
                                Description not provided.
                              </p>
                            )}

                            {/* Skills Tag Pills */}
                            {badge.skills && badge.skills.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mb-6">
                                {badge.skills.map((skill) => (
                                  <span
                                    key={skill}
                                    className="mono inline-flex items-center gap-1 border border-border bg-[#FAF9F6] px-2 py-0.5 text-[10px] font-medium text-carbon"
                                  >
                                    <Tag className="h-2.5 w-2.5 text-cobalt/70 shrink-0" />
                                    <span>{skill}</span>
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Bottom Row: Issue Date & Direct Verification Link */}
                          <div className="flex items-center justify-between border-t border-border pt-4 mt-auto">
                            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-mono">
                              <Calendar className="h-3.5 w-3.5 text-carbon/40 shrink-0" />
                              <span>{formatBadgeDate(badge.issue_date)}</span>
                            </div>

                            <a
                              href={badge.credly_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="group/link inline-flex items-center gap-1 text-xs font-semibold text-cobalt hover:text-carbon transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cobalt"
                              title={`Verify ${badge.name} credential on Credly`}
                              aria-label={`Verify ${badge.name} credential on Credly (opens in new tab)`}
                            >
                              <span>Verify Credential</span>
                              <ExternalLink className="h-3 w-3 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                            </a>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* View More / Show Less Button */}
              {sortedBadges.length > INITIAL_BADGE_LIMIT && (
                <div className="mt-12 flex justify-center">
                  <button
                    type="button"
                    onClick={handleToggleBadgesView}
                    aria-expanded={showAllBadges}
                    className="mono inline-flex items-center gap-2.5 border border-border bg-white px-6 py-3.5 text-xs font-bold tracking-wider text-cobalt uppercase transition-all duration-200 hover:border-cobalt hover:bg-[#FAF9F6] hover:shadow-xs active:scale-[0.99] cursor-pointer"
                  >
                    <span>
                      {showAllBadges ? "SHOW LESS" : `VIEW MORE CREDENTIALS (${remainingCount})`}
                    </span>
                    <span className="text-carbon/40">{showAllBadges ? "↑" : "↓"}</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 5. Detail Modal Interaction (Radix Dialog) */}
      {/* ------------------------------------------------------------- */}
      <Dialog open={!!selectedBadge} onOpenChange={(open) => !open && setSelectedBadge(null)}>
        <DialogContent className="max-w-2xl bg-white p-6 sm:p-8 border border-border sm:rounded-none shadow-xl">
          {selectedBadge && (
            <>
              {/* Centered Large Badge Artwork */}
              <div className="flex justify-center pt-2 pb-2">
                <BadgeArtwork
                  src={selectedBadge.badge_image_url}
                  alt={selectedBadge.name}
                  size="lg"
                />
              </div>

              <DialogHeader className="text-center sm:text-left space-y-1 mt-2">
                <div className="flex items-center justify-center sm:justify-start gap-2 mono text-xs font-bold text-cobalt uppercase tracking-wider">
                  <Building2 className="h-3.5 w-3.5 text-cobalt shrink-0" />
                  <span>{selectedBadge.issuer}</span>
                </div>
                <DialogTitle className="text-xl sm:text-2xl font-bold text-carbon leading-snug">
                  {selectedBadge.name}
                </DialogTitle>
                <DialogDescription className="mono text-[11px] text-muted-foreground uppercase">
                  Verified Credly Digital Credential
                </DialogDescription>
              </DialogHeader>

              {/* Modal Description */}
              <div className="mt-3 border-t border-border pt-4">
                <h4 className="mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Credential Overview
                </h4>
                <p className="text-xs sm:text-sm text-carbon/85 leading-relaxed whitespace-pre-line break-words max-h-52 overflow-y-auto pr-2">
                  {selectedBadge.description || "Description not provided."}
                </p>
              </div>

              {/* Modal Metadata Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-border pt-4 mt-3 text-xs font-mono">
                <div className="flex items-center gap-2.5 border border-border bg-[#FAF9F6] p-2.5">
                  <Calendar className="h-4 w-4 text-cobalt shrink-0" />
                  <div>
                    <div className="text-[10px] text-muted-foreground uppercase">Issue Date</div>
                    <div className="font-semibold text-carbon">
                      {formatBadgeDate(selectedBadge.issue_date)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 border border-border bg-[#FAF9F6] p-2.5">
                  <ShieldCheck className="h-4 w-4 text-cobalt shrink-0" />
                  <div>
                    <div className="text-[10px] text-muted-foreground uppercase">
                      Validity Period
                    </div>
                    <div className="font-semibold text-carbon">
                      {selectedBadge.expiry_date
                        ? formatBadgeDate(selectedBadge.expiry_date)
                        : "Valid Indefinitely"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Associated Skills */}
              {selectedBadge.skills && selectedBadge.skills.length > 0 && (
                <div className="border-t border-border pt-4 mt-3">
                  <h4 className="mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                    Verified Competencies & Skills ({selectedBadge.skills.length})
                  </h4>
                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                    {selectedBadge.skills.map((skill) => (
                      <span
                        key={skill}
                        className="mono inline-flex items-center gap-1 border border-border bg-[#FAF9F6] px-2.5 py-1 text-[10px] font-medium text-carbon"
                      >
                        <Tag className="h-2.5 w-2.5 text-cobalt/70 shrink-0" />
                        <span>{skill}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Modal Footer with Verify on Credly Action */}
              <div className="border-t border-border pt-5 mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-[11px] mono text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Cryptographically Verified Badge</span>
                </div>

                <a
                  href={selectedBadge.credly_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mono inline-flex items-center justify-center gap-2 border border-cobalt bg-cobalt px-5 py-2.5 text-xs font-bold text-white transition-all hover:bg-cobalt/90 hover:shadow-xs active:scale-[0.99] cursor-pointer"
                >
                  <span>Verify on Credly</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
