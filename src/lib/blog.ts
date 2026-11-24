import { supabase } from "@/integrations/supabase/client";

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  short_description: string;
  category: "Networking & DNS" | "Cloud Infrastructure" | "Linux & Systems" | "DevSecOps & CI/CD";
  reading_time: string;
  published_date: string;
  author: string;
  author_role: string;
  cover_image_url?: string;
  cover_icon: string;
  is_published: boolean;
  is_featured: boolean;
  seo_title: string;
  seo_description: string;
  canonical_url: string;
  created_at: string;
  updated_at: string;
}

export interface BlogPostInput {
  title: string;
  slug: string;
  subtitle: string;
  short_description: string;
  category: "Networking & DNS" | "Cloud Infrastructure" | "Linux & Systems" | "DevSecOps & CI/CD";
  reading_time: string;
  published_date: string;
  cover_image_url?: string;
  cover_icon?: string;
  is_published: boolean;
  is_featured: boolean;
  seo_title: string;
  seo_description: string;
}

export const BLOG_CATEGORIES = [
  "Networking & DNS",
  "Cloud Infrastructure",
  "Linux & Systems",
  "DevSecOps & CI/CD",
] as const;

export const INITIAL_BLOG_POSTS: BlogPost[] = [
  {
    id: "blog-01-dns-explained",
    slug: "dns-explained",
    title: "DNS Explained: How Domain Names Connect to Websites",
    subtitle: "Understand DNS, DNS records, domain resolution, and how to connect your own domain to a website.",
    short_description:
      "A beginner-friendly guide to how domain names connect to websites: what DNS means, how records work, and what happens step-by-step when you type piyushprasad.in into your browser.",
    category: "Networking & DNS",
    reading_time: "7 min read",
    published_date: "November 2026",
    author: "Piyush Prasad",
    author_role: "Cloud & DevOps Engineer",
    cover_icon: "Network",
    is_published: true,
    is_featured: true,
    seo_title: "DNS Explained: How Domain Names Connect to Websites — Piyush Prasad",
    seo_description:
      "Understand DNS, A/CNAME/MX/TXT records, hierarchical domain resolution, troubleshooting, and connecting custom domains with interactive architecture diagrams.",
    canonical_url: "https://www.piyushprasad.in/blog/dns-explained",
    created_at: "2026-11-23T10:00:00.000Z",
    updated_at: "2026-11-23T10:00:00.000Z",
  },
  {
    id: "blog-02-aws-cloud-infrastructure",
    slug: "aws-cloud-infrastructure-guide",
    title: "AWS Explained: How EC2, S3, RDS, VPC and Load Balancers Work Together",
    subtitle: "Understand core AWS cloud services using simple language, real-world analogies, and interactive architectures.",
    short_description:
      "A beginner's guide to cloud computing on AWS: how virtual servers (EC2), file storage (S3), databases (RDS), private networks (VPC), and load balancers collaborate to run websites.",
    category: "Cloud Infrastructure",
    reading_time: "9 min read",
    published_date: "November 2026",
    author: "Piyush Prasad",
    author_role: "Cloud & DevOps Engineer",
    cover_icon: "Cloud",
    is_published: true,
    is_featured: true,
    seo_title: "AWS Explained: How EC2, S3, RDS, VPC and Load Balancers Work Together — Piyush Prasad",
    seo_description:
      "Learn how AWS EC2, S3, RDS, VPC, and Application Load Balancers work together with beginner-friendly explanations and interactive architecture diagrams.",
    canonical_url: "https://www.piyushprasad.in/blog/aws-cloud-infrastructure-guide",
    created_at: "2026-11-23T11:00:00.000Z",
    updated_at: "2026-11-23T11:00:00.000Z",
  },
  {
    id: "blog-03-linux-server-administration",
    slug: "linux-server-administration",
    title: "Linux Server Basics: How to Manage and Host a Website",
    subtitle: "Learn how to connect with SSH, run essential commands, configure Nginx, and host a website securely.",
    short_description:
      "A practical, step-by-step beginner guide to Linux and Ubuntu servers: connecting via SSH, essential terminal commands, Nginx web serving, UFW firewall security, and HTTPS setup.",
    category: "Linux & Systems",
    reading_time: "8 min read",
    published_date: "November 2026",
    author: "Piyush Prasad",
    author_role: "Cloud & DevOps Engineer",
    cover_icon: "Terminal",
    is_published: true,
    is_featured: true,
    seo_title: "Linux Server Basics: How to Manage and Host a Website — Piyush Prasad",
    seo_description:
      "A hands-on guide to managing an Ubuntu cloud server, mastering essential Linux commands, configuring Nginx reverse proxy, setting up SSL certificates, and hardening SSH.",
    canonical_url: "https://www.piyushprasad.in/blog/linux-server-administration",
    created_at: "2026-11-23T12:00:00.000Z",
    updated_at: "2026-11-23T12:00:00.000Z",
  },
];

const LOCAL_STORAGE_KEY = "piyush_portfolio_blog_posts";

function getLocalPosts(): BlogPost[] {
  if (typeof window === "undefined") return INITIAL_BLOG_POSTS;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return INITIAL_BLOG_POSTS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (e) {
    console.warn("Failed to read blog posts from localStorage", e);
  }
  return INITIAL_BLOG_POSTS;
}

function saveLocalPosts(posts: BlogPost[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(posts));
  } catch (e) {
    console.warn("Failed to persist blog posts to localStorage", e);
  }
}

/**
 * Fetch all published blog posts for public view
 */
export async function fetchPublishedBlogPosts(): Promise<BlogPost[]> {
  try {
    const { data, error } = await supabase
      .from("blog_posts" as any)
      .select("*")
      .eq("is_published", true)
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      return data as unknown as BlogPost[];
    }
  } catch (err) {
    // Graceful fallback if database table not yet populated or offline
  }

  const local = getLocalPosts();
  return local.filter((post) => post.is_published);
}

/**
 * Fetch a single blog post by its URL slug
 */
export async function fetchBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const { data, error } = await supabase
      .from("blog_posts" as any)
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (!error && data) {
      return data as unknown as BlogPost;
    }
  } catch (err) {
    // Graceful fallback
  }

  const local = getLocalPosts();
  const found = local.find((post) => post.slug === slug);
  return found || null;
}

/**
 * Admin: Fetch all blog posts including drafts
 */
export async function fetchAllBlogPostsAdmin(): Promise<BlogPost[]> {
  try {
    const { data, error } = await supabase
      .from("blog_posts" as any)
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      return data as unknown as BlogPost[];
    }
  } catch (err) {
    // Graceful fallback
  }

  return getLocalPosts();
}

/**
 * Admin: Create a new blog post
 */
export async function createBlogPost(input: BlogPostInput): Promise<BlogPost> {
  const newPost: BlogPost = {
    id: `blog-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    slug: input.slug.toLowerCase().trim().replace(/[^a-z0-9-]+/g, "-"),
    title: input.title,
    subtitle: input.subtitle,
    short_description: input.short_description,
    category: input.category,
    reading_time: input.reading_time || "8 min read",
    published_date: input.published_date || new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
    author: "Piyush Prasad",
    author_role: "Cloud & DevOps Engineer",
    cover_image_url: input.cover_image_url,
    cover_icon: input.cover_icon || "BookOpen",
    is_published: input.is_published,
    is_featured: input.is_featured,
    seo_title: input.seo_title || `${input.title} — Piyush Prasad`,
    seo_description: input.seo_description || input.short_description,
    canonical_url: `https://www.piyushprasad.in/blog/${input.slug}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabase
      .from("blog_posts" as any)
      .insert([newPost])
      .select()
      .single();

    if (!error && data) {
      const posts = getLocalPosts();
      saveLocalPosts([data as unknown as BlogPost, ...posts]);
      return data as unknown as BlogPost;
    }
  } catch (e) {
    // Local persistence fallback
  }

  const posts = getLocalPosts();
  const updated = [newPost, ...posts];
  saveLocalPosts(updated);
  return newPost;
}

/**
 * Admin: Update an existing blog post
 */
export async function updateBlogPost(id: string, input: Partial<BlogPostInput>): Promise<BlogPost> {
  const posts = getLocalPosts();
  const existing = posts.find((p) => p.id === id);
  if (!existing) throw new Error("Blog post not found");

  const updatedPost: BlogPost = {
    ...existing,
    ...input,
    updated_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabase
      .from("blog_posts" as any)
      .update(updatedPost)
      .eq("id", id)
      .select()
      .single();

    if (!error && data) {
      const filtered = posts.map((p) => (p.id === id ? (data as unknown as BlogPost) : p));
      saveLocalPosts(filtered);
      return data as unknown as BlogPost;
    }
  } catch (e) {
    // Local persistence fallback
  }

  const filtered = posts.map((p) => (p.id === id ? updatedPost : p));
  saveLocalPosts(filtered);
  return updatedPost;
}

/**
 * Admin: Toggle publish status
 */
export async function toggleBlogPostPublish(id: string, is_published: boolean): Promise<BlogPost> {
  return updateBlogPost(id, { is_published });
}

/**
 * Admin: Delete a blog post
 */
export async function deleteBlogPost(id: string): Promise<void> {
  try {
    await supabase.from("blog_posts" as any).delete().eq("id", id);
  } catch (e) {
    // Ignore error
  }

  const posts = getLocalPosts();
  const filtered = posts.filter((p) => p.id !== id);
  saveLocalPosts(filtered);
}
