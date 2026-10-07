import { GITHUB, LINKEDIN, EMAIL } from "@/lib/site";
import { ArrowUpRight, Github, Linkedin, Mail, Activity, FileText } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-[#FAF9F6] py-16 text-carbon">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-8 pb-12 border-b border-border">
          {/* Identity column */}
          <div className="md:col-span-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center border border-border bg-white shadow-2xs">
                  <img
                    src="/pp-logo.png"
                    alt="PP"
                    className="h-5 w-auto object-contain"
                  />
                </div>
                <span className="text-base font-bold tracking-tight text-carbon">
                  Piyush Prasad
                </span>
              </div>
              <p className="mt-3 max-w-sm text-sm text-muted-foreground leading-relaxed">
                Cloud &amp; DevOps engineer designing reliable AWS environments, CI/CD automation pipelines, and production observability.
              </p>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <a
                href={GITHUB}
                target="_blank"
                rel="noreferrer"
                className="flex h-8 w-8 items-center justify-center border border-border bg-white text-carbon/70 hover:border-cobalt hover:text-cobalt transition-colors"
                aria-label="GitHub Profile"
              >
                <Github className="h-4 w-4" />
              </a>
              <a
                href={LINKEDIN}
                target="_blank"
                rel="noreferrer"
                className="flex h-8 w-8 items-center justify-center border border-border bg-white text-carbon/70 hover:border-cobalt hover:text-cobalt transition-colors"
                aria-label="LinkedIn Profile"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a
                href={`mailto:${EMAIL}`}
                className="flex h-8 w-8 items-center justify-center border border-border bg-white text-carbon/70 hover:border-cobalt hover:text-cobalt transition-colors"
                aria-label="Send Email"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick links column */}
          <div className="md:col-span-3">
            <div className="mono text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">
              SECTIONS
            </div>
            <ul className="space-y-2.5 text-xs font-mono">
              <li>
                <a href="#hero" className="text-carbon/80 hover:text-cobalt transition-colors">
                  00 // Home
                </a>
              </li>
              <li>
                <a href="#projects" className="text-carbon/80 hover:text-cobalt transition-colors">
                  01 // Featured Projects
                </a>
              </li>
              <li>
                <a href="#skills" className="text-carbon/80 hover:text-cobalt transition-colors">
                  02 // Technical Skills
                </a>
              </li>
              <li>
                <a href="#experience" className="text-carbon/80 hover:text-cobalt transition-colors">
                  03 // Experience Journey
                </a>
              </li>
              <li>
                <a href="#certifications" className="text-carbon/80 hover:text-cobalt transition-colors">
                  04 // Credentials &amp; Education
                </a>
              </li>
              <li>
                <a href="#github" className="text-carbon/80 hover:text-cobalt transition-colors">
                  05 // GitHub Activity
                </a>
              </li>
              <li>
                <a href="#contact" className="text-carbon/80 hover:text-cobalt transition-colors">
                  06 // Get In Touch
                </a>
              </li>
            </ul>
          </div>

          {/* Infrastructure & Guides column */}
          <div className="md:col-span-4">
            <div className="mono text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">
              SYSTEM PORTALS &amp; GUIDES
            </div>
            <ul className="space-y-3 text-xs">
              <li>
                <a
                  href="/dashboard"
                  target="_blank"
                  rel="noreferrer"
                  className="group inline-flex items-center gap-2 font-mono text-cobalt font-semibold hover:underline"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Live CloudOps &amp; Architecture Monitor</span>
                  <ArrowUpRight className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="/resume"
                  target="_blank"
                  rel="noreferrer"
                  className="group inline-flex items-center gap-1.5 text-carbon/80 hover:text-cobalt transition-colors"
                >
                  <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Interactive Resume Document Viewer</span>
                  <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </li>
              <li>
                <a
                  href="/guides/devsecops-pipeline"
                  className="group inline-flex items-center gap-1.5 text-carbon/80 hover:text-cobalt transition-colors"
                >
                  <span>Guide: Building Secure CI/CD with Trivy</span>
                  <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.google.com/maps/place/Mahavir+Varsha+Residence/@19.1213383,73.0014191,17z"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-muted-foreground hover:text-carbon transition-colors"
                >
                  <span>Navi Mumbai, Maharashtra &bull; India</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright row */}
        <div className="mono mt-8 flex flex-wrap items-center justify-between gap-4 text-[10px] text-muted-foreground">
          <span>&copy; {new Date().getFullYear()} PIYUSH PRASAD — ALL RIGHTS RESERVED</span>
          <div className="flex items-center gap-4">
            <span>EDITORIAL ENGINEERING PORTFOLIO</span>
            <span>&bull;</span>
            <span className="text-cobalt">AWS &bull; LINUX &bull; DOCKER</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
