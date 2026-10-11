import { createFileRoute } from "@tanstack/react-router";
import { Navigation } from "@/components/portfolio/Navigation";
import { Hero } from "@/components/portfolio/Hero";
import { Projects } from "@/components/portfolio/Projects";
import { SkillsGrid } from "@/components/portfolio/SkillsGrid";
import { ExperienceTimeline } from "@/components/portfolio/ExperienceTimeline";
import { Certifications } from "@/components/portfolio/Certifications";
import { GithubActivity } from "@/components/portfolio/GithubActivity";
import { ContactSection } from "@/components/portfolio/ContactSection";
import { Footer } from "@/components/portfolio/Footer";
import { AskPiyushAI } from "@/components/portfolio/AskPiyushAI";
import { CommandPalette } from "@/components/portfolio/CommandPalette";
import { CustomCursor } from "@/components/portfolio/CustomCursor";
import { SITE_URL } from "@/lib/site";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cloud & DevOps Engineer | Piyush Prasad" },
      {
        name: "description",
        content:
          "Portfolio of Piyush Prasad, Cloud & DevOps Engineer specializing in AWS cloud infrastructure, automated CI/CD pipelines, Docker containerization, and DevSecOps.",
      },
      { property: "og:title", content: "Cloud & DevOps Engineer | Piyush Prasad" },
      {
        property: "og:description",
        content:
          "Portfolio of Piyush Prasad, Cloud & DevOps Engineer specializing in AWS cloud infrastructure, automated CI/CD pipelines, Docker containerization, and DevSecOps.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/` },
      { property: "og:image", content: `${SITE_URL}/og-image.png` },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Piyush Prasad — Cloud & DevOps Engineer Portfolio" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Cloud & DevOps Engineer | Piyush Prasad" },
      {
        name: "twitter:description",
        content:
          "Portfolio of Piyush Prasad, Cloud & DevOps Engineer specializing in AWS cloud infrastructure, automated CI/CD pipelines, Docker containerization, and DevSecOps.",
      },
      { name: "twitter:image", content: `${SITE_URL}/og-image.png` },
      { name: "twitter:image:alt", content: "Piyush Prasad — Cloud & DevOps Engineer Portfolio" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/` }],
  }),

  component: PortfolioPage,
});

function PortfolioPage() {
  return (
    <div className="relative min-h-screen bg-[#FAF9F6] text-carbon selection:bg-cobalt selection:text-white">
      {/* Minimalist Deep Carbon Custom Pointer */}
      <CustomCursor />

      {/* Sticky Top Navigation */}
      <Navigation />

      {/* Main Content Sections */}
      <main className="relative z-10">
        <Hero />
        <Projects />
        <SkillsGrid />
        <ExperienceTimeline />
        <Certifications />
        <GithubActivity />
        <ContactSection />
      </main>

      {/* Editorial Footer */}
      <Footer />

      {/* Interactive Command Palette (Cmd+K / Ctrl+K) */}
      <CommandPalette />

      {/* AI Portfolio Assistant Float */}
      <AskPiyushAI />
    </div>
  );
}
