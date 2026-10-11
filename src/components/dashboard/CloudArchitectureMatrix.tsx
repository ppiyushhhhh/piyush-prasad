import { useState } from "react";
import {
  Globe,
  Database,
  Lock,
  ShieldCheck,
  Network,
  Cpu,
  CheckCircle2,
  Server,
  Zap,
  Code2,
  Bot,
  ExternalLink,
  Layers,
  Activity,
  ArrowRight,
} from "lucide-react";

import { StatusTag } from "@/components/dashboard/primitives";

export function CloudArchitectureMatrix() {
  const [activeTab, setActiveTab] = useState<"topology" | "specs" | "security">("topology");

  const architectureNodes = [
    {
      id: "edge",
      tag: "SYS.EDGE",
      label: "Edge CDN & Hosting",
      provider: "Vercel Serverless (Global Edge Network)",
      category: "Compute & Ingress",
      status: "Operational",
      badge: "Sub-50ms TTFB",
      icon: Globe,
      color: "text-cobalt",
      specs: [
        "Global Anycast Edge Network with sub-50ms worldwide TTFB",
        "TanStack Start SSR executed on ephemeral Node.js Serverless runtime",
        "Dynamic Brotli / Gzip asset compression & distributed CDN caching",
        "Automated zero-downtime rolling deployments on Git push",
      ],
      region: "Global Anycast POPs (Singapore Edge Ingress)",
    },
    {
      id: "database",
      tag: "SYS.DATA",
      label: "Database Cluster",
      provider: "Supabase PostgreSQL (AWS ap-south-1 Mumbai)",
      category: "Data & Persistence",
      status: "Connected",
      badge: "AWS ap-south-1",
      icon: Database,
      color: "text-purple-600",
      specs: [
        "Hosted on AWS ap-south-1 (Mumbai, India) low-latency datacenter",
        "6 telemetry & observability tables protected with Row Level Security (RLS)",
        "Zero browser client-side key leakage; queried exclusively via server functions",
        "Connection pooling & automated snapshot backup recovery",
      ],
      region: "AWS Asia Pacific (Mumbai) ap-south-1",
    },
    {
      id: "tls",
      tag: "SYS.CRYPTO",
      label: "TLS & Encryption",
      provider: "TLS 1.3 / Strict-Transport-Security / Google Trust Services",
      category: "Cryptography & SSL",
      status: "A+ Verified",
      badge: "Expires Dec 6, 2026",
      icon: Lock,
      color: "text-emerald-700",
      specs: [
        "Modern TLS 1.3 cipher suite: TLS_AES_128_GCM_SHA256 with 0-RTT resumption",
        "HSTS (HTTP Strict Transport Security) header: max-age=63072000",
        "Certified by Google Trust Services / Let's Encrypt with automated renewal",
        "Live node:tls native socket verification probed on every health check",
      ],
      region: "Cloudflare & Vercel SSL Termination Edge",
    },
    {
      id: "security",
      tag: "SYS.DEVSECOPS",
      label: "Security Automation",
      provider: "GitHub CodeQL (SAST) & Dependabot",
      category: "DevSecOps & CI/CD",
      status: "Passing",
      badge: "238+ Automated Runs",
      icon: ShieldCheck,
      color: "text-amber-700",
      specs: [
        "GitHub CodeQL Advanced Static Application Security Testing (SAST) on PRs",
        "Automated Dependabot vulnerability alerts and automated security pull requests",
        "CI gate pipeline: TypeScript strict validation, ESLint 9, and frozen lockfile builds",
        "Zero-trust environment secrets: backend credentials never exported to client bundle",
      ],
      region: "GitHub Actions Cloud Runners",
    },
    {
      id: "protocol",
      tag: "SYS.NETWORK",
      label: "Network Protocols",
      provider: "HTTP/2 & IPv6 Dual Stack",
      category: "Networking & Transport",
      status: "Dual-Stack Active",
      badge: "HTTP/2 + IPv6",
      icon: Network,
      color: "text-cobalt",
      specs: [
        "Full dual-stack IPv4 & IPv6 Anycast DNS resolution (A and AAAA records)",
        "Multiplexed binary streaming via HTTP/2 and HTTP/3 (QUIC) edge support",
        "Header compression (HPACK) eliminating redundant network protocol overhead",
        "Cloudflare Anycast routing ensuring lowest round-trip latency to edge POPs",
      ],
      region: "Anycast DNS & Cloudflare Network",
    },
  ];

  return (
    <div className="border border-[#E5E5DF] bg-white">
      {/* Header with Title and Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E5E5DF] px-5 py-3.5 gap-4 bg-[#FAF9F6]">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="mono text-[10px] font-bold uppercase tracking-[0.2em] text-cobalt">
              ARCH.01 //
            </span>
            <h2 className="mono text-xs font-bold uppercase tracking-wider text-carbon">
              Cloud Architecture & Infrastructure Matrix
            </h2>
            <StatusTag status="optimal">DEVOPS VERIFIED</StatusTag>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Multi-cloud production topography powering <span className="font-mono text-cobalt font-semibold">piyushprasad.in</span> across global edge, database cluster, cryptography, and DevSecOps.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center border border-[#E5E5DF] bg-white text-xs font-mono">
          <button
            onClick={() => setActiveTab("topology")}
            className={`px-3 py-1.5 font-medium transition cursor-pointer ${
              activeTab === "topology"
                ? "bg-cobalt text-white font-semibold"
                : "text-muted-foreground hover:text-carbon"
            }`}
          >
            TOPOLOGY
          </button>
          <button
            onClick={() => setActiveTab("specs")}
            className={`px-3 py-1.5 font-medium transition border-l border-[#E5E5DF] cursor-pointer ${
              activeTab === "specs"
                ? "bg-cobalt text-white font-semibold"
                : "text-muted-foreground hover:text-carbon"
            }`}
          >
            SPECS
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`px-3 py-1.5 font-medium transition border-l border-[#E5E5DF] cursor-pointer ${
              activeTab === "security"
                ? "bg-cobalt text-white font-semibold"
                : "text-muted-foreground hover:text-carbon"
            }`}
          >
            SECURITY
          </button>
        </div>
      </div>
      {/* Main Content Area */}
      <div>
        {activeTab === "topology" && (
          <div className="space-y-0">
            {/* Visual End-to-End Pipeline Telemetry Strip */}
            <div className="border-b border-[#E5E5DF] bg-[#FAF9F6] p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="mono text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  LIVE INGRESS &amp; SERVICE TOPOLOGY ROUTE
                </span>
                <span className="mono text-[9px] font-semibold text-emerald-700 uppercase">
                  [ ACTIVE ANYCAST ROUTING ]
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 border border-[#E5E5DF] divide-y md:divide-y-0 md:divide-x divide-[#E5E5DF] bg-white">
                <div className="p-3 text-center">
                  <div className="flex items-center justify-center gap-1.5 text-cobalt mb-1">
                    <Globe className="h-4 w-4" />
                    <span className="mono text-[10px] font-bold uppercase tracking-wider">CLIENT EDGE</span>
                  </div>
                  <p className="font-semibold text-xs text-carbon">Web Browser / Mobile</p>
                  <p className="mono text-[10px] text-muted-foreground mt-0.5">TLS 1.3 &bull; IPv6 / HTTP/2</p>
                </div>

                <div className="p-3 text-center bg-blue-50/20">
                  <div className="flex items-center justify-center gap-1.5 text-cobalt mb-1">
                    <Server className="h-4 w-4" />
                    <span className="mono text-[10px] font-bold uppercase tracking-wider">VERCEL SERVERLESS</span>
                  </div>
                  <p className="font-semibold text-xs text-carbon">Anycast Global POPs</p>
                  <p className="mono text-[10px] text-cobalt mt-0.5 font-bold">TanStack Start SSR Edge</p>
                </div>

                <div className="p-3 text-center">
                  <div className="flex items-center justify-center gap-1.5 text-purple-700 mb-1">
                    <Database className="h-4 w-4" />
                    <span className="mono text-[10px] font-bold uppercase tracking-wider">PERSISTENCE CLUSTER</span>
                  </div>
                  <p className="font-semibold text-xs text-carbon">Supabase PostgreSQL</p>
                  <p className="mono text-[10px] text-purple-700 mt-0.5">AWS ap-south-1 Mumbai</p>
                </div>
              </div>
            </div>

            {/* Monolithic Architectural Grid (replaces 6 floating cards) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-y lg:divide-y-0 md:divide-x divide-[#E5E5DF] bg-white">
              {architectureNodes.map((node) => {
                const IconComponent = node.icon;
                return (
                  <div key={node.id} className="p-5 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="mono text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                            {node.tag}
                          </span>
                        </div>
                        <StatusTag status="optimal">{node.status.toUpperCase()}</StatusTag>
                      </div>

                      <div className="mt-2">
                        <p className="mono text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                          {node.label}
                        </p>
                        <h3 className="font-bold text-sm text-carbon mt-0.5 font-mono">
                          {node.provider.split("(")[0]}
                        </h3>
                        <p className="text-[11px] text-muted-foreground mt-0.5 font-mono">
                          Region: {node.region}
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-[#E5E5DF] pt-3">
                      <ul className="space-y-1.5 text-[11px] text-muted-foreground">
                        {node.specs.slice(0, 2).map((spec, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="mono text-[9px] text-cobalt font-bold shrink-0">&bull;</span>
                            <span className="leading-snug">{spec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}

              {/* Node 6: AI Inference Engine */}
              <div className="p-5 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-start justify-between">
                    <span className="mono text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                      SYS.AI
                    </span>
                    <StatusTag status="optimal">ONLINE</StatusTag>
                  </div>

                  <div className="mt-2">
                    <p className="mono text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                      AI Inference Gateway
                    </p>
                    <h3 className="font-bold text-sm text-carbon mt-0.5 font-mono">
                      Google Gemini API
                    </h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5 font-mono">
                      Region: Multi-Region /api/chat Proxy
                    </p>
                  </div>
                </div>

                <div className="border-t border-[#E5E5DF] pt-3">
                  <ul className="space-y-1.5 text-[11px] text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="mono text-[9px] text-cobalt font-bold shrink-0">&bull;</span>
                      <span className="leading-snug">Zero client-side key leakage with server-side rate limits</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mono text-[9px] text-cobalt font-bold shrink-0">&bull;</span>
                      <span className="leading-snug">Live prompt telemetry recorded into Supabase chat_activity</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "specs" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E5E5DF] bg-[#FAF9F6] text-muted-foreground uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4 font-semibold mono">Layer</th>
                  <th className="py-3 px-4 font-semibold mono">Production Provider</th>
                  <th className="py-3 px-4 font-semibold mono">Architectural Specifications</th>
                  <th className="py-3 px-4 font-semibold mono">Region</th>
                  <th className="py-3 px-4 font-semibold mono">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5DF] font-mono text-[11px]">
                {architectureNodes.map((node) => (
                  <tr key={node.id} className="hover:bg-[#FAF9F6]/80 transition-colors">
                    <td className="py-3 px-4 text-carbon font-semibold">
                      {node.tag}
                    </td>
                    <td className="py-3 px-4 text-cobalt font-bold">
                      {node.provider.split("(")[0]}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground font-sans text-xs max-w-md">
                      {node.specs[0]}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {node.region}
                    </td>
                    <td className="py-3 px-4">
                      <StatusTag status="optimal">{node.status.toUpperCase()}</StatusTag>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "security" && (
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#E5E5DF] bg-white text-xs">
            <div className="p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="mono text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">SEC.01</span>
                <span className="h-1.5 w-1.5 bg-emerald-600" />
              </div>
              <h4 className="font-mono font-bold text-sm text-carbon">Zero Trust Secrets Policy</h4>
              <p className="text-muted-foreground text-[11px] leading-relaxed font-sans">
                All external API keys (Google Gemini, Supabase Service Role) are kept strictly server-side. The client bundle contains zero sensitive keys, preventing client-side credential scraping.
              </p>
            </div>

            <div className="p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="mono text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">SEC.02</span>
                <span className="h-1.5 w-1.5 bg-cobalt" />
              </div>
              <h4 className="font-mono font-bold text-sm text-carbon">Automated SAST &amp; CVE Sweeps</h4>
              <p className="text-muted-foreground text-[11px] leading-relaxed font-sans">
                Every commit is scanned via GitHub CodeQL Advanced security workflows. Dependabot runs automated security pull requests, keeping packages patched against known CVEs.
              </p>
            </div>

            <div className="p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="mono text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">SEC.03</span>
                <span className="h-1.5 w-1.5 bg-purple-700" />
              </div>
              <h4 className="font-mono font-bold text-sm text-carbon">Row Level Security (RLS)</h4>
              <p className="text-muted-foreground text-[11px] leading-relaxed font-sans">
                The Supabase PostgreSQL database enforces strict Row Level Security. Telemetry tables allow admin-only reading via service-role authentication, preventing unauthorized public data access.
              </p>
            </div>
          </div>
        )}

        {/* DevOps Console Validation Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E5E5DF] bg-[#FAF9F6] px-5 py-3 text-xs text-muted-foreground font-mono">
          <div className="flex flex-wrap items-center gap-4 text-[10px] uppercase tracking-wider">
            <span>EDGE COLD STARTS: &lt;150MS</span>
            <span className="text-[#E5E5DF]">|</span>
            <span>HSTS: 63,072,000S</span>
            <span className="text-[#E5E5DF]">|</span>
            <span>PROTOCOLS: IPV6 / HTTP/2</span>
          </div>

          <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider">
            <span className="h-1.5 w-1.5 bg-emerald-600" />
            <span>HOST: <strong className="text-carbon">PIYUSHPRASAD.IN</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}
