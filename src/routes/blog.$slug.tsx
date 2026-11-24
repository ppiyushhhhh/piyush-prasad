import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Clock,
  Calendar,
  ArrowLeft,
  ArrowRight,
  Copy,
  Check,
  Terminal,
  Shield,
  AlertCircle,
  Hash,
  ChevronDown,
  ChevronUp,
  Server,
  Globe,
  HardDrive,
  Cloud,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { Navigation } from "@/components/portfolio/Navigation";
import { Footer } from "@/components/portfolio/Footer";
import { CustomCursor } from "@/components/portfolio/CustomCursor";
import { CommandPalette } from "@/components/portfolio/CommandPalette";
import { AskPiyushAI } from "@/components/portfolio/AskPiyushAI";
import { fetchBlogPostBySlug, fetchPublishedBlogPosts } from "@/lib/blog";
import { DnsArchitectureDiagram } from "@/components/blog/DnsArchitectureDiagram";
import { AwsArchitectureDiagram } from "@/components/blog/AwsArchitectureDiagram";
import { LinuxArchitectureDiagram } from "@/components/blog/LinuxArchitectureDiagram";
import { SITE_URL } from "@/lib/site";

export const Route = createFileRoute("/blog/$slug")({
  head: ({ params }) => {
    const slug = params.slug;
    let title = "Technical Article — Piyush Prasad";
    let desc = "Practical cloud infrastructure and engineering tutorial by Piyush Prasad.";

    if (slug === "dns-explained") {
      title = "DNS Explained: How Domain Names Connect to Websites — Piyush Prasad";
      desc = "Understand DNS, records, domain resolution, and how domain names connect to web hosting in simple terms.";
    } else if (slug === "aws-cloud-infrastructure-guide") {
      title = "AWS Explained: How EC2, S3, RDS, VPC and Load Balancers Work Together — Piyush Prasad";
      desc = "Beginner guide to AWS cloud computing: how EC2, S3, RDS, VPC, and load balancers collaborate to host applications.";
    } else if (slug === "linux-server-administration") {
      title = "Linux Server Basics: How to Manage and Host a Website — Piyush Prasad";
      desc = "Beginner tutorial for Ubuntu servers: SSH access, essential terminal commands, Nginx web hosting, and SSL certificates.";
    }

    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { property: "og:url", content: `${SITE_URL}/blog/${slug}` },
        { property: "og:image", content: `${SITE_URL}/og-image.png` },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: desc },
      ],
      links: [{ rel: "canonical", href: `${SITE_URL}/blog/${slug}` }],
    };
  },
  component: BlogArticlePage,
});

function CodeSnippet({ code, lang = "bash" }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("Command copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy code");
    }
  };

  return (
    <div className="relative my-4 overflow-hidden border border-border bg-[#0E0F12] text-[#EDEDED] shadow-2xs font-mono text-xs">
      <div className="flex items-center justify-between border-b border-[#262626] bg-[#121316] px-3.5 py-1.5 text-[11px] text-[#9E9E9E]">
        <span>{lang}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function Callout({
  type = "note",
  title,
  children,
}: {
  type?: "note" | "tip" | "security" | "warning";
  title: string;
  children: React.ReactNode;
}) {
  const styles = {
    note: "border-accent bg-accent/5 text-text",
    tip: "border-emerald-600 bg-emerald-50/50 text-emerald-950",
    security: "border-indigo-600 bg-indigo-50/50 text-indigo-950",
    warning: "border-amber-500 bg-amber-50/50 text-amber-950",
  }[type];

  return (
    <div className={`my-5 border-l-4 p-4 ${styles} shadow-2xs`}>
      <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wide">
        {type === "security" ? (
          <Shield className="h-3.5 w-3.5 text-indigo-600" />
        ) : (
          <AlertCircle className="h-3.5 w-3.5 text-accent" />
        )}
        <span>{title}</span>
      </div>
      <div className="mt-1.5 text-xs leading-relaxed">{children}</div>
    </div>
  );
}

function TechnicalDetails({
  title = "Technical Details (Deep Dive)",
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="my-6 border border-border bg-surface-muted/30 rounded-xs overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3.5 text-left font-mono text-xs font-bold text-text hover:bg-surface-muted transition-colors cursor-pointer"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-accent" />
          <span>{title}</span>
        </span>
        <span className="mono text-[10px] text-accent border border-accent/30 px-2 py-0.5 rounded-xs flex items-center gap-1">
          <span>{isOpen ? "Hide Details" : "Show Details"}</span>
          {isOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </span>
      </button>
      {isOpen && (
        <div className="p-4 border-t border-border bg-surface text-xs text-text-muted space-y-3 leading-relaxed">
          {children}
        </div>
      )}
    </div>
  );
}

function BlogArticlePage() {
  const { slug } = Route.useParams();
  const [readingProgress, setReadingProgress] = useState(0);

  const { data: post, isLoading } = useQuery({
    queryKey: ["blog-post", slug],
    queryFn: () => fetchBlogPostBySlug(slug),
    staleTime: 60_000,
  });

  const { data: allPosts = [] } = useQuery({
    queryKey: ["published-blog-posts"],
    queryFn: fetchPublishedBlogPosts,
    staleTime: 60_000,
  });

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100;
        setReadingProgress(Math.min(100, Math.max(0, progress)));
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const currentIndex = allPosts.findIndex((p) => p.slug === slug);
  const prevPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;
  const nextPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center mono text-xs text-text-muted">
        Loading article...
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-xl font-bold text-text">Article Not Found</h1>
        <p className="text-xs text-text-muted mt-2">
          The requested article &ldquo;{slug}&rdquo; does not exist or has not been published yet.
        </p>
        <Link
          to="/blog"
          className="mt-6 inline-flex items-center gap-2 bg-accent px-4 py-2 text-xs font-semibold text-text-on-accent"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Return to Blog</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background text-carbon selection:bg-cobalt selection:text-white">
      {/* Top Reading Progress Bar */}
      <div
        className="fixed top-0 left-0 h-1 bg-accent z-50 transition-all duration-75"
        style={{ width: `${readingProgress}%` }}
      />

      <CustomCursor />
      <Navigation />

      <main className="relative z-10 pt-28 pb-20 md:pt-36 md:pb-28">
        <div className="mx-auto max-w-[1280px] px-6 md:px-10">
          {/* Breadcrumbs */}
          <nav className="mb-6 flex items-center gap-2 text-xs font-mono text-text-muted">
            <Link to="/" className="hover:text-accent">
              Home
            </Link>
            <span>/</span>
            <Link to="/blog" className="hover:text-accent">
              Technical Blog
            </Link>
            <span>/</span>
            <span className="text-text font-semibold truncate max-w-[240px] sm:max-w-none">
              {post.title}
            </span>
          </nav>

          {/* Article Header */}
          <header className="border-b border-border pb-8">
            <div className="flex flex-wrap items-center gap-3 text-xs font-mono mb-4">
              <span className="border border-border bg-surface px-2.5 py-1 text-accent font-semibold">
                {post.category}
              </span>
              <span className="flex items-center gap-1 text-text-muted">
                <Clock className="h-3.5 w-3.5 text-accent" />
                <span>{post.reading_time}</span>
              </span>
              <span className="text-border">•</span>
              <span className="flex items-center gap-1 text-text-muted">
                <Calendar className="h-3.5 w-3.5 text-accent" />
                <span>{post.published_date}</span>
              </span>
            </div>

            <h1 className="display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-text leading-tight">
              {post.title}
            </h1>
            <p className="mt-3 text-lg md:text-xl text-text-muted leading-relaxed max-w-4xl">
              {post.subtitle}
            </p>

            {/* Author Byline */}
            <div className="mt-6 flex items-center gap-3 pt-6 border-t border-border">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface font-mono text-xs font-bold text-accent">
                PP
              </div>
              <div>
                <div className="text-xs font-bold text-text">{post.author}</div>
                <div className="mono text-[11px] text-text-muted">{post.author_role}</div>
              </div>
            </div>
          </header>

          {/* Two-Column Editorial Layout */}
          <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Main Article Prose */}
            <article className="lg:col-span-8 prose-custom space-y-8">
              {slug === "dns-explained" && <DnsExplainedContent />}
              {slug === "aws-cloud-infrastructure-guide" && <AwsCloudInfraContent />}
              {slug === "linux-server-administration" && <LinuxAdminContent />}

              {/* Prev / Next Article Navigation Cards */}
              <div className="mt-16 pt-8 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-4">
                {prevPost ? (
                  <Link
                    to="/blog/$slug"
                    params={{ slug: prevPost.slug }}
                    className="group border border-border bg-surface p-4 shadow-2xs hover:border-accent hover:-translate-y-0.5 transition-all text-left"
                  >
                    <span className="mono text-[10px] text-text-muted block mb-1">
                      ← PREVIOUS ARTICLE
                    </span>
                    <span className="text-xs font-bold text-text group-hover:text-accent line-clamp-2">
                      {prevPost.title}
                    </span>
                  </Link>
                ) : (
                  <div />
                )}

                {nextPost ? (
                  <Link
                    to="/blog/$slug"
                    params={{ slug: nextPost.slug }}
                    className="group border border-border bg-surface p-4 shadow-2xs hover:border-accent hover:-translate-y-0.5 transition-all text-right sm:col-start-2"
                  >
                    <span className="mono text-[10px] text-text-muted block mb-1">
                      NEXT ARTICLE →
                    </span>
                    <span className="text-xs font-bold text-text group-hover:text-accent line-clamp-2">
                      {nextPost.title}
                    </span>
                  </Link>
                ) : (
                  <div />
                )}
              </div>
            </article>

            {/* Sticky Table of Contents Sidebar */}
            <aside className="lg:col-span-4 space-y-6">
              <div className="sticky top-28 space-y-6">
                <div className="border border-border bg-surface p-5 shadow-2xs">
                  <div className="flex items-center gap-2 border-b border-border pb-3 mb-3">
                    <Hash className="h-4 w-4 text-accent" />
                    <h4 className="mono text-xs font-bold uppercase tracking-wider text-text">
                      Table of Contents
                    </h4>
                  </div>
                  {slug === "dns-explained" && <ArticleToc prefix="dns" />}
                  {slug === "aws-cloud-infrastructure-guide" && <ArticleToc prefix="aws" />}
                  {slug === "linux-server-administration" && <ArticleToc prefix="linux" />}
                </div>

                {/* About Author */}
                <div className="border border-border bg-surface p-5 shadow-2xs space-y-3">
                  <span className="mono text-[10px] font-bold uppercase tracking-wider text-text-muted">
                    About the Author
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full border border-border bg-surface-muted flex items-center justify-center font-mono text-xs font-bold text-accent">
                      PP
                    </div>
                    <div>
                      <div className="text-xs font-bold text-text">Piyush Prasad</div>
                      <div className="mono text-[10px] text-accent">Cloud &amp; DevOps Engineer</div>
                    </div>
                  </div>
                  <p className="text-xs text-text-muted leading-relaxed">
                    Building resilient cloud architectures, CI/CD automation, and practical engineering guides for developers.
                  </p>
                  <a
                    href="/#contact"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline pt-1"
                  >
                    <span>Get in touch</span>
                    <ArrowRight className="h-3 w-3" />
                  </a>
                </div>

                {/* Return to Blog */}
                <Link
                  to="/blog"
                  className="inline-flex items-center gap-2 w-full justify-center border border-border bg-surface py-2.5 text-xs font-semibold text-text hover:border-accent hover:text-accent transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Explore All Learning Guides</span>
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
      <CommandPalette />
      <AskPiyushAI />
    </div>
  );
}

function ArticleToc({ prefix }: { prefix: string }) {
  const links = [
    { href: `#${prefix}-1`, title: "1. What is it?" },
    { href: `#${prefix}-2`, title: "2. Why do we need it?" },
    { href: `#${prefix}-3`, title: "3. How does it work?" },
    { href: `#${prefix}-4`, title: "4. Real-world example" },
    { href: `#${prefix}-5`, title: "5. Simple architecture diagram" },
    { href: `#${prefix}-6`, title: "6. Practical implementation" },
    { href: `#${prefix}-7`, title: "7. Common mistakes" },
    { href: `#${prefix}-8`, title: "8. Key takeaways" },
  ];

  return (
    <ul className="space-y-1.5 text-xs">
      {links.map((l) => (
        <li key={l.href}>
          <a
            href={l.href}
            className="text-text-muted hover:text-accent transition-colors block py-0.5"
          >
            {l.title}
          </a>
        </li>
      ))}
    </ul>
  );
}

/* =========================================================================
   ARTICLE 1: DNS EXPLAINED
========================================================================= */

function DnsExplainedContent() {
  return (
    <div className="space-y-8 text-sm text-text leading-relaxed">
      {/* 1. What is it? */}
      <section id="dns-1" className="space-y-3 scroll-mt-28">
        <h2 className="text-xl sm:text-2xl font-bold text-text border-b border-border pb-2">
          1. What is it?
        </h2>
        <p>
          <strong>DNS</strong> stands for <strong>Domain Name System</strong>. In simple terms, it is the phonebook of the entire internet.
        </p>
        <p>
          Every computer, server, and phone connected to the internet has a unique numerical address called an <strong>IP address</strong> (such as <code>76.76.21.21</code>). Computers need these numbers to route data to the right place.
        </p>
        <p>
          However, humans find words much easier to remember than long strings of random numbers. DNS bridges this gap: it translates human-friendly names like <code>piyushprasad.in</code> into computer-friendly IP addresses.
        </p>
      </section>

      {/* 2. Why do we need it? */}
      <section id="dns-2" className="space-y-3 scroll-mt-28">
        <h2 className="text-xl sm:text-2xl font-bold text-text border-b border-border pb-2">
          2. Why do we need it?
        </h2>
        <p>
          Imagine if you had to memorize 10-digit phone numbers for every single friend, store, and website you visit every day. You would quickly run out of memory!
        </p>
        <p>
          DNS allows website owners to change their hosting providers or move to different servers at any time. Even if your server moves to a new IP address, visitors continue typing the exact same domain name seamlessly.
        </p>
        <Callout type="note" title="Core Purpose">
          DNS solves one major problem: it lets humans browse the internet using friendly names while computers communicate using precise numerical addresses.
        </Callout>
      </section>

      {/* 3. How does it work? */}
      <section id="dns-3" className="space-y-3 scroll-mt-28">
        <h2 className="text-xl sm:text-2xl font-bold text-text border-b border-border pb-2">
          3. How does it work?
        </h2>
        <p>
          When you enter <code>piyushprasad.in</code> in your browser and press Enter, your computer needs to discover where the website lives.
        </p>
        <p>
          It is essential to understand that loading a website consists of two completely separate stages:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
          <div className="border border-sky-500/30 bg-sky-500/5 p-4 rounded-xs">
            <span className="mono text-[10px] font-bold text-sky-700 uppercase block mb-1">
              Stage 1: DNS Resolution
            </span>
            <p className="text-xs text-text">
              Your browser asks DNS: <em>&ldquo;What is the IP address for piyushprasad.in?&rdquo;</em> DNS responds with <code>76.76.21.21</code>.
            </p>
          </div>
          <div className="border border-emerald-500/30 bg-emerald-500/5 p-4 rounded-xs">
            <span className="mono text-[10px] font-bold text-emerald-700 uppercase block mb-1">
              Stage 2: Web Request (HTTPS)
            </span>
            <p className="text-xs text-text">
              Now that the browser has the address, it connects directly to the server at <code>76.76.21.21</code> and downloads the website files.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Real-world example */}
      <section id="dns-4" className="space-y-3 scroll-mt-28">
        <h2 className="text-xl sm:text-2xl font-bold text-text border-b border-border pb-2">
          4. Real-World Example: piyushprasad.in
        </h2>
        <p>
          Let&apos;s see how this portfolio website is set up in real life:
        </p>
        <ul className="list-disc pl-6 space-y-1 text-xs sm:text-sm">
          <li>
            <strong>Root Domain (@):</strong> <code>piyushprasad.in</code> is connected to the hosting server IP using an <strong>A Record</strong>.
          </li>
          <li>
            <strong>Subdomain (www):</strong> <code>www.piyushprasad.in</code> is pointed to the primary domain using a <strong>CNAME Record</strong> so both addresses open the exact same portfolio.
          </li>
        </ul>

        {/* Illustrative DNS table */}
        <div className="overflow-x-auto border border-border bg-surface my-4">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-surface-muted mono font-semibold">
                <th className="p-3">Host / Name</th>
                <th className="p-3">Type</th>
                <th className="p-3">Target Value</th>
                <th className="p-3">What It Does</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="p-3 font-mono font-bold text-accent">@ (root)</td>
                <td className="p-3 font-mono font-bold">A</td>
                <td className="p-3 font-mono">76.76.21.21</td>
                <td className="p-3">Directs visitors typing piyushprasad.in to the web server</td>
              </tr>
              <tr>
                <td className="p-3 font-mono font-bold text-accent">www</td>
                <td className="p-3 font-mono font-bold">CNAME</td>
                <td className="p-3 font-mono">cname.vercel-dns.com</td>
                <td className="p-3">Aliases www.piyushprasad.in to the edge hosting network</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 5. Simple architecture diagram */}
      <section id="dns-5" className="space-y-3 scroll-mt-28">
        <h2 className="text-xl sm:text-2xl font-bold text-text border-b border-border pb-2">
          5. Simple Architecture Diagram
        </h2>
        <p>
          Press <strong>Play</strong> below to watch step-by-step how a visitor connects to the website:
        </p>

        <DnsArchitectureDiagram />
      </section>

      {/* 6. Practical implementation */}
      <section id="dns-6" className="space-y-3 scroll-mt-28">
        <h2 className="text-xl sm:text-2xl font-bold text-text border-b border-border pb-2">
          6. Practical Implementation: DNS Record Types
        </h2>
        <p>
          When you purchase a domain and open your DNS control panel, you will see a table where you add <strong>records</strong>. Here are the 6 records you need to know:
        </p>
        <div className="space-y-3 my-4">
          <div className="border border-border bg-surface p-3.5 rounded-xs">
            <span className="font-mono font-bold text-accent text-xs">A Record (Address)</span>
            <p className="text-xs text-text-muted mt-1">
              Connects a domain directly to an <strong>IPv4 address</strong>.
              <br />
              <em>Example:</em> <code>piyushprasad.in → 76.76.21.21</code>
            </p>
          </div>
          <div className="border border-border bg-surface p-3.5 rounded-xs">
            <span className="font-mono font-bold text-accent text-xs">AAAA Record (IPv6 Address)</span>
            <p className="text-xs text-text-muted mt-1">
              Connects a domain to a modern <strong>IPv6 address</strong>.
              <br />
              <em>Example:</em> <code>piyushprasad.in → 2600:1901:0:9d36::</code>
            </p>
          </div>
          <div className="border border-border bg-surface p-3.5 rounded-xs">
            <span className="font-mono font-bold text-accent text-xs">CNAME Record (Canonical Name)</span>
            <p className="text-xs text-text-muted mt-1">
              Points one domain name to another domain name instead of a number.
              <br />
              <em>Example:</em> <code>www.piyushprasad.in → cname.vercel-dns.com</code>
            </p>
          </div>
          <div className="border border-border bg-surface p-3.5 rounded-xs">
            <span className="font-mono font-bold text-accent text-xs">MX Record (Mail Exchange)</span>
            <p className="text-xs text-text-muted mt-1">
              Tells email services where to deliver incoming emails sent to your domain.
              <br />
              <em>Example:</em> <code>hello@piyushprasad.in → mail.google.com</code>
            </p>
          </div>
          <div className="border border-border bg-surface p-3.5 rounded-xs">
            <span className="font-mono font-bold text-accent text-xs">TXT Record (Text Information)</span>
            <p className="text-xs text-text-muted mt-1">
              Stores readable text used to prove domain ownership and prevent email spam (SPF and DKIM).
              <br />
              <em>Example:</em> <code>&quot;v=spf1 include:_spf.google.com ~all&quot;</code>
            </p>
          </div>
          <div className="border border-border bg-surface p-3.5 rounded-xs">
            <span className="font-mono font-bold text-accent text-xs">NS Record (Name Server)</span>
            <p className="text-xs text-text-muted mt-1">
              Identifies which DNS servers manage your records (e.g., Cloudflare, Route 53, or GoDaddy).
              <br />
              <em>Example:</em> <code>ns1.vercel-dns.com</code>
            </p>
          </div>
        </div>

        {/* Collapsible Technical Details */}
        <TechnicalDetails title="Technical Details: TTL & Diagnostic Tools">
          <p>
            <strong>TTL (Time To Live):</strong> Specifies how many seconds (e.g. <code>300</code> = 5 minutes) DNS resolvers should cache your record before asking the nameserver again. Setting a low TTL before migrations helps updates appear quickly.
          </p>
          <p>
            You can verify DNS records directly from your terminal using the <code>nslookup</code> command:
          </p>
          <CodeSnippet
            lang="bash"
            code={`# Look up the IP address of any domain
nslookup piyushprasad.in

# Look up mail exchange records
nslookup -type=mx piyushprasad.in`}
          />
        </TechnicalDetails>
      </section>

      {/* 7. Common mistakes */}
      <section id="dns-7" className="space-y-3 scroll-mt-28">
        <h2 className="text-xl sm:text-2xl font-bold text-text border-b border-border pb-2">
          7. Common Mistakes
        </h2>
        <div className="space-y-2 text-xs sm:text-sm">
          <div className="flex items-start gap-2 border border-rose-500/20 bg-rose-500/5 p-3 rounded-xs">
            <XCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <strong>Expecting instant updates:</strong> When you change a DNS record, old records stay cached in intermediate resolvers until the TTL expires. Always allow a few minutes for changes to propagate.
            </div>
          </div>
          <div className="flex items-start gap-2 border border-rose-500/20 bg-rose-500/5 p-3 rounded-xs">
            <XCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <strong>Creating a CNAME on the root domain (@):</strong> DNS standards do not allow a CNAME on root domains if other records (like MX) exist. Use an A record or an ALIAS record instead.
            </div>
          </div>
          <div className="flex items-start gap-2 border border-rose-500/20 bg-rose-500/5 p-3 rounded-xs">
            <XCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <strong>Typos in the target IP address:</strong> Even a single wrong digit in an A record will prevent visitors from reaching your website. Always double-check with your hosting provider.
            </div>
          </div>
        </div>
      </section>

      {/* 8. Key takeaways */}
      <section id="dns-8" className="space-y-3 scroll-mt-28">
        <h2 className="text-xl sm:text-2xl font-bold text-text border-b border-border pb-2">
          8. Key Takeaways
        </h2>
        <div className="border border-accent/40 bg-accent/5 p-4 rounded-xs space-y-2 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
            <span>DNS translates human domain names into numerical IP addresses.</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
            <span>DNS resolution (finding the address) is separate from loading the web files.</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
            <span>Use <strong>A records</strong> for IP addresses and <strong>CNAME records</strong> for aliases like <code>www</code>.</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
            <span>Keep your TTL reasonable (e.g. 300 seconds) so updates take effect smoothly.</span>
          </div>
        </div>
      </section>
    </div>
  );
}

/* =========================================================================
   ARTICLE 2: AWS EXPLAINED
========================================================================= */

function AwsCloudInfraContent() {
  return (
    <div className="space-y-8 text-sm text-text leading-relaxed">
      {/* 1. What is it? */}
      <section id="aws-1" className="space-y-3 scroll-mt-28">
        <h2 className="text-xl sm:text-2xl font-bold text-text border-b border-border pb-2">
          1. What is it?
        </h2>
        <p>
          <strong>Amazon Web Services (AWS)</strong> is the world&apos;s leading cloud computing platform.
        </p>
        <p>
          In traditional computing, if you wanted to launch a website or business application, you had to buy expensive physical computer servers, set them up in an air-conditioned room, connect cables, and pay for 24/7 electricity.
        </p>
        <p>
          With AWS, you rent computing power, storage, and databases over the internet on demand. You can launch a high-powered virtual server in 30 seconds and delete it when you no longer need it.
        </p>
      </section>

      {/* 2. Why do we need it? */}
      <section id="aws-2" className="space-y-3 scroll-mt-28">
        <h2 className="text-xl sm:text-2xl font-bold text-text border-b border-border pb-2">
          2. Why do we need it?
        </h2>
        <p>
          Cloud computing provides three huge benefits to developers and businesses:
        </p>
        <ul className="list-disc pl-6 space-y-1.5 text-xs sm:text-sm">
          <li>
            <strong>Scalability:</strong> If your website goes viral and gets 100,000 visitors today, AWS can automatically add more servers to handle the traffic.
          </li>
          <li>
            <strong>Cost Efficiency:</strong> You only pay for what you use by the second. No expensive upfront hardware purchases.
          </li>
          <li>
            <strong>Reliability:</strong> AWS maintains secure data centers globally with redundant power, backup generators, and automatic hardware repairs.
          </li>
        </ul>
      </section>

      {/* 3. How does it work? */}
      <section id="aws-3" className="space-y-3 scroll-mt-28">
        <h2 className="text-xl sm:text-2xl font-bold text-text border-b border-border pb-2">
          3. How does it work? Core Services Explained
        </h2>
        <p>
          AWS has hundreds of services, but modern applications are built using five fundamental building blocks:
        </p>

        <div className="space-y-3 my-4">
          <div className="border border-border bg-surface p-3.5 rounded-xs">
            <span className="font-mono font-bold text-accent text-xs">1. EC2 (Your Cloud Computer)</span>
            <p className="text-xs text-text-muted mt-1">
              <strong>EC2 (Elastic Compute Cloud)</strong> is a virtual server running in AWS data centers. You choose the operating system (like Ubuntu) and run your web applications, APIs, and backend scripts.
            </p>
          </div>
          <div className="border border-border bg-surface p-3.5 rounded-xs">
            <span className="font-mono font-bold text-accent text-xs">2. S3 (Your Cloud Storage)</span>
            <p className="text-xs text-text-muted mt-1">
              <strong>S3 (Simple Storage Service)</strong> is practically unlimited file storage. You store images, PDFs, user uploads, and backups in named containers called <em>buckets</em>.
            </p>
          </div>
          <div className="border border-border bg-surface p-3.5 rounded-xs">
            <span className="font-mono font-bold text-accent text-xs">3. RDS (Your Managed Database)</span>
            <p className="text-xs text-text-muted mt-1">
              <strong>RDS (Relational Database Service)</strong> manages databases like PostgreSQL and MySQL. It automatically handles backups, security patches, and hardware maintenance so your user accounts and order data stay safe.
            </p>
          </div>
          <div className="border border-border bg-surface p-3.5 rounded-xs">
            <span className="font-mono font-bold text-accent text-xs">4. VPC (Your Private Cloud Network)</span>
            <p className="text-xs text-text-muted mt-1">
              <strong>VPC (Virtual Private Cloud)</strong> is an isolated virtual network dedicated to your account. Think of it like a secure office building:
            </p>
            <ul className="list-disc pl-5 mt-1 text-xs text-text-muted space-y-0.5">
              <li><strong>Public Subnet (The Front Lobby):</strong> Accessible from the public internet (used for load balancers).</li>
              <li><strong>Private Subnet (Staff Only):</strong> Shielded away from internet access (where your EC2 servers and RDS databases live safely).</li>
            </ul>
          </div>
          <div className="border border-border bg-surface p-3.5 rounded-xs">
            <span className="font-mono font-bold text-accent text-xs">5. Load Balancer (Traffic Distributor)</span>
            <p className="text-xs text-text-muted mt-1">
              Distributes incoming visitor requests across multiple EC2 servers so no single server gets overloaded.
            </p>
          </div>
        </div>

        <Callout type="note" title="Single-Server Simplicity">
          A small or personal website does not require a load balancer or multiple servers! A single small EC2 instance running Ubuntu and Nginx can easily handle thousands of visitors each day.
        </Callout>
      </section>

      {/* 4. Real-world example */}
      <section id="aws-4" className="space-y-3 scroll-mt-28">
        <h2 className="text-xl sm:text-2xl font-bold text-text border-b border-border pb-2">
          4. Real-World Example: An Online Store
        </h2>
        <p>
          Here is how all 5 services collaborate when a customer purchases an item on an online store:
        </p>
        <ol className="list-decimal pl-6 space-y-1.5 text-xs sm:text-sm">
          <li>The customer opens <code>shop.example.com</code> in their browser.</li>
          <li>The <strong>Load Balancer</strong> receives the request in the public subnet and forwards it to an active <strong>EC2 Server</strong> in the private subnet.</li>
          <li>The <strong>EC2 Server</strong> queries the <strong>RDS Database</strong> to fetch customer account and order details.</li>
          <li>The <strong>EC2 Server</strong> loads product photos stored in an <strong>S3 Bucket</strong>.</li>
          <li>The final webpage is assembled and sent back to the customer&apos;s phone in milliseconds.</li>
        </ol>
      </section>

      {/* 5. Simple architecture diagram */}
      <section id="aws-5" className="space-y-3 scroll-mt-28">
        <h2 className="text-xl sm:text-2xl font-bold text-text border-b border-border pb-2">
          5. Simple Architecture Diagram
        </h2>
        <p>
          Press <strong>Play</strong> below to follow a visitor request through the Load Balancer, EC2 virtual server, RDS database, and S3 file storage:
        </p>

        <AwsArchitectureDiagram />
      </section>

      {/* 6. Practical implementation */}
      <section id="aws-6" className="space-y-3 scroll-mt-28">
        <h2 className="text-xl sm:text-2xl font-bold text-text border-b border-border pb-2">
          6. Practical Implementation: Getting Started on AWS
        </h2>
        <p>
          To launch your first cloud application on AWS, follow these standard steps:
        </p>
        <ol className="list-decimal pl-6 space-y-2 text-xs sm:text-sm">
          <li>
            <strong>Launch an EC2 Instance:</strong> In the AWS Console, choose Ubuntu 24.04 LTS and select the free-tier eligible <code>t4g.nano</code> or <code>t2.micro</code> instance size.
          </li>
          <li>
            <strong>Download your Key Pair (.pem file):</strong> AWS creates a cryptographic key file so you can log into your server securely without needing a password.
          </li>
          <li>
            <strong>Connect via SSH:</strong>
            <CodeSnippet
              lang="bash"
              code={`# Connect to your new EC2 server from your terminal
ssh -i ~/.ssh/my-aws-key.pem ubuntu@your-ec2-ip`}
            />
          </li>
          <li>
            <strong>Create an S3 Bucket:</strong> Create a bucket (e.g. <code>my-portfolio-assets-2026</code>) to upload photos and files.
          </li>
        </ol>

        {/* Collapsible Technical Details */}
        <TechnicalDetails title="Technical Details: Security Groups & IAM Roles">
          <p>
            <strong>Security Groups:</strong> Act as virtual firewalls for your EC2 instances. Only open port <code>80</code> (HTTP), port <code>443</code> (HTTPS), and port <code>22</code> (SSH from your IP address).
          </p>
          <p>
            <strong>IAM Roles:</strong> Always attach an IAM role to your EC2 instance when it needs to access S3. Never hardcode AWS secret access keys inside your code.
          </p>
        </TechnicalDetails>
      </section>

      {/* 7. Common mistakes */}
      <section id="aws-7" className="space-y-3 scroll-mt-28">
        <h2 className="text-xl sm:text-2xl font-bold text-text border-b border-border pb-2">
          7. Common Mistakes
        </h2>
        <div className="space-y-2 text-xs sm:text-sm">
          <div className="flex items-start gap-2 border border-rose-500/20 bg-rose-500/5 p-3 rounded-xs">
            <XCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <strong>Forgetting to terminate test resources:</strong> Load balancers, NAT Gateways, and databases charge by the hour. Stop or terminate learning instances when you finish testing.
            </div>
          </div>
          <div className="flex items-start gap-2 border border-rose-500/20 bg-rose-500/5 p-3 rounded-xs">
            <XCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <strong>Putting databases in the public subnet:</strong> Databases should never have public IP addresses. Keep RDS inside private subnets and only allow connections from EC2.
            </div>
          </div>
          <div className="flex items-start gap-2 border border-rose-500/20 bg-rose-500/5 p-3 rounded-xs">
            <XCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <strong>Committing AWS credentials to GitHub:</strong> Automated bots scan public repositories for leaked AWS keys. Use IAM roles and environment variables instead.
            </div>
          </div>
        </div>
      </section>

      {/* 8. Key takeaways */}
      <section id="aws-8" className="space-y-3 scroll-mt-28">
        <h2 className="text-xl sm:text-2xl font-bold text-text border-b border-border pb-2">
          8. Key Takeaways
        </h2>
        <div className="border border-accent/40 bg-accent/5 p-4 rounded-xs space-y-2 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
            <span><strong>EC2</strong> is your virtual server; <strong>S3</strong> stores files; <strong>RDS</strong> stores database records.</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
            <span><strong>VPC</strong> isolates your infrastructure; <strong>Load Balancer</strong> distributes visitor traffic.</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
            <span>Keep databases in private subnets shielded from direct public internet access.</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
            <span>Simple personal websites can start happily with a single affordable EC2 instance!</span>
          </div>
        </div>
      </section>
    </div>
  );
}

/* =========================================================================
   ARTICLE 3: LINUX SERVER BASICS
========================================================================= */

function LinuxAdminContent() {
  return (
    <div className="space-y-8 text-sm text-text leading-relaxed">
      {/* 1. What is it? */}
      <section id="linux-1" className="space-y-3 scroll-mt-28">
        <h2 className="text-xl sm:text-2xl font-bold text-text border-b border-border pb-2">
          1. What is it?
        </h2>
        <p>
          <strong>Linux</strong> is a free, secure, and open-source operating system that powers over 90% of all cloud web servers and public websites across the world.
        </p>
        <p>
          Unlike Windows or macOS on your laptop, a Linux server usually does not have a desktop screen, icons, or mouse pointer. It runs in &ldquo;headless&rdquo; mode and is controlled entirely using written text commands in a terminal window.
        </p>
        <p>
          <strong>Ubuntu Server</strong> is the most popular Linux distribution for beginners and professionals because it is well-supported, reliable, and straightforward to manage.
        </p>
      </section>

      {/* 2. Why do we need it? */}
      <section id="linux-2" className="space-y-3 scroll-mt-28">
        <h2 className="text-xl sm:text-2xl font-bold text-text border-b border-border pb-2">
          2. Why do we need it?
        </h2>
        <p>
          Web servers need to run continuously 24 hours a day, 365 days a year without crashing, freezing, or requiring random restarts.
        </p>
        <ul className="list-disc pl-6 space-y-1.5 text-xs sm:text-sm">
          <li>
            <strong>Rock-Solid Stability:</strong> Linux servers can run for years without needing to be rebooted.
          </li>
          <li>
            <strong>Security:</strong> Linux has a strict user permission system that protects system files from unauthorized changes.
          </li>
          <li>
            <strong>Lightweight:</strong> Because there are no graphics or desktop windows, all CPU and memory power is reserved for serving your website fast.
          </li>
        </ul>
      </section>

      {/* 3. How does it work? */}
      <section id="linux-3" className="space-y-3 scroll-mt-28">
        <h2 className="text-xl sm:text-2xl font-bold text-text border-b border-border pb-2">
          3. How does it work? Core Concepts
        </h2>
        <p>Managing an Ubuntu server involves a few key technologies:</p>
        <div className="space-y-3 my-4">
          <div className="border border-border bg-surface p-3.5 rounded-xs">
            <span className="font-mono font-bold text-accent text-xs">SSH (Secure Shell)</span>
            <p className="text-xs text-text-muted mt-1">
              A secure encrypted connection that lets you log into your remote server from your laptop terminal as if you were sitting right in front of it.
            </p>
          </div>
          <div className="border border-border bg-surface p-3.5 rounded-xs">
            <span className="font-mono font-bold text-accent text-xs">Nginx (Web Server)</span>
            <p className="text-xs text-text-muted mt-1">
              High-speed software that listens for incoming website visitors on ports 80 and 443, and serves your website files or passes requests to your backend application.
            </p>
          </div>
          <div className="border border-border bg-surface p-3.5 rounded-xs">
            <span className="font-mono font-bold text-accent text-xs">UFW (Firewall)</span>
            <p className="text-xs text-text-muted mt-1">
              The digital security guard on your server that only opens safe ports (like 443 for HTTPS and 22 for SSH) and blocks everything else.
            </p>
          </div>
          <div className="border border-border bg-surface p-3.5 rounded-xs">
            <span className="font-mono font-bold text-accent text-xs">SSL &amp; HTTPS</span>
            <p className="text-xs text-text-muted mt-1">
              Encrypts all communication between the visitor&apos;s browser and your server so passwords and data cannot be intercepted.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Real-world example */}
      <section id="linux-4" className="space-y-3 scroll-mt-28">
        <h2 className="text-xl sm:text-2xl font-bold text-text border-b border-border pb-2">
          4. Real-World Example: Deploying a Website
        </h2>
        <p>
          In modern web engineering, website deployment and live visitor traffic are two separate streams that meet on the Linux server:
        </p>
        <ul className="list-disc pl-6 space-y-1.5 text-xs sm:text-sm">
          <li>
            <strong>Stream 1 (Deployment):</strong> Developer writes code on laptop → pushes commits to GitHub → Ubuntu server pulls updated code into <code>/var/www/website</code> → Nginx reloads.
          </li>
          <li>
            <strong>Stream 2 (Visitor Traffic):</strong> Visitor enters domain in browser → DNS provides IP → request hits Nginx over HTTPS (port 443) → Nginx delivers the page.
          </li>
        </ul>
      </section>

      {/* 5. Simple architecture diagram */}
      <section id="linux-5" className="space-y-3 scroll-mt-28">
        <h2 className="text-xl sm:text-2xl font-bold text-text border-b border-border pb-2">
          5. Simple Architecture Diagram
        </h2>
        <p>
          Press <strong>Play</strong> below to follow both the deployment process and the visitor request process:
        </p>

        <LinuxArchitectureDiagram />
      </section>

      {/* 6. Practical implementation */}
      <section id="linux-6" className="space-y-3 scroll-mt-28">
        <h2 className="text-xl sm:text-2xl font-bold text-text border-b border-border pb-2">
          6. Practical Implementation: Essential Commands
        </h2>
        <p>Here are the fundamental commands you need to manage your Ubuntu server:</p>

        <div className="space-y-4 my-4">
          <div>
            <span className="mono text-xs font-bold text-text">1. Update the software package lists:</span>
            <CodeSnippet lang="bash" code="sudo apt update" />
            <p className="text-xs text-text-muted">Checks Ubuntu servers to see what software updates are available.</p>
          </div>

          <div>
            <span className="mono text-xs font-bold text-text">2. Install the Nginx web server:</span>
            <CodeSnippet lang="bash" code="sudo apt install -y nginx" />
            <p className="text-xs text-text-muted">Installs Nginx so your server can start accepting website visitors.</p>
          </div>

          <div>
            <span className="mono text-xs font-bold text-text">3. Verify that Nginx is running:</span>
            <CodeSnippet lang="bash" code="sudo systemctl status nginx" />
            <p className="text-xs text-text-muted">Shows whether Nginx is active, running, or has any errors.</p>
          </div>

          <div>
            <span className="mono text-xs font-bold text-text">4. Check available hard drive disk space:</span>
            <CodeSnippet lang="bash" code="df -h" />
            <p className="text-xs text-text-muted">Displays hard drive usage in human-readable gigabytes (e.g. 15GB free).</p>
          </div>

          <div>
            <span className="mono text-xs font-bold text-text">5. Check available RAM memory:</span>
            <CodeSnippet lang="bash" code="free -h" />
            <p className="text-xs text-text-muted">Displays how much RAM memory your applications are using.</p>
          </div>

          <div>
            <span className="mono text-xs font-bold text-text">6. Configure the UFW firewall:</span>
            <CodeSnippet
              lang="bash"
              code={`# Allow SSH so you do not lock yourself out
sudo ufw allow 22

# Allow standard web traffic
sudo ufw allow 80
sudo ufw allow 443

# Turn on the firewall
sudo ufw enable`}
            />
          </div>
        </div>

        {/* Collapsible Technical Details */}
        <TechnicalDetails title="Technical Details: Nginx Configuration & Certbot SSL">
          <p>
            Nginx configuration files live in <code>/etc/nginx/sites-available/</code>. A minimal configuration to serve a static website looks like this:
          </p>
          <CodeSnippet
            lang="nginx"
            code={`server {
    listen 80;
    server_name piyushprasad.in www.piyushprasad.in;
    root /var/www/website;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}`}
          />
          <p>
            To enable free automated SSL certificates using Let&apos;s Encrypt:
          </p>
          <CodeSnippet
            lang="bash"
            code={`# Install Certbot and obtain HTTPS certificate
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d piyushprasad.in -d www.piyushprasad.in`}
          />
        </TechnicalDetails>
      </section>

      {/* 7. Common mistakes */}
      <section id="linux-7" className="space-y-3 scroll-mt-28">
        <h2 className="text-xl sm:text-2xl font-bold text-text border-b border-border pb-2">
          7. Common Mistakes
        </h2>
        <div className="space-y-2 text-xs sm:text-sm">
          <div className="flex items-start gap-2 border border-rose-500/20 bg-rose-500/5 p-3 rounded-xs">
            <XCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <strong>Enabling the firewall without allowing SSH:</strong> If you run <code>sudo ufw enable</code> before running <code>sudo ufw allow 22</code>, you will be locked out of your server!
            </div>
          </div>
          <div className="flex items-start gap-2 border border-rose-500/20 bg-rose-500/5 p-3 rounded-xs">
            <XCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <strong>Running daily commands as the root user:</strong> Always log in as a standard user (like <code>ubuntu</code>) and use <code>sudo</code> only when administrator privileges are needed.
            </div>
          </div>
          <div className="flex items-start gap-2 border border-rose-500/20 bg-rose-500/5 p-3 rounded-xs">
            <XCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <strong>Loose permissions on SSH key files:</strong> OpenSSH will reject your key if other users on your laptop can read it. Run <code>chmod 400 ~/.ssh/my-key.pem</code>.
            </div>
          </div>
        </div>
      </section>

      {/* 8. Key takeaways */}
      <section id="linux-8" className="space-y-3 scroll-mt-28">
        <h2 className="text-xl sm:text-2xl font-bold text-text border-b border-border pb-2">
          8. Key Takeaways
        </h2>
        <div className="border border-accent/40 bg-accent/5 p-4 rounded-xs space-y-2 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
            <span>Linux powers the modern cloud because it is reliable, lightweight, and secure.</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
            <span>Connect to your server using <strong>SSH</strong> and manage services using clear terminal commands.</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
            <span><strong>Nginx</strong> serves your website files and encrypts connections with free SSL certificates.</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
            <span>Always keep your firewall active with only essential ports (22, 80, 443) open.</span>
          </div>
        </div>
      </section>
    </div>
  );
}
