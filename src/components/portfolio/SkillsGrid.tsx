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

interface PriorityTech {
  name: string;
  category: string;
  detail: string;
}

const PRIORITY_TECHS: PriorityTech[] = [
  { name: "AWS", category: "Cloud Infrastructure", detail: "EC2 · S3 · IAM · Networking" },
  { name: "Linux", category: "Operating System", detail: "Ubuntu LTS · CLI · Administration" },
  { name: "Docker", category: "Containers", detail: "Containerization · Isolation" },
  { name: "Kubernetes", category: "Orchestration", detail: "Workloads · Deployments" },
  { name: "GitHub Actions", category: "CI/CD Automation", detail: "Automated Workflows · Runners" },
  { name: "Nginx", category: "Web & Reverse Proxy", detail: "Reverse Proxy · SSL Termination" },
  { name: "MySQL", category: "Relational Database", detail: "Data Persistence · Queries" },
  { name: "Prometheus", category: "Metrics Collection", detail: "Time-Series TSDB · Node Exporter" },
  { name: "Grafana", category: "Observability", detail: "Dashboards · Alerting" },
  { name: "Terraform", category: "IaC", detail: "Infrastructure as Code" },
  { name: "Git", category: "Version Control", detail: "Branching · SSH Keys · VCS" },
  { name: "Trivy", category: "DevSecOps", detail: "Vulnerability & Secret Scans" },
];

const SKILL_CATEGORIES = [
  {
    icon: Cloud,
    label: "Cloud & Infrastructure",
    tags: ["AWS EC2", "AWS S3", "AWS IAM", "Cloudflare", "DNS Routing"],
  },
  {
    icon: Terminal,
    label: "Operating Systems & Linux",
    tags: ["Linux (Ubuntu)", "Server Administration", "Bash Scripting", "Systemd Services"],
  },
  {
    icon: Layers,
    label: "Containers & Orchestration",
    tags: ["Docker", "Docker Compose", "Kubernetes", "Container Hardening"],
  },
  {
    icon: GitBranch,
    label: "CI/CD & Version Control",
    tags: ["GitHub Actions", "Pipeline Automation", "Continuous Deployment", "SSH Auth", "Git"],
  },
  {
    icon: Server,
    label: "Web Servers & Reverse Proxy",
    tags: ["Nginx", "Reverse Proxy", "Load Balancing", "PM2 Process Manager"],
  },
  {
    icon: Activity,
    label: "Observability & Metrics",
    tags: ["Prometheus", "Grafana", "Node Exporter", "Server Health Telemetry"],
  },
  {
    icon: Shield,
    label: "Security & DevSecOps",
    tags: ["Trivy Vulnerability Scan", "UFW Firewall", "Certbot SSL/HTTPS", "Rate Limiting", "DKIM/SPF/DMARC"],
  },
  {
    icon: Database,
    label: "Databases & Runtimes",
    tags: ["MySQL", "SQLite", "Node.js", "Express"],
  },
  {
    icon: Settings,
    label: "ITSM & Operations",
    tags: ["ManageEngine ServiceDesk Plus", "ITIL Practices", "SLA Management", "Incident Management"],
  },
];

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
    <section id="skills" className="relative border-b border-border bg-[#FAF9F6] py-20 md:py-28">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <SectionHeader
          n="02"
          label="TECHNICAL SKILLS"
          title="Tools & Technologies"
          description="A production-tested technology matrix across cloud infrastructure, container orchestration, CI/CD automation, and DevSecOps tooling."
        />

        {/* Prioritized Technology Showcase Grid */}
        <div className="mb-14">
          <div className="mono mb-4 flex items-center justify-between text-xs text-carbon/60">
            <span className="font-semibold text-carbon tracking-wider">
              PRIORITY INFRASTRUCTURE STACK
            </span>
            <span className="text-cobalt font-medium">12 PRODUCTION TOOLS</span>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {PRIORITY_TECHS.map((tech, i) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.35, delay: i * 0.04 }}
                className="group relative flex flex-col justify-between border border-border bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-cobalt hover:shadow-2xs"
              >
                <div>
                  <div className="mono text-[9px] text-muted-foreground uppercase tracking-wider">
                    {tech.category}
                  </div>
                  <div className="mt-1.5 text-base font-bold text-carbon group-hover:text-cobalt transition-colors">
                    {tech.name}
                  </div>
                </div>
                <div className="mono mt-3 text-[10px] text-carbon/70 border-t border-border/60 pt-2">
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
            <div className="mono mb-4 text-xs font-semibold text-carbon tracking-wider">
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
                    className="flex flex-col justify-between border border-border bg-white p-5 transition-all hover:border-carbon/40"
                  >
                    <div>
                      <div className="flex items-center gap-2 text-cobalt mb-3">
                        <Icon className="h-4 w-4" />
                        <span className="mono text-[10px] font-bold tracking-wider text-carbon">
                          {cat.label.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {cat.tags.map((t) => (
                          <span
                            key={t}
                            className="mono border border-border bg-[#FAF9F6] px-2 py-0.5 text-[10px] text-carbon/80 hover:border-cobalt hover:text-cobalt transition-colors"
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
            <div className="mono mb-4 text-xs font-semibold text-carbon tracking-wider">
              OPERATIONAL WORKBENCH
            </div>

            <div className="border border-border bg-white p-6 shadow-2xs">
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
                    className={`mono text-left border px-3 py-2 text-[11px] transition-all ${
                      pressed === c.id
                        ? "border-cobalt bg-cobalt text-white scale-[0.98]"
                        : "border-border bg-[#FAF9F6] text-carbon hover:border-cobalt hover:text-cobalt"
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
                  <span className="text-xs font-medium text-carbon">
                    Auto-Deploy Trigger
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setToggle(!toggle)}
                      aria-pressed={toggle}
                      aria-label="Toggle auto-deploy trigger state"
                      className={`relative h-6 w-11 rounded-full border transition-colors ${
                        toggle ? "border-cobalt bg-cobalt" : "border-border bg-[#EAEAE4]"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all shadow-xs ${
                          toggle ? "left-6" : "left-0.5"
                        }`}
                      />
                    </button>
                    <span className="mono text-[10px] font-bold text-cobalt w-12">
                      {toggle ? "ACTIVE" : "PAUSED"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Utilization Simulator Slider */}
              <div className="mt-6 border-t border-border pt-5">
                <div className="flex items-center justify-between">
                  <label htmlFor="workbench-slider" className="mono text-[10px] text-muted-foreground uppercase tracking-wider">
                    TARGET CPU UTILIZATION
                  </label>
                  <span className="mono text-[10px] font-bold text-cobalt">
                    {util}%
                  </span>
                </div>
                <input
                  id="workbench-slider"
                  type="range"
                  min={10}
                  max={100}
                  value={util}
                  onChange={(e) => setUtil(Number(e.target.value))}
                  aria-label="Adjust target CPU utilization"
                  className="mt-3 w-full accent-[#1A4BFF]"
                />
                <div className="mono mt-2 flex justify-between text-[9px] text-muted-foreground">
                  <span>BASELINE 10%</span>
                  <span>MAX LOAD 100%</span>
                </div>
              </div>

              {/* Status Note */}
              <div className="mono mt-6 border-t border-dashed border-border pt-4 text-[10px] text-carbon/60">
                PROD RUNNER: <span className="text-emerald-600 font-semibold">HEALTHY (0 FAILS)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
