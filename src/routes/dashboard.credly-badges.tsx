import { useState, useMemo, useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Award,
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
  Building,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";

import {
  fetchAllBadges,
  createBadge,
  updateBadge,
  deleteBadge,
  toggleBadgePublish,
  updateBadgesOrder,
  uploadBadgeImage,
  validateBadgeFile,
  type CredlyBadge,
  type CredlyBadgeInput,
} from "@/lib/credly-badges";
import {
  PageHeader,
  TelemetryMatrix,
  TelemetryCell,
  Panel,
  EmptyState,
  StatusTag,
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/dashboard/credly-badges")({
  head: () => ({
    meta: [
      { title: "Credly Badges — PP · OPS Monitoring" },
      {
        name: "description",
        content:
          "Manage, upload, organize and publish verified Credly professional badges and credentials.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: CredlyBadgesPage,
});

interface BadgeFormData {
  name: string;
  issuer: string;
  credly_url: string;
  badge_image_url: string;
  badge_storage_path: string | null;
  issue_date: string;
  expiry_date: string;
  description: string;
  skills: string[];
  is_published: boolean;
  display_order: number;
}

const INITIAL_FORM: BadgeFormData = {
  name: "",
  issuer: "",
  credly_url: "",
  badge_image_url: "",
  badge_storage_path: null,
  issue_date: new Date().toISOString().split("T")[0],
  expiry_date: "",
  description: "",
  skills: [],
  is_published: true,
  display_order: 1,
};

function CredlyBadgesPage() {
  const queryClient = useQueryClient();

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBadge, setEditingBadge] = useState<CredlyBadge | null>(null);
  const [formData, setFormData] = useState<BadgeFormData>(INITIAL_FORM);
  const [currentSkillInput, setCurrentSkillInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Deletion state
  const [deletingBadge, setDeletingBadge] = useState<CredlyBadge | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // React Query Fetch
  const {
    data: badges = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["admin-credly-badges"],
    queryFn: fetchAllBadges,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: createBadge,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-credly-badges"] });
      queryClient.invalidateQueries({ queryKey: ["public-credly-badges"] });
      toast.success("Credly badge created successfully");
      closeDialog();
    },
    onError: (err: Error) => {
      toast.error(`Failed to create badge: ${err.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      input,
      previousStoragePath,
    }: {
      id: string;
      input: Partial<CredlyBadgeInput>;
      previousStoragePath?: string | null;
    }) => updateBadge(id, input, previousStoragePath),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-credly-badges"] });
      queryClient.invalidateQueries({ queryKey: ["public-credly-badges"] });
      toast.success("Credly badge updated successfully");
      closeDialog();
    },
    onError: (err: Error) => {
      toast.error(`Failed to update badge: ${err.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id, storagePath }: { id: string; storagePath?: string | null }) =>
      deleteBadge(id, storagePath),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-credly-badges"] });
      queryClient.invalidateQueries({ queryKey: ["public-credly-badges"] });
      toast.success("Credly badge and associated files deleted");
      setDeletingBadge(null);
    },
    onError: (err: Error) => {
      toast.error(`Failed to delete badge: ${err.message}`);
    },
  });

  const togglePublishMutation = useMutation({
    mutationFn: ({ id, is_published }: { id: string; is_published: boolean }) =>
      toggleBadgePublish(id, is_published),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["admin-credly-badges"] });
      queryClient.invalidateQueries({ queryKey: ["public-credly-badges"] });
      toast.success(
        updated.is_published
          ? "Badge published to portfolio"
          : "Badge moved to drafts (unpublished)",
      );
    },
    onError: (err: Error) => {
      toast.error(`Status change failed: ${err.message}`);
    },
  });

  const reorderMutation = useMutation({
    mutationFn: updateBadgesOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-credly-badges"] });
      queryClient.invalidateQueries({ queryKey: ["public-credly-badges"] });
      toast.success("Badge order updated");
    },
    onError: (err: Error) => {
      toast.error(`Reorder failed: ${err.message}`);
    },
  });

  // Metrics
  const metrics = useMemo(() => {
    const total = badges.length;
    const published = badges.filter((b) => b.is_published).length;
    const drafts = total - published;
    const issuers = new Set(badges.map((b) => b.issuer.trim().toLowerCase())).size;
    return { total, published, drafts, issuers };
  }, [badges]);

  // Filtered badges
  const filteredBadges = useMemo(() => {
    return badges.filter((badge) => {
      // Status filter
      if (statusFilter === "published" && !badge.is_published) return false;
      if (statusFilter === "draft" && badge.is_published) return false;

      // Search query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const inName = badge.name.toLowerCase().includes(q);
      const inIssuer = badge.issuer.toLowerCase().includes(q);
      const inSkills = badge.skills?.some((s) => s.toLowerCase().includes(q));
      const inDesc = badge.description?.toLowerCase().includes(q) ?? false;
      return inName || inIssuer || inSkills || inDesc;
    });
  }, [badges, statusFilter, searchQuery]);

  // Dialog Handlers
  function openAddDialog() {
    setEditingBadge(null);
    setFormData({
      ...INITIAL_FORM,
      display_order: badges.length + 1,
    });
    setUploadError(null);
    setCurrentSkillInput("");
    setIsDialogOpen(true);
  }

  function openEditDialog(badge: CredlyBadge) {
    setEditingBadge(badge);
    setFormData({
      name: badge.name,
      issuer: badge.issuer,
      credly_url: badge.credly_url,
      badge_image_url: badge.badge_image_url,
      badge_storage_path: badge.badge_storage_path,
      issue_date: badge.issue_date,
      expiry_date: badge.expiry_date || "",
      description: badge.description || "",
      skills: badge.skills || [],
      is_published: badge.is_published,
      display_order: badge.display_order,
    });
    setUploadError(null);
    setCurrentSkillInput("");
    setIsDialogOpen(true);
  }

  function closeDialog() {
    setIsDialogOpen(false);
    setEditingBadge(null);
    setFormData(INITIAL_FORM);
    setUploadError(null);
  }

  // Handle Image Upload
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setIsUploading(true);

    try {
      const validation = await validateBadgeFile(file);
      if (!validation.valid) {
        setUploadError(validation.error || "Invalid file");
        setIsUploading(false);
        return;
      }

      const uploadResult = await uploadBadgeImage(file);
      setFormData((prev) => ({
        ...prev,
        badge_image_url: uploadResult.url,
        badge_storage_path: uploadResult.storagePath,
      }));
      toast.success("Badge image uploaded and sanitized successfully");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      setUploadError(msg);
      toast.error(msg);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  // Handle Skill Tag Input
  function addSkillTag() {
    const trimmed = currentSkillInput.trim();
    if (!trimmed) return;
    if (formData.skills.includes(trimmed)) {
      setCurrentSkillInput("");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      skills: [...prev.skills, trimmed],
    }));
    setCurrentSkillInput("");
  }

  function removeSkillTag(skillToRemove: string) {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove),
    }));
  }

  // Submit Badge Form
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Badge name is required");
      return;
    }
    if (!formData.issuer.trim()) {
      toast.error("Issuing organization is required");
      return;
    }
    if (!formData.credly_url.trim()) {
      toast.error("Credly verification URL is required");
      return;
    }
    if (!formData.badge_image_url.trim()) {
      toast.error("Badge image is required (upload or provide URL)");
      return;
    }
    if (!formData.issue_date) {
      toast.error("Issue date is required");
      return;
    }

    const payload: CredlyBadgeInput = {
      name: formData.name.trim(),
      issuer: formData.issuer.trim(),
      description: formData.description.trim() || null,
      badge_image_url: formData.badge_image_url.trim(),
      badge_storage_path: formData.badge_storage_path,
      credly_url: formData.credly_url.trim(),
      issue_date: formData.issue_date,
      expiry_date: formData.expiry_date ? formData.expiry_date : null,
      skills: formData.skills,
      is_published: formData.is_published,
      display_order: Number(formData.display_order) || 0,
    };

    if (editingBadge) {
      updateMutation.mutate({
        id: editingBadge.id,
        input: payload,
        previousStoragePath: editingBadge.badge_storage_path,
      });
    } else {
      createMutation.mutate(payload);
    }
  }

  // Reorder up/down
  function moveBadge(index: number, direction: "up" | "down") {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= badges.length) return;

    const reordered = [...badges];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    const updates = reordered.map((badge, idx) => ({
      id: badge.id,
      display_order: idx + 1,
    }));

    reorderMutation.mutate(updates);
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Credly Digital Badges"
          subtitle="Manage verified professional badges earned through Credly, customize skills metadata, and configure portfolio visibility."
          badge="CREDENTIALS"
        />
        <div className="flex items-center gap-2.5 shrink-0 -mt-4 sm:mt-0">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-1.5 border border-[#E5E5DF] bg-white px-3 py-2 text-xs font-semibold text-carbon transition-colors hover:border-cobalt hover:text-cobalt disabled:opacity-50"
            title="Refresh database records"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin text-cobalt" : ""}`} />
            Refresh
          </button>
          <button
            type="button"
            onClick={openAddDialog}
            className="inline-flex items-center gap-1.5 bg-cobalt px-3.5 py-2 text-xs font-semibold text-white shadow-2xs transition-colors hover:bg-cobalt/90"
          >
            <Plus className="h-4 w-4" />
            Add New Badge
          </button>
        </div>
      </div>

      {/* Telemetry Matrix */}
      <TelemetryMatrix columns={4}>
        <TelemetryCell
          index={1}
          label="Total Badges"
          value={metrics.total}
          hint="All registered Credly digital credentials"
        />
        <TelemetryCell
          index={2}
          label="Published Badges"
          value={metrics.published}
          status="optimal"
          hint="Live & visible on public portfolio"
        />
        <TelemetryCell
          index={3}
          label="Drafts / Unpublished"
          value={metrics.drafts}
          status={metrics.drafts > 0 ? "warning" : "neutral"}
          hint="Hidden from public visitors"
        />
        <TelemetryCell
          index={4}
          label="Issuing Organizations"
          value={metrics.issuers}
          accent="cobalt"
          hint="Distinct verifying authorities"
        />
      </TelemetryMatrix>

      {/* Main Panel */}
      <Panel
        title="Verified Credly Badges Roster"
        tag="CREDENTIALS"
        action={
          <div className="flex flex-wrap items-center gap-2">
            <span className="mono text-[10px] text-muted-foreground uppercase">
              SHOWING {filteredBadges.length} OF {badges.length}
            </span>
          </div>
        }
      >
        {/* Search & Filter Controls */}
        <div className="mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 border-b border-[#E5E5DF] pb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by badge name, issuer, or skills…"
              className="w-full pl-9 pr-4 py-2 border border-[#E5E5DF] bg-[#FAF9F6] text-xs text-carbon placeholder:text-muted-foreground/60 focus:outline-none focus:border-cobalt focus:bg-white"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-carbon text-xs"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {(["all", "published", "draft"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setStatusFilter(mode)}
                className={`mono px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider transition-colors border ${
                  statusFilter === mode
                    ? "border-cobalt bg-cobalt text-white"
                    : "border-[#E5E5DF] bg-white text-carbon/70 hover:border-carbon/40"
                }`}
              >
                {mode === "all" ? "All" : mode === "published" ? "Published" : "Drafts"}
              </button>
            ))}
          </div>
        </div>

        {/* Loading / Error States */}
        {isLoading && <LoadingState label="Loading Credly badges from database…" />}

        {isError && (
          <ErrorState
            message={
              error instanceof Error
                ? error.message
                : "Failed to connect to database. Please check Supabase connectivity."
            }
          />
        )}

        {/* Empty State */}
        {!isLoading && !isError && filteredBadges.length === 0 && (
          <div className="border border-dashed border-[#E5E5DF] bg-[#FAF9F6]/50 p-10 text-center">
            <Award className="mx-auto h-8 w-8 text-muted-foreground/50 mb-3" />
            <h3 className="mono text-xs font-bold text-carbon uppercase tracking-wider">
              {searchQuery ? "No matching badges found" : "No Credly Badges Registered"}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
              {searchQuery
                ? "Try adjusting your search terms or filter settings."
                : "Add your first Credly badge by pasting a public badge link or uploading an image badge downloaded from Credly."}
            </p>
            {!searchQuery && (
              <button
                type="button"
                onClick={openAddDialog}
                className="mt-4 inline-flex items-center gap-1.5 bg-cobalt px-3.5 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-cobalt/90"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Badge Now
              </button>
            )}
          </div>
        )}

        {/* Badges Table / Cards */}
        {!isLoading && !isError && filteredBadges.length > 0 && (
          <div className="divide-y divide-[#E5E5DF] border border-[#E5E5DF] bg-white">
            {filteredBadges.map((badge, idx) => (
              <div
                key={badge.id}
                className="group flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 md:p-5 transition-colors hover:bg-[#FAF9F6]/80"
              >
                {/* Left: Thumbnail & Badge Metadata */}
                <div className="flex items-start gap-4 min-w-0 flex-1">
                  {/* Badge Image Thumbnail */}
                  <div className="relative flex h-14 w-14 shrink-0 items-center justify-center border border-[#E5E5DF] bg-white p-1.5 shadow-2xs overflow-hidden">
                    <img
                      src={badge.badge_image_url}
                      alt={badge.name}
                      className="h-full w-full object-contain"
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.style.display = "none";
                        if (target.parentElement) {
                          target.parentElement.innerHTML =
                            '<div class="flex items-center justify-center w-full h-full text-cobalt"><svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg></div>';
                        }
                      }}
                    />
                  </div>

                  {/* Metadata */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-sm font-bold text-carbon group-hover:text-cobalt transition-colors truncate">
                        {badge.name}
                      </h3>
                      {badge.is_published ? (
                        <StatusTag status="optimal" code="LIVE">
                          Published
                        </StatusTag>
                      ) : (
                        <StatusTag status="warning" code="DRAFT">
                          Unpublished
                        </StatusTag>
                      )}
                      <span className="mono text-[10px] text-muted-foreground/70">
                        Order #{badge.display_order}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mb-2">
                      <span className="mono font-semibold text-cobalt flex items-center gap-1">
                        <Building className="h-3 w-3" />
                        {badge.issuer}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Issued: {badge.issue_date}
                      </span>
                      {badge.expiry_date && <span>Expires: {badge.expiry_date}</span>}
                    </div>

                    {/* Associated Skills */}
                    {badge.skills && badge.skills.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                        {badge.skills.map((skill) => (
                          <span
                            key={skill}
                            className="mono inline-flex items-center gap-1 border border-[#E5E5DF] bg-[#FAF9F6] px-2 py-0.5 text-[9px] font-semibold text-carbon"
                          >
                            <Tag className="h-2.5 w-2.5 text-cobalt/70" />
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-wrap items-center gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-[#E5E5DF]">
                  {/* Reorder Buttons */}
                  <div className="flex items-center border border-[#E5E5DF] bg-white">
                    <button
                      type="button"
                      disabled={idx === 0 || reorderMutation.isPending}
                      onClick={() => moveBadge(idx, "up")}
                      className="p-1.5 text-muted-foreground hover:text-carbon hover:bg-[#FAF9F6] disabled:opacity-30 disabled:pointer-events-none"
                      title="Move Up"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <div className="h-3.5 w-[1px] bg-[#E5E5DF]" />
                    <button
                      type="button"
                      disabled={idx === filteredBadges.length - 1 || reorderMutation.isPending}
                      onClick={() => moveBadge(idx, "down")}
                      className="p-1.5 text-muted-foreground hover:text-carbon hover:bg-[#FAF9F6] disabled:opacity-30 disabled:pointer-events-none"
                      title="Move Down"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Verify Link */}
                  <a
                    href={badge.credly_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 border border-[#E5E5DF] bg-white px-2.5 py-1.5 text-[11px] font-medium text-carbon hover:border-cobalt hover:text-cobalt transition-colors"
                    title="Verify on Credly"
                  >
                    <ExternalLink className="h-3 w-3" />
                    <span>Verify</span>
                  </a>

                  {/* Toggle Publish */}
                  <button
                    type="button"
                    onClick={() =>
                      togglePublishMutation.mutate({
                        id: badge.id,
                        is_published: !badge.is_published,
                      })
                    }
                    disabled={togglePublishMutation.isPending}
                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium border transition-colors ${
                      badge.is_published
                        ? "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100"
                        : "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                    }`}
                    title={
                      badge.is_published
                        ? "Unpublish from public portfolio"
                        : "Publish to public portfolio"
                    }
                  >
                    {badge.is_published ? (
                      <>
                        <EyeOff className="h-3 w-3" />
                        <span>Unpublish</span>
                      </>
                    ) : (
                      <>
                        <Eye className="h-3 w-3" />
                        <span>Publish</span>
                      </>
                    )}
                  </button>

                  {/* Edit */}
                  <button
                    type="button"
                    onClick={() => openEditDialog(badge)}
                    className="inline-flex items-center gap-1 border border-[#E5E5DF] bg-white px-2.5 py-1.5 text-[11px] font-medium text-carbon hover:border-cobalt hover:text-cobalt transition-colors"
                  >
                    <Edit3 className="h-3 w-3" />
                    <span>Edit</span>
                  </button>

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => setDeletingBadge(badge)}
                    className="inline-flex items-center gap-1 border border-rose-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>

      {/* Add / Edit Badge Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto border-[#E5E5DF] bg-white p-6">
          <DialogHeader>
            <div className="flex items-center gap-2 text-cobalt">
              <Award className="h-5 w-5" />
              <DialogTitle className="text-base font-bold text-carbon">
                {editingBadge ? "Edit Credly Digital Badge" : "Add New Credly Digital Badge"}
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground">
              Provide the verified badge metadata, upload or link the badge artwork, and configure
              skills and visibility.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            {/* Row 1: Name and Issuer */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="mono text-[10px] font-bold uppercase tracking-wider text-carbon block mb-1.5">
                  Badge Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AWS Knowledge: Cloud Essentials"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-[#E5E5DF] bg-[#FAF9F6] px-3 py-2 text-xs text-carbon focus:border-cobalt focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="mono text-[10px] font-bold uppercase tracking-wider text-carbon block mb-1.5">
                  Issuing Organization <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amazon Web Services"
                  value={formData.issuer}
                  onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                  className="w-full border border-[#E5E5DF] bg-[#FAF9F6] px-3 py-2 text-xs text-carbon focus:border-cobalt focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            {/* Row 2: Credly Verification URL */}
            <div>
              <label className="mono text-[10px] font-bold uppercase tracking-wider text-carbon block mb-1.5">
                Credly Verification URL <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="url"
                  required
                  placeholder="https://www.credly.com/badges/..."
                  value={formData.credly_url}
                  onChange={(e) => setFormData({ ...formData, credly_url: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 border border-[#E5E5DF] bg-[#FAF9F6] text-xs text-carbon focus:border-cobalt focus:bg-white focus:outline-none"
                />
              </div>
              <p className="mt-1 mono text-[9px] text-muted-foreground">
                The public Credly verification link. Visitors can click this to verify your
                credential.
              </p>
            </div>

            {/* Row 3: Badge Image (Upload or URL) */}
            <div className="border border-[#E5E5DF] bg-[#FAF9F6] p-4">
              <label className="mono text-[10px] font-bold uppercase tracking-wider text-carbon block mb-2">
                Badge Image / Artwork <span className="text-rose-500">*</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                {/* Image Preview */}
                <div className="sm:col-span-3 flex flex-col items-center justify-center">
                  <div className="relative flex h-20 w-20 items-center justify-center border border-[#E5E5DF] bg-white p-2 shadow-2xs">
                    {formData.badge_image_url ? (
                      <img
                        src={formData.badge_image_url}
                        alt="Badge Preview"
                        className="h-full w-full object-contain"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.style.display = "none";
                          if (target.parentElement) {
                            target.parentElement.innerHTML =
                              '<span class="mono text-[9px] text-rose-500 text-center">Invalid Image</span>';
                          }
                        }}
                      />
                    ) : (
                      <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
                    )}
                  </div>
                  <span className="mono text-[9px] text-muted-foreground mt-1.5">
                    {formData.badge_image_url ? "Preview" : "No image"}
                  </span>
                </div>

                {/* Upload Options */}
                <div className="sm:col-span-9 space-y-2.5">
                  <div>
                    <span className="mono text-[9px] text-muted-foreground uppercase block mb-1">
                      Method A: Direct Public Badge Image URL
                    </span>
                    <input
                      type="url"
                      placeholder="https://images.credly.com/images/... or public CDN"
                      value={formData.badge_image_url}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          badge_image_url: e.target.value,
                          badge_storage_path: null,
                        })
                      }
                      className="w-full border border-[#E5E5DF] bg-white px-3 py-1.5 text-xs text-carbon focus:border-cobalt focus:outline-none"
                    />
                  </div>

                  <div>
                    <span className="mono text-[9px] text-muted-foreground uppercase block mb-1">
                      Method B: Upload Credly Badge File (PNG, JPEG, WebP, SVG)
                    </span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".png,.jpg,.jpeg,.webp,.svg,image/png,image/jpeg,image/webp,image/svg+xml"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="badge-file-upload"
                    />
                    <label
                      htmlFor="badge-file-upload"
                      className={`inline-flex items-center gap-2 border border-[#E5E5DF] bg-white px-3 py-2 text-xs font-semibold text-carbon hover:border-cobalt hover:text-cobalt cursor-pointer transition-colors ${
                        isUploading ? "opacity-60 pointer-events-none" : ""
                      }`}
                    >
                      {isUploading ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-cobalt" />
                      ) : (
                        <Upload className="h-3.5 w-3.5" />
                      )}
                      <span>
                        {isUploading ? "Sanitizing & Uploading…" : "Upload Badge Image File"}
                      </span>
                    </label>
                  </div>

                  {uploadError && (
                    <p className="mono text-[10px] text-rose-600 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3 shrink-0" />
                      {uploadError}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Row 4: Issue Date & Expiry Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="mono text-[10px] font-bold uppercase tracking-wider text-carbon block mb-1.5">
                  Issue Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.issue_date}
                  onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                  className="w-full border border-[#E5E5DF] bg-[#FAF9F6] px-3 py-2 text-xs text-carbon focus:border-cobalt focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="mono text-[10px] font-bold uppercase tracking-wider text-carbon block mb-1.5">
                  Expiry Date <span className="text-muted-foreground font-normal">(Optional)</span>
                </label>
                <input
                  type="date"
                  value={formData.expiry_date}
                  onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                  className="w-full border border-[#E5E5DF] bg-[#FAF9F6] px-3 py-2 text-xs text-carbon focus:border-cobalt focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            {/* Row 5: Description */}
            <div>
              <label className="mono text-[10px] font-bold uppercase tracking-wider text-carbon block mb-1.5">
                Description / Criteria{" "}
                <span className="text-muted-foreground font-normal">(Optional)</span>
              </label>
              <textarea
                rows={2}
                placeholder="Brief summary of skills or requirements demonstrated to earn this badge…"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full border border-[#E5E5DF] bg-[#FAF9F6] px-3 py-2 text-xs text-carbon focus:border-cobalt focus:bg-white focus:outline-none resize-none"
              />
            </div>

            {/* Row 6: Skills Associated with Badge */}
            <div>
              <label className="mono text-[10px] font-bold uppercase tracking-wider text-carbon block mb-1.5">
                Associated Skills
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Type a skill and click Add or press Enter (e.g. AWS, Docker, Kubernetes)…"
                  value={currentSkillInput}
                  onChange={(e) => setCurrentSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSkillTag();
                    }
                  }}
                  className="flex-1 border border-[#E5E5DF] bg-[#FAF9F6] px-3 py-1.5 text-xs text-carbon focus:border-cobalt focus:bg-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={addSkillTag}
                  className="border border-[#E5E5DF] bg-white px-3 py-1.5 text-xs font-semibold text-carbon hover:border-cobalt hover:text-cobalt"
                >
                  Add Skill
                </button>
              </div>

              {/* Skills Tags List */}
              {formData.skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 border border-[#E5E5DF] bg-white p-2.5">
                  {formData.skills.map((skill) => (
                    <span
                      key={skill}
                      className="mono inline-flex items-center gap-1.5 bg-[#FAF9F6] border border-[#E5E5DF] px-2 py-0.5 text-[10px] text-carbon font-semibold"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => removeSkillTag(skill)}
                        className="text-muted-foreground hover:text-rose-600 transition-colors"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Row 7: Display Order and Publish Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-[#E5E5DF] pt-4">
              <div>
                <label className="mono text-[10px] font-bold uppercase tracking-wider text-carbon block mb-1.5">
                  Display Order
                </label>
                <input
                  type="number"
                  min={1}
                  value={formData.display_order}
                  onChange={(e) =>
                    setFormData({ ...formData, display_order: Number(e.target.value) || 1 })
                  }
                  className="w-full border border-[#E5E5DF] bg-[#FAF9F6] px-3 py-2 text-xs text-carbon focus:border-cobalt focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-4 sm:pt-6">
                <input
                  type="checkbox"
                  id="badge-is-published"
                  checked={formData.is_published}
                  onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                  className="h-4 w-4 border-[#E5E5DF] text-cobalt focus:ring-cobalt accent-cobalt cursor-pointer"
                />
                <label
                  htmlFor="badge-is-published"
                  className="text-xs font-semibold text-carbon cursor-pointer"
                >
                  Publish Badge to Public Portfolio
                </label>
              </div>
            </div>

            <DialogFooter className="border-t border-[#E5E5DF] pt-4">
              <button
                type="button"
                onClick={closeDialog}
                className="border border-[#E5E5DF] bg-white px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-carbon"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending || isUploading}
                className="inline-flex items-center gap-1.5 bg-cobalt px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-cobalt/90 disabled:opacity-50"
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                )}
                <span>{editingBadge ? "Save Changes" : "Create Badge"}</span>
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog
        open={Boolean(deletingBadge)}
        onOpenChange={(open) => {
          if (!open) setDeletingBadge(null);
        }}
      >
        <AlertDialogContent className="border-[#E5E5DF] bg-white">
          <AlertDialogHeader>
            <div className="flex items-center gap-2 text-rose-600 mb-1">
              <AlertTriangle className="h-5 w-5" />
              <AlertDialogTitle className="text-base font-bold text-carbon">
                Delete Credly Badge?
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to permanently delete{" "}
              <strong className="text-carbon font-semibold">"{deletingBadge?.name}"</strong>?
              {deletingBadge?.badge_storage_path && (
                <span className="block mt-2 text-amber-700 bg-amber-50 p-2 border border-amber-200">
                  Notice: The badge's uploaded storage file will also be deleted from the
                  credly-badges bucket.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingBadge) {
                  deleteMutation.mutate({
                    id: deletingBadge.id,
                    storagePath: deletingBadge.badge_storage_path,
                  });
                }
              }}
              className="bg-rose-600 text-white hover:bg-rose-700 text-xs"
            >
              {deleteMutation.isPending ? "Deleting…" : "Confirm Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
