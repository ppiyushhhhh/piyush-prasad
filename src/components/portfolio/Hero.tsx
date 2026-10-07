import { motion, useReducedMotion, type Variants } from "framer-motion";
import { EMAIL, GITHUB, LINKEDIN } from "@/lib/site";
import {
  ArrowDown,
  Download,
  Github,
  Linkedin,
  Mail,
  Server,
  ShieldCheck,
  Cpu,
  Terminal,
  Activity,
  CheckCircle2,
} from "lucide-react";

export function Hero() {
  const shouldReduceMotion = useReducedMotion();

  const fadeIn: Variants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <section
      id="hero"
      className="relative overflow-hidden border-b border-border bg-[#FAF9F6] pt-28 pb-16 md:pt-36 md:pb-24"
    >
      {/* Subtle Technical Engineering Blueprint Grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(#121316 1px, transparent 1px), linear-gradient(90deg, #121316 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative mx-auto max-w-[1400px] px-6 md:px-10">
        {/* Top Operational Status Ribbon */}
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="show"
          className="mono mb-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-carbon/70"
        >
          <div className="inline-flex items-center gap-2 border border-border bg-white px-3 py-1 shadow-2xs">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600" />
            </span>
            <span className="font-semibold text-carbon">SYSTEM STATUS: OPERATIONAL</span>
          </div>
          <span className="hidden text-border sm:inline">•</span>
          <span>NAVI MUMBAI, INDIA</span>
          <span className="hidden text-border sm:inline">•</span>
          <span className="text-cobalt font-medium">AWS & DEVOPS ENGINEERING</span>
        </motion.div>

        {/* Main Grid: Asymmetric Editorial Split */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-14 xl:gap-20 items-center">
          {/* Left Column: Headlines & Actions */}
          <div className="lg:col-span-7 xl:col-span-7">
            {/* Small Eyebrow */}
            <motion.div
              variants={fadeIn}
              initial="hidden"
              animate="show"
              transition={{ delay: 0.1 }}
              className="mono text-cobalt text-[11px] font-bold tracking-[0.2em] mb-4"
            >
              CLOUD &amp; DEVOPS ENGINEER
            </motion.div>

            {/* Large Editorial Headline */}
            <motion.h1
              variants={fadeIn}
              initial="hidden"
              animate="show"
              transition={{ delay: 0.2 }}
              className="display text-[38px] leading-[1.04] sm:text-[54px] md:text-[68px] xl:text-[76px] text-carbon tracking-tight"
            >
              Building Reliable
              <br />
              Infrastructure for
              <br />
              <span className="text-cobalt">a Scalable Tomorrow</span>
            </motion.h1>

            {/* Concise Description */}
            <motion.p
              variants={fadeIn}
              initial="hidden"
              animate="show"
              transition={{ delay: 0.3 }}
              className="mt-6 max-w-xl text-base md:text-lg leading-relaxed text-muted-foreground"
            >
              Specializing in AWS cloud infrastructure, Linux server administration,
              Docker containerization, automated CI/CD pipelines, Prometheus &amp; Grafana monitoring,
              security hardening, and infrastructure automation.
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={fadeIn}
              initial="hidden"
              animate="show"
              transition={{ delay: 0.4 }}
              className="mt-8 flex flex-wrap items-center gap-4"
            >
              <a
                href="#projects"
                className="mono inline-flex items-center gap-2.5 bg-cobalt px-6 py-3.5 text-[11px] font-semibold tracking-wider text-white transition-all hover:bg-carbon hover:shadow-sm"
              >
                <span>VIEW MY PROJECTS</span>
                <ArrowDown className="h-3.5 w-3.5" />
              </a>

              <a
                href="/resume.pdf"
                target="_blank"
                rel="noreferrer"
                download="Piyush_Prasad_Resume.pdf"
                className="mono inline-flex items-center gap-2.5 border border-carbon bg-white px-6 py-3.5 text-[11px] font-semibold tracking-wider text-carbon transition-all hover:border-cobalt hover:text-cobalt hover:bg-white"
              >
                <Download className="h-3.5 w-3.5" />
                <span>DOWNLOAD RESUME</span>
              </a>
            </motion.div>

            {/* Social & Contact Direct Links */}
            <motion.div
              variants={fadeIn}
              initial="hidden"
              animate="show"
              transition={{ delay: 0.5 }}
              className="mt-10 flex flex-wrap items-center gap-5 border-t border-border pt-6 text-xs text-carbon/80 font-medium"
            >
              <span className="mono text-[10px] text-muted-foreground uppercase tracking-wider">
                CONNECT:
              </span>
              <a
                href={GITHUB}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 transition-colors hover:text-cobalt"
              >
                <Github className="h-4 w-4" />
                <span>GitHub</span>
              </a>
              <span className="text-border">/</span>
              <a
                href={LINKEDIN}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 transition-colors hover:text-cobalt"
              >
                <Linkedin className="h-4 w-4" />
                <span>LinkedIn</span>
              </a>
              <span className="text-border">/</span>
              <a
                href={`mailto:${EMAIL}`}
                className="inline-flex items-center gap-1.5 transition-colors hover:text-cobalt"
              >
                <Mail className="h-4 w-4" />
                <span>{EMAIL}</span>
              </a>
            </motion.div>
          </div>

          {/* Right Column: Technical Infrastructure Blueprint Card */}
          <div className="lg:col-span-5 xl:col-span-5">
            <motion.div
              variants={fadeIn}
              initial="hidden"
              animate="show"
              transition={{ delay: 0.35 }}
              className="border border-border bg-white p-6 md:p-8 shadow-xs"
            >
              {/* Terminal / Monitor Header */}
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-border" />
                  <span className="h-2.5 w-2.5 rounded-full bg-border" />
                  <span className="h-2.5 w-2.5 rounded-full bg-border" />
                  <span className="mono ml-2 text-[10px] font-semibold text-carbon/70">
                    INFRASTRUCTURE TOPOLOGY
                  </span>
                </div>
                <span className="mono text-[10px] text-cobalt font-semibold">
                  ap-south-1
                </span>
              </div>

              {/* Technical Spec List */}
              <div className="mt-5 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center border border-border bg-[#FAF9F6] text-cobalt">
                    <Server className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="mono text-[10px] text-muted-foreground uppercase">
                      Compute &amp; OS
                    </div>
                    <div className="text-sm font-semibold text-carbon">
                      AWS EC2 · Ubuntu Linux 24.04 LTS
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center border border-border bg-[#FAF9F6] text-cobalt">
                    <Terminal className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="mono text-[10px] text-muted-foreground uppercase">
                      Automation &amp; CI/CD
                    </div>
                    <div className="text-sm font-semibold text-carbon">
                      GitHub Actions · Docker · PM2
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center border border-border bg-[#FAF9F6] text-cobalt">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="mono text-[10px] text-muted-foreground uppercase">
                      Security &amp; Hardening
                    </div>
                    <div className="text-sm font-semibold text-carbon">
                      Trivy Scan · UFW Firewall · Certbot SSL
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center border border-border bg-[#FAF9F6] text-cobalt">
                    <Activity className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="mono text-[10px] text-muted-foreground uppercase">
                      Observability Stack
                    </div>
                    <div className="text-sm font-semibold text-carbon">
                      Prometheus · Grafana · Node Exporter
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Operational Summary Box */}
              <div className="mt-6 border border-dashed border-border bg-[#FAF9F6] p-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="mono text-[10px] text-muted-foreground">
                    CORE SPECIALTY
                  </span>
                  <span className="mono text-[10px] font-semibold text-cobalt">
                    PRODUCTION GRADE
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-carbon/80">
                  Bridging IT Service Management with DevSecOps — turning ticket queues into reliable, automated, observable pipelines.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
