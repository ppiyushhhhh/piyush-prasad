import { useState, useEffect, useMemo } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Clock,
  Calendar,
  ArrowLeft,
  ArrowRight,
  Copy,
  Check,
  Share2,
  BookOpen,
  Terminal,
  Shield,
  Layers,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Hash,
} from "lucide-react";
import { toast } from "sonner";

import { Navigation } from "@/components/portfolio/Navigation";
import { Footer } from "@/components/portfolio/Footer";
import { CustomCursor } from "@/components/portfolio/CustomCursor";
import { CommandPalette } from "@/components/portfolio/CommandPalette";
import { AskPiyushAI } from "@/components/portfolio/AskPiyushAI";
import { fetchBlogPostBySlug, fetchPublishedBlogPosts, type BlogPost } from "@/lib/blog";
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
      desc = "Understand DNS records, hierarchical resolution, troubleshooting, and custom domain setup with an interactive architecture diagram.";
    } else if (slug === "aws-cloud-infrastructure-guide") {
      title = "AWS Cloud Infrastructure Explained: EC2, S3, RDS, VPC & ALB — Piyush Prasad";
      desc = "Learn how AWS services interconnect to host scalable web apps with an interactive reference cloud architecture.";
    } else if (slug === "linux-server-administration") {
      title = "Linux Server Administration: From SSH to Hosting a Website — Piyush Prasad";
      desc = "Ubuntu server management, essential commands, Nginx reverse proxy, Certbot SSL, and deployment architecture.";
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
    } catch (e) {
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
    note: "border-accent bg-accent-soft text-text",
    tip: "border-success bg-emerald-50 text-emerald-950",
    security: "border-indigo-600 bg-indigo-50 text-indigo-950",
    warning: "border-amber-500 bg-amber-50 text-amber-950",
  }[type];

  return (
    <div className={`my-5 border-l-4 p-4 ${styles} shadow-2xs`}>
      <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wide">
        {type === "security" ? (
          <Shield className="h-3.5 w-3.5" />
        ) : (
          <AlertCircle className="h-3.5 w-3.5" />
        )}
        <span>{title}</span>
      </div>
      <div className="mt-1.5 text-xs leading-relaxed">{children}</div>
    </div>
  );
}

function BlogArticlePage() {
  const { slug } = Route.useParams();
  const [readingProgress, setReadingProgress] = useState(0);

  // Fetch article
  const { data: post, isLoading } = useQuery({
    queryKey: ["blog-post", slug],
    queryFn: () => fetchBlogPostBySlug(slug),
    staleTime: 60_000,
  });

  // Fetch all for prev/next
  const { data: allPosts = [] } = useQuery({
    queryKey: ["published-blog-posts"],
    queryFn: fetchPublishedBlogPosts,
    staleTime: 60_000,
  });

  // Scroll reading progress indicator
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

          {/* Two-Column Editorial Layout: Article Content + Sticky Sidebar */}
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

            {/* Sticky Table of Contents & Resources Sidebar */}
            <aside className="lg:col-span-4 space-y-6">
              <div className="sticky top-28 space-y-6">
                {/* Table of Contents */}
                <div className="border border-border bg-surface p-5 shadow-2xs">
                  <div className="flex items-center gap-2 border-b border-border pb-3 mb-3">
                    <Hash className="h-4 w-4 text-accent" />
                    <h4 className="mono text-xs font-bold uppercase tracking-wider text-text">
                      Table of Contents
                    </h4>
                  </div>
                  {slug === "dns-explained" && <DnsToc />}
                  {slug === "aws-cloud-infrastructure-guide" && <AwsToc />}
                  {slug === "linux-server-administration" && <LinuxToc />}
                </div>

                {/* About the Author Card */}
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
                      <div className="mono text-[10px] text-accent">AWS &amp; DevOps Engineer</div>
                    </div>
                  </div>
                  <p className="text-xs text-text-muted leading-relaxed">
                    Specializing in AWS cloud infrastructure, Linux server hardening, automated CI/CD pipelines,
                    and production observability.
                  </p>
                  <a
                    href="/#contact"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline pt-2"
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
                  <span>Explore All Technical Articles</span>
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

/* =========================================================================
   ARTICLE 1: DNS EXPLAINED CONTENT & TOC
========================================================================= */

function DnsToc() {
  const links = [
    { href: "#section-1", title: "1. What is DNS?" },
    { href: "#section-2", title: "2. How DNS Works (Interactive Flow)" },
    { href: "#section-3", title: "3. Types of DNS Records" },
    { href: "#section-4", title: "4. How to Configure DNS" },
    { href: "#section-5", title: "5. Real-World Example: piyushprasad.in" },
    { href: "#section-6", title: "6. DNS Troubleshooting" },
    { href: "#section-7", title: "7. Key Takeaways" },
  ];

  return (
    <ul className="space-y-2 text-xs">
      {links.map((l) => (
        <li key={l.href}>
          <a href={l.href} className="text-text-muted hover:text-accent transition-colors block py-0.5">
            {l.title}
          </a>
        </li>
      ))}
    </ul>
  );
}

function DnsExplainedContent() {
  return (
    <div className="space-y-8 text-sm text-text leading-relaxed">
      {/* Section 1 */}
      <section id="section-1" className="space-y-4 scroll-mt-28">
        <h2 className="text-2xl font-bold text-text border-b border-border pb-2">
          Section 1 — What is DNS?
        </h2>
        <p>
          The <strong>Domain Name System (DNS)</strong> is the foundational address book of the modern
          internet. Computers, servers, routers, and edge nodes do not communicate using human-readable
          names like <code>piyushprasad.in</code>; they communicate strictly across IPv4 (e.g.{" "}
          <code>76.76.21.21</code>) and IPv6 (e.g. <code>2600:1901:0:9d36::</code>) numerical addresses.
        </p>
        <p>
          Without DNS, browsing the web would require memorizing long strings of numbers for every
          application, API endpoint, and cloud service. DNS translates human-friendly domain names into
          machine-routable IP addresses in milliseconds.
        </p>
        <Callout type="note" title="Practical Mental Model">
          <code>piyushprasad.in</code> → DNS resolution (hierarchical lookup) → Hosting server IP (
          <code>76.76.21.21</code>) → Web page rendered.
        </Callout>
      </section>

      {/* Section 2 */}
      <section id="section-2" className="space-y-4 scroll-mt-28">
        <h2 className="text-2xl font-bold text-text border-b border-border pb-2">
          Section 2 — How DNS Works
        </h2>
        <p>
          When you enter a URL like <code>https://piyushprasad.in</code> in your browser, an intricate,
          multi-tier resolution process takes place behind the scenes:
        </p>
        <ol className="list-decimal pl-6 space-y-2 text-xs md:text-sm">
          <li>
            <strong>Browser DNS Cache:</strong> The browser first inspects its internal memory cache to
            see if it has recently resolved this domain.
          </li>
          <li>
            <strong>Operating System Resolver:</strong> If not in browser cache, the OS checks its local
            DNS cache (Windows DNS Client or macOS mDNSResponder) and the local <code>/etc/hosts</code>{" "}
            file.
          </li>
          <li>
            <strong>Recursive DNS Resolver:</strong> If a local cache miss occurs, the query travels
            over UDP port 53 to a recursive resolver (typically your ISP resolver or Anycast public
            resolvers like Cloudflare <code>1.1.1.1</code> or Google <code>8.8.8.8</code>).
          </li>
          <li>
            <strong>Root DNS Server (.):</strong> If the resolver has no cached entry, it queries one of
            the 13 global Root Server IP clusters. The root server returns a referral to the nameservers
            handling the <code>.in</code> Top-Level Domain (TLD).
          </li>
          <li>
            <strong>TLD Nameserver:</strong> The resolver asks the <code>.in</code> TLD nameserver,
            which replies with the authoritative nameservers configured at the domain registrar (e.g.{" "}
            <code>ns1.vercel-dns.com</code>).
          </li>
          <li>
            <strong>Authoritative Nameserver:</strong> The resolver queries the authoritative server,
            which holds the official zone file and replies with the A Record: <code>76.76.21.21</code>.
          </li>
          <li>
            <strong>Direct Web Connection:</strong> With the IP in hand, DNS resolution is finished.
            The browser initiates a direct TCP connection on port 443 with the hosting server to
            complete the TLS handshake and download website assets.
          </li>
        </ol>

        {/* Embedded Interactive DNS Architecture Diagram */}
        <div className="my-6">
          <DnsArchitectureDiagram />
        </div>
      </section>

      {/* Section 3 */}
      <section id="section-3" className="space-y-4 scroll-mt-28">
        <h2 className="text-2xl font-bold text-text border-b border-border pb-2">
          Section 3 — Types of DNS Records
        </h2>
        <p>
          A domain zone file contains various record types, each designated for specific networking
          and application purposes:
        </p>

        {/* Responsive DNS Table */}
        <div className="overflow-x-auto border border-border bg-surface my-4">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-surface-muted mono font-semibold">
                <th className="p-3">Record Type</th>
                <th className="p-3">Purpose</th>
                <th className="p-3">Common Use Case</th>
                <th className="p-3">Concrete Example</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="p-3 font-mono font-bold text-accent">A</td>
                <td className="p-3">Maps hostname to IPv4 address</td>
                <td className="p-3">Pointing root domain to hosting server</td>
                <td className="p-3 font-mono">piyushprasad.in → 76.76.21.21</td>
              </tr>
              <tr>
                <td className="p-3 font-mono font-bold text-accent">AAAA</td>
                <td className="p-3">Maps hostname to IPv6 address</td>
                <td className="p-3">Modern dual-stack IPv6 hosting</td>
                <td className="p-3 font-mono">piyushprasad.in → 2600:1901:0:9d36::</td>
              </tr>
              <tr>
                <td className="p-3 font-mono font-bold text-accent">CNAME</td>
                <td className="p-3">Aliases one hostname to another</td>
                <td className="p-3">Mapping www or subdomains to cloud targets</td>
                <td className="p-3 font-mono">www → cname.vercel-dns.com</td>
              </tr>
              <tr>
                <td className="p-3 font-mono font-bold text-accent">MX</td>
                <td className="p-3">Specifies mail exchange servers</td>
                <td className="p-3">Routing incoming emails to Google Workspace or Zoho</td>
                <td className="p-3 font-mono">10 aspmx.l.google.com</td>
              </tr>
              <tr>
                <td className="p-3 font-mono font-bold text-accent">TXT</td>
                <td className="p-3">Stores arbitrary text verification</td>
                <td className="p-3">SPF email security, DKIM, domain ownership</td>
                <td className="p-3 font-mono">v=spf1 include:_spf.google.com ~all</td>
              </tr>
              <tr>
                <td className="p-3 font-mono font-bold text-accent">NS</td>
                <td className="p-3">Delegates zone to authoritative servers</td>
                <td className="p-3">Pointing domain to Cloudflare or Route 53</td>
                <td className="p-3 font-mono">ns1.vercel-dns.com</td>
              </tr>
              <tr>
                <td className="p-3 font-mono font-bold text-accent">SRV</td>
                <td className="p-3">Defines host and port for services</td>
                <td className="p-3">SIP, LDAP, XMPP, Minecraft servers</td>
                <td className="p-3 font-mono">_sip._tcp.example.com 5060</td>
              </tr>
              <tr>
                <td className="p-3 font-mono font-bold text-accent">CAA</td>
                <td className="p-3">Restricts Certificate Authorities</td>
                <td className="p-3">Allowing only Let&apos;s Encrypt to issue SSL</td>
                <td className="p-3 font-mono">0 issue &ldquo;letsencrypt.org&rdquo;</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 4 */}
      <section id="section-4" className="space-y-4 scroll-mt-28">
        <h2 className="text-2xl font-bold text-text border-b border-border pb-2">
          Section 4 — How to Configure DNS
        </h2>
        <p>
          When you configure DNS in a management portal (such as Cloudflare, GoDaddy, Namecheap, or
          AWS Route 53), each entry requires four standard attributes:
        </p>
        <ul className="list-disc pl-6 space-y-1 text-xs md:text-sm">
          <li>
            <strong>Host / Name:</strong> The subdomain or prefix (use <code>@</code> for root domain,
            or <code>www</code>, <code>api</code>, <code>blog</code>).
          </li>
          <li>
            <strong>Type:</strong> The record category (<code>A</code>, <code>CNAME</code>, <code>TXT</code>, etc.).
          </li>
          <li>
            <strong>Value / Target:</strong> The destination IP or alias hostname.
          </li>
          <li>
            <strong>TTL (Time to Live):</strong> Number of seconds resolvers should cache the record
            before querying again (e.g. <code>300</code> for 5 minutes, or Auto).
          </li>
        </ul>

        <h3 className="text-base font-bold text-text mt-4">Example Configuration:</h3>
        <CodeSnippet
          lang="dns-zone"
          code={`# Root domain pointed to verified edge hosting
@              A      76.76.21.21             TTL 300

# Subdomain aliased to cloud provider edge target
www            CNAME  cname.vercel-dns.com.   TTL 300

# SPF record authorizing transactional email sender
@              TXT    "v=spf1 include:_spf.mx.cloudflare.net ~all" TTL 3600`}
        />
      </section>

      {/* Section 5 */}
      <section id="section-5" className="space-y-4 scroll-mt-28">
        <h2 className="text-2xl font-bold text-text border-b border-border pb-2">
          Section 5 — Real-World Example: piyushprasad.in
        </h2>
        <p>
          Examining the actual verified production configuration of this portfolio domain:
        </p>
        <div className="border border-border bg-surface p-5 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="mono text-text-muted block">Registered Domain</span>
              <span className="font-bold text-text">piyushprasad.in</span>
            </div>
            <div>
              <span className="mono text-text-muted block">Hosting Platform</span>
              <span className="font-bold text-accent">Vercel Global Edge Network</span>
            </div>
            <div>
              <span className="mono text-text-muted block">Root A Record (@)</span>
              <span className="mono font-semibold text-text">76.76.21.21</span>
            </div>
            <div>
              <span className="mono text-text-muted block">Subdomain CNAME (www)</span>
              <span className="mono font-semibold text-text">cname.vercel-dns.com</span>
            </div>
            <div>
              <span className="mono text-text-muted block">DNSSEC</span>
              <span className="mono text-success font-semibold">Active &amp; Cryptographically Signed</span>
            </div>
            <div>
              <span className="mono text-text-muted block">Staging Preview Subdomain</span>
              <span className="mono text-text">test.piyushprasad.in</span>
            </div>
          </div>
        </div>
      </section>

      {/* Section 6 */}
      <section id="section-6" className="space-y-4 scroll-mt-28">
        <h2 className="text-2xl font-bold text-text border-b border-border pb-2">
          Section 6 — DNS Troubleshooting
        </h2>
        <p>
          DNS issues are among the most common root causes of web downtime. Here is how to diagnose
          them systematically:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-xs md:text-sm">
          <li>
            <strong>DNS Propagation Delays:</strong> When you change records, old records stay in
            resolver caches until their TTL expires. Keep TTLs short (300 seconds) prior to a migration.
          </li>
          <li>
            <strong>NXDOMAIN (Non-Existent Domain):</strong> The nameserver has no record for the
            requested host. Verify spelling or check whether the record was added to the wrong zone.
          </li>
          <li>
            <strong>Flushing Local Resolver Cache:</strong> Clear stale entries on your workstation:
          </li>
        </ul>
        <CodeSnippet
          lang="bash"
          code={`# Windows: Flush local DNS cache
ipconfig /flushdns

# macOS: Flush directory service cache
sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder

# Linux (systemd-resolved): Flush resolver cache
sudo resolvectl flush-caches`}
        />
        <p className="mt-3 text-xs md:text-sm">
          Inspect authoritative resolution directly using <code>dig</code> or <code>nslookup</code>:
        </p>
        <CodeSnippet
          lang="bash"
          code={`# Query A record using Cloudflare Anycast resolver
dig @1.1.1.1 piyushprasad.in A +noall +answer

# Query specific nameservers directly to bypass ISP caching
dig @ns1.vercel-dns.com piyushprasad.in A

# Windows nslookup equivalent
nslookup piyushprasad.in 8.8.8.8`}
        />
      </section>

      {/* Section 7 */}
      <section id="section-7" className="space-y-4 scroll-mt-28">
        <h2 className="text-2xl font-bold text-text border-b border-border pb-2">
          Section 7 — Key Takeaways
        </h2>
        <div className="border-l-4 border-accent bg-surface p-5 space-y-2 shadow-2xs">
          <ul className="list-disc pl-5 space-y-1.5 text-xs md:text-sm">
            <li>DNS maps human names to numerical IP addresses via hierarchical delegation.</li>
            <li>DNS queries operate over UDP 53; the actual website loads over TCP 443 (HTTPS).</li>
            <li>A records point to IPv4 addresses; CNAME records point to other hostnames.</li>
            <li>TTLs dictate caching duration across intermediate recursive resolvers.</li>
            <li>Always verify authoritative records with <code>dig</code> before assuming application failure.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}

/* =========================================================================
   ARTICLE 2: AWS CLOUD INFRASTRUCTURE CONTENT & TOC
========================================================================= */

function AwsToc() {
  const links = [
    { href: "#aws-sec-1", title: "1. Introduction to AWS" },
    { href: "#aws-sec-2", title: "2. Amazon EC2 Compute" },
    { href: "#aws-sec-3", title: "3. Amazon S3 Storage" },
    { href: "#aws-sec-4", title: "4. AWS Database Services (RDS)" },
    { href: "#aws-sec-5", title: "5. Amazon VPC Networking" },
    { href: "#aws-sec-6", title: "6. AWS Load Balancers (ALB)" },
    { href: "#aws-sec-7", title: "7. How Everything Connects (Diagram)" },
    { href: "#aws-sec-8", title: "8. Practical Deployment Workflow" },
    { href: "#aws-sec-9", title: "9. Security Best Practices" },
    { href: "#aws-sec-10", title: "10. Cost Awareness" },
  ];

  return (
    <ul className="space-y-2 text-xs">
      {links.map((l) => (
        <li key={l.href}>
          <a href={l.href} className="text-text-muted hover:text-accent transition-colors block py-0.5">
            {l.title}
          </a>
        </li>
      ))}
    </ul>
  );
}

function AwsCloudInfraContent() {
  return (
    <div className="space-y-8 text-sm text-text leading-relaxed">
      {/* Section 1 */}
      <section id="aws-sec-1" className="space-y-4 scroll-mt-28">
        <h2 className="text-2xl font-bold text-text border-b border-border pb-2">
          Section 1 — Introduction to AWS
        </h2>
        <p>
          <strong>Amazon Web Services (AWS)</strong> provides on-demand cloud computing platforms and
          APIs on a metered pay-as-you-go basis. Instead of ordering, racking, cabling, and maintaining
          physical physical servers in a colocation facility, teams provision elastic computing power,
          managed databases, and global networking programmatically in seconds.
        </p>
      </section>

      {/* Section 2 */}
      <section id="aws-sec-2" className="space-y-4 scroll-mt-28">
        <h2 className="text-2xl font-bold text-text border-b border-border pb-2">
          Section 2 — Amazon EC2 (Elastic Compute Cloud)
        </h2>
        <p>
          <strong>Amazon EC2</strong> provides resizable virtual servers (instances) running in AWS
          data centers. Key concepts:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-xs md:text-sm">
          <li>
            <strong>AMIs (Amazon Machine Images):</strong> Pre-configured OS templates (e.g. Ubuntu
            24.04 LTS or Amazon Linux 2023).
          </li>
          <li>
            <strong>Instance Types:</strong> Categorized by CPU/RAM ratios (e.g. <code>t4g.micro</code>{" "}
            for burstable low-cost dev, <code>c7g</code> for compute-intensive workloads).
          </li>
          <li>
            <strong>EBS (Elastic Block Store):</strong> Network-attached persistent virtual block storage
            drives attached to instances.
          </li>
          <li>
            <strong>Security Groups:</strong> Virtual stateful firewalls controlling inbound and outbound
            traffic.
          </li>
        </ul>
        <CodeSnippet
          lang="bash"
          code={`# SSH authentication into an Ubuntu EC2 instance
ssh -i ~/.ssh/piyush-aws-key.pem ubuntu@ec2-13-233-0-1.ap-south-1.compute.amazonaws.com

# Update package repository and install production web stack
sudo apt update && sudo apt upgrade -y
sudo apt install -y nginx nodejs npm docker.io`}
        />
      </section>

      {/* Section 3 */}
      <section id="aws-sec-3" className="space-y-4 scroll-mt-28">
        <h2 className="text-2xl font-bold text-text border-b border-border pb-2">
          Section 3 — Amazon S3 (Simple Storage Service)
        </h2>
        <p>
          <strong>Amazon S3</strong> is an object store offering 99.999999999% (11 9s) of durability.
          Data is stored as objects inside named buckets. It is ideal for storing media uploads,
          build artifacts, database backups, and hosting static assets.
        </p>
      </section>

      {/* Section 4 */}
      <section id="aws-sec-4" className="space-y-4 scroll-mt-28">
        <h2 className="text-2xl font-bold text-text border-b border-border pb-2">
          Section 4 — AWS Database Services (Amazon RDS)
        </h2>
        <p>
          <strong>Amazon RDS</strong> automates tedious relational database administration: OS
          patching, automated continuous backups, multi-AZ synchronous replication for failover, and
          point-in-time recovery.
        </p>
        <Callout type="security" title="Critical Production Security Rule">
          Databases should never be exposed with public IP addresses (<code>PubliclyAccessible = false</code>).
          Place RDS instances in isolated Private Database Subnets with Security Groups permitting
          connections only from backend compute instances on port 5432 / 3306.
        </Callout>
      </section>

      {/* Section 5 */}
      <section id="aws-sec-5" className="space-y-4 scroll-mt-28">
        <h2 className="text-2xl font-bold text-text border-b border-border pb-2">
          Section 5 — Amazon VPC (Virtual Private Cloud)
        </h2>
        <p>
          A <strong>VPC</strong> is an isolated virtual network dedicated to your AWS account:
        </p>
        <ul className="list-disc pl-6 space-y-1.5 text-xs md:text-sm">
          <li>
            <strong>Subnets:</strong> CIDR segments carved from the VPC range (e.g. <code>10.0.1.0/24</code>).
          </li>
          <li>
            <strong>Public Subnets:</strong> Route tables target an Internet Gateway (IGW) for direct
            internet ingress (used for ALBs and bastion hosts).
          </li>
          <li>
            <strong>Private Subnets:</strong> No route to IGW; instances talk to the internet through a
            NAT Gateway for outbound updates only.
          </li>
        </ul>
      </section>

      {/* Section 6 */}
      <section id="aws-sec-6" className="space-y-4 scroll-mt-28">
        <h2 className="text-2xl font-bold text-text border-b border-border pb-2">
          Section 6 — AWS Application Load Balancers (ALB)
        </h2>
        <p>
          An <strong>ALB</strong> operates at Layer 7 (HTTP/HTTPS). It terminates SSL certificates
          provisioned via AWS ACM, inspects path headers (e.g. routing <code>/api/*</code> to one
          service and <code>/*</code> to another), and executes periodic health check probes.
        </p>
      </section>

      {/* Section 7 */}
      <section id="aws-sec-7" className="space-y-4 scroll-mt-28">
        <h2 className="text-2xl font-bold text-text border-b border-border pb-2">
          Section 7 — How Everything Connects (Interactive Architecture)
        </h2>
        <p>
          Below is a complete reference architecture showing how Route 53, ALB, EC2 in private
          subnets, Amazon RDS, and Amazon S3 interconnect securely:
        </p>
        <Callout type="note" title="Reference Architecture Notice">
          This diagram represents a scalable, enterprise-grade multi-AZ reference design for educational
          learning, illustrating how production AWS services interconnect.
        </Callout>

        <div className="my-6">
          <AwsArchitectureDiagram />
        </div>
      </section>

      {/* Section 8 */}
      <section id="aws-sec-8" className="space-y-4 scroll-mt-28">
        <h2 className="text-2xl font-bold text-text border-b border-border pb-2">
          Section 8 — Practical AWS Deployment Workflow
        </h2>
        <p>A structured approach to standing up this environment:</p>
        <ol className="list-decimal pl-6 space-y-1.5 text-xs md:text-sm">
          <li>Create VPC (<code>10.0.0.0/16</code>) with 2 public and 4 private subnets across 2 AZs.</li>
          <li>Attach Internet Gateway to the VPC and configure public route tables (<code>0.0.0.0/0 → igw</code>).</li>
          <li>Launch a NAT Gateway in Public Subnet AZ-a to enable private subnet egress.</li>
          <li>Configure Security Groups: <code>sg-alb</code> (inbound 80/443), <code>sg-ec2</code> (inbound 3000 from <code>sg-alb</code>), <code>sg-rds</code> (inbound 5432 from <code>sg-ec2</code>).</li>
          <li>Provision RDS PostgreSQL Multi-AZ cluster in private DB subnets.</li>
          <li>Create an S3 bucket and attach a VPC Gateway Endpoint to the private route tables.</li>
          <li>Launch EC2 instances in private app subnets using an Ubuntu 24.04 AMI.</li>
          <li>Provision ALB across public subnets with an HTTPS listener and forward to target group.</li>
          <li>Alias domain in Route 53 to the ALB DNS endpoint.</li>
        </ol>
      </section>

      {/* Section 9 */}
      <section id="aws-sec-9" className="space-y-4 scroll-mt-28">
        <h2 className="text-2xl font-bold text-text border-b border-border pb-2">
          Section 9 — Security Best Practices
        </h2>
        <ul className="list-disc pl-6 space-y-1.5 text-xs md:text-sm">
          <li>Enforce AWS IAM Least Privilege; never use root credentials for daily operations.</li>
          <li>Encrypt all EBS volumes, RDS storage, and S3 buckets at rest using AWS KMS.</li>
          <li>Use AWS SSM Session Manager instead of exposing port 22 directly to the internet.</li>
          <li>Enable AWS CloudTrail and AWS Config for continuous infrastructure auditing.</li>
        </ul>
      </section>

      {/* Section 10 */}
      <section id="aws-sec-10" className="space-y-4 scroll-mt-28">
        <h2 className="text-2xl font-bold text-text border-b border-border pb-2">
          Section 10 — Cost Awareness
        </h2>
        <p>
          Always set up an <strong>AWS Budget alert</strong> (e.g. at $10/month threshold). NAT
          Gateways, ALBs, and multi-AZ RDS instances incur hourly charges regardless of traffic. For
          learning labs, terminate or stop idle resources immediately after testing.
        </p>
      </section>
    </div>
  );
}

/* =========================================================================
   ARTICLE 3: LINUX SERVER ADMIN CONTENT & TOC
========================================================================= */

function LinuxToc() {
  const links = [
    { href: "#lnx-sec-1", title: "1. What is Linux Server Administration?" },
    { href: "#lnx-sec-2", title: "2. Connecting via SSH" },
    { href: "#lnx-sec-3", title: "3. Essential Linux Commands" },
    { href: "#lnx-sec-4", title: "4. User & Permission Management" },
    { href: "#lnx-sec-5", title: "5. Nginx Web Server Configuration" },
    { href: "#lnx-sec-6", title: "6. Deployment Workflow (Diagram)" },
    { href: "#lnx-sec-7", title: "7. Automated SSL with Certbot" },
    { href: "#lnx-sec-8", title: "8. Monitoring & Troubleshooting" },
    { href: "#lnx-sec-9", title: "9. Hardening & Security Best Practices" },
  ];

  return (
    <ul className="space-y-2 text-xs">
      {links.map((l) => (
        <li key={l.href}>
          <a href={l.href} className="text-text-muted hover:text-accent transition-colors block py-0.5">
            {l.title}
          </a>
        </li>
      ))}
    </ul>
  );
}

function LinuxAdminContent() {
  return (
    <div className="space-y-8 text-sm text-text leading-relaxed">
      {/* Section 1 */}
      <section id="lnx-sec-1" className="space-y-4 scroll-mt-28">
        <h2 className="text-2xl font-bold text-text border-b border-border pb-2">
          Section 1 — What is Linux Server Administration?
        </h2>
        <p>
          Over 90% of global cloud infrastructure and public web servers run on Linux distributions
          like Ubuntu, Debian, Red Hat, and Alpine. Linux server administration is the discipline of
          configuring, operating, securing, and maintaining these headless operating systems to ensure
          uninterrupted uptime, high throughput, and robust data protection.
        </p>
      </section>

      {/* Section 2 */}
      <section id="lnx-sec-2" className="space-y-4 scroll-mt-28">
        <h2 className="text-2xl font-bold text-text border-b border-border pb-2">
          Section 2 — Connecting to a Linux Server via SSH
        </h2>
        <p>
          Secure Shell (SSH) is the cryptographic network protocol used to execute commands on remote
          machines securely over an unsecured network.
        </p>
        <CodeSnippet
          lang="bash"
          code={`# Restrict permissions on your private key (required by OpenSSH)
chmod 400 ~/.ssh/deployer_key.pem

# Connect to Ubuntu cloud instance
ssh -i ~/.ssh/deployer_key.pem ubuntu@your-server-ip

# Test SSH connection with verbose debugging
ssh -v -i ~/.ssh/deployer_key.pem ubuntu@your-server-ip`}
        />
      </section>

      {/* Section 3 */}
      <section id="lnx-sec-3" className="space-y-4 scroll-mt-28">
        <h2 className="text-2xl font-bold text-text border-b border-border pb-2">
          Section 3 — Essential Linux Commands
        </h2>
        <p>Core command-line utilities used daily in cloud administration:</p>

        <div className="overflow-x-auto border border-border bg-surface my-4">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-surface-muted mono font-semibold">
                <th className="p-3">Command</th>
                <th className="p-3">Description &amp; Flags</th>
                <th className="p-3">Practical Example</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="p-3 font-mono font-bold text-accent">df -h</td>
                <td className="p-3">Inspect disk filesystem space in human-readable GB</td>
                <td className="p-3 font-mono">df -h /</td>
              </tr>
              <tr>
                <td className="p-3 font-mono font-bold text-accent">free -h</td>
                <td className="p-3">Display total, used, and available RAM and Swap</td>
                <td className="p-3 font-mono">free -m -t</td>
              </tr>
              <tr>
                <td className="p-3 font-mono font-bold text-accent">systemctl</td>
                <td className="p-3">Control systemd service units and daemons</td>
                <td className="p-3 font-mono">sudo systemctl restart nginx</td>
              </tr>
              <tr>
                <td className="p-3 font-mono font-bold text-accent">journalctl</td>
                <td className="p-3">Query systemd journal logs with real-time tailing</td>
                <td className="p-3 font-mono">journalctl -u nginx.service -f</td>
              </tr>
              <tr>
                <td className="p-3 font-mono font-bold text-accent">grep -rn</td>
                <td className="p-3">Search string recursively across directory with line numbers</td>
                <td className="p-3 font-mono">grep -rn &ldquo;server_name&rdquo; /etc/nginx/</td>
              </tr>
              <tr>
                <td className="p-3 font-mono font-bold text-accent">top / htop</td>
                <td className="p-3">Real-time dynamic view of running processes and CPU load</td>
                <td className="p-3 font-mono">htop</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 4 */}
      <section id="lnx-sec-4" className="space-y-4 scroll-mt-28">
        <h2 className="text-2xl font-bold text-text border-b border-border pb-2">
          Section 4 — User and Permission Management
        </h2>
        <p>
          Linux enforces multi-user security with Users, Groups, and Read/Write/Execute permissions:
        </p>
        <CodeSnippet
          lang="bash"
          code={`# Create an unprivileged deployment user
sudo adduser deployer
sudo usermod -aG sudo deployer

# Grant ownership of web directory to deployer
sudo chown -R deployer:www-data /var/www/html
sudo chmod -R 755 /var/www/html`}
        />
      </section>

      {/* Section 5 */}
      <section id="lnx-sec-5" className="space-y-4 scroll-mt-28">
        <h2 className="text-2xl font-bold text-text border-b border-border pb-2">
          Section 5 — Nginx Web Server &amp; Reverse Proxy
        </h2>
        <p>
          Nginx is an event-driven, high-performance web server that terminates SSL and reverse
          proxies requests to local app servers (Node.js, Python, or Go):
        </p>
        <CodeSnippet
          lang="nginx"
          code={`# /etc/nginx/sites-available/piyushprasad.in
server {
    listen 80;
    server_name piyushprasad.in www.piyushprasad.in;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name piyushprasad.in www.piyushprasad.in;

    ssl_certificate /etc/letsencrypt/live/piyushprasad.in/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/piyushprasad.in/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}`}
        />
        <CodeSnippet
          lang="bash"
          code={`# Test Nginx syntax and reload safely
sudo nginx -t && sudo systemctl reload nginx`}
        />
      </section>

      {/* Section 6 */}
      <section id="lnx-sec-6" className="space-y-4 scroll-mt-28">
        <h2 className="text-2xl font-bold text-text border-b border-border pb-2">
          Section 6 — Website Deployment Architecture
        </h2>
        <p>
          The complete flow separating automated GitHub Actions deployment from incoming live web
          visitor traffic:
        </p>

        <div className="my-6">
          <LinuxArchitectureDiagram />
        </div>
      </section>

      {/* Section 7 */}
      <section id="lnx-sec-7" className="space-y-4 scroll-mt-28">
        <h2 className="text-2xl font-bold text-text border-b border-border pb-2">
          Section 7 — SSL Certificates with Certbot &amp; Let&apos;s Encrypt
        </h2>
        <p>
          Let&apos;s Encrypt provides free, automated 90-day TLS certificates using the ACME protocol.
          Certbot automates certificate requests and Nginx configuration:
        </p>
        <CodeSnippet
          lang="bash"
          code={`# Install Certbot via Snap on Ubuntu
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot

# Obtain and install SSL certificates for Nginx automatically
sudo certbot --nginx -d piyushprasad.in -d www.piyushprasad.in

# Verify that automatic renewal timers are active
sudo certbot renew --dry-run`}
        />
      </section>

      {/* Section 8 */}
      <section id="lnx-sec-8" className="space-y-4 scroll-mt-28">
        <h2 className="text-2xl font-bold text-text border-b border-border pb-2">
          Section 8 — Monitoring and Troubleshooting
        </h2>
        <p>When an application fails or returns a 502 Bad Gateway error:</p>
        <CodeSnippet
          lang="bash"
          code={`# 1. Verify if the backend application is listening on port 3000
sudo ss -tulpn | grep 3000

# 2. Check Nginx error logs for upstream connect failures
sudo tail -n 50 /var/log/nginx/error.log

# 3. Check application logs via PM2 or systemd
pm2 logs --lines 100
# or
journalctl -u webapp -n 50 --no-pager`}
        />
      </section>

      {/* Section 9 */}
      <section id="lnx-sec-9" className="space-y-4 scroll-mt-28">
        <h2 className="text-2xl font-bold text-text border-b border-border pb-2">
          Section 9 — Security Hardening Best Practices
        </h2>
        <ul className="list-disc pl-6 space-y-2 text-xs md:text-sm">
          <li>
            <strong>Disable Root SSH Password Login:</strong> In <code>/etc/ssh/sshd_config</code>,
            set <code>PermitRootLogin no</code> and <code>PasswordAuthentication no</code>.
          </li>
          <li>
            <strong>Configure UFW Firewall:</strong>
            <CodeSnippet
              lang="bash"
              code={`sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable`}
            />
          </li>
          <li>
            <strong>Automatic Security Updates:</strong> Enable <code>unattended-upgrades</code> to
            apply critical CVE security patches automatically without manual intervention.
          </li>
        </ul>
      </section>
    </div>
  );
}
