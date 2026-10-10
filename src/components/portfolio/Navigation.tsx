import { useState, useEffect } from "react";
import { GITHUB } from "@/lib/site";
import { Github, FileText, Menu, X, Search } from "lucide-react";

interface NavItem {
  id: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: "hero", label: "Home" },
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Skills" },
  { id: "experience", label: "Experience" },
  { id: "certifications", label: "Certifications" },
  { id: "contact", label: "Contact" },
];

export function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const sectionElements = NAV_ITEMS.map((item) =>
      document.getElementById(item.id),
    ).filter((el): el is HTMLElement => !!el);

    if (sectionElements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) {
          setActiveSection(visible.target.id);
        }
      },
      { rootMargin: "-30% 0px -50% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    );

    sectionElements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

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
          {/* Identity: PP Monogram + Name */}
          <a
            href="#hero"
            className="group flex items-center gap-3 transition-opacity hover:opacity-90"
            aria-label="Piyush Prasad — Cloud & DevOps Engineer home"
          >
            <div className="flex h-9 w-9 items-center justify-center border border-carbon/15 bg-white shadow-xs transition-colors group-hover:border-cobalt">
              <img
                src="/pp-logo.png"
                alt="PP"
                className="h-6 w-auto object-contain"
                onError={(e) => {
                  // Fallback if image fails
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

          {/* Desktop Navigation */}
          <nav
            className="hidden items-center gap-7 lg:flex"
            aria-label="Main Navigation"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  aria-current={isActive ? "page" : undefined}
                  className={`mono relative py-1 text-[11px] font-medium tracking-wider transition-colors ${
                    isActive
                      ? "text-cobalt font-semibold"
                      : "text-carbon/75 hover:text-cobalt"
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

            {/* Command Palette Trigger Button */}
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent("open-command-palette"))}
              className="mono inline-flex items-center gap-2 border border-border bg-white px-2.5 py-1 text-[11px] text-muted-foreground transition-all hover:border-cobalt hover:text-carbon shadow-2xs cursor-pointer"
              title="Quick Search & Actions (Ctrl+K or ⌘K)"
              aria-label="Open command palette"
            >
              <Search className="h-3.5 w-3.5 text-cobalt" />
              <span className="hidden xl:inline text-[10px]">Search</span>
              <kbd className="mono rounded border border-border bg-[#FAF9F6] px-1 py-0.2 text-[9px] font-semibold text-carbon/70">
                ⌘K
              </kbd>
            </button>

            {/* GitHub Icon Link */}
            <a
              href={GITHUB}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-8 w-8 items-center justify-center border border-border bg-white text-carbon/80 transition-all hover:border-cobalt hover:text-cobalt"
              aria-label="Piyush Prasad on GitHub"
            >
              <Github className="h-4 w-4" />
            </a>

            {/* Resume Button */}
            <a
              href="/resume.pdf"
              target="_blank"
              rel="noreferrer"
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
              href="/resume.pdf"
              target="_blank"
              rel="noreferrer"
              className="mono inline-flex items-center gap-1 border border-carbon/20 bg-white px-2.5 py-1.5 text-[10px] font-semibold text-carbon"
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
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
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
            <span className="mono mb-2 text-[10px] text-muted-foreground tracking-widest">
              NAVIGATION
            </span>

            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between border-b border-border py-3.5 text-base font-medium transition-colors ${
                    isActive
                      ? "text-cobalt font-semibold"
                      : "text-carbon hover:text-cobalt"
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
                href="/resume.pdf"
                target="_blank"
                rel="noreferrer"
                className="mono flex items-center justify-center gap-2 bg-cobalt py-3 text-[11px] text-white font-semibold"
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
