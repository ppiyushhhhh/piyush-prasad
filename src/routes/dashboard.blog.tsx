import { useState, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  BookOpen,
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
  Calendar,
  Sparkles,
  Link as LinkIcon,
  AlertTriangle,
  Loader2,
  Tag,
  Clock,
  Globe,
  Shield,
  FileText,
  X,
  Check,
} from "lucide-react";
import { toast } from "sonner";

import {
  fetchAllBlogPostsAdmin,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  toggleBlogPostPublish,
  BLOG_CATEGORIES,
  type BlogPost,
  type BlogPostInput,
} from "@/lib/blog";
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

export const Route = createFileRoute("/dashboard/blog")({
  head: () => ({
    meta: [
      { title: "Technical Blog CMS — Operations Console" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: DashboardBlogPage,
});

function DashboardBlogPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [deletingPost, setDeletingPost] = useState<BlogPost | null>(null);

  // Form fields
  const [formData, setFormData] = useState<BlogPostInput>({
    title: "",
    slug: "",
    subtitle: "",
    short_description: "",
    category: BLOG_CATEGORIES[0],
    reading_time: "10 min read",
    published_date: "November 2026",
    cover_image_url: "",
    cover_icon: "BookOpen",
    is_published: true,
    is_featured: false,
    seo_title: "",
    seo_description: "",
  });

  // Query blog posts
  const {
    data: posts = [],
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["admin-blog-posts"],
    queryFn: fetchAllBlogPostsAdmin,
    staleTime: 60_000,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: createBlogPost,
    onSuccess: () => {
      toast.success("Article created successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
      closeForm();
    },
    onError: (err: Error) => {
      toast.error(`Failed to create article: ${err.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<BlogPostInput> }) =>
      updateBlogPost(id, input),
    onSuccess: () => {
      toast.success("Article updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
      closeForm();
    },
    onError: (err: Error) => {
      toast.error(`Failed to update article: ${err.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBlogPost,
    onSuccess: () => {
      toast.success("Article deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
      setDeletingPost(null);
    },
    onError: (err: Error) => {
      toast.error(`Failed to delete article: ${err.message}`);
    },
  });

  const togglePublishMutation = useMutation({
    mutationFn: ({ id, is_published }: { id: string; is_published: boolean }) =>
      toggleBlogPostPublish(id, is_published),
    onSuccess: (updated) => {
      toast.success(
        updated.is_published ? "Article published live" : "Article moved to drafts"
      );
      queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
    },
    onError: (err: Error) => {
      toast.error(`Failed to update status: ${err.message}`);
    },
  });

  // Filtered posts
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesSearch =
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.short_description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.slug.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        categoryFilter === "all" || post.category === categoryFilter;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "published" && post.is_published) ||
        (statusFilter === "draft" && !post.is_published);

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [posts, searchQuery, categoryFilter, statusFilter]);

  // Telemetry metrics
  const stats = useMemo(() => {
    const total = posts.length;
    const published = posts.filter((p) => p.is_published).length;
    const drafts = total - published;
    const featured = posts.filter((p) => p.is_featured).length;
    return { total, published, drafts, featured };
  }, [posts]);

  // Open create form
  const handleOpenCreate = () => {
    setEditingPost(null);
    setFormData({
      title: "",
      slug: "",
      subtitle: "",
      short_description: "",
      category: BLOG_CATEGORIES[0],
      reading_time: "10 min read",
      published_date: "November 2026",
      cover_image_url: "",
      cover_icon: "BookOpen",
      is_published: true,
      is_featured: false,
      seo_title: "",
      seo_description: "",
    });
    setIsFormOpen(true);
  };

  // Open edit form
  const handleOpenEdit = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      slug: post.slug,
      subtitle: post.subtitle,
      short_description: post.short_description,
      category: post.category,
      reading_time: post.reading_time,
      published_date: post.published_date,
      cover_image_url: post.cover_image_url || "",
      cover_icon: post.cover_icon || "BookOpen",
      is_published: post.is_published,
      is_featured: post.is_featured,
      seo_title: post.seo_title,
      seo_description: post.seo_description,
    });
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingPost(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.slug.trim()) {
      toast.error("Title and URL Slug are required");
      return;
    }

    if (editingPost) {
      updateMutation.mutate({ id: editingPost.id, input: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Technical Blog CMS"
        subtitle="Publish, edit, and organize tutorials, architecture guides, and technical learning articles."
      />

      {/* Metrics Row */}
      <TelemetryMatrix columns={4}>
        <TelemetryCell label="Total Articles" value={stats.total} hint="Database records" />
        <TelemetryCell
          label="Published Live"
          value={stats.published}
          hint="Visible to public visitors"
          status={stats.published > 0 ? "optimal" : "neutral"}
        />
        <TelemetryCell label="Drafts" value={stats.drafts} hint="Work in progress" />
        <TelemetryCell label="Featured Articles" value={stats.featured} hint="Shown on homepage" />
      </TelemetryMatrix>

      {/* Controls & Filters Bar */}
      <Panel title="Search & Filtering">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search articles by title, description or slug..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-border bg-background pl-9 pr-4 py-2 text-xs text-text placeholder:text-text-muted focus:border-accent focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="border border-border bg-surface px-3 py-2 text-xs text-text focus:border-accent focus:outline-none"
            >
              <option value="all">All Categories</option>
              {BLOG_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-border bg-surface px-3 py-2 text-xs text-text focus:border-accent focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>

            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-1.5 bg-accent px-3 py-2 text-xs font-semibold text-text-on-accent hover:bg-accent-hover transition-all cursor-pointer shadow-xs"
            >
              <Plus className="h-4 w-4" />
              <span>New Article</span>
            </button>
          </div>
        </div>
      </Panel>

      {/* Content Area */}
      {isLoading ? (
        <LoadingState label="Loading articles from database..." />
      ) : isError ? (
        <ErrorState
          message={(error as Error)?.message || "Unknown database error"}
        />
      ) : filteredPosts.length === 0 ? (
        <EmptyState
          title="No articles found"
          description="Try adjusting your search criteria or create your first technical blog article."
        />
      ) : (
        <div className="border border-border bg-surface divide-y divide-border">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors hover:bg-surface-muted/50"
            >
              <div className="space-y-1.5 flex-1 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-semibold uppercase ${
                      post.is_published
                        ? "bg-success/10 text-success border border-success/30"
                        : "bg-surface-muted text-text-muted border border-border"
                    }`}
                  >
                    {post.is_published ? (
                      <>
                        <CheckCircle2 className="h-3 w-3" />
                        Published
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-3 w-3" />
                        Draft
                      </>
                    )}
                  </span>

                  <span className="mono text-[10px] border border-border bg-surface px-2 py-0.5 text-accent font-medium">
                    {post.category}
                  </span>

                  <span className="mono text-[10px] text-text-muted flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {post.reading_time}
                  </span>

                  <span className="mono text-[10px] text-text-muted flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {post.published_date}
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-text group-hover:text-accent">
                  {post.title}
                </h3>
                <p className="text-xs text-text-muted line-clamp-2">{post.short_description}</p>
                <div className="mono text-[11px] text-accent/80">/blog/{post.slug}</div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-start md:self-center shrink-0">
                <Link
                  to="/blog/$slug"
                  params={{ slug: post.slug }}
                  target="_blank"
                  className="inline-flex items-center gap-1 border border-border bg-surface px-2.5 py-1.5 text-xs text-text hover:border-accent hover:text-accent"
                  title="View Public Article Page"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Preview</span>
                </Link>

                <button
                  type="button"
                  onClick={() =>
                    togglePublishMutation.mutate({
                      id: post.id,
                      is_published: !post.is_published,
                    })
                  }
                  className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold cursor-pointer border ${
                    post.is_published
                      ? "border-border bg-surface text-text hover:border-amber-500 hover:text-amber-600"
                      : "border-success/30 bg-success/10 text-success hover:bg-success/20"
                  }`}
                  title={post.is_published ? "Unpublish to draft" : "Publish to live website"}
                >
                  {post.is_published ? (
                    <>
                      <EyeOff className="h-3.5 w-3.5" />
                      <span>Unpublish</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>Publish</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenEdit(post)}
                  className="inline-flex items-center gap-1 border border-border bg-surface px-2.5 py-1.5 text-xs text-text hover:border-accent hover:text-accent cursor-pointer"
                  title="Edit Article Details"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Edit</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDeletingPost(post)}
                  className="inline-flex items-center gap-1 border border-border bg-surface px-2.5 py-1.5 text-xs text-danger hover:border-danger/40 hover:bg-danger/10 cursor-pointer"
                  title="Delete Article"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Dialog Modal */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPost ? "Edit Technical Article" : "Create Technical Article"}
            </DialogTitle>
            <DialogDescription>
              Configure article metadata, URL slug, category, reading time, and publishing status.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="mono text-xs font-semibold text-text">Article Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    const slug = editingPost
                      ? formData.slug
                      : title
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, "-")
                          .replace(/(^-|-$)/g, "");
                    setFormData((prev) => ({ ...prev, title, slug }));
                  }}
                  placeholder="e.g. DNS Explained: How Domain Names Connect to Websites"
                  className="w-full border border-border bg-background px-3 py-2 text-xs text-text focus:border-accent focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="mono text-xs font-semibold text-text">URL Slug *</label>
                <div className="flex items-center">
                  <span className="border border-r-0 border-border bg-surface-muted px-2.5 py-2 text-xs text-text-muted">
                    /blog/
                  </span>
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
                    placeholder="dns-explained"
                    className="w-full border border-border bg-background px-3 py-2 text-xs text-text focus:border-accent focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="mono text-xs font-semibold text-text">Subtitle</label>
              <input
                type="text"
                value={formData.subtitle}
                onChange={(e) => setFormData((prev) => ({ ...prev, subtitle: e.target.value }))}
                placeholder="Brief explanatory subtitle"
                className="w-full border border-border bg-background px-3 py-2 text-xs text-text focus:border-accent focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="mono text-xs font-semibold text-text">Short Description / Abstract *</label>
              <textarea
                required
                rows={3}
                value={formData.short_description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, short_description: e.target.value }))
                }
                placeholder="High-level summary shown in cards and search snippets..."
                className="w-full border border-border bg-background px-3 py-2 text-xs text-text focus:border-accent focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="mono text-xs font-semibold text-text">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      category: e.target.value as any,
                    }))
                  }
                  className="w-full border border-border bg-background px-3 py-2 text-xs text-text focus:border-accent focus:outline-none"
                >
                  {BLOG_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="mono text-xs font-semibold text-text">Reading Time</label>
                <input
                  type="text"
                  value={formData.reading_time}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, reading_time: e.target.value }))
                  }
                  placeholder="e.g. 10 min read"
                  className="w-full border border-border bg-background px-3 py-2 text-xs text-text focus:border-accent focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="mono text-xs font-semibold text-text">Publication Date</label>
                <input
                  type="text"
                  value={formData.published_date}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, published_date: e.target.value }))
                  }
                  placeholder="e.g. November 2026"
                  className="w-full border border-border bg-background px-3 py-2 text-xs text-text focus:border-accent focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="mono text-xs font-semibold text-text">SEO Title</label>
                <input
                  type="text"
                  value={formData.seo_title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, seo_title: e.target.value }))}
                  placeholder="Defaults to Article Title"
                  className="w-full border border-border bg-background px-3 py-2 text-xs text-text focus:border-accent focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="mono text-xs font-semibold text-text">Cover Image URL</label>
                <input
                  type="text"
                  value={formData.cover_image_url}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, cover_image_url: e.target.value }))
                  }
                  placeholder="https://... or /og-image.png"
                  className="w-full border border-border bg-background px-3 py-2 text-xs text-text focus:border-accent focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-6 pt-2 border-t border-border">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_published}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, is_published: e.target.checked }))
                  }
                  className="h-4 w-4 border-border text-accent focus:ring-accent"
                />
                <span className="text-xs font-semibold text-text">Published Live (Public View)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, is_featured: e.target.checked }))
                  }
                  className="h-4 w-4 border-border text-accent focus:ring-accent"
                />
                <span className="text-xs font-semibold text-text">Featured Article</span>
              </label>
            </div>

            <DialogFooter className="pt-4 border-t border-border flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={closeForm}
                className="border border-border bg-surface px-4 py-2 text-xs font-medium text-text hover:bg-surface-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="inline-flex items-center gap-2 bg-accent px-4 py-2 text-xs font-semibold text-text-on-accent hover:bg-accent-hover disabled:opacity-50"
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                )}
                <span>{editingPost ? "Save Changes" : "Create Article"}</span>
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingPost} onOpenChange={() => setDeletingPost(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Article Confirmation</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete &ldquo;{deletingPost?.title}&rdquo;? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex items-center justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => setDeletingPost(null)}
              className="border border-border bg-surface px-4 py-2 text-xs font-medium text-text"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={deleteMutation.isPending}
              onClick={() => deletingPost && deleteMutation.mutate(deletingPost.id)}
              className="inline-flex items-center gap-2 bg-danger px-4 py-2 text-xs font-semibold text-white hover:bg-danger/90"
            >
              {deleteMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>Delete Permanently</span>
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
