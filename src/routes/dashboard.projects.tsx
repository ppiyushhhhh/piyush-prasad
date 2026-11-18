import { useState, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FolderGit2,
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
  Upload,
  ArrowUp,
  ArrowDown,
  Calendar,
  Layers,
  Sparkles,
  Link as LinkIcon,
  AlertTriangle,
  Loader2,
  Tag,
  Server,
  Globe,
  Shield,
  FileText,
  X,
  Check,
} from "lucide-react";
import { toast } from "sonner";

import {
  fetchAllProjectsAdmin,
  createProject,
  updateProject,
  deleteProject,
  toggleProjectPublish,
  updateProjectsOrder,
  uploadProjectMedia,
  PROJECT_CATEGORIES,
  PROJECT_STATUSES,
  STATUS_STYLES,
  type PortfolioProject,
  type PortfolioProjectInput,
  type ProjectStatus,
} from "@/lib/portfolio-projects";
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

export const Route = createFileRoute("/dashboard/projects")({
  head: () => ({
    meta: [
      { title: "Project Manager — Operations Console" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: DashboardProjectsPage,
});

function DashboardProjectsPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<PortfolioProject | null>(null);
  const [deletingProject, setDeletingProject] = useState<PortfolioProject | null>(null);

  // Form fields
  const [formData, setFormData] = useState<PortfolioProjectInput>({
    title: "",
    slug: "",
    category: PROJECT_CATEGORIES[0],
    status: "Personal Project",
    short_description: "",
    overview: "",
    problem_solved: "",
    objectives: "",
    solution: "",
    technologies: [],
    key_features: [],
    architecture_description: "",
    implementation_details: "",
    cicd_details: "",
    security_details: "",
    challenges: "",
    results: "",
    repository_url: "",
    live_demo_url: "",
    cover_image_url: "",
    deployment_environment: "",
    started_at: "",
    updated_at_date: "",
    is_featured: false,
    is_published: true,
    display_order: 0,
  });

  const [techInput, setTechInput] = useState("");
  const [featureInput, setFeatureInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Query projects
  const {
    data: projects = [],
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["admin-projects"],
    queryFn: fetchAllProjectsAdmin,
    staleTime: 60_000,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      toast.success("Project created successfully");
      setIsFormOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["admin-projects"] });
      queryClient.invalidateQueries({ queryKey: ["portfolio-projects-public"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to create project");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<PortfolioProjectInput> }) =>
      updateProject(id, input),
    onSuccess: () => {
      toast.success("Project updated successfully");
      setIsFormOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["admin-projects"] });
      queryClient.invalidateQueries({ queryKey: ["portfolio-projects-public"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update project");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      toast.success("Project deleted successfully");
      setDeletingProject(null);
      queryClient.invalidateQueries({ queryKey: ["admin-projects"] });
      queryClient.invalidateQueries({ queryKey: ["portfolio-projects-public"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to delete project");
    },
  });

  const togglePublishMutation = useMutation({
    mutationFn: ({ id, is_published }: { id: string; is_published: boolean }) =>
      toggleProjectPublish(id, is_published),
    onSuccess: () => {
      toast.success("Publication status updated");
      queryClient.invalidateQueries({ queryKey: ["admin-projects"] });
      queryClient.invalidateQueries({ queryKey: ["portfolio-projects-public"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update publication status");
    },
  });

  const orderMutation = useMutation({
    mutationFn: updateProjectsOrder,
    onSuccess: () => {
      toast.success("Project order updated");
      queryClient.invalidateQueries({ queryKey: ["admin-projects"] });
      queryClient.invalidateQueries({ queryKey: ["portfolio-projects-public"] });
    },
  });

  // Filter projects
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          p.title.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.technologies.some((t) => t.toLowerCase().includes(q));
        if (!matches) return false;
      }
      if (categoryFilter !== "all" && p.category !== categoryFilter) return false;
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      return true;
    });
  }, [projects, searchQuery, categoryFilter, statusFilter]);

  // Telemetry counts
  const telemetry = useMemo(() => {
    const total = projects.length;
    const published = projects.filter((p) => p.is_published).length;
    const featured = projects.filter((p) => p.is_featured).length;
    const production = projects.filter((p) => p.status === "Production").length;
    return { total, published, featured, production };
  }, [projects]);

  const resetForm = () => {
    setFormData({
      title: "",
      slug: "",
      category: PROJECT_CATEGORIES[0],
      status: "Personal Project",
      short_description: "",
      overview: "",
      problem_solved: "",
      objectives: "",
      solution: "",
      technologies: [],
      key_features: [],
      architecture_description: "",
      implementation_details: "",
      cicd_details: "",
      security_details: "",
      challenges: "",
      results: "",
      repository_url: "",
      live_demo_url: "",
      cover_image_url: "",
      deployment_environment: "",
      started_at: "",
      updated_at_date: "",
      is_featured: false,
      is_published: true,
      display_order: projects.length + 1,
    });
    setEditingProject(null);
    setTechInput("");
    setFeatureInput("");
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleOpenEdit = (project: PortfolioProject) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      slug: project.slug,
      category: project.category,
      status: project.status,
      short_description: project.short_description,
      overview: project.overview,
      problem_solved: project.problem_solved || "",
      objectives: project.objectives || "",
      solution: project.solution || "",
      technologies: [...project.technologies],
      key_features: [...project.key_features],
      architecture_description: project.architecture_description || "",
      architecture_data: project.architecture_data || null,
      implementation_details: project.implementation_details || "",
      cicd_details: project.cicd_details || "",
      security_details: project.security_details || "",
      challenges: project.challenges || "",
      results: project.results || "",
      repository_url: project.repository_url || "",
      live_demo_url: project.live_demo_url || "",
      cover_image_url: project.cover_image_url || "",
      deployment_environment: project.deployment_environment || "",
      started_at: project.started_at || "",
      updated_at_date: project.updated_at_date || "",
      is_featured: project.is_featured,
      is_published: project.is_published,
      display_order: project.display_order,
    });
    setIsFormOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const publicUrl = await uploadProjectMedia(file);
      setFormData((prev) => ({ ...prev, cover_image_url: publicUrl }));
      toast.success("Image uploaded successfully");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      toast.error(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddTech = () => {
    if (!techInput.trim()) return;
    if (formData.technologies.includes(techInput.trim())) {
      toast.error("Technology tag already added");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      technologies: [...prev.technologies, techInput.trim()],
    }));
    setTechInput("");
  };

  const handleRemoveTech = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      technologies: prev.technologies.filter((t) => t !== tag),
    }));
  };

  const handleAddFeature = () => {
    if (!featureInput.trim()) return;
    setFormData((prev) => ({
      ...prev,
      key_features: [...prev.key_features, featureInput.trim()],
    }));
    setFeatureInput("");
  };

  const handleRemoveFeature = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      key_features: prev.key_features.filter((_, i) => i !== idx),
    }));
  };

  const handleTitleChange = (val: string) => {
    setFormData((prev) => {
      // Auto-generate slug if not editing an existing slug or if slug was generated from title
      const autoSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      return {
        ...prev,
        title: val,
        slug: editingProject ? prev.slug : autoSlug,
      };
    });
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Please enter a project title");
      return;
    }
    if (!formData.slug.trim()) {
      toast.error("Please enter a valid slug");
      return;
    }
    if (!formData.short_description.trim()) {
      toast.error("Please enter a short description");
      return;
    }
    if (!formData.overview.trim()) {
      toast.error("Please enter a project overview");
      return;
    }

    if (editingProject) {
      updateMutation.mutate({ id: editingProject.id, input: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleMoveOrder = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= projects.length) return;

    const currentItem = projects[index];
    const targetItem = projects[targetIndex];

    const updates = [
      { id: currentItem.id, display_order: targetItem.display_order },
      { id: targetItem.id, display_order: currentItem.display_order },
    ];

    orderMutation.mutate(updates);
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
        <PageHeader
          title="Engineering Projects"
          subtitle="Manage technical case studies, deployment statuses, architecture data, and GitHub links."
        />
        <button
          type="button"
          onClick={handleOpenCreate}
          className="mono inline-flex items-center gap-1.5 rounded-md bg-cobalt px-3.5 py-1.5 text-xs font-bold text-white hover:bg-cobalt/90 shadow-2xs mb-6"
        >
          <Plus className="h-4 w-4" />
          <span>New Project</span>
        </button>
      </div>

      <div className="space-y-6">
        {/* Telemetry Matrix */}
        <TelemetryMatrix columns={4}>
          <TelemetryCell
            label="Total Projects"
            value={telemetry.total}
            hint="Catalogued in database"
            status="neutral"
          />
          <TelemetryCell
            label="Published"
            value={telemetry.published}
            hint="Visible on public site"
            status="optimal"
          />
          <TelemetryCell
            label="Production"
            value={telemetry.production}
            hint="Live client/infra systems"
            status="optimal"
          />
          <TelemetryCell
            label="Featured"
            value={telemetry.featured}
            hint="Highlighted in showcase"
            status="warning"
          />
        </TelemetryMatrix>

        {/* Filter & Controls Panel */}
        <Panel title="Project Repository">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[300px]">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by name, slug, technology..."
                  className="w-full rounded-md border border-border bg-[#FAF9F6] dark:bg-neutral-950 pl-9 pr-3 py-1.5 text-xs focus:border-cobalt focus:outline-hidden"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                aria-label="Filter by category"
                className="rounded-md border border-border bg-[#FAF9F6] dark:bg-neutral-950 px-2.5 py-1.5 text-xs focus:border-cobalt focus:outline-hidden"
              >
                <option value="all">All Categories</option>
                {PROJECT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="Filter by status"
                className="rounded-md border border-border bg-[#FAF9F6] dark:bg-neutral-950 px-2.5 py-1.5 text-xs focus:border-cobalt focus:outline-hidden"
              >
                <option value="all">All Statuses</option>
                {PROJECT_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="mono inline-flex items-center gap-1.5 rounded border border-border bg-white dark:bg-neutral-900 px-2.5 py-1.5 text-xs text-muted-foreground hover:text-carbon"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>

          {/* Table / Project List */}
          {isLoading ? (
            <LoadingState label="Loading projects..." />
          ) : isError ? (
            <ErrorState message={(error as Error)?.message || "Failed to load projects"} />
          ) : filteredProjects.length === 0 ? (
            <EmptyState
              title="No projects found"
              description="No projects match the current search filters."
            />
          ) : (
            <div className="overflow-x-auto rounded border border-border">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF9F6] dark:bg-neutral-950 border-b border-border mono text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">Order</th>
                    <th className="py-2.5 px-3">Project Title & Slug</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-center">Featured</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-white dark:bg-neutral-900">
                  {filteredProjects.map((project, idx) => {
                    const statusConfig =
                      STATUS_STYLES[project.status] || STATUS_STYLES["Personal Project"];

                    return (
                      <tr
                        key={project.id}
                        className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                      >
                        {/* Order & Reordering */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1">
                            <span className="mono font-semibold text-muted-foreground w-4 text-center">
                              {project.display_order}
                            </span>
                            <div className="flex flex-col">
                              <button
                                type="button"
                                onClick={() => handleMoveOrder(idx, "up")}
                                disabled={idx === 0}
                                className="text-muted-foreground hover:text-carbon disabled:opacity-30 p-0.5"
                                title="Move Up"
                              >
                                <ArrowUp className="h-2.5 w-2.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMoveOrder(idx, "down")}
                                disabled={idx === filteredProjects.length - 1}
                                className="text-muted-foreground hover:text-carbon disabled:opacity-30 p-0.5"
                                title="Move Down"
                              >
                                <ArrowDown className="h-2.5 w-2.5" />
                              </button>
                            </div>
                          </div>
                        </td>

                        {/* Title & Slug */}
                        <td className="py-3 px-3">
                          <div className="font-bold text-carbon dark:text-white line-clamp-1">
                            {project.title}
                          </div>
                          <div className="mono text-[10px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                            <span>/{project.slug}</span>
                            {project.deployment_environment && (
                              <span className="text-cobalt">
                                • {project.deployment_environment}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3 px-3">
                          <span className="mono text-[11px] font-medium text-carbon/80 dark:text-neutral-300">
                            {project.category}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
                          >
                            <span className={`h-1 w-1 rounded-full ${statusConfig.dot}`} />
                            {statusConfig.label}
                          </span>
                        </td>

                        {/* Featured Toggle */}
                        <td className="py-3 px-3 text-center">
                          <button
                            type="button"
                            onClick={() =>
                              updateMutation.mutate({
                                id: project.id,
                                input: { is_featured: !project.is_featured },
                              })
                            }
                            title={project.is_featured ? "Remove featured" : "Mark as featured"}
                            className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                          >
                            <Sparkles
                              className={`h-4 w-4 ${
                                project.is_featured
                                  ? "text-amber-500 fill-amber-500"
                                  : "text-muted-foreground/40"
                              }`}
                            />
                          </button>
                        </td>

                        {/* Published Toggle */}
                        <td className="py-3 px-3 text-center">
                          <button
                            type="button"
                            onClick={() =>
                              togglePublishMutation.mutate({
                                id: project.id,
                                is_published: !project.is_published,
                              })
                            }
                            className={`mono inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-semibold transition-colors ${
                              project.is_published
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-neutral-100 text-neutral-600 border border-neutral-200"
                            }`}
                          >
                            {project.is_published ? (
                              <>
                                <Eye className="h-3 w-3" />
                                <span>Published</span>
                              </>
                            ) : (
                              <>
                                <EyeOff className="h-3 w-3" />
                                <span>Draft</span>
                              </>
                            )}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Live Preview */}
                            <Link
                              to="/projects/$slug"
                              params={{ slug: project.slug }}
                              target="_blank"
                              className="p-1 rounded text-muted-foreground hover:text-cobalt hover:bg-neutral-100 dark:hover:bg-neutral-800"
                              title="Preview Case Study"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Link>

                            {/* Edit */}
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(project)}
                              className="p-1 rounded text-muted-foreground hover:text-cobalt hover:bg-neutral-100 dark:hover:bg-neutral-800"
                              title="Edit Project"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>

                            {/* Delete */}
                            <button
                              type="button"
                              onClick={() => setDeletingProject(project)}
                              className="p-1 rounded text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                              title="Delete Project"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </div>

      {/* Create / Edit Project Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-carbon dark:text-white">
              {editingProject ? "Edit Engineering Project" : "Create New Engineering Project"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Define complete case study details, architecture overview, and technical evidence.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveForm} className="space-y-6 py-2 text-xs">
            {/* Core Identifiers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-carbon dark:text-white mb-1">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. AWS Multi-AZ VPC Architecture"
                  className="w-full rounded border border-border bg-[#FAF9F6] dark:bg-neutral-950 p-2 focus:border-cobalt focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-carbon dark:text-white mb-1">
                  Slug (URL path) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, "-"),
                    }))
                  }
                  placeholder="e.g. aws-multi-az-vpc"
                  className="w-full rounded border border-border bg-[#FAF9F6] dark:bg-neutral-950 p-2 font-mono focus:border-cobalt focus:outline-hidden"
                />
              </div>
            </div>

            {/* Category & Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-carbon dark:text-white mb-1">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                  className="w-full rounded border border-border bg-[#FAF9F6] dark:bg-neutral-950 p-2 focus:border-cobalt focus:outline-hidden"
                >
                  {PROJECT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-carbon dark:text-white mb-1">
                  Controlled Status *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, status: e.target.value as ProjectStatus }))
                  }
                  className="w-full rounded border border-border bg-[#FAF9F6] dark:bg-neutral-950 p-2 focus:border-cobalt focus:outline-hidden"
                >
                  {PROJECT_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-carbon dark:text-white mb-1">
                  Deployment Environment
                </label>
                <input
                  type="text"
                  value={formData.deployment_environment || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, deployment_environment: e.target.value }))
                  }
                  placeholder="e.g. AWS EC2 (ap-south-1)"
                  className="w-full rounded border border-border bg-[#FAF9F6] dark:bg-neutral-950 p-2 focus:border-cobalt focus:outline-hidden"
                />
              </div>
            </div>

            {/* Descriptions */}
            <div>
              <label className="block font-bold text-carbon dark:text-white mb-1">
                Short Description (Cards & Previews) *
              </label>
              <textarea
                required
                rows={2}
                value={formData.short_description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, short_description: e.target.value }))
                }
                placeholder="Concise technical summary..."
                className="w-full rounded border border-border bg-[#FAF9F6] dark:bg-neutral-950 p-2 focus:border-cobalt focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-bold text-carbon dark:text-white mb-1">
                Executive Overview *
              </label>
              <textarea
                required
                rows={4}
                value={formData.overview}
                onChange={(e) => setFormData((prev) => ({ ...prev, overview: e.target.value }))}
                placeholder="Comprehensive technical overview..."
                className="w-full rounded border border-border bg-[#FAF9F6] dark:bg-neutral-950 p-2 focus:border-cobalt focus:outline-hidden"
              />
            </div>

            {/* Problem & Solution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-carbon dark:text-white mb-1">
                  Problem Statement
                </label>
                <textarea
                  rows={3}
                  value={formData.problem_solved || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, problem_solved: e.target.value }))
                  }
                  placeholder="What operational gap or security challenge did this solve?"
                  className="w-full rounded border border-border bg-[#FAF9F6] dark:bg-neutral-950 p-2 focus:border-cobalt focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-carbon dark:text-white mb-1">
                  Objectives
                </label>
                <textarea
                  rows={3}
                  value={formData.objectives || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, objectives: e.target.value }))}
                  placeholder="1. Build X\n2. Enforce Y..."
                  className="w-full rounded border border-border bg-[#FAF9F6] dark:bg-neutral-950 p-2 focus:border-cobalt focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-carbon dark:text-white mb-1">
                The Solution
              </label>
              <textarea
                rows={3}
                value={formData.solution || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, solution: e.target.value }))}
                placeholder="Architectural approach taken..."
                className="w-full rounded border border-border bg-[#FAF9F6] dark:bg-neutral-950 p-2 focus:border-cobalt focus:outline-hidden"
              />
            </div>

            {/* Technologies Tag Manager */}
            <div>
              <label className="block font-bold text-carbon dark:text-white mb-1">
                Technologies Used
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTech())}
                  placeholder="e.g. AWS EC2, Docker, Prometheus..."
                  className="flex-1 rounded border border-border bg-[#FAF9F6] dark:bg-neutral-950 p-2 focus:border-cobalt focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={handleAddTech}
                  className="rounded border border-border bg-white dark:bg-neutral-900 px-3 py-1 font-semibold text-carbon hover:border-cobalt"
                >
                  Add Tag
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 min-h-[30px] p-2 rounded border border-border/80 bg-neutral-50 dark:bg-neutral-950">
                {formData.technologies.map((t) => (
                  <span
                    key={t}
                    className="mono inline-flex items-center gap-1 rounded bg-white dark:bg-neutral-900 border border-border px-2 py-0.5 text-[11px]"
                  >
                    <span>{t}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTech(t)}
                      className="text-muted-foreground hover:text-rose-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Key Features */}
            <div>
              <label className="block font-bold text-carbon dark:text-white mb-1">
                Key Features / Verified Capabilities
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddFeature())}
                  placeholder="e.g. Automated push-to-deploy pipeline with GitHub Actions..."
                  className="flex-1 rounded border border-border bg-[#FAF9F6] dark:bg-neutral-950 p-2 focus:border-cobalt focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={handleAddFeature}
                  className="rounded border border-border bg-white dark:bg-neutral-900 px-3 py-1 font-semibold text-carbon hover:border-cobalt"
                >
                  Add Feature
                </button>
              </div>

              <ul className="space-y-1.5 p-2 rounded border border-border/80 bg-neutral-50 dark:bg-neutral-950 text-xs">
                {formData.key_features.map((feat, i) => (
                  <li key={i} className="flex items-center justify-between gap-2">
                    <span className="truncate">• {feat}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(i)}
                      className="text-muted-foreground hover:text-rose-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Architecture Description */}
            <div>
              <label className="block font-bold text-carbon dark:text-white mb-1">
                Architecture Flow Description
              </label>
              <textarea
                rows={2}
                value={formData.architecture_description || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, architecture_description: e.target.value }))
                }
                placeholder="Client → Cloudflare → AWS EC2 → Nginx..."
                className="w-full rounded border border-border bg-[#FAF9F6] dark:bg-neutral-950 p-2 focus:border-cobalt focus:outline-hidden"
              />
            </div>

            {/* Implementation, CI/CD, Security */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-carbon dark:text-white mb-1">
                  Implementation Workflow
                </label>
                <textarea
                  rows={3}
                  value={formData.implementation_details || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, implementation_details: e.target.value }))
                  }
                  placeholder="Step-by-step setup..."
                  className="w-full rounded border border-border bg-[#FAF9F6] dark:bg-neutral-950 p-2 focus:border-cobalt focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-carbon dark:text-white mb-1">
                  CI/CD Pipeline Details
                </label>
                <textarea
                  rows={3}
                  value={formData.cicd_details || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, cicd_details: e.target.value }))
                  }
                  placeholder="GitHub Actions triggers & scripts..."
                  className="w-full rounded border border-border bg-[#FAF9F6] dark:bg-neutral-950 p-2 focus:border-cobalt focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-carbon dark:text-white mb-1">
                  Security Controls
                </label>
                <textarea
                  rows={3}
                  value={formData.security_details || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, security_details: e.target.value }))
                  }
                  placeholder="Firewall, scanning, TLS..."
                  className="w-full rounded border border-border bg-[#FAF9F6] dark:bg-neutral-950 p-2 focus:border-cobalt focus:outline-hidden"
                />
              </div>
            </div>

            {/* Challenges & Results */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-carbon dark:text-white mb-1">
                  Challenges & Troubleshooting
                </label>
                <textarea
                  rows={2}
                  value={formData.challenges || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, challenges: e.target.value }))}
                  placeholder="Root cause & resolution..."
                  className="w-full rounded border border-border bg-[#FAF9F6] dark:bg-neutral-950 p-2 focus:border-cobalt focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-carbon dark:text-white mb-1">
                  Results & Measurable Outcomes
                </label>
                <textarea
                  rows={2}
                  value={formData.results || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, results: e.target.value }))}
                  placeholder="Observed performance & reliability results..."
                  className="w-full rounded border border-border bg-[#FAF9F6] dark:bg-neutral-950 p-2 focus:border-cobalt focus:outline-hidden"
                />
              </div>
            </div>

            {/* Links & Cover Upload */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-carbon dark:text-white mb-1">
                  Repository URL
                </label>
                <input
                  type="url"
                  value={formData.repository_url || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, repository_url: e.target.value }))
                  }
                  placeholder="https://github.com/ppiyushhhhh/..."
                  className="w-full rounded border border-border bg-[#FAF9F6] dark:bg-neutral-950 p-2 focus:border-cobalt focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-carbon dark:text-white mb-1">
                  Live Demo URL
                </label>
                <input
                  type="url"
                  value={formData.live_demo_url || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, live_demo_url: e.target.value }))
                  }
                  placeholder="https://..."
                  className="w-full rounded border border-border bg-[#FAF9F6] dark:bg-neutral-950 p-2 focus:border-cobalt focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-carbon dark:text-white mb-1">
                  Cover Image URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={formData.cover_image_url || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, cover_image_url: e.target.value }))
                    }
                    placeholder="https://... or upload"
                    className="flex-1 rounded border border-border bg-[#FAF9F6] dark:bg-neutral-950 p-2 focus:border-cobalt focus:outline-hidden"
                  />
                  <label className="rounded border border-border bg-white dark:bg-neutral-900 px-3 py-2 cursor-pointer hover:border-cobalt transition-colors inline-flex items-center">
                    <Upload className={`h-4 w-4 ${isUploading ? "animate-spin" : ""}`} />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Publishing Flags */}
            <div className="flex flex-wrap items-center gap-6 pt-3 border-t border-border">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_published}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, is_published: e.target.checked }))
                  }
                  className="h-4 w-4 rounded border-border text-cobalt focus:ring-cobalt"
                />
                <span className="font-semibold text-carbon dark:text-white">Publish Project</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, is_featured: e.target.checked }))
                  }
                  className="h-4 w-4 rounded border-border text-cobalt focus:ring-cobalt"
                />
                <span className="font-semibold text-carbon dark:text-white">
                  Mark as Featured Showcase
                </span>
              </label>
            </div>

            <DialogFooter className="pt-4 border-t border-border flex justify-between gap-3">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="rounded border border-border px-4 py-2 font-semibold text-muted-foreground hover:text-carbon"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="mono inline-flex items-center gap-2 rounded bg-cobalt px-5 py-2 font-bold text-white hover:bg-cobalt/90 disabled:opacity-50"
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                <span>{editingProject ? "Update Project" : "Create Project"}</span>
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingProject} onOpenChange={(open) => !open && setDeletingProject(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-rose-600 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              <span>Confirm Project Deletion</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-2">
              Are you sure you want to permanently delete the project{" "}
              <strong className="text-carbon dark:text-white">"{deletingProject?.title}"</strong>?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setDeletingProject(null)}
              className="rounded border border-border px-3.5 py-1.5 font-semibold text-xs text-muted-foreground hover:text-carbon"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={deleteMutation.isPending}
              onClick={() => deletingProject && deleteMutation.mutate(deletingProject.id)}
              className="mono inline-flex items-center gap-1.5 rounded bg-rose-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-50"
            >
              {deleteMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>Delete Permanently</span>
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
