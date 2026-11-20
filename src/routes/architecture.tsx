import { useState, useMemo, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Layers,
  Network,
  Shield,
  Server,
  Terminal,
  Activity,
  ArrowRight,
  ExternalLink,
  FolderGit2,
  CheckCircle2,
  Info,
  RefreshCw,
  Sparkles,
  Bot,
  Globe,
} from "lucide-react";

import { Navigation } from "@/components/portfolio/Navigation";
import { Footer } from "@/components/portfolio/Footer";
import { CommandPalette } from "@/components/portfolio/CommandPalette";
import { CustomCursor } from "@/components/portfolio/CustomCursor";
import { AskPiyushAI } from "@/components/portfolio/AskPiyushAI";
import { ArchitectureCanvas } from "@/components/architecture/ArchitectureCanvas";
import { ComponentInspector } from "@/components/architecture/ComponentInspector";
import { ArchitectureLegend } from "@/components/architecture/ArchitectureLegend";
import {
  fetchPublishedArchitectures,
  INITIAL_ARCHITECTURES,
  type ArchitectureDiagram,
  type ArchitectureNode,
  type ArchitectureEdge,
  type ArchitectureViewMode,
} from "@/lib/architecture-diagrams";
import { SITE_URL } from "@/lib/site";

export const Route = createFileRoute("/architecture")({
  validateSearch: (search: Record<string, unknown>): { diagram?: string } => ({
    diagram: typeof search.diagram === "string" ? search.diagram : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Interactive Infrastructure Architecture Explorer | Piyush Prasad" },
      {
        name: "description",
        content:
          "Explore interactive cloud infrastructure topologies, deployment pipelines, network flows, and security boundaries behind production engineering projects by Piyush Prasad.",
      },
      {
        property: "og:title",
        content: "Interactive Infrastructure Architecture Explorer | Piyush Prasad",
      },
      {
        property: "og:description",
        content:
          "Explore interactive cloud infrastructure topologies, deployment pipelines, network flows, and security boundaries behind production engineering projects by Piyush Prasad.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/architecture` },
      { property: "og:image", content: `${SITE_URL}/og-image.png` },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:title",
        content: "Interactive Infrastructure Architecture Explorer | Piyush Prasad",
      },
      {
        name: "twitter:description",
        content:
          "Explore interactive cloud infrastructure topologies, deployment pipelines, network flows, and security boundaries behind production engineering projects by Piyush Prasad.",
      },
      { name: "twitter:image", content: `${SITE_URL}/og-image.png` },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/architecture` }],
  }),

  component: ArchitectureExplorerPage,
});

const VIEW_MODES: { id: ArchitectureViewMode; label: string; icon: typeof Layers }[] = [
  { id: "topology", label: "Topology View", icon: Layers },
  { id: "network", label: "Network Flow", icon: Network },
  { id: "security", label: "Security & RLS", icon: Shield },
  { id: "infrastructure", label: "Infrastructure", icon: Server },
  { id: "deployment", label: "CI/CD & Deploy", icon: Terminal },
];

function ArchitectureExplorerPage() {
  const { diagram } = Route.useSearch();
  const navigate = Route.useNavigate();

  const { data: architectures = INITIAL_ARCHITECTURES, isLoading } = useQuery({
    queryKey: ["published-architectures"],
    queryFn: fetchPublishedArchitectures,
    initialData: INITIAL_ARCHITECTURES,
  });

  const [selectedSlug, setSelectedSlug] = useState<string>(
    () => diagram || "personal-portfolio"
  );
  const [viewMode, setViewMode] = useState<ArchitectureViewMode>("topology");
  const [selectedNode, setSelectedNode] = useState<ArchitectureNode | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<ArchitectureEdge | null>(null);

  // Sync if URL query param changes
  useEffect(() => {
    if (diagram && diagram !== selectedSlug) {
      setSelectedSlug(diagram);
      setSelectedNode(null);
      setSelectedEdge(null);
    }
  }, [diagram, selectedSlug]);

  // Active architecture
  const currentArchitecture = useMemo(() => {
    return (
      architectures.find((a) => a.slug === selectedSlug) ||
      architectures[0] ||
      INITIAL_ARCHITECTURES[0]
    );
  }, [architectures, selectedSlug]);

  // Handle switching architecture tab
  const handleSelectArchitecture = (slug: string) => {
    setSelectedSlug(slug);
    setSelectedNode(null);
    setSelectedEdge(null);
    navigate({ search: { diagram: slug }, replace: true });
  };

  return (
    <div className="relative min-h-screen bg-[#FAF9F6] text-carbon selection:bg-cobalt selection:text-white dark:bg-[#0E0F12] dark:text-neutral-100">
      <CustomCursor />
      <Navigation />

      <main className="pt-24 md:pt-32 pb-24">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10">
          {/* Header Introduction */}
          <div className="border-b border-border/80 pb-8 mb-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="mono text-[10px] font-bold uppercase tracking-[0.2em] text-cobalt">
                    SYSTEM.03 // INFRASTRUCTURE EXPLORER
                  </span>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="mono text-[9px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase">
                    [ PRODUCTION VERIFIED ]
                  </span>
                </div>
                <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-carbon dark:text-white">
                  Interactive Infrastructure Architecture Explorer
                </h1>
                <p className="mt-3 text-sm md:text-base text-muted-foreground max-w-3xl leading-relaxed">
                  Inspect the real-world cloud infrastructure, application runtime topologies,
                  automated deployment pipelines, and security boundaries behind my engineering
                  projects. Click any component to inspect live technical specifications, active
                  ports, and security controls.
                </p>
              </div>

              {/* Related Projects Link */}
              <div className="flex items-center gap-3">
                <Link
                  to="/projects"
                  className="mono inline-flex items-center gap-1.5 border border-border bg-white dark:bg-neutral-900 px-3.5 py-2 text-xs font-semibold text-carbon dark:text-neutral-200 transition-colors hover:border-cobalt hover:text-cobalt shadow-2xs"
                >
                  <FolderGit2 className="h-3.5 w-3.5 text-cobalt" />
                  <span>ALL CASE STUDIES</span>
                </Link>
              </div>
            </div>

            {/* Architecture Selector Pills */}
            <div className="mt-8 flex flex-wrap items-center gap-2 pt-6 border-t border-border/60">
              <span className="mono text-[10px] uppercase font-bold tracking-wider text-muted-foreground mr-2">
                SELECT ARCHITECTURE:
              </span>
              {architectures.map((arch) => {
                const isSelected = arch.slug === selectedSlug;
                return (
                  <button
                    key={arch.id}
                    type="button"
                    onClick={() => handleSelectArchitecture(arch.slug)}
                    className={`mono text-xs px-3.5 py-1.5 rounded-md border transition-all cursor-pointer ${
                      isSelected
                        ? "border-cobalt bg-cobalt text-white font-bold shadow-xs"
                        : "border-border bg-white dark:bg-neutral-900 text-carbon dark:text-neutral-300 hover:border-cobalt/60 hover:text-cobalt"
                    }`}
                  >
                    {arch.title}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Architecture Overview Strip */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
            <div className="lg:col-span-3 p-4 rounded-lg border border-border bg-white dark:bg-[#121316] shadow-2xs">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="mono text-[10px] font-bold uppercase tracking-wider text-cobalt">
                  {currentArchitecture.architecture_type}
                </span>
                <span className="mono text-[10px] text-muted-foreground">&bull;</span>
                <span className="mono text-[10px] text-muted-foreground font-semibold">
                  {currentArchitecture.diagram_data.nodes.length} Components
                </span>
                <span className="mono text-[10px] text-muted-foreground">&bull;</span>
                <span className="mono text-[10px] text-muted-foreground font-semibold">
                  {currentArchitecture.diagram_data.edges.length} Data Connections
                </span>
              </div>
              <h2 className="text-lg md:text-xl font-bold text-carbon dark:text-white">
                {currentArchitecture.title}
              </h2>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                {currentArchitecture.description}
              </p>
            </div>

            {/* View Mode Switcher */}
            <div className="p-4 rounded-lg border border-border bg-white dark:bg-[#121316] shadow-2xs flex flex-col justify-between">
              <span className="mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 block">
                LAYER VIEW MODES:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-1.5">
                {VIEW_MODES.map((mode) => {
                  const Icon = mode.icon;
                  const isActive = viewMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setViewMode(mode.id)}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded text-left transition-all cursor-pointer ${
                        isActive
                          ? "bg-cobalt text-white font-semibold"
                          : "text-muted-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-carbon"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-3.5 w-3.5" />
                        <span className="mono text-[11px]">{mode.label}</span>
                      </div>
                      <span className="mono text-[9px] opacity-80">
                        {isActive ? "[ACTIVE]" : "→"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Interactive Canvas + Inspector Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Main Interactive Diagram Canvas */}
            <div className={`${selectedNode || selectedEdge ? "lg:col-span-8" : "lg:col-span-12"} transition-all`}>
              <ArchitectureCanvas
                data={currentArchitecture.diagram_data}
                viewMode={viewMode}
                selectedNode={selectedNode}
                selectedEdge={selectedEdge}
                onSelectNode={(node) => {
                  setSelectedNode(node);
                  if (node) setSelectedEdge(null);
                }}
                onSelectEdge={(edge) => {
                  setSelectedEdge(edge);
                  if (edge) setSelectedNode(null);
                }}
                isEditable={false}
              />
            </div>

            {/* Component Inspector Panel */}
            {(selectedNode || selectedEdge) && (
              <div className="lg:col-span-4 rounded-lg overflow-hidden border border-border bg-white dark:bg-[#121316] shadow-md sticky top-28">
                <ComponentInspector
                  node={selectedNode}
                  edge={selectedEdge}
                  edges={currentArchitecture.diagram_data.edges}
                  allNodes={currentArchitecture.diagram_data.nodes}
                  onClose={() => {
                    setSelectedNode(null);
                    setSelectedEdge(null);
                  }}
                  onSelectNode={(node) => {
                    setSelectedNode(node);
                    setSelectedEdge(null);
                  }}
                />
              </div>
            )}
          </div>

          {/* Technical Legend */}
          <div className="mt-8">
            <ArchitectureLegend />
          </div>

          {/* Infrastructure Layer Deep-Dive Cards */}
          <div className="mt-12 space-y-4">
            <div className="flex items-center gap-2">
              <span className="mono text-[10px] font-bold uppercase tracking-widest text-cobalt">
                VERIFIED TECHNICAL SPECIFICATIONS
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-cobalt" />
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-carbon dark:text-white">
              Component Inventory &amp; Node Specifications
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {currentArchitecture.diagram_data.nodes.map((node) => {
                const isSelected = selectedNode?.id === node.id;
                return (
                  <button
                    key={node.id}
                    type="button"
                    onClick={() => {
                      setSelectedNode(node);
                      window.scrollTo({ top: 320, behavior: "smooth" });
                    }}
                    className={`p-4 rounded-lg border text-left bg-white dark:bg-[#121316] transition-all cursor-pointer ${
                      isSelected
                        ? "border-cobalt ring-2 ring-cobalt/20 shadow-md"
                        : "border-border hover:border-cobalt/60 hover:shadow-2xs"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="mono text-[9px] uppercase font-bold text-cobalt">
                        {node.category}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {node.verification && (
                          <span
                            className={`mono text-[8.5px] font-bold px-1.5 py-0.5 rounded border ${
                              node.verification === "code"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                                : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
                            }`}
                          >
                            {node.verification === "code" ? "Code" : "Docs"}
                          </span>
                        )}
                        {node.port && (
                          <span className="mono text-[9px] text-muted-foreground">{node.port}</span>
                        )}
                      </div>
                    </div>
                    <h4 className="text-sm font-bold text-carbon dark:text-white">{node.name}</h4>
                    <p className="mono text-[11px] text-cobalt font-semibold mt-0.5">{node.tech}</p>
                    <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                      {node.description}
                    </p>
                    <div className="mt-3 pt-2 border-t border-border/70 flex items-center justify-between text-[10px] text-muted-foreground">
                      <span className="mono truncate max-w-[150px]">{node.provider}</span>
                      <span className="text-cobalt font-semibold">Inspect &rarr;</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Verified Data Flow & Connection Matrix Table */}
          <div className="mt-12 space-y-4">
            <div className="flex items-center gap-2">
              <span className="mono text-[10px] font-bold uppercase tracking-widest text-cobalt">
                VERIFIED INTERACTION MATRIX
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-cobalt" />
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-carbon dark:text-white">
              Data Flow Connections &amp; Protocols
            </h3>

            <div className="overflow-x-auto rounded-lg border border-border bg-white dark:bg-[#121316] shadow-2xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border bg-[#FAF9F6] dark:bg-neutral-900/60 mono text-[10px] uppercase text-muted-foreground">
                    <th className="p-3.5 font-bold">Source Node</th>
                    <th className="p-3.5 font-bold">Target Node</th>
                    <th className="p-3.5 font-bold">Connection Label</th>
                    <th className="p-3.5 font-bold">Protocol / Wire</th>
                    <th className="p-3.5 font-bold">Category</th>
                    <th className="p-3.5 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {currentArchitecture.diagram_data.edges.map((edge) => {
                    const sourceNode = currentArchitecture.diagram_data.nodes.find(
                      (n) => n.id === edge.source
                    );
                    const targetNode = currentArchitecture.diagram_data.nodes.find(
                      (n) => n.id === edge.target
                    );
                    const isSelected = selectedEdge?.id === edge.id;

                    return (
                      <tr
                        key={edge.id}
                        className={`transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900/40 ${
                          isSelected ? "bg-blue-50/60 dark:bg-blue-950/20 font-semibold" : ""
                        }`}
                      >
                        <td className="p-3.5">
                          <span className="font-bold text-carbon dark:text-white block">
                            {sourceNode?.name || edge.source}
                          </span>
                          <span className="mono text-[10px] text-muted-foreground">
                            {sourceNode?.tech}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className="font-bold text-carbon dark:text-white block">
                            {targetNode?.name || edge.target}
                          </span>
                          <span className="mono text-[10px] text-muted-foreground">
                            {targetNode?.tech}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className="text-carbon dark:text-neutral-200">
                            {edge.label || edge.protocol}
                          </span>
                          {edge.description && (
                            <span className="text-[11px] text-muted-foreground block line-clamp-1 mt-0.5">
                              {edge.description}
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 mono text-[11px] text-cobalt font-semibold">
                          {edge.protocol || "TCP/IP"}
                        </td>
                        <td className="p-3.5">
                          <span className="mono text-[9px] uppercase px-2 py-0.5 rounded font-bold border border-border/80 bg-[#FAF9F6] dark:bg-neutral-900 text-carbon dark:text-neutral-300">
                            {edge.category}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedEdge(edge);
                              setSelectedNode(null);
                              window.scrollTo({ top: 320, behavior: "smooth" });
                            }}
                            className="mono text-xs text-cobalt font-bold hover:underline cursor-pointer"
                          >
                            Inspect &rarr;
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <CommandPalette />
      <AskPiyushAI />
    </div>
  );
}
