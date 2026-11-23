import { Link } from "@tanstack/react-router";
import {
  BookOpen,
  ArrowRight,
  Clock,
  Calendar,
  Network,
  Cloud,
  Terminal,
  ArrowUpRight,
} from "lucide-react";
import { INITIAL_BLOG_POSTS } from "@/lib/blog";

export function BlogSection() {
  const posts = INITIAL_BLOG_POSTS.slice(0, 3);

  const getIcon = (cat: string) => {
    switch (cat) {
      case "Networking & DNS":
        return Network;
      case "Cloud Infrastructure":
        return Cloud;
      case "Linux & Systems":
        return Terminal;
      default:
        return BookOpen;
    }
  };

  return (
    <section id="blog" className="border-b border-border bg-background py-20 md:py-28 scroll-mt-20">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8">
          <div>
            <div className="mono text-accent text-[11px] font-bold tracking-[0.2em] mb-2">
              LEARNING CENTER &amp; ARCHITECTURES
            </div>
            <h2 className="display text-3xl sm:text-4xl font-bold tracking-tight text-text">
              Technical Blog
            </h2>
            <p className="mt-2 text-sm md:text-base text-text-muted max-w-2xl">
              Practical tutorials, infrastructure guides, and engineering knowledge based on
              real-world implementations.
            </p>
          </div>

          <Link
            to="/blog"
            className="inline-flex items-center gap-2 border border-border bg-surface px-4 py-2.5 text-xs font-semibold text-text hover:border-accent hover:text-accent transition-all self-start md:self-auto shadow-2xs"
          >
            <span>View All Articles</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* 3 Articles Grid */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => {
            const Icon = getIcon(post.category);
            return (
              <article
                key={post.id}
                className="group flex flex-col justify-between border border-border bg-surface p-6 shadow-2xs transition-all hover:-translate-y-1 hover:border-accent hover:shadow-md"
              >
                <div className="space-y-4">
                  {/* Category & Icon */}
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
                    <Link to="/blog/$slug" params={{ slug: post.slug }} className="block">
                      <h3 className="text-base font-bold text-text group-hover:text-accent transition-colors leading-snug">
                        {post.title}
                      </h3>
                    </Link>
                    <p className="mono text-[10px] text-accent mt-1">{post.subtitle}</p>
                  </div>

                  {/* Excerpt */}
                  <p className="text-xs text-text-muted leading-relaxed line-clamp-3">
                    {post.short_description}
                  </p>
                </div>

                {/* Footer Metadata & CTA */}
                <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-[11px] font-mono text-text-muted">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3 text-accent" />
                    <span>{post.reading_time}</span>
                  </div>

                  <Link
                    to="/blog/$slug"
                    params={{ slug: post.slug }}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-accent group-hover:underline"
                  >
                    <span>Read Article</span>
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
