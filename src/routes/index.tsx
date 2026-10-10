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
      { property: "og:url", content: `${SITE_URL}/` },
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
