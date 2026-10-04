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
      color: "text-cyan-400",
      bgBorder: "border-cyan-500/30 bg-cyan-950/20",
      pillBg: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
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
      color: "text-purple-400",
      bgBorder: "border-purple-500/30 bg-purple-950/20",
      pillBg: "bg-purple-500/10 text-purple-400 border-purple-500/20",
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
      color: "text-emerald-400",
      bgBorder: "border-emerald-500/30 bg-emerald-950/20",
      pillBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
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
      color: "text-orange-400",
      bgBorder: "border-orange-500/30 bg-orange-950/20",
      pillBg: "bg-orange-500/10 text-orange-400 border-orange-500/20",
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
      color: "text-sky-400",
      bgBorder: "border-sky-500/30 bg-sky-950/20",
      pillBg: "bg-sky-500/10 text-sky-400 border-sky-500/20",
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
    <div className="rounded-xl border border-slate-800 bg-slate-900/70 shadow-2xl backdrop-blur-sm overflow-hidden">
      {/* Header with Title and Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800/80 px-6 py-4 gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <Layers className="h-5 w-5 text-cyan-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-100">
              Cloud Architecture & Infrastructure Matrix
            </h2>
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              DevOps Verified
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Multi-cloud production topography powering <span className="font-mono text-cyan-300">piyushprasad.in</span> across global edge, database cluster, cryptography, and DevSecOps.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center rounded-lg border border-slate-800 bg-slate-950 p-1 text-xs">
          <button
            onClick={() => setActiveTab("topology")}
            className={`rounded-md px-3 py-1 font-medium transition ${
              activeTab === "topology"
                ? "bg-cyan-500/20 text-cyan-300 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Topology View
          </button>
          <button
            onClick={() => setActiveTab("specs")}
            className={`rounded-md px-3 py-1 font-medium transition ${
              activeTab === "specs"
                ? "bg-cyan-500/20 text-cyan-300 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            DevOps Specs
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`rounded-md px-3 py-1 font-medium transition ${
              activeTab === "security"
                ? "bg-cyan-500/20 text-cyan-300 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
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
            <div className="rounded-lg border border-slate-800/80 bg-slate-950/70 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-3">
                Live Ingress & Service Topology Flow
              </p>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center text-xs">
                {/* Node 1: Client Ingress */}
                <div className="rounded-lg border border-slate-800 bg-slate-900/90 p-3 text-center">
                  <Globe className="h-4 w-4 text-cyan-400 mx-auto mb-1" />
                  <p className="font-semibold text-slate-200">Client / Browser</p>
                  <p className="text-[10px] text-slate-500 font-mono">IPv6 &bull; HTTP/2</p>
                </div>

                <div className="hidden md:flex justify-center text-cyan-500/60 font-mono text-[10px]">
                  <span>TLS 1.3 &rarr;</span>
                </div>

                {/* Node 2: Vercel Edge */}
                <div className="rounded-lg border border-cyan-500/30 bg-cyan-950/20 p-3 text-center">
                  <Server className="h-4 w-4 text-cyan-400 mx-auto mb-1" />
                  <p className="font-semibold text-slate-100">Vercel Edge CDN</p>
                  <p className="text-[10px] text-cyan-400 font-mono">Global POPs &bull; SSR</p>
                </div>

                <div className="hidden md:flex justify-center text-purple-500/60 font-mono text-[10px]">
                  <span>Serverless &rarr;</span>
                </div>

                {/* Node 3: Supabase AWS */}
                <div className="rounded-lg border border-purple-500/30 bg-purple-950/20 p-3 text-center">
                  <Database className="h-4 w-4 text-purple-400 mx-auto mb-1" />
                  <p className="font-semibold text-slate-100">Supabase PostgreSQL</p>
                  <p className="text-[10px] text-purple-400 font-mono">AWS ap-south-1</p>
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
                    className={`rounded-xl border ${node.bgBorder} p-4 transition-all duration-200 hover:border-slate-700 hover:bg-slate-950/80`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`rounded-lg p-2.5 bg-slate-900/90 border border-slate-800 ${node.color}`}>
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                            {node.label}
                          </p>
                          <h3 className="font-semibold text-sm text-slate-100 leading-snug">
                            {node.provider.split(" ")[0]} {node.provider.split(" ")[1]}
                          </h3>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-semibold ${node.pillBg}`}>
                        <CheckCircle2 className="h-3 w-3" />
                        {node.status}
                      </span>
                    </div>

                    <div className="mt-3.5 pt-3 border-t border-slate-800/80">
                      <p className="text-xs font-mono font-medium text-slate-300">
                        {node.provider}
                      </p>
                      <p className="mt-1 text-[11px] text-slate-500">
                        <span className="font-semibold text-slate-400">Deployment Region:</span> {node.region}
                      </p>
                    </div>

                    <ul className="mt-3 space-y-1.5 text-[11px] text-slate-400">
                      {node.specs.slice(0, 2).map((spec, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className={`mt-1 h-1 w-1 rounded-full ${node.color.replace("text-", "bg-")}`} />
                          <span>{spec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}

              {/* Bonus Card 6: AI Inference Engine */}
              <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/20 p-4 transition-all duration-200 hover:border-slate-700 hover:bg-slate-950/80">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg p-2.5 bg-slate-900/90 border border-slate-800 text-indigo-400">
                      <Bot className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        AI Inference Gateway
                      </p>
                      <h3 className="font-semibold text-sm text-slate-100 leading-snug">
                        Google Gemini API
                      </h3>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
                    <CheckCircle2 className="h-3 w-3" />
                    Online
                  </span>
                </div>

                <div className="mt-3.5 pt-3 border-t border-slate-800/80">
                  <p className="text-xs font-mono font-medium text-slate-300">
                    Grounded Knowledge Model (/api/chat)
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-400">Security:</span> Zero client-side key leakage &bull; 10 req/hr rate limit
                  </p>
                </div>

                <ul className="mt-3 space-y-1.5 text-[11px] text-slate-400">
                  <li className="flex items-start gap-1.5">
                    <span className="mt-1 h-1 w-1 rounded-full bg-indigo-400" />
                    <span>Serverless token-efficient proxy with retry backoff</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="mt-1 h-1 w-1 rounded-full bg-indigo-400" />
                    <span>Live telemetry logged to Supabase chat_activity table</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === "specs" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="pb-3 pr-4 font-semibold">Infrastructure Layer</th>
                  <th className="pb-3 pr-4 font-semibold">Production Technology</th>
                  <th className="pb-3 pr-4 font-semibold">Architectural Specifications</th>
                  <th className="pb-3 pr-4 font-semibold">Region / Cluster</th>
                  <th className="pb-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {architectureNodes.map((node) => (
                  <tr key={node.id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="py-3.5 pr-4 text-slate-200 font-sans font-semibold">
                      {node.label}
                    </td>
                    <td className="py-3.5 pr-4 text-cyan-300 font-bold">
                      {node.provider}
                    </td>
                    <td className="py-3.5 pr-4 text-slate-400 font-sans text-[11px] max-w-md">
                      {node.specs[0]}
                    </td>
                    <td className="py-3.5 pr-4 text-slate-400 text-[11px]">
                      {node.region}
                    </td>
                    <td className="py-3.5">
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
            <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-2">
                <Lock className="h-4 w-4" />
                <span>Zero Trust Secrets Policy</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                All external API keys (Google Gemini, Supabase Service Role) are kept strictly server-side. The client bundle contains zero sensitive keys, preventing client-side decompilation or credential scraping.
              </p>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4">
              <div className="flex items-center gap-2 text-cyan-400 font-semibold mb-2">
                <ShieldCheck className="h-4 w-4" />
                <span>Automated SAST & CVE Sweeps</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Every commit is scanned via GitHub CodeQL Advanced security workflows. Dependabot runs automated security pull requests, keeping packages patched against known CVEs.
              </p>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4">
              <div className="flex items-center gap-2 text-purple-400 font-semibold mb-2">
                <Database className="h-4 w-4" />
                <span>Row Level Security (RLS)</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                The Supabase PostgreSQL database enforces strict Row Level Security. Telemetry tables allow admin-only reading via service-role authentication, preventing unauthorized public data access.
              </p>
            </div>
          </div>
        )}

        {/* DevOps Skillset Validation Footer */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/80 pt-4 text-xs text-slate-500">
          <div className="flex flex-wrap items-center gap-4 font-mono text-[11px]">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Zap className="h-3.5 w-3.5 text-yellow-400" />
              Edge Cold Starts: &lt; 150ms
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              HSTS max-age: 63,072,000s
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <Network className="h-3.5 w-3.5 text-cyan-400" />
              IPv6 / HTTP/2 Dual-Stack
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-sans text-slate-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span>Target: <strong className="text-slate-200 font-mono">piyushprasad.in</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}
