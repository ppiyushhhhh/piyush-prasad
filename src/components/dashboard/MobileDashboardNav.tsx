import { useState, useEffect, useRef, useMemo } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  BarChart3,
  Bot,
  FileText,
  Gauge,
  Github,
  Rocket,
  Settings,
  Database,
  HardDrive,
  LogOut,
  Shield,
  Mail,
  Menu,
  X,
  Search,
  Compass,
  ChevronRight,
  Check,
  ArrowUpRight,
  SlidersHorizontal,
  Home,
} from "lucide-react";

export interface NavModule {
  to: string;
  label: string;
  icon: typeof Gauge;
  category: "Monitoring" | "Pipelines" | "Data & Storage" | "System";
  description: string;
  badge?: string;
  keywords: string[];
}

export const DASHBOARD_NAV_MODULES: NavModule[] = [
  {
    to: "/dashboard",
    label: "Overview",
    icon: Gauge,
    category: "Monitoring",
    description: "Real-time system telemetry, uptime, response latency & health score",
    badge: "Core",
    keywords: ["home", "status", "uptime", "latency", "health", "metrics", "chart"],
  },
  {
    to: "/dashboard/messages",
    label: "Messages",
    icon: Mail,
    category: "Monitoring",
    description: "Contact submissions, visitor inquiries & message status tracking",
    badge: "Inbox",
    keywords: ["contact", "inbox", "email", "form", "submissions", "leads", "visitors"],
  },
  {
    to: "/dashboard/health",
    label: "Website Health",
    icon: Activity,
    category: "Monitoring",
    description: "Live endpoint probes, SSL validity, DNS status & TLS certificates",
    badge: "Probes",
    keywords: ["ssl", "tls", "probes", "dns", "http", "cert", "uptime", "ping"],
  },
  {
    to: "/dashboard/performance",
    label: "Performance",
    icon: BarChart3,
    category: "Monitoring",
    description: "Core Web Vitals, TTFB, Google Lighthouse scores & speed benchmarks",
    keywords: ["lighthouse", "speed", "vitals", "ttfb", "fcp", "lcp", "performance"],
  },
  {
    to: "/dashboard/github",
    label: "GitHub",
    icon: Github,
    category: "Pipelines",
    description: "Repository commits, pull requests, releases & remote branch sync",
    keywords: ["repo", "git", "commits", "branches", "code", "sync"],
  },
  {
    to: "/dashboard/cicd",
    label: "CI/CD",
    icon: Rocket,
    category: "Pipelines",
    description: "GitHub Actions workflow pipelines, build artifacts & deployment logs",
    badge: "Actions",
    keywords: ["actions", "builds", "deploy", "workflows", "pipeline", "release"],
  },
  {
    to: "/dashboard/ai-chat",
    label: "AI Chat",
    icon: Bot,
    category: "Pipelines",
    description: "Portfolio AI assistant telemetry, interaction analytics & conversation logs",
    keywords: ["ai", "assistant", "chat", "llm", "prompts", "analytics", "bot"],
  },
  {
    to: "/dashboard/reports",
    label: "Reports",
    icon: FileText,
    category: "Data & Storage",
    description: "Automated diagnostics summaries, incident reports & executive logs",
    keywords: ["audit", "export", "pdf", "incident", "summary", "logs"],
  },
  {
    to: "/dashboard/database",
    label: "Database",
    icon: Database,
    category: "Data & Storage",
    description: "PostgreSQL tables, telemetry schema, live row counts & storage health",
    badge: "Supabase",
    keywords: ["sql", "tables", "postgres", "supabase", "rows", "schema", "storage"],
  },
  {
    to: "/dashboard/manual-backups",
    label: "Manual Backups",
    icon: HardDrive,
    category: "Data & Storage",
    description: "On-demand database snapshot archives, JSON table exports & backup recovery",
    badge: "Storage",
    keywords: ["backup", "snapshots", "dumps", "restore", "export", "archive", "storage"],
  },
  {
    to: "/dashboard/settings",
    label: "Settings",
    icon: Settings,
    category: "System",
    description: "Alert thresholds, notification emails, probe intervals & preferences",
    keywords: ["config", "alerts", "thresholds", "intervals", "email", "preferences"],
  },
];

const CATEGORIES = ["All", "Monitoring", "Pipelines", "Data & Storage", "System"] as const;

interface MobileDashboardNavProps {
  currentPath: string;
  userEmail?: string;
  onSignOut: () => Promise<void> | void;
}

export function MobileDashboardNav({
  currentPath,
  userEmail,
  onSignOut,
}: MobileDashboardNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [showFab, setShowFab] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const activePillRef = useRef<HTMLAnchorElement>(null);
  const carouselContainerRef = useRef<HTMLDivElement>(null);

  // Identify active module
  const activeModule = useMemo(() => {
    return (
      DASHBOARD_NAV_MODULES.find((m) =>
        m.to === "/dashboard"
          ? currentPath === "/dashboard" || currentPath === "/dashboard/"
          : currentPath.startsWith(m.to)
      ) ?? DASHBOARD_NAV_MODULES[0]
    );
  }, [currentPath]);

  // Scroll active horizontal pill to center whenever currentPath changes
  useEffect(() => {
    if (activePillRef.current && carouselContainerRef.current) {
      activePillRef.current.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [currentPath]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      // Auto-focus search input after drawer opens
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = "";
      };
    } else {
      document.body.style.overflow = "";
      setSearchQuery("");
      setSelectedCategory("All");
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close drawer on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Toggle floating action button on scroll
  useEffect(() => {
    const handleScroll = () => {
      setShowFab(window.scrollY > 220);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Filter modules based on search query and selected category
  const filteredModules = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return DASHBOARD_NAV_MODULES.filter((module) => {
      const matchesCategory =
        selectedCategory === "All" || module.category === selectedCategory;
      if (!matchesCategory) return false;

      if (!q) return true;

      const inLabel = module.label.toLowerCase().includes(q);
      const inDescription = module.description.toLowerCase().includes(q);
      const inCategory = module.category.toLowerCase().includes(q);
      const inKeywords = module.keywords.some((k) => k.toLowerCase().includes(q));

      return inLabel || inDescription || inCategory || inKeywords;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="md:hidden">
      {/* 1. Sticky Mobile Header */}
      <header className="sticky top-0 z-30 border-b border-[#E5E5DF] bg-white/95 backdrop-blur-md shadow-2xs">
        {/* Top brand & trigger row */}
        <div className="flex items-center justify-between px-3.5 py-2.5">
          {/* Logo & Brand Identity */}
          <Link
            to="/dashboard"
            className="flex items-center gap-2 group transition-opacity hover:opacity-90"
          >
            <div className="flex h-8 w-8 items-center justify-center border border-carbon/20 bg-white font-mono text-xs font-bold text-cobalt shadow-2xs group-hover:border-cobalt transition-colors">
              PP
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="mono text-xs font-bold tracking-tight text-carbon">
                  PP · OPS
                </span>
                <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <span className="mono text-[8px] uppercase tracking-wider text-muted-foreground">
                CONSOLE // ADMIN
              </span>
            </div>
          </Link>

          {/* Right action controls */}
          <div className="flex items-center gap-2">
            {/* Quick jump menu button */}
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="flex items-center gap-1.5 rounded-sm bg-cobalt px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-cobalt/90 active:scale-95 transition-all"
              aria-label="Open dashboard navigation menu"
            >
              <Compass className="h-3.5 w-3.5" />
              <span className="font-mono text-[11px] uppercase tracking-wider">
                Jump
              </span>
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-white/25 px-1 text-[9px] font-bold text-white">
                11
              </span>
            </button>

            {/* Quick Sign Out icon */}
            <button
              type="button"
              onClick={onSignOut}
              className="flex h-8 w-8 items-center justify-center rounded-sm border border-[#E5E5DF] bg-[#FAF9F6] text-muted-foreground hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 transition-colors"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Active Module Indicator & Quick Filter Trigger */}
        <div className="flex items-center justify-between border-t border-[#E5E5DF]/70 bg-[#FAF9F6]/80 px-3.5 py-1.5 text-[11px]">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="mono text-[9px] uppercase tracking-widest text-muted-foreground shrink-0">
              MODULE:
            </span>
            <span className="mono flex items-center gap-1 font-bold text-cobalt truncate">
              {activeModule.label}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="mono flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground hover:text-carbon font-semibold shrink-0 bg-white border border-[#E5E5DF] px-2 py-0.5 rounded-xs shadow-2xs hover:border-cobalt transition-colors"
          >
            <Search className="h-2.5 w-2.5 text-cobalt" />
            <span>Find Page</span>
          </button>
        </div>

        {/* 2. Horizontal Scrollable Pill Carousel */}
        <div
          ref={carouselContainerRef}
          className="flex items-center gap-1.5 overflow-x-auto border-t border-[#E5E5DF] bg-white px-3 py-2 scrollbar-none"
        >
          {/* "All Pages" launcher button */}
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="mono flex items-center gap-1 whitespace-nowrap rounded-sm border border-cobalt/30 bg-cobalt/5 px-2.5 py-1 text-[11px] font-bold text-cobalt hover:bg-cobalt/10 active:scale-95 transition-all shrink-0"
          >
            <SlidersHorizontal className="h-3 w-3" />
            <span>ALL (11) ▾</span>
          </button>

          {/* Individual Route Pills */}
          {DASHBOARD_NAV_MODULES.map((item) => {
            const Icon = item.icon;
            const isExact = item.to === "/dashboard";
            const isActive = isExact
              ? currentPath === "/dashboard" || currentPath === "/dashboard/"
              : currentPath.startsWith(item.to);

            return (
              <Link
                key={item.to}
                to={item.to}
                ref={isActive ? activePillRef : null}
                className={`mono flex items-center gap-1.5 whitespace-nowrap rounded-sm px-2.5 py-1 text-[11px] font-medium transition-all shrink-0 ${
                  isActive
                    ? "bg-cobalt text-white font-bold shadow-2xs"
                    : "border border-[#E5E5DF] bg-[#FAF9F6] text-carbon/75 hover:border-cobalt hover:text-cobalt"
                }`}
              >
                <Icon className={`h-3 w-3 ${isActive ? "text-white" : "text-muted-foreground"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </header>

      {/* 3. Full "Jump to Page" Mobile Drawer / Dialog */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Dashboard Page Navigation"
          className="fixed inset-0 z-50 flex flex-col bg-carbon/60 backdrop-blur-xs animate-in fade-in duration-150"
        >
          {/* Drawer Content Container */}
          <div className="relative flex flex-col h-full w-full max-w-lg mx-auto bg-white shadow-2xl animate-in slide-in-from-top-4 duration-200">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-[#E5E5DF] px-4 py-3 bg-[#FAF9F6]">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center border border-carbon/20 bg-white text-cobalt shadow-2xs">
                  <Compass className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="mono text-xs font-bold uppercase tracking-wider text-carbon">
                    Jump to Console Module
                  </h2>
                  <p className="mono text-[9px] uppercase tracking-widest text-muted-foreground">
                    11 Services Available
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-sm border border-[#E5E5DF] bg-white text-muted-foreground hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors"
                aria-label="Close navigation menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Search Input Bar */}
            <div className="border-b border-[#E5E5DF] p-3 bg-white">
              <div className="relative flex items-center">
                <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter pages (e.g. database, health, cicd, email)..."
                  className="w-full rounded-sm border border-[#E5E5DF] bg-[#FAF9F6] py-2 pl-9 pr-8 text-xs font-mono text-carbon placeholder:text-muted-foreground/60 focus:border-cobalt focus:bg-white focus:outline-none transition-colors"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 text-muted-foreground hover:text-carbon"
                    title="Clear search"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto pb-0.5 scrollbar-none">
                {CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat;
                  const count =
                    cat === "All"
                      ? DASHBOARD_NAV_MODULES.length
                      : DASHBOARD_NAV_MODULES.filter((m) => m.category === cat).length;

                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`mono whitespace-nowrap rounded-xs px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider transition-colors ${
                        isSelected
                          ? "bg-carbon text-white"
                          : "border border-[#E5E5DF] bg-[#FAF9F6] text-muted-foreground hover:text-carbon hover:border-carbon/30"
                      }`}
                    >
                      {cat} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Modules List (Scrollable Area) */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {filteredModules.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed border-[#E5E5DF] bg-[#FAF9F6]/60">
                  <Search className="h-8 w-8 text-muted-foreground/40 mb-2" />
                  <p className="mono text-xs font-bold uppercase text-carbon">
                    No Matching Modules
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    No dashboard sections match &ldquo;{searchQuery}&rdquo;.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("All");
                    }}
                    className="mono mt-3 text-xs font-semibold text-cobalt hover:underline uppercase"
                  >
                    Reset Search Filters
                  </button>
                </div>
              ) : (
                filteredModules.map((module) => {
                  const Icon = module.icon;
                  const isExact = module.to === "/dashboard";
                  const isActive = isExact
                    ? currentPath === "/dashboard" || currentPath === "/dashboard/"
                    : currentPath.startsWith(module.to);

                  return (
                    <Link
                      key={module.to}
                      to={module.to}
                      onClick={() => setIsOpen(false)}
                      className={`group flex items-start gap-3 rounded-sm border p-3 transition-all ${
                        isActive
                          ? "border-cobalt bg-cobalt/5 shadow-2xs"
                          : "border-[#E5E5DF] bg-white hover:border-cobalt/50 hover:bg-[#FAF9F6]"
                      }`}
                    >
                      {/* Module Icon Box */}
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border transition-colors ${
                          isActive
                            ? "border-cobalt bg-cobalt text-white shadow-2xs"
                            : "border-[#E5E5DF] bg-[#FAF9F6] text-carbon group-hover:border-cobalt/40 group-hover:text-cobalt"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`mono text-xs font-bold tracking-tight ${
                              isActive ? "text-cobalt" : "text-carbon group-hover:text-cobalt"
                            }`}
                          >
                            {module.label}
                          </span>

                          <span className="mono text-[8px] uppercase tracking-wider text-muted-foreground bg-[#FAF9F6] border border-[#E5E5DF] px-1.5 py-0.2 rounded-xs">
                            {module.category}
                          </span>

                          {isActive && (
                            <span className="mono ml-auto flex items-center gap-1 rounded-xs bg-cobalt px-1.5 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider">
                              <Check className="h-2.5 w-2.5" />
                              Active
                            </span>
                          )}

                          {!isActive && module.badge && (
                            <span className="mono ml-auto text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                              {module.badge}
                            </span>
                          )}
                        </div>

                        <p className="mt-1 text-[11px] leading-snug text-muted-foreground font-sans line-clamp-2">
                          {module.description}
                        </p>
                      </div>

                      {!isActive && (
                        <div className="flex items-center self-center text-muted-foreground group-hover:text-cobalt group-hover:translate-x-0.5 transition-transform">
                          <ChevronRight className="h-4 w-4" />
                        </div>
                      )}
                    </Link>
                  );
                })
              )}
            </div>

            {/* Drawer Footer & Quick Exit Actions */}
            <div className="border-t border-[#E5E5DF] bg-[#FAF9F6] p-3 space-y-2">
              {/* Authenticated user pill */}
              {userEmail && (
                <div className="flex items-center justify-between rounded-sm border border-[#E5E5DF] bg-white px-2.5 py-1.5 text-xs">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Shield className="h-3 w-3 text-emerald-600 shrink-0" />
                    <span className="mono text-[10px] text-muted-foreground truncate">
                      Admin: <strong className="text-carbon font-semibold">{userEmail}</strong>
                    </span>
                  </div>
                  <span className="mono text-[8px] uppercase font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1 py-0.2">
                    Verified
                  </span>
                </div>
              )}

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/"
                  onClick={() => setIsOpen(false)}
                  className="mono flex items-center justify-center gap-1.5 rounded-sm border border-[#E5E5DF] bg-white py-2 text-[11px] font-semibold text-carbon hover:border-cobalt hover:text-cobalt transition-colors"
                >
                  <Home className="h-3.5 w-3.5" />
                  <span>Public Site</span>
                  <ArrowUpRight className="h-3 w-3 opacity-60" />
                </Link>

                <button
                  type="button"
                  onClick={async () => {
                    setIsOpen(false);
                    await onSignOut();
                  }}
                  className="mono flex items-center justify-center gap-1.5 rounded-sm border border-transparent bg-rose-50 text-rose-700 py-2 text-[11px] font-semibold hover:bg-rose-100 hover:border-rose-200 transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Floating Action Button (FAB) for fast jump on long mobile pages */}
      {showFab && !isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full border border-cobalt/40 bg-cobalt px-3.5 py-2 text-xs font-semibold text-white shadow-lg active:scale-95 hover:bg-cobalt/95 transition-all animate-in fade-in slide-in-from-bottom-2 duration-150"
          aria-label="Jump to another dashboard page"
        >
          <Compass className="h-4 w-4" />
          <span className="mono text-[11px] uppercase tracking-wider font-bold">
            Jump to Page
          </span>
          <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-white text-cobalt text-[9px] font-bold">
            11
          </span>
        </button>
      )}
    </div>
  );
}
