import { useState, useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import { GITHUB } from "@/lib/site";
import { Github, FileText, Menu, X, Search } from "lucide-react";
import { isStaging } from "@/lib/staging.guard";

interface NavItem {
  id: string;
  label: string;
  href: string;
  isExternalPage?: boolean;
}

const SECTION_IDS = ["hero", "projects", "skills", "experience", "certifications", "contact"];

const NAV_ITEMS: NavItem[] = [
  { id: "hero", label: "Home", href: "/#hero" },
  { id: "projects", label: "Projects", href: "/#projects" },
  { id: "skills", label: "Skills", href: "/#skills" },
  { id: "experience", label: "Experience", href: "/#experience" },
  { id: "certifications", label: "Certifications", href: "/#certifications" },
  { id: "contact", label: "Contact", href: "/#contact" },
];

export function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isHome = pathname === "/" || pathname === "";
  const isGithub = pathname === "/github";
  const isProjects = pathname.startsWith("/projects");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Initial hash sync on home page mount / hash change
  useEffect(() => {
    if (!isHome || typeof window === "undefined") return;
    const hash = window.location.hash.replace(/^#/, "");
    if (hash && SECTION_IDS.includes(hash)) {
      setActiveSection(hash);
    }
  }, [isHome]);

  useEffect(() => {
    if (!isHome) {
      if (isProjects) {
        setActiveSection("projects");
      } else if (isGithub) {
        setActiveSection("github");
      }
      return;
    }

    const handleScrollSpy = () => {
      // Near top: Hero
      if (window.scrollY < 80) {
        setActiveSection("hero");
        return;
      }

      // Bottom of page: Contact
      const scrollBottom = window.innerHeight + window.scrollY;
      const totalHeight = document.documentElement.scrollHeight;
      if (scrollBottom >= totalHeight - 60) {
        setActiveSection("contact");
        return;
      }

      // Focal reading line: 35% down the viewport (where visitor attention rests)
      const focalPoint = Math.min(320, window.innerHeight * 0.35);

      // 1. Primary check: Which section currently spans across the focal line?
      for (const id of SECTION_IDS) {
        const el = document.getElementById(id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= focalPoint && rect.bottom > focalPoint) {
          setActiveSection(id);
          return;
        }
      }

      // 2. Secondary check / rapid scroll / transition fallback: Find section with maximum visible height in viewport
      let candidate = "hero";
      let maxOverlap = -1;

      for (const id of SECTION_IDS) {
        const el = document.getElementById(id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        const visibleTop = Math.max(rect.top, 80);
        const visibleBottom = Math.min(rect.bottom, window.innerHeight);
        const visibleHeight = Math.max(0, visibleBottom - visibleTop);

        if (visibleHeight > maxOverlap) {
          maxOverlap = visibleHeight;
          candidate = id;
        }
      }

      if (maxOverlap > 0) {
        setActiveSection(candidate);
      }
    };

    handleScrollSpy();
    window.addEventListener("scroll", handleScrollSpy, { passive: true });
    window.addEventListener("resize", handleScrollSpy, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScrollSpy);
      window.removeEventListener("resize", handleScrollSpy);
    };
  }, [isHome, isGithub, isProjects]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, item: NavItem) => {
    if (item.isExternalPage) return;

    if (isHome) {
      e.preventDefault();
      setActiveSection(item.id);
      if (mobileMenuOpen) {
        setMobileMenuOpen(false);
      }

      const el = document.getElementById(item.id);
      if (el) {
        const headerOffset = 80;
        const elementPosition = el.getBoundingClientRect().top + window.scrollY;
        const offsetPosition = Math.max(0, elementPosition - headerOffset);

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });

        if (window.history.pushState) {
          window.history.pushState(null, "", `#${item.id}`);
        }
      }
    }
  };

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [mobileMenuOpen]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const getItemHref = (item: NavItem) => {
    if (item.isExternalPage) {
      return item.href;
    }
    if (isHome) {
      return `#${item.id}`;
    }
    if (item.id === "projects" && isProjects && pathname !== "/projects") {
      return "/projects";
    }
    return item.href;
  };

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled || mobileMenuOpen
            ? "border-b border-border bg-[#FAF9F6]/95 backdrop-blur-md"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-4 md:px-10">
          {/* Identity: PP Monogram + Name + Optional Staging Badge */}
          <div className="flex items-center gap-3">
            <a
              href={isHome ? "#hero" : "/#hero"}
              className="group flex items-center gap-3 transition-opacity hover:opacity-90"
              aria-label="Piyush Prasad — Cloud & DevOps Engineer home"
            >
              <div className="flex h-9 w-9 items-center justify-center border border-carbon/15 bg-white shadow-xs transition-colors group-hover:border-cobalt">
                <img
                  src="/pp-logo.png"
                  alt="PP"
                  className="h-6 w-auto object-contain"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.style.display = "none";
                    if (target.parentElement) {
                      target.parentElement.innerHTML =
                        '<span class="mono font-bold text-cobalt text-[12px]">PP</span>';
                    }
                  }}
                />
              </div>
              <div className="flex flex-col">
                <span className="text-[14px] font-bold tracking-tight text-carbon">
                  Piyush Prasad
                </span>
                <span className="mono text-[9px] text-muted-foreground tracking-widest">
                  Cloud & DevOps
                </span>
              </div>
            </a>

            {isStaging && (
              <div
                className="mono inline-flex items-center gap-1.5 border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[9px] font-bold tracking-widest text-amber-700 select-none shadow-2xs"
                title="Staging Test Environment (Local / test.piyushprasad.in)"
                role="status"
                aria-label="Staging environment active"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span>STAGING</span>
              </div>
            )}
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-7 lg:flex" aria-label="Main Navigation">
            {NAV_ITEMS.map((item) => {
              const isActive = isProjects
                ? item.id === "projects"
                : isGithub
                  ? item.id === "github"
                  : isHome && activeSection === item.id;

              return (
                <a
                  key={item.id}
                  href={getItemHref(item)}
                  onClick={(e) => handleNavClick(e, item)}
                  aria-current={isActive ? "page" : undefined}
                  className={`mono relative py-1 text-[11px] font-medium tracking-wider transition-colors ${
                    isActive ? "text-cobalt font-semibold" : "text-carbon/75 hover:text-cobalt"
                  }`}
                >
                  {item.label}
                  <span
                    aria-hidden="true"
                    className={`absolute -bottom-1 left-0 h-[2px] bg-cobalt transition-all duration-200 ${
                      isActive ? "w-full" : "w-0"
                    }`}
                  />
                </a>
              );
            })}

            {/* Search Trigger Button */}
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent("open-command-palette"))}
              className="mono inline-flex items-center gap-1.5 border border-border bg-white px-2.5 py-1 text-[11px] font-medium text-carbon/80 transition-all hover:border-cobalt hover:text-cobalt shadow-2xs cursor-pointer"
              title="Search"
              aria-label="Search"
            >
              <Search className="h-3.5 w-3.5 text-cobalt" />
              <span className="text-[10px] tracking-wider uppercase font-semibold">SEARCH</span>
            </button>

            {/* GitHub Profile Icon Link */}
            <a
              href="https://github.com/ppiyushhhhh?tab=repositories"
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-8 w-8 items-center justify-center border border-border bg-white text-carbon/80 transition-all hover:border-cobalt hover:text-cobalt"
              aria-label="Explore All Projects on GitHub"
              title="Explore All Projects on GitHub"
            >
              <Github className="h-4 w-4" />
            </a>

            {/* Resume Button */}
            <a
              href="/resume"
              className="mono inline-flex items-center gap-1.5 border border-carbon bg-carbon px-3.5 py-1.5 text-[10px] font-semibold tracking-wider text-white transition-all hover:border-cobalt hover:bg-cobalt"
            >
              <FileText className="h-3 w-3" />
              RESUME
            </a>
          </nav>

          {/* Mobile Menu Actions */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent("open-command-palette"))}
              className="inline-flex h-9 w-9 items-center justify-center border border-border bg-white text-carbon transition-colors hover:border-cobalt hover:text-cobalt cursor-pointer"
              title="Quick Search (⌘K)"
              aria-label="Open search palette"
            >
              <Search className="h-4 w-4 text-cobalt" />
            </button>

            <a
              href="/resume"
              className="mono inline-flex items-center gap-1 border border-carbon/20 bg-white px-2.5 py-1.5 text-[10px] font-semibold text-carbon hover:border-cobalt hover:text-cobalt"
            >
              RESUME
            </a>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex h-9 w-9 items-center justify-center border border-border bg-white text-carbon transition-colors hover:border-cobalt hover:text-cobalt"
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Full-width Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 top-[65px] z-40 flex flex-col bg-[#FAF9F6] px-6 py-8 lg:hidden animate-in fade-in slide-in-from-top-4 duration-200"
          style={{ height: "calc(100dvh - 65px)" }}
        >
          <div className="flex flex-col gap-2">
            {isStaging && (
              <div className="mb-2 flex items-center justify-between border border-amber-500/30 bg-amber-500/10 px-3 py-1.5">
                <span className="mono text-[10px] font-bold tracking-widest text-amber-700">
                  STAGING ENVIRONMENT
                </span>
                <span className="mono text-[9px] text-amber-600">TEST BUILD</span>
              </div>
            )}
            <span className="mono mb-2 text-[10px] text-muted-foreground tracking-widest">
              NAVIGATION
            </span>

            {NAV_ITEMS.map((item) => {
              const isActive = isProjects
                ? item.id === "projects"
                : isGithub
                  ? item.id === "github"
                  : isHome && activeSection === item.id;

              return (
                <a
                  key={item.id}
                  href={getItemHref(item)}
                  onClick={(e) => handleNavClick(e, item)}
                  className={`flex items-center justify-between border-b border-border py-3.5 text-base font-medium transition-colors ${
                    isActive ? "text-cobalt font-semibold" : "text-carbon hover:text-cobalt"
                  }`}
                >
                  <span>{item.label}</span>
                  <span className="mono text-[10px] text-muted-foreground">
                    {isActive ? "ACTIVE" : `→`}
                  </span>
                </a>
              );
            })}
          </div>

          <div className="mt-auto space-y-4 pt-6 border-t border-border">
            <div className="grid grid-cols-2 gap-3">
              <a
                href={GITHUB}
                target="_blank"
                rel="noreferrer"
                className="mono flex items-center justify-center gap-2 border border-border bg-white py-3 text-[11px] text-carbon font-semibold"
              >
                <Github className="h-4 w-4" />
                GITHUB
              </a>
              <a
                href="/resume"
                onClick={() => setMobileMenuOpen(false)}
                className="mono flex items-center justify-center gap-2 bg-cobalt py-3 text-[11px] text-white font-semibold transition-opacity hover:opacity-95"
              >
                <FileText className="h-4 w-4" />
                RESUME
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
