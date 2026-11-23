-- Migration: Create blog_posts table with RLS and indexes
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  short_description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Cloud Infrastructure',
  reading_time TEXT NOT NULL DEFAULT '10 min read',
  published_date TEXT NOT NULL,
  author TEXT NOT NULL DEFAULT 'Piyush Prasad',
  author_role TEXT NOT NULL DEFAULT 'Cloud & DevOps Engineer',
  cover_image_url TEXT,
  cover_icon TEXT NOT NULL DEFAULT 'BookOpen',
  is_published BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  seo_title TEXT NOT NULL,
  seo_description TEXT NOT NULL,
  canonical_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Allow public read of published posts
CREATE POLICY "Public read published blog posts"
  ON public.blog_posts
  FOR SELECT
  USING (is_published = true OR auth.role() = 'authenticated');

-- Allow authenticated admins to insert, update, delete
CREATE POLICY "Admins full management on blog posts"
  ON public.blog_posts
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Index for slug lookups and published status
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts (slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON public.blog_posts (is_published, created_at DESC);
