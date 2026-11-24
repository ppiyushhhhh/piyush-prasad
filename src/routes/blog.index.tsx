import { useState, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  BookOpen,
  Search,
  Clock,
  Calendar,
  ArrowRight,
  Network,
  Cloud,
  Terminal,
  ShieldCheck,
  Tag,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";

import { Navigation } from "@/components/portfolio/Navigation";
import { Footer } from "@/components/portfolio/Footer";
import { CustomCursor } from "@/components/portfolio/CustomCursor";
import { CommandPalette } from "@/components/portfolio/CommandPalette";
import { AskPiyushAI } from "@/components/portfolio/AskPiyushAI";
import { fetchPublishedBlogPosts, BLOG_CATEGORIES, type BlogPost } from "@/lib/blog";
import { SITE_URL } from "@/lib/site";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "Technical Blog & Learning Center — Piyush Prasad" },
      {
        name: "description",
        content:
          "Practical tutorials, cloud infrastructure guides, and engineering knowledge based on real-world implementations by Piyush Prasad.",
      },
      { property: "og:title", content: "Technical Blog & Learning Center — Piyush Prasad" },
      {
        property: "og:description",
        content:
          "Practical tutorials, cloud infrastructure guides, and engineering knowledge based on real-world implementations.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/blog` },
      { property: "og:image", content: `${SITE_URL}/og-image.png` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Technical Blog & Learning Center — Piyush Prasad" },
      {
        name: "twitter:description",
        content:
          "Practical tutorials, cloud infrastructure guides, and engineering knowledge based on real-world implementations.",
      },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/blog` }],
  }),
  component: BlogListingPage,
});

function getCategoryIcon(cat: string) {
  switch (cat) {
    case "Networking & DNS":
      return Network;
    case "Cloud Infrastructure":
      return Cloud;
    case "Linux & Systems":
      return Terminal;
    default:
      return ShieldCheck;
  }
}

function BlogListingPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["published-blog-posts"],
    queryFn: fetchPublishedBlogPosts,
    staleTime: 60_000,
  });

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesSearch =
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.short_description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" || post.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [posts, searchQuery, selectedCategory]);

  return (
    <div className="relative min-h-screen bg-background text-carbon selection:bg-cobalt selection:text-white">
      <CustomCursor />
      <Navigation />

      <main className="relative z-10 pt-28 pb-20 md:pt-36 md:pb-28">
        <div className="mx-auto max-w-[1200px] px-6 md:px-10">
          {/* Editorial Header */}
          <div className="border-b border-border pb-10">
            <div className="inline-flex items-center gap-2 border border-border bg-surface px-3 py-1 shadow-2xs text-[11px] font-mono text-text-muted mb-4">
              <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
              <span>LEARNING CENTER &amp; ARCHITECTURE GUIDES</span>
            </div>

            <h1 className="display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-text">
              Technical Blog
            </h1>
            <p className="mt-3 max-w-2xl text-base md:text-lg text-text-muted leading-relaxed">
              Practical tutorials, infrastructure guides, and engineering knowledge based on
              real-world implementations.
            </p>

            {/* Filter and Search Bar */}
            <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                <input
                  type="text"
                  placeholder="Search articles by topic, keyword, or tool..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full border border-border bg-surface pl-9 pr-4 py-2 text-xs text-text placeholder:text-text-muted focus:border-accent focus:outline-none shadow-2xs"
                />
              </div>

              {/* Category Pills */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedCategory("all")}
                  className={`mono px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer border ${
                    selectedCategory === "all"
                      ? "border-accent bg-accent text-text-on-accent"
                      : "border-border bg-surface text-text hover:border-accent hover:text-accent"
                  }`}
                >
                  All ({posts.length})
                </button>
                {BLOG_CATEGORIES.map((cat) => {
                  const count = posts.filter((p) => p.category === cat).length;
                  const isSelected = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`mono px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer border ${
                        isSelected
                          ? "border-accent bg-accent text-text-on-accent"
                          : "border-border bg-surface text-text hover:border-accent hover:text-accent"
                      }`}
                    >
                      {cat} ({count})
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Article Grid */}
          <div className="mt-12">
            {isLoading ? (
              <div className="py-20 text-center mono text-xs text-text-muted">
                Loading technical articles...
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="py-20 text-center border border-border bg-surface p-10">
                <BookOpen className="mx-auto h-8 w-8 text-text-muted opacity-50 mb-3" />
                <h3 className="text-sm font-semibold text-text">No articles found</h3>
                <p className="text-xs text-text-muted mt-1">
                  Try adjusting your search query or select another category filter.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPosts.map((post) => {
                  const Icon = getCategoryIcon(post.category);
                  return (
                    <article
                      key={post.id}
                      className="group flex flex-col justify-between border border-border bg-surface p-6 shadow-2xs transition-all hover:-translate-y-1 hover:border-accent hover:shadow-md"
                    >
                      <div className="space-y-4">
                        {/* Technical Illustration / Icon Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex h-10 w-10 items-center justify-center border border-border bg-surface-muted text-accent group-hover:border-accent group-hover:bg-accent-soft transition-colors">
                            <Icon className="h-5 w-5" />
                          </div>
                          <span className="mono text-[10px] font-semibold border border-border bg-surface-muted px-2.5 py-1 text-accent">
                            {post.category}
                          </span>
                        </div>

                        {/* Title & Subtitle */}
                        <div>
                          <Link
                            to="/blog/$slug"
                            params={{ slug: post.slug }}
                            className="block"
                          >
                            <h2 className="text-lg font-bold text-text group-hover:text-accent transition-colors leading-snug">
                              {post.title}
                            </h2>
                          </Link>
                          <p className="mono text-[11px] text-accent/90 mt-1 font-medium">
                            {post.subtitle}
                          </p>
                        </div>

                        {/* Abstract */}
                        <p className="text-xs text-text-muted leading-relaxed line-clamp-3">
                          {post.short_description}
                        </p>
                      </div>

                      {/* Meta & CTA Footer */}
                      <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-[11px] font-mono text-text-muted">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-accent" />
                            <span>{post.reading_time}</span>
                          </span>
                          <span>•</span>
                          <span>{post.published_date}</span>
                        </div>

                        <Link
                          to="/blog/$slug"
                          params={{ slug: post.slug }}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-accent group-hover:underline"
                        >
                          <span>Read</span>
                          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
      <CommandPalette />
      <AskPiyushAI />
    </div>
  );
}
