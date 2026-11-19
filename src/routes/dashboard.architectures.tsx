import { useState, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Network,
  Plus,
  RefreshCw,
  Search,
  ExternalLink,
  Trash2,
  Edit3,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Layers,
  ArrowRight,
  Server,
  Database,
  Globe,
  Shield,
  Cpu,
  Bot,
  Terminal,
  Activity,
  HardDrive,
  X,
  Check,
  Move,
  AlertTriangle,
  FolderGit2,
} from "lucide-react";
import { toast } from "sonner";

import {
  fetchAllArchitecturesAdmin,
  createArchitecture,
  updateArchitecture,
  deleteArchitecture,
  toggleArchitecturePublish,
  type ArchitectureDiagram,
  type ArchitectureDiagramInput,
  type ArchitectureNode,
  type ArchitectureEdge,
  type ArchitectureCategory,
  type ArchitectureViewMode,
  INITIAL_ARCHITECTURES,
} from "@/lib/architecture-diagrams";
import { ArchitectureCanvas } from "@/components/architecture/ArchitectureCanvas";
import { ComponentInspector } from "@/components/architecture/ComponentInspector";
import {
  PageHeader,
  TelemetryMatrix,
  TelemetryCell,
  Panel,
  EmptyState,
} from "@/components/dashboard/primitives";
import { LoadingState, ErrorState } from "@/components/dashboard/state";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/dashboard/architectures")({
  head: () => ({
    meta: [
      { title: "Architecture Manager — Operations Console" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: DashboardArchitecturesPage,
});

const CATEGORIES: ArchitectureCategory[] = [
  "client",
  "dns",
  "cdn",
  "networking",
  "compute",
  "application",
  "database",
  "storage",
  "security",
  "monitoring",
  "cicd",
  "ai",
];

function DashboardArchitecturesPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArchitectureId, setSelectedArchitectureId] = useState<string>("");
  const [viewMode, setViewMode] = useState<ArchitectureViewMode>("topology");
  const [selectedNode, setSelectedNode] = useState<ArchitectureNode | null>(null);

  // Modal dialog states
  const [isDiagramModalOpen, setIsDiagramModalOpen] = useState(false);
  const [isNodeModalOpen, setIsNodeModalOpen] = useState(false);
  const [isEdgeModalOpen, setIsEdgeModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Editing targets
  const [editingDiagram, setEditingDiagram] = useState<ArchitectureDiagram | null>(null);
  const [editingNode, setEditingNode] = useState<ArchitectureNode | null>(null);
  const [editingEdge, setEditingEdge] = useState<ArchitectureEdge | null>(null);
  const [deletingDiagram, setDeletingDiagram] = useState<ArchitectureDiagram | null>(null);

  // Diagram form data
  const [diagramForm, setDiagramForm] = useState<{
    title: string;
    slug: string;
    description: string;
    architecture_type: string;
    is_published: boolean;
    display_order: number;
  }>({
    title: "",
    slug: "",
    description: "",
    architecture_type: "Full-Stack Cloud & Edge",
    is_published: true,
    display_order: 0,
  });

  // Node form data
  const [nodeForm, setNodeForm] = useState<{
    id: string;
    name: string;
    category: ArchitectureCategory;
    tech: string;
    provider: string;
    description: string;
    port: string;
    region: string;
    responsibilities: string;
    configuration: string;
    security_controls: string;
    project_association: string;
    x: number;
    y: number;
  }>({
    id: "",
    name: "",
    category: "compute",
    tech: "",
    provider: "",
    description: "",
    port: "",
    region: "",
    responsibilities: "",
    configuration: "",
    security_controls: "",
    project_association: "",
    x: 100,
    y: 100,
  });

  // Edge form data
  const [edgeForm, setEdgeForm] = useState<{
    id: string;
    source: string;
    target: string;
    label: string;
    protocol: string;
    description: string;
    category: "network" | "data" | "security" | "deployment" | "telemetry";
    animated: boolean;
  }>({
    id: "",
    source: "",
    target: "",
    label: "",
    protocol: "HTTPS / TLS 1.3",
    description: "",
    category: "network",
    animated: false,
  });

  // Query all architectures
  const {
    data: architectures = INITIAL_ARCHITECTURES,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["admin-architectures"],
    queryFn: fetchAllArchitecturesAdmin,
    initialData: INITIAL_ARCHITECTURES,
  });

  // Active architecture
  const activeArchitecture = useMemo(() => {
    if (selectedArchitectureId) {
      const match = architectures.find((a) => a.id === selectedArchitectureId);
      if (match) return match;
    }
    return architectures[0] || INITIAL_ARCHITECTURES[0];
  }, [architectures, selectedArchitectureId]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: createArchitecture,
    onSuccess: (newArch) => {
      queryClient.invalidateQueries({ queryKey: ["admin-architectures"] });
      queryClient.invalidateQueries({ queryKey: ["published-architectures"] });
      toast.success("Architecture created successfully");
      setIsDiagramModalOpen(false);
      setSelectedArchitectureId(newArch.id);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<ArchitectureDiagramInput> }) =>
      updateArchitecture(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-architectures"] });
      queryClient.invalidateQueries({ queryKey: ["published-architectures"] });
      toast.success("Architecture updated successfully");
      setIsDiagramModalOpen(false);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteArchitecture,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-architectures"] });
      queryClient.invalidateQueries({ queryKey: ["published-architectures"] });
      toast.success("Architecture deleted successfully");
      setIsDeleteModalOpen(false);
      setDeletingDiagram(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const publishMutation = useMutation({
    mutationFn: ({ id, is_published }: { id: string; is_published: boolean }) =>
      toggleArchitecturePublish(id, is_published),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["admin-architectures"] });
      queryClient.invalidateQueries({ queryKey: ["published-architectures"] });
      toast.success(vars.is_published ? "Architecture published" : "Architecture unpublished");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // Open diagram modal
  const handleOpenDiagramModal = (arch?: ArchitectureDiagram) => {
    if (arch) {
      setEditingDiagram(arch);
      setDiagramForm({
        title: arch.title,
        slug: arch.slug,
        description: arch.description,
        architecture_type: arch.architecture_type,
        is_published: arch.is_published,
        display_order: arch.display_order,
      });
    } else {
      setEditingDiagram(null);
      setDiagramForm({
        title: "",
        slug: "",
        description: "",
        architecture_type: "Full-Stack Cloud & Edge",
        is_published: true,
        display_order: architectures.length + 1,
      });
    }
    setIsDiagramModalOpen(true);
  };

  const handleSaveDiagram = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDiagram) {
      updateMutation.mutate({
        id: editingDiagram.id,
        input: {
          title: diagramForm.title,
          slug: diagramForm.slug,
          description: diagramForm.description,
          architecture_type: diagramForm.architecture_type,
          is_published: diagramForm.is_published,
          display_order: diagramForm.display_order,
        },
      });
    } else {
      createMutation.mutate({
        title: diagramForm.title,
        slug: diagramForm.slug || diagramForm.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        description: diagramForm.description,
        architecture_type: diagramForm.architecture_type,
        is_published: diagramForm.is_published,
        display_order: diagramForm.display_order,
        diagram_data: {
          version: 1,
          viewport: { x: 0, y: 0, zoom: 0.95 },
          nodes: [],
          edges: [],
        },
      });
    }
  };

  // Open Node modal
  const handleOpenNodeModal = (node?: ArchitectureNode) => {
    if (node) {
      setEditingNode(node);
      setNodeForm({
        id: node.id,
        name: node.name,
        category: node.category,
        tech: node.tech,
        provider: node.provider,
        description: node.description,
        port: node.port || "",
        region: node.region || "",
        responsibilities: node.responsibilities.join("\n"),
        configuration: node.configuration.join("\n"),
        security_controls: node.security_controls.join("\n"),
        project_association: node.project_association || "",
        x: node.x,
        y: node.y,
      });
    } else {
      setEditingNode(null);
      setNodeForm({
        id: `node-${Date.now().toString(36)}`,
        name: "",
        category: "compute",
        tech: "",
        provider: "",
        description: "",
        port: "",
        region: "AWS ap-south-1",
        responsibilities: "",
        configuration: "",
        security_controls: "",
        project_association: "",
        x: 200,
        y: 150,
      });
    }
    setIsNodeModalOpen(true);
  };

  const handleSaveNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeArchitecture) return;

    const newNode: ArchitectureNode = {
      id: nodeForm.id || `node-${Date.now().toString(36)}`,
      name: nodeForm.name,
      category: nodeForm.category,
      tech: nodeForm.tech,
      provider: nodeForm.provider,
      description: nodeForm.description,
      port: nodeForm.port || undefined,
      region: nodeForm.region || undefined,
      responsibilities: nodeForm.responsibilities
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      configuration: nodeForm.configuration
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      security_controls: nodeForm.security_controls
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      project_association: nodeForm.project_association || undefined,
      x: nodeForm.x,
      y: nodeForm.y,
      status: "operational",
    };

    const existingNodes = activeArchitecture.diagram_data.nodes;
    const updatedNodes = editingNode
      ? existingNodes.map((n) => (n.id === editingNode.id ? newNode : n))
      : [...existingNodes, newNode];

    updateMutation.mutate({
      id: activeArchitecture.id,
      input: {
        diagram_data: {
          ...activeArchitecture.diagram_data,
          nodes: updatedNodes,
        },
      },
    });
    setIsNodeModalOpen(false);
  };

  const handleDeleteNode = (nodeId: string) => {
    if (!activeArchitecture) return;
    const updatedNodes = activeArchitecture.diagram_data.nodes.filter((n) => n.id !== nodeId);
    const updatedEdges = activeArchitecture.diagram_data.edges.filter(
      (e) => e.source !== nodeId && e.target !== nodeId,
    );

    updateMutation.mutate({
      id: activeArchitecture.id,
      input: {
        diagram_data: {
          ...activeArchitecture.diagram_data,
          nodes: updatedNodes,
          edges: updatedEdges,
        },
      },
    });
    if (selectedNode?.id === nodeId) setSelectedNode(null);
  };

  // Open Edge modal
  const handleOpenEdgeModal = (edge?: ArchitectureEdge) => {
    const nodes = activeArchitecture?.diagram_data.nodes || [];
    if (edge) {
      setEditingEdge(edge);
      setEdgeForm({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: edge.label,
        protocol: edge.protocol,
        description: edge.description,
        category: edge.category,
        animated: Boolean(edge.animated),
      });
    } else {
      setEditingEdge(null);
      setEdgeForm({
        id: `e-${Date.now().toString(36)}`,
        source: nodes[0]?.id || "",
        target: nodes[1]?.id || "",
        label: "Data Transit",
        protocol: "HTTPS / TLS 1.3",
        description: "",
        category: "network",
        animated: true,
      });
    }
    setIsEdgeModalOpen(true);
  };

  const handleSaveEdge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeArchitecture) return;

    const newEdge: ArchitectureEdge = {
      id: edgeForm.id || `e-${Date.now().toString(36)}`,
      source: edgeForm.source,
      target: edgeForm.target,
      label: edgeForm.label,
      protocol: edgeForm.protocol,
      description: edgeForm.description,
      category: edgeForm.category,
      direction: "directional",
      animated: edgeForm.animated,
    };

    const existingEdges = activeArchitecture.diagram_data.edges;
    const updatedEdges = editingEdge
      ? existingEdges.map((e) => (e.id === editingEdge.id ? newEdge : e))
      : [...existingEdges, newEdge];

    updateMutation.mutate({
      id: activeArchitecture.id,
      input: {
        diagram_data: {
          ...activeArchitecture.diagram_data,
          edges: updatedEdges,
        },
      },
    });
    setIsEdgeModalOpen(false);
  };

  const handleDeleteEdge = (edgeId: string) => {
    if (!activeArchitecture) return;
    const updatedEdges = activeArchitecture.diagram_data.edges.filter((e) => e.id !== edgeId);
    updateMutation.mutate({
      id: activeArchitecture.id,
      input: {
        diagram_data: {
          ...activeArchitecture.diagram_data,
          edges: updatedEdges,
        },
      },
    });
  };

  // Canvas node position drag update
  const handleUpdateNodesFromCanvas = (updatedNodes: ArchitectureNode[]) => {
    if (!activeArchitecture) return;
    // Local instant update via queryClient cache
    queryClient.setQueryData(["admin-architectures"], (prev: ArchitectureDiagram[] | undefined) => {
      if (!prev) return prev;
      return prev.map((a) =>
        a.id === activeArchitecture.id
          ? { ...a, diagram_data: { ...a.diagram_data, nodes: updatedNodes } }
          : a,
      );
    });
  };

  // Persist current canvas node layout
  const handlePersistLayout = () => {
    if (!activeArchitecture) return;
    updateMutation.mutate({
      id: activeArchitecture.id,
      input: {
        diagram_data: activeArchitecture.diagram_data,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#E5E5DF] pb-5">
        <div>
          <PageHeader
            title="Architecture Diagram Manager"
            subtitle="Manage production infrastructure topologies, interactive node positioning, protocol edges, and security layers."
            badge="EDITOR ACTIVE"
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => refetch()}
            className="mono inline-flex items-center gap-1.5 border border-[#E5E5DF] bg-white px-3 py-1.5 text-xs font-semibold text-carbon hover:border-cobalt hover:text-cobalt transition-colors"
          >
            <RefreshCw className="h-3 w-3" />
            <span>SYNC</span>
          </button>
          <a
            href="/architecture"
            target="_blank"
            rel="noreferrer"
            className="mono inline-flex items-center gap-1.5 border border-[#E5E5DF] bg-white px-3 py-1.5 text-xs font-semibold text-carbon hover:border-cobalt hover:text-cobalt transition-colors"
          >
            <Eye className="h-3 w-3" />
            <span>PUBLIC EXPLORER</span>
          </a>
          <button
            type="button"
            onClick={() => handleOpenDiagramModal()}
            className="mono inline-flex items-center gap-1.5 border border-cobalt bg-cobalt px-3.5 py-1.5 text-xs font-bold text-white hover:bg-blue-700 transition-colors shadow-2xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>NEW ARCHITECTURE</span>
          </button>
        </div>
      </div>

      {/* Telemetry Strip */}
      <TelemetryMatrix columns={4}>
        <TelemetryCell
          label="Total Topologies"
          value={architectures.length.toString()}
          hint="Production architectures"
          status="optimal"
        />
        <TelemetryCell
          label="Active Diagram Nodes"
          value={activeArchitecture.diagram_data.nodes.length.toString()}
          hint="Configured components"
          status="optimal"
        />
        <TelemetryCell
          label="Data Connections"
          value={activeArchitecture.diagram_data.edges.length.toString()}
          hint="Network & protocol paths"
          status="optimal"
        />
        <TelemetryCell
          label="Public Status"
          value={activeArchitecture.is_published ? "PUBLISHED" : "DRAFT"}
          hint={activeArchitecture.is_published ? "Visible on /architecture" : "Admin view only"}
          status={activeArchitecture.is_published ? "optimal" : "warning"}
        />
      </TelemetryMatrix>

      {/* Architecture Selector & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 border border-border bg-white dark:bg-[#121316] rounded-md shadow-2xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground mr-1">
            ACTIVE TOPOLOGY:
          </span>
          {architectures.map((arch) => {
            const isSelected = arch.id === activeArchitecture.id;
            return (
              <button
                key={arch.id}
                type="button"
                onClick={() => {
                  setSelectedArchitectureId(arch.id);
                  setSelectedNode(null);
                }}
                className={`mono text-xs px-3 py-1.5 rounded border transition-all cursor-pointer ${
                  isSelected
                    ? "border-cobalt bg-cobalt text-white font-bold"
                    : "border-border bg-[#FAF9F6] text-carbon hover:border-cobalt/60 hover:text-cobalt"
                }`}
              >
                {arch.title}
              </button>
            );
          })}
        </div>

        {/* Diagram Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleOpenDiagramModal(activeArchitecture)}
            className="mono inline-flex items-center gap-1 px-2.5 py-1 text-xs border border-border rounded bg-white hover:border-cobalt text-carbon hover:text-cobalt"
          >
            <Edit3 className="h-3 w-3 text-cobalt" />
            <span>EDIT TOPOLOGY</span>
          </button>
          <button
            type="button"
            onClick={() =>
              publishMutation.mutate({
                id: activeArchitecture.id,
                is_published: !activeArchitecture.is_published,
              })
            }
            className={`mono inline-flex items-center gap-1 px-2.5 py-1 text-xs border rounded transition-colors ${
              activeArchitecture.is_published
                ? "border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100"
                : "border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
            }`}
          >
            {activeArchitecture.is_published ? (
              <>
                <EyeOff className="h-3 w-3" />
                <span>UNPUBLISH</span>
              </>
            ) : (
              <>
                <Eye className="h-3 w-3" />
                <span>PUBLISH DRAFT</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handlePersistLayout}
            className="mono inline-flex items-center gap-1 px-3 py-1 text-xs border border-cobalt bg-cobalt text-white rounded font-semibold hover:bg-blue-700"
          >
            <Check className="h-3 w-3" />
            <span>SAVE POSITIONS</span>
          </button>
        </div>
      </div>

      {/* Visual Canvas with Editable Node Dragging */}
      <Panel title="VISUAL TOPOLOGY CANVAS (DRAG NODES TO REPOSITION)">
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="mono">
              💡 Drag any node card to adjust coordinates (snaps to 20px grid). Click &quot;Save
              Positions&quot; to persist.
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleOpenNodeModal()}
                className="mono inline-flex items-center gap-1 text-xs px-2.5 py-1 border border-cobalt text-cobalt rounded hover:bg-blue-50 font-semibold"
              >
                <Plus className="h-3 w-3" />
                <span>ADD NODE</span>
              </button>
              <button
                type="button"
                onClick={() => handleOpenEdgeModal()}
                className="mono inline-flex items-center gap-1 text-xs px-2.5 py-1 border border-cobalt text-cobalt rounded hover:bg-blue-50 font-semibold"
              >
                <Plus className="h-3 w-3" />
                <span>ADD CONNECTION</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className={selectedNode ? "lg:col-span-8" : "lg:col-span-12"}>
              <ArchitectureCanvas
                data={activeArchitecture.diagram_data}
                viewMode={viewMode}
                selectedNode={selectedNode}
                onSelectNode={(n) => setSelectedNode(n)}
                isEditable={true}
                onUpdateNodes={handleUpdateNodesFromCanvas}
              />
            </div>
            {selectedNode && (
              <div className="lg:col-span-4 rounded-lg overflow-hidden border border-border shadow-md sticky top-4">
                <ComponentInspector
                  node={selectedNode}
                  edges={activeArchitecture.diagram_data.edges}
                  allNodes={activeArchitecture.diagram_data.nodes}
                  onClose={() => setSelectedNode(null)}
                  onSelectNode={(n) => setSelectedNode(n)}
                />
              </div>
            )}
          </div>
        </div>
      </Panel>

      {/* Nodes & Edges Data Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Nodes Manager Table */}
        <Panel title={`CONFIGURED NODES (${activeArchitecture.diagram_data.nodes.length})`}>
          <div className="divide-y divide-border text-xs">
            {activeArchitecture.diagram_data.nodes.map((node) => (
              <div
                key={node.id}
                className="p-3 flex items-center justify-between hover:bg-[#FAF9F6] transition-colors"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="mono text-[9px] font-bold text-cobalt uppercase">
                      {node.category}
                    </span>
                    <span className="font-semibold text-carbon">{node.name}</span>
                  </div>
                  <p className="mono text-[10px] text-muted-foreground">
                    {node.tech} &bull; pos: ({node.x}, {node.y})
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleOpenNodeModal(node)}
                    className="p-1 rounded text-muted-foreground hover:text-cobalt hover:bg-neutral-100"
                    title="Edit Node"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteNode(node.id)}
                    className="p-1 rounded text-muted-foreground hover:text-rose-600 hover:bg-neutral-100"
                    title="Delete Node"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        {/* Edges Manager Table */}
        <Panel
          title={`CONFIGURED DATA CONNECTIONS (${activeArchitecture.diagram_data.edges.length})`}
        >
          <div className="divide-y divide-border text-xs">
            {activeArchitecture.diagram_data.edges.map((edge) => {
              const src = activeArchitecture.diagram_data.nodes.find((n) => n.id === edge.source);
              const tgt = activeArchitecture.diagram_data.nodes.find((n) => n.id === edge.target);
              return (
                <div
                  key={edge.id}
                  className="p-3 flex items-center justify-between hover:bg-[#FAF9F6] transition-colors"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1 font-mono text-[11px] text-carbon font-semibold">
                      <span>{src?.name || edge.source}</span>
                      <ArrowRight className="h-3 w-3 text-cobalt" />
                      <span>{tgt?.name || edge.target}</span>
                    </div>
                    <p className="mono text-[10px] text-muted-foreground">
                      {edge.label} &bull; {edge.protocol}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdgeModal(edge)}
                      className="p-1 rounded text-muted-foreground hover:text-cobalt hover:bg-neutral-100"
                      title="Edit Connection"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteEdge(edge.id)}
                      className="p-1 rounded text-muted-foreground hover:text-rose-600 hover:bg-neutral-100"
                      title="Delete Connection"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* MODAL: CREATE / EDIT DIAGRAM                                          */}
      {/* --------------------------------------------------------------------- */}
      <Dialog open={isDiagramModalOpen} onOpenChange={setIsDiagramModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingDiagram ? "Edit Architecture Diagram" : "New Architecture Diagram"}
            </DialogTitle>
            <DialogDescription>
              Configure top-level topology metadata, title, slug, and publication status.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveDiagram} className="space-y-4 pt-2 text-xs">
            <div>
              <label className="mono font-semibold block mb-1">Title</label>
              <input
                type="text"
                required
                value={diagramForm.title}
                onChange={(e) => setDiagramForm({ ...diagramForm, title: e.target.value })}
                className="w-full border border-border px-3 py-2 rounded text-xs"
                placeholder="e.g. AWS Multi-AZ Cluster"
              />
            </div>

            <div>
              <label className="mono font-semibold block mb-1">Slug</label>
              <input
                type="text"
                required
                value={diagramForm.slug}
                onChange={(e) => setDiagramForm({ ...diagramForm, slug: e.target.value })}
                className="w-full border border-border px-3 py-2 rounded text-xs font-mono"
                placeholder="e.g. aws-cluster"
              />
            </div>

            <div>
              <label className="mono font-semibold block mb-1">Architecture Type</label>
              <input
                type="text"
                required
                value={diagramForm.architecture_type}
                onChange={(e) =>
                  setDiagramForm({ ...diagramForm, architecture_type: e.target.value })
                }
                className="w-full border border-border px-3 py-2 rounded text-xs"
                placeholder="e.g. Full-Stack Cloud & Edge"
              />
            </div>

            <div>
              <label className="mono font-semibold block mb-1">Description</label>
              <textarea
                rows={3}
                value={diagramForm.description}
                onChange={(e) => setDiagramForm({ ...diagramForm, description: e.target.value })}
                className="w-full border border-border px-3 py-2 rounded text-xs leading-relaxed"
                placeholder="Technical overview of this architecture..."
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={diagramForm.is_published}
                  onChange={(e) =>
                    setDiagramForm({ ...diagramForm, is_published: e.target.checked })
                  }
                  className="rounded border-border text-cobalt"
                />
                <span className="mono font-semibold">Published (Public)</span>
              </label>

              <div className="flex items-center gap-2">
                <label className="mono font-semibold">Display Order:</label>
                <input
                  type="number"
                  value={diagramForm.display_order}
                  onChange={(e) =>
                    setDiagramForm({ ...diagramForm, display_order: Number(e.target.value) })
                  }
                  className="w-16 border border-border px-2 py-1 rounded text-xs font-mono"
                />
              </div>
            </div>

            <DialogFooter className="pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => setIsDiagramModalOpen(false)}
                className="px-3 py-1.5 border border-border rounded text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-cobalt text-white rounded text-xs font-bold"
              >
                {editingDiagram ? "Save Changes" : "Create Architecture"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* --------------------------------------------------------------------- */}
      {/* MODAL: CREATE / EDIT NODE                                             */}
      {/* --------------------------------------------------------------------- */}
      <Dialog open={isNodeModalOpen} onOpenChange={setIsNodeModalOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingNode ? "Edit Component Node" : "Add Component Node"}</DialogTitle>
            <DialogDescription>
              Configure technical details, ports, security controls, and responsibilities.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveNode} className="space-y-4 pt-2 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mono font-semibold block mb-1">Component Name</label>
                <input
                  type="text"
                  required
                  value={nodeForm.name}
                  onChange={(e) => setNodeForm({ ...nodeForm, name: e.target.value })}
                  className="w-full border border-border px-3 py-2 rounded text-xs"
                  placeholder="e.g. Nginx Reverse Proxy"
                />
              </div>
              <div>
                <label className="mono font-semibold block mb-1">Category</label>
                <select
                  value={nodeForm.category}
                  onChange={(e) =>
                    setNodeForm({ ...nodeForm, category: e.target.value as ArchitectureCategory })
                  }
                  className="w-full border border-border px-3 py-2 rounded text-xs mono"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mono font-semibold block mb-1">Technology &amp; Version</label>
                <input
                  type="text"
                  required
                  value={nodeForm.tech}
                  onChange={(e) => setNodeForm({ ...nodeForm, tech: e.target.value })}
                  className="w-full border border-border px-3 py-2 rounded text-xs"
                  placeholder="e.g. Nginx 1.24 / Certbot"
                />
              </div>
              <div>
                <label className="mono font-semibold block mb-1">Cloud Provider / Host</label>
                <input
                  type="text"
                  required
                  value={nodeForm.provider}
                  onChange={(e) => setNodeForm({ ...nodeForm, provider: e.target.value })}
                  className="w-full border border-border px-3 py-2 rounded text-xs"
                  placeholder="e.g. AWS EC2 (Ubuntu 24.04)"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="mono font-semibold block mb-1">Active Ports</label>
                <input
                  type="text"
                  value={nodeForm.port}
                  onChange={(e) => setNodeForm({ ...nodeForm, port: e.target.value })}
                  className="w-full border border-border px-3 py-2 rounded text-xs font-mono"
                  placeholder="e.g. 80, 443"
                />
              </div>
              <div>
                <label className="mono font-semibold block mb-1">Region / Zone</label>
                <input
                  type="text"
                  value={nodeForm.region}
                  onChange={(e) => setNodeForm({ ...nodeForm, region: e.target.value })}
                  className="w-full border border-border px-3 py-2 rounded text-xs"
                  placeholder="e.g. AWS ap-south-1"
                />
              </div>
              <div>
                <label className="mono font-semibold block mb-1">Project Slug</label>
                <input
                  type="text"
                  value={nodeForm.project_association}
                  onChange={(e) =>
                    setNodeForm({ ...nodeForm, project_association: e.target.value })
                  }
                  className="w-full border border-border px-3 py-2 rounded text-xs font-mono"
                  placeholder="e.g. kamlesh-prasad"
                />
              </div>
            </div>

            <div>
              <label className="mono font-semibold block mb-1">Role Description</label>
              <textarea
                rows={2}
                required
                value={nodeForm.description}
                onChange={(e) => setNodeForm({ ...nodeForm, description: e.target.value })}
                className="w-full border border-border px-3 py-2 rounded text-xs leading-relaxed"
                placeholder="What is this component's technical responsibility?"
              />
            </div>

            <div>
              <label className="mono font-semibold block mb-1">
                Responsibilities (one per line)
              </label>
              <textarea
                rows={3}
                value={nodeForm.responsibilities}
                onChange={(e) => setNodeForm({ ...nodeForm, responsibilities: e.target.value })}
                className="w-full border border-border px-3 py-2 rounded text-xs font-mono leading-relaxed"
                placeholder="Terminates TLS 1.3&#10;Applies Gzip compression"
              />
            </div>

            <div>
              <label className="mono font-semibold block mb-1">
                Technical Configuration (one per line)
              </label>
              <textarea
                rows={3}
                value={nodeForm.configuration}
                onChange={(e) => setNodeForm({ ...nodeForm, configuration: e.target.value })}
                className="w-full border border-border px-3 py-2 rounded text-xs font-mono leading-relaxed"
                placeholder="proxy_pass http://127.0.0.1:3000&#10;ssl_protocols TLSv1.3"
              />
            </div>

            <div>
              <label className="mono font-semibold block mb-1">
                Security Controls (one per line)
              </label>
              <textarea
                rows={2}
                value={nodeForm.security_controls}
                onChange={(e) => setNodeForm({ ...nodeForm, security_controls: e.target.value })}
                className="w-full border border-border px-3 py-2 rounded text-xs font-mono leading-relaxed"
                placeholder="Strict TLS 1.3&#10;UFW default-deny"
              />
            </div>

            <DialogFooter className="pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => setIsNodeModalOpen(false)}
                className="px-3 py-1.5 border border-border rounded text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-cobalt text-white rounded text-xs font-bold"
              >
                {editingNode ? "Update Node" : "Add Node"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* --------------------------------------------------------------------- */}
      {/* MODAL: CREATE / EDIT EDGE                                             */}
      {/* --------------------------------------------------------------------- */}
      <Dialog open={isEdgeModalOpen} onOpenChange={setIsEdgeModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingEdge ? "Edit Data Connection" : "Add Data Connection"}
            </DialogTitle>
            <DialogDescription>
              Connect two components with protocol and flow semantics.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveEdge} className="space-y-4 pt-2 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mono font-semibold block mb-1">Source Component</label>
                <select
                  required
                  value={edgeForm.source}
                  onChange={(e) => setEdgeForm({ ...edgeForm, source: e.target.value })}
                  className="w-full border border-border px-3 py-2 rounded text-xs mono"
                >
                  {activeArchitecture?.diagram_data.nodes.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mono font-semibold block mb-1">Target Component</label>
                <select
                  required
                  value={edgeForm.target}
                  onChange={(e) => setEdgeForm({ ...edgeForm, target: e.target.value })}
                  className="w-full border border-border px-3 py-2 rounded text-xs mono"
                >
                  {activeArchitecture?.diagram_data.nodes.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mono font-semibold block mb-1">Connection Label</label>
              <input
                type="text"
                required
                value={edgeForm.label}
                onChange={(e) => setEdgeForm({ ...edgeForm, label: e.target.value })}
                className="w-full border border-border px-3 py-2 rounded text-xs"
                placeholder="e.g. Reverse Proxy Pass"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mono font-semibold block mb-1">Protocol / Transport</label>
                <input
                  type="text"
                  required
                  value={edgeForm.protocol}
                  onChange={(e) => setEdgeForm({ ...edgeForm, protocol: e.target.value })}
                  className="w-full border border-border px-3 py-2 rounded text-xs font-mono"
                  placeholder="e.g. HTTP / 127.0.0.1:3000"
                />
              </div>
              <div>
                <label className="mono font-semibold block mb-1">Category</label>
                <select
                  value={edgeForm.category}
                  onChange={(e) =>
                    setEdgeForm({
                      ...edgeForm,
                      category: e.target.value as
                        "network" | "data" | "security" | "deployment" | "telemetry",
                    })
                  }
                  className="w-full border border-border px-3 py-2 rounded text-xs mono"
                >
                  <option value="network">Network</option>
                  <option value="data">Data</option>
                  <option value="security">Security</option>
                  <option value="deployment">Deployment</option>
                  <option value="telemetry">Telemetry</option>
                </select>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={edgeForm.animated}
                  onChange={(e) => setEdgeForm({ ...edgeForm, animated: e.target.checked })}
                  className="rounded border-border text-cobalt"
                />
                <span className="mono font-semibold">
                  Animate active data flow along connection
                </span>
              </label>
            </div>

            <DialogFooter className="pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => setIsEdgeModalOpen(false)}
                className="px-3 py-1.5 border border-border rounded text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-cobalt text-white rounded text-xs font-bold"
              >
                {editingEdge ? "Update Connection" : "Add Connection"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
