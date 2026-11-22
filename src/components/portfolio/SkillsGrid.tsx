import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { SectionHeader } from "./SectionHeader";
import {
  Cloud,
  Terminal,
  Cpu,
  Layers,
  Activity,
  Shield,
  Server,
  Settings,
  Database,
  GitBranch,
} from "lucide-react";
import { TechLogo } from "./TechLogos";

import { PRIORITY_TECHS, SKILL_CATEGORIES_DATA } from "@/data/portfolio-data";

const CATEGORY_ICONS = [
  Cloud,
  Terminal,
  Layers,
  GitBranch,
  Server,
  Activity,
  Shield,
  Database,
  Settings,
];

const SKILL_CATEGORIES = SKILL_CATEGORIES_DATA.map((cat, idx) => ({
  ...cat,
  icon: CATEGORY_ICONS[idx] ?? Settings,
}));

export function SkillsGrid() {
  const shouldReduceMotion = useReducedMotion();
  const [toggle, setToggle] = useState(true);
  const [util, setUtil] = useState(72);
  const [pressed, setPressed] = useState<string | null>(null);

  const press = (id: string) => {
    setPressed(id);
    setTimeout(() => setPressed(null), 300);
  };

  return (
    <section id="skills" className="relative border-b border-border bg-background py-20 md:py-28 scroll-mt-20">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <SectionHeader
          n="02"
          label="TECHNICAL SKILLS"
          title="Tools & Technologies"
          description="A production-tested technology matrix across cloud infrastructure, container orchestration, CI/CD automation, and DevSecOps tooling."
        />

        {/* Prioritized Technology Showcase Grid */}
        <div className="mb-14">
          <div className="mono mb-4 flex items-center justify-between text-xs text-text-muted">
            <span className="font-semibold text-text tracking-wider">
              PRIORITY INFRASTRUCTURE STACK
            </span>
            <span className="text-accent font-medium">12 PRODUCTION TOOLS</span>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {PRIORITY_TECHS.map((tech, i) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.35, delay: i * 0.04 }}
                className="group relative flex flex-col justify-between border border-border bg-surface p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent hover:shadow-2xs"
              >
                <div>
                  {/* Service Logo Header Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-border bg-surface-muted p-1 shadow-2xs group-hover:border-accent/60 group-hover:bg-surface transition-all">
                      <TechLogo name={tech.name} className="h-5 w-5" />
                    </div>
                    <span className="mono text-[8px] font-semibold text-muted-foreground/60 uppercase tracking-widest select-none">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <div className="mono text-[9px] text-muted-foreground uppercase tracking-wider">
                    {tech.category}
                  </div>
                  <div className="mt-1 text-base font-bold text-text group-hover:text-accent transition-colors">
                    {tech.name}
                  </div>
                </div>
                <div className="mono mt-3 text-[10px] text-text-muted border-t border-border/60 pt-2">
                  {tech.detail}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Categories & Interactive Workbench Layout */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-14">
          {/* Left Column: Categorized Detailed Skills */}
          <div className="lg:col-span-8">
            <div className="mono mb-4 text-xs font-semibold text-text tracking-wider">
              DETAILED DOMAIN CAPABILITIES
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              {SKILL_CATEGORIES.map((cat, i) => {
                const Icon = cat.icon;
                return (
                  <motion.div
                    key={cat.label}
                    initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-30px" }}
                    transition={{ duration: 0.35, delay: i * 0.05 }}
                    className="flex flex-col justify-between border border-border bg-surface p-5 transition-all hover:border-border"
                  >
                    <div>
                      <div className="flex items-center gap-2 text-accent mb-3">
                        <Icon className="h-4 w-4" />
                        <span className="mono text-[10px] font-bold tracking-wider text-text">
                          {cat.label.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {cat.tags.map((t) => (
                          <span
                            key={t}
                            className="mono border border-border bg-surface-muted px-2 py-0.5 text-[10px] text-text/80 hover:border-accent hover:text-accent transition-colors"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Interactive Systems Terminal & Workbench */}
          <div className="lg:col-span-4">
            <div className="mono mb-4 text-xs font-semibold text-text tracking-wider">
              OPERATIONAL WORKBENCH
            </div>

            <div className="border border-border bg-surface p-6 shadow-2xs">
              <div className="mono text-[10px] text-muted-foreground uppercase tracking-wider mb-4">
                CLI COMMAND SHORTCUTS
              </div>

              {/* Command triggers */}
              <div className="flex flex-col gap-2">
                {[
                  { id: "aws", cmd: "$ aws ec2 describe-instances" },
                  { id: "nginx", cmd: "$ nginx -t && systemctl reload" },
                  { id: "trivy", cmd: "$ trivy image --severity HIGH,CRIT" },
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => press(c.id)}
                    className={`mono text-left border px-3 py-2 text-[11px] transition-all cursor-pointer ${
                      pressed === c.id
                        ? "border-accent bg-accent text-text-on-accent scale-[0.98]"
                        : "border-border bg-surface-muted text-text hover:border-accent hover:text-accent"
                    }`}
                  >
                    {c.cmd}
                  </button>
                ))}
              </div>

              {/* System State Toggle */}
              <div className="mt-6 border-t border-border pt-5">
                <div className="mono text-[10px] text-muted-foreground uppercase tracking-wider mb-3">
                  PIPELINE DEPLOY GATE
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-text">Auto-Deploy Trigger</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setToggle(!toggle)}
                      aria-pressed={toggle}
                      aria-label="Toggle auto-deploy trigger state"
                      className={`relative h-6 w-11 rounded-full border transition-colors cursor-pointer ${
                        toggle ? "border-accent bg-accent" : "border-border bg-surface-muted"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 h-4 w-4 rounded-full bg-surface transition-all shadow-xs ${
                          toggle ? "left-6" : "left-0.5"
                        }`}
                      />
                    </button>
                    <span className="mono text-[10px] font-bold text-accent w-12">
                      {toggle ? "ACTIVE" : "PAUSED"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Utilization Simulator Slider */}
              <div className="mt-6 border-t border-border pt-5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="workbench-slider"
                    className="mono text-[10px] text-muted-foreground uppercase tracking-wider"
                  >
                    TARGET CPU UTILIZATION
                  </label>
                  <span className="mono text-[10px] font-bold text-accent">{util}%</span>
                </div>
                <input
                  id="workbench-slider"
                  type="range"
                  min={10}
                  max={100}
                  value={util}
                  onChange={(e) => setUtil(Number(e.target.value))}
                  aria-label="Adjust target CPU utilization"
                  className="mt-3 w-full accent-accent cursor-pointer"
                />
                <div className="mono mt-2 flex justify-between text-[9px] text-muted-foreground">
                  <span>BASELINE 10%</span>
                  <span>MAX LOAD 100%</span>
                </div>
              </div>

              {/* Status Note */}
              <div className="mono mt-6 border-t border-dashed border-border pt-4 text-[10px] text-text-muted">
                PROD RUNNER:{" "}
                <span className="text-success font-semibold">HEALTHY (0 FAILS)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
