import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import {
  ArrowLeft,
  ArrowUpRight,
  FileText,
  Home,
  ShieldCheck,
  Terminal,
} from "lucide-react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="min-h-screen bg-[#FAF9F6] text-carbon flex flex-col justify-between selection:bg-cobalt selection:text-white">
      {/* Top Bar */}
      <header className="border-b border-[#E5E5DF] bg-[#FAF9F6]/90 backdrop-blur-md px-6 py-4">
        <div className="mx-auto max-w-5xl flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 group text-sm font-semibold tracking-tight text-carbon"
          >
            <div className="h-2 w-2 bg-cobalt transition-transform group-hover:scale-125" />
            <span>Piyush Prasad</span>
            <span className="mono text-[10px] text-muted-foreground uppercase tracking-widest ml-1">
              // 404
            </span>
          </Link>
          <Link
            to="/"
            className="mono inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-cobalt transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to Portfolio</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-3xl w-full px-6 py-16 sm:py-24">
        <div className="border border-[#E5E5DF] bg-white p-8 sm:p-12 shadow-2xs">
          {/* Status readout */}
          <div className="flex items-center justify-between border-b border-[#E5E5DF] pb-5 mb-8">
            <span className="mono inline-flex items-center gap-2 border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-semibold tracking-wider uppercase text-rose-800">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-600 animate-pulse" />
              <span>HTTP 404 // ROUTE_NOT_FOUND</span>
            </span>
            <span className="mono text-[11px] text-muted-foreground">
              [INDEX_ERROR]
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-carbon">
            The requested page does not exist.
          </h1>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
            The URL you requested could not be located on this server. It may have been moved, updated, or removed. You can explore the core sections of the site below:
          </p>

          {/* Navigational Cards */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              to="/"
              className="group flex items-start justify-between border border-[#E5E5DF] bg-[#FAF9F6] p-4 transition-all hover:border-cobalt hover:bg-white hover:shadow-2xs"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center border border-[#E5E5DF] bg-white text-cobalt group-hover:border-cobalt">
                  <Home className="h-3.5 w-3.5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-carbon group-hover:text-cobalt transition-colors">
                    Home Portfolio
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    Projects, cloud architecture, and credentials.
                  </div>
                </div>
              </div>
              <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-cobalt transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>

            <Link
              to="/resume"
              className="group flex items-start justify-between border border-[#E5E5DF] bg-[#FAF9F6] p-4 transition-all hover:border-cobalt hover:bg-white hover:shadow-2xs"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center border border-[#E5E5DF] bg-white text-cobalt group-hover:border-cobalt">
                  <FileText className="h-3.5 w-3.5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-carbon group-hover:text-cobalt transition-colors">
                    Resume &amp; Experience
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    Engineering background &amp; printable PDF viewer.
                  </div>
                </div>
              </div>
              <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-cobalt transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>

            <Link
              to="/guides/devsecops-pipeline"
              className="group flex items-start justify-between border border-[#E5E5DF] bg-[#FAF9F6] p-4 transition-all hover:border-cobalt hover:bg-white hover:shadow-2xs"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center border border-[#E5E5DF] bg-white text-cobalt group-hover:border-cobalt">
                  <ShieldCheck className="h-3.5 w-3.5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-carbon group-hover:text-cobalt transition-colors">
                    DevSecOps Pipeline Guide
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    GitHub Actions, Trivy vulnerability scanning &amp; SBOMs.
                  </div>
                </div>
              </div>
              <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-cobalt transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>

            <Link
              to="/guides/devsecops-tools"
              className="group flex items-start justify-between border border-[#E5E5DF] bg-[#FAF9F6] p-4 transition-all hover:border-cobalt hover:bg-white hover:shadow-2xs"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center border border-[#E5E5DF] bg-white text-cobalt group-hover:border-cobalt">
                  <Terminal className="h-3.5 w-3.5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-carbon group-hover:text-cobalt transition-colors">
                    DevSecOps Tools Ecosystem
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    SAST, SCA, container scanning &amp; security stack.
                  </div>
                </div>
              </div>
              <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-cobalt transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-[#E5E5DF] flex items-center justify-between">
            <Link
              to="/"
              className="inline-flex items-center gap-2 border border-carbon bg-carbon px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-cobalt hover:border-cobalt shadow-2xs"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Return to Homepage</span>
            </Link>
            <span className="mono text-[10px] text-muted-foreground">
              piyushprasad.in
            </span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E5E5DF] bg-[#FAF9F6] px-6 py-4">
        <div className="mx-auto max-w-5xl flex items-center justify-between text-xs text-muted-foreground mono">
          <span>&copy; {new Date().getFullYear()} Piyush Prasad</span>
          <span>Cloud &amp; DevOps Engineering</span>
        </div>
      </footer>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Piyush Prasad — Cloud & DevOps Engineer | AWS & CI/CD" },
      { name: "description", content: "Cloud & DevOps engineer building AWS infrastructure, CI/CD pipelines, and DevSecOps automation with Docker, Nginx, and GitHub Actions." },
      { name: "author", content: "Piyush Prasad" },
      { name: "keywords", content: "Piyush Prasad, Cloud Engineer, DevOps Engineer, AWS, CI/CD, Docker, Nginx, GitHub Actions, Linux, DevSecOps, Portfolio" },
      { name: "robots", content: "index, follow" },
      { name: "google-site-verification", content: "K1jY27s3c8in51n399XWyedM9KQrwIQb0gYdcLoinBk" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Piyush Prasad — Portfolio" },
      { property: "og:locale", content: "en_US" },
      { property: "og:title", content: "Piyush Prasad — Cloud & DevOps Engineer | AWS & CI/CD" },
      { property: "og:description", content: "Cloud & DevOps engineer building AWS infrastructure, CI/CD pipelines, and DevSecOps automation with Docker, Nginx, and GitHub Actions." },
      { property: "og:url", content: "https://www.piyushprasad.in" },
      { property: "og:image", content: "https://www.piyushprasad.in/og-image.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Piyush Prasad — Cloud & DevOps Engineer Portfolio" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Piyush Prasad — Cloud & DevOps Engineer | AWS & CI/CD" },
      { name: "twitter:description", content: "Cloud & DevOps engineer building AWS infrastructure, CI/CD pipelines, and DevSecOps automation with Docker, Nginx, and GitHub Actions." },
      { name: "twitter:image", content: "https://www.piyushprasad.in/og-image.png" },
      { name: "twitter:image:alt", content: "Piyush Prasad — Cloud & DevOps Engineer Portfolio" },

    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Person",
              "@id": "https://www.piyushprasad.in/#person",
              name: "Piyush Prasad",
              alternateName: "Piyush",
              jobTitle: "Cloud & DevOps Engineer",
              description:
                "Cloud & DevOps engineer building AWS infrastructure, CI/CD pipelines, and DevSecOps automation with Docker, Nginx, and GitHub Actions.",
              url: "https://www.piyushprasad.in",
              email: "mailto:hello@piyushprasad.in",
              image:
                "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/c909e907-efb4-401c-9b45-48a20e30711a",
              address: {
                "@type": "PostalAddress",
                addressLocality: "Navi Mumbai",
                addressRegion: "Maharashtra",
                addressCountry: "IN",
              },
              knowsAbout: [
                "Amazon Web Services",
                "DevOps",
                "DevSecOps",
                "CI/CD",
                "Docker",
                "Nginx",
                "GitHub Actions",
                "Linux",
                "Cloudflare",
              ],
              sameAs: [
                "https://github.com/ppiyushhhhh",
                "https://linkedin.com/in/ppiyushhhh",
              ],
            },
            {
              "@type": "WebSite",
              "@id": "https://www.piyushprasad.in/#website",
              url: "https://www.piyushprasad.in",
              name: "Piyush Prasad — Portfolio",
              description:
                "Cloud & DevOps engineer building AWS infrastructure, CI/CD pipelines, and DevSecOps automation with Docker, Nginx, and GitHub Actions.",
              inLanguage: "en",
              publisher: { "@id": "https://www.piyushprasad.in/#person" },
              about: { "@id": "https://www.piyushprasad.in/#person" },
            },
          ],
        }),
      },
    ],

  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

import { Toaster } from "@/components/ui/sonner";

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
      <Toaster richColors position="bottom-right" />
    </QueryClientProvider>
  );
}
