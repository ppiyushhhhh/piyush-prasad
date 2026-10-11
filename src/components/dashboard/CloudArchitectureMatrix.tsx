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

export function CloudArchitectureMatrix() {
  const [activeTab, setActiveTab] = useState<"topology" | "specs" | "security">("topology");

  const architectureNodes = [
    {
      id: "edge",
      label: "Edge CDN & Hosting",
      provider: "Vercel Serverless (Global Edge Network)",
      category: "Compute & Ingress",
      status: "Operational",
      badge: "Sub-50ms TTFB",
      icon: Globe,
      color: "text-cobalt",
      bgBorder: "border-[#E5E5DF] bg-white",
      pillBg: "bg-blue-50 text-cobalt border-blue-200",
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
      label: "Database Cluster",
      provider: "Supabase PostgreSQL (AWS ap-south-1 Mumbai)",
      category: "Data & Persistence",
      status: "Connected",
      badge: "AWS ap-south-1",
      icon: Database,
      color: "text-purple-600",
      bgBorder: "border-[#E5E5DF] bg-white",
      pillBg: "bg-purple-50 text-purple-700 border-purple-200",
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
      label: "TLS & Encryption",
      provider: "TLS 1.3 / Strict-Transport-Security / Google Trust Services",
      category: "Cryptography & SSL",
      status: "A+ Verified",
      badge: "Expires Dec 6, 2026",
      icon: Lock,
      color: "text-emerald-600",
      bgBorder: "border-[#E5E5DF] bg-white",
      pillBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
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
      label: "Security Automation",
      provider: "GitHub CodeQL (SAST) & Dependabot",
      category: "DevSecOps & CI/CD",
      status: "Passing",
      badge: "238+ Automated Runs",
      icon: ShieldCheck,
      color: "text-orange-600",
      bgBorder: "border-[#E5E5DF] bg-white",
      pillBg: "bg-orange-50 text-orange-700 border-orange-200",
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
      label: "Network Protocols",
      provider: "HTTP/2 & IPv6 Dual Stack",
      category: "Networking & Transport",
      status: "Dual-Stack Active",
      badge: "HTTP/2 + IPv6",
      icon: Network,
      color: "text-sky-600",
      bgBorder: "border-[#E5E5DF] bg-white",
      pillBg: "bg-sky-50 text-sky-700 border-sky-200",
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
    <div className="rounded-sm border border-[#E5E5DF] bg-white shadow-2xs overflow-hidden">
      {/* Header with Title and Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E5E5DF] px-6 py-4 gap-4 bg-[#FAF9F6]/50">
        <div>
          <div className="flex items-center gap-2.5">
            <Layers className="h-5 w-5 text-cobalt" />
            <h2 className="mono text-xs font-bold uppercase tracking-wider text-carbon">
              Cloud Architecture & Infrastructure Matrix
            </h2>
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              DevOps Verified
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Multi-cloud production topography powering <span className="font-mono text-cobalt font-semibold">piyushprasad.in</span> across global edge, database cluster, cryptography, and DevSecOps.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center rounded-sm border border-[#E5E5DF] bg-[#FAF9F6] p-1 text-xs">
          <button
            onClick={() => setActiveTab("topology")}
            className={`rounded-sm px-3 py-1 font-medium transition ${
              activeTab === "topology"
                ? "bg-cobalt text-white shadow-2xs font-semibold"
                : "text-muted-foreground hover:text-carbon"
            }`}
          >
            Topology View
          </button>
          <button
            onClick={() => setActiveTab("specs")}
            className={`rounded-sm px-3 py-1 font-medium transition ${
              activeTab === "specs"
                ? "bg-cobalt text-white shadow-2xs font-semibold"
                : "text-muted-foreground hover:text-carbon"
            }`}
          >
            DevOps Specs
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`rounded-sm px-3 py-1 font-medium transition ${
              activeTab === "security"
                ? "bg-cobalt text-white shadow-2xs font-semibold"
                : "text-muted-foreground hover:text-carbon"
            }`}
          >
            Security & Compliance
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-6">
        {activeTab === "topology" && (
          <div className="space-y-6">
            {/* Visual End-to-End Topology Banner */}
            <div className="rounded-sm border border-[#E5E5DF] bg-[#FAF9F6]/60 p-4">
              <p className="mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Live Ingress & Service Topology Flow
              </p>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center text-xs">
                {/* Node 1: Client Ingress */}
                <div className="rounded-sm border border-[#E5E5DF] bg-white p-3 text-center shadow-2xs">
                  <Globe className="h-4 w-4 text-cobalt mx-auto mb-1" />
                  <p className="font-semibold text-carbon">Client / Browser</p>
                  <p className="text-[10px] text-muted-foreground font-mono">IPv6 &bull; HTTP/2</p>
                </div>

                <div className="hidden md:flex justify-center text-cobalt font-mono text-[10px] font-semibold">
                  <span>TLS 1.3 &rarr;</span>
                </div>

                {/* Node 2: Vercel Edge */}
                <div className="rounded-sm border border-[#E5E5DF] bg-white p-3 text-center shadow-2xs">
                  <Server className="h-4 w-4 text-cobalt mx-auto mb-1" />
                  <p className="font-semibold text-carbon">Vercel Edge CDN</p>
                  <p className="text-[10px] text-cobalt font-mono">Global POPs &bull; SSR</p>
                </div>

                <div className="hidden md:flex justify-center text-purple-600 font-mono text-[10px] font-semibold">
                  <span>Serverless &rarr;</span>
                </div>

                {/* Node 3: Supabase AWS */}
                <div className="rounded-sm border border-[#E5E5DF] bg-white p-3 text-center shadow-2xs">
                  <Database className="h-4 w-4 text-purple-600 mx-auto mb-1" />
                  <p className="font-semibold text-carbon">Supabase PostgreSQL</p>
                  <p className="text-[10px] text-purple-600 font-mono">AWS ap-south-1</p>
                </div>
              </div>
            </div>

            {/* The 5 Key Cloud Architecture Nodes */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {architectureNodes.map((node) => {
                const IconComponent = node.icon;
                return (
                  <div
                    key={node.id}
                    className="rounded-sm border border-[#E5E5DF] bg-white p-4 shadow-2xs transition-all duration-200 hover:border-cobalt/40"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`rounded-sm p-2 bg-[#FAF9F6] border border-[#E5E5DF] ${node.color}`}>
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                            {node.label}
                          </p>
                          <h3 className="font-semibold text-sm text-carbon leading-snug">
                            {node.provider.split(" ")[0]} {node.provider.split(" ")[1]}
                          </h3>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1 rounded-sm border px-2 py-0.5 text-[10px] font-semibold ${node.pillBg}`}>
                        <CheckCircle2 className="h-3 w-3" />
                        {node.status}
                      </span>
                    </div>

                    <div className="mt-3.5 pt-3 border-t border-[#E5E5DF]">
                      <p className="text-xs font-mono font-medium text-carbon">
                        {node.provider}
                      </p>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        <span className="font-semibold text-carbon/80">Deployment Region:</span> {node.region}
                      </p>
                    </div>

                    <ul className="mt-3 space-y-1.5 text-[11px] text-muted-foreground">
                      {node.specs.slice(0, 2).map((spec, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="mt-1.5 h-1 w-1 rounded-full bg-cobalt shrink-0" />
                          <span>{spec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}

              {/* Bonus Card 6: AI Inference Engine */}
              <div className="rounded-sm border border-[#E5E5DF] bg-white p-4 shadow-2xs transition-all duration-200 hover:border-cobalt/40">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-sm p-2 bg-[#FAF9F6] border border-[#E5E5DF] text-indigo-600">
                      <Bot className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        AI Inference Gateway
                      </p>
                      <h3 className="font-semibold text-sm text-carbon leading-snug">
                        Google Gemini API
                      </h3>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-sm border px-2 py-0.5 text-[10px] font-semibold bg-indigo-50 text-indigo-700 border-indigo-200">
                    <CheckCircle2 className="h-3 w-3" />
                    Online
                  </span>
                </div>

                <div className="mt-3.5 pt-3 border-t border-[#E5E5DF]">
                  <p className="text-xs font-mono font-medium text-carbon">
                    Grounded Knowledge Model (/api/chat)
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    <span className="font-semibold text-carbon/80">Security:</span> Zero client-side key leakage &bull; 10 req/hr rate limit
                  </p>
                </div>

                <ul className="mt-3 space-y-1.5 text-[11px] text-muted-foreground">
                  <li className="flex items-start gap-1.5">
                    <span className="mt-1.5 h-1 w-1 rounded-full bg-indigo-600 shrink-0" />
                    <span>Serverless token-efficient proxy with retry backoff</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="mt-1.5 h-1 w-1 rounded-full bg-indigo-600 shrink-0" />
                    <span>Live telemetry logged to Supabase chat_activity table</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === "specs" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E5E5DF] bg-[#FAF9F6]/60 text-muted-foreground uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-4 font-semibold mono">Infrastructure Layer</th>
                  <th className="py-2.5 px-4 font-semibold mono">Production Technology</th>
                  <th className="py-2.5 px-4 font-semibold mono">Architectural Specifications</th>
                  <th className="py-2.5 px-4 font-semibold mono">Region / Cluster</th>
                  <th className="py-2.5 px-4 font-semibold mono">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5DF]/60 font-mono">
                {architectureNodes.map((node) => (
                  <tr key={node.id} className="hover:bg-[#FAF9F6]/50 transition-colors">
                    <td className="py-3 px-4 text-carbon font-sans font-semibold">
                      {node.label}
                    </td>
                    <td className="py-3 px-4 text-cobalt font-bold">
                      {node.provider}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground font-sans text-[11px] max-w-md">
                      {node.specs[0]}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground text-[11px]">
                      {node.region}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-semibold border ${node.pillBg}`}>
                        <CheckCircle2 className="h-3 w-3" />
                        {node.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "security" && (
          <div className="grid gap-4 md:grid-cols-3 text-xs">
            <div className="rounded-sm border border-[#E5E5DF] bg-[#FAF9F6]/50 p-4">
              <div className="flex items-center gap-2 text-emerald-700 font-semibold mb-2">
                <Lock className="h-4 w-4" />
                <span>Zero Trust Secrets Policy</span>
              </div>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                All external API keys (Google Gemini, Supabase Service Role) are kept strictly server-side. The client bundle contains zero sensitive keys, preventing client-side decompilation or credential scraping.
              </p>
            </div>

            <div className="rounded-sm border border-[#E5E5DF] bg-[#FAF9F6]/50 p-4">
              <div className="flex items-center gap-2 text-cobalt font-semibold mb-2">
                <ShieldCheck className="h-4 w-4" />
                <span>Automated SAST & CVE Sweeps</span>
              </div>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                Every commit is scanned via GitHub CodeQL Advanced security workflows. Dependabot runs automated security pull requests, keeping packages patched against known CVEs.
              </p>
            </div>

            <div className="rounded-sm border border-[#E5E5DF] bg-[#FAF9F6]/50 p-4">
              <div className="flex items-center gap-2 text-purple-700 font-semibold mb-2">
                <Database className="h-4 w-4" />
                <span>Row Level Security (RLS)</span>
              </div>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                The Supabase PostgreSQL database enforces strict Row Level Security. Telemetry tables allow admin-only reading via service-role authentication, preventing unauthorized public data access.
              </p>
            </div>
          </div>
        )}

        {/* DevOps Skillset Validation Footer */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#E5E5DF] pt-4 text-xs text-muted-foreground">
          <div className="flex flex-wrap items-center gap-4 font-mono text-[11px]">
            <span className="flex items-center gap-1.5 text-carbon/80">
              <Zap className="h-3.5 w-3.5 text-amber-500" />
              Edge Cold Starts: &lt; 150ms
            </span>
            <span className="flex items-center gap-1.5 text-carbon/80">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              HSTS max-age: 63,072,000s
            </span>
            <span className="flex items-center gap-1.5 text-carbon/80">
              <Network className="h-3.5 w-3.5 text-cobalt" />
              IPv6 / HTTP/2 Dual-Stack
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-sans text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Target: <strong className="text-carbon font-mono">piyushprasad.in</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}
