import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowUpRight,
  Copy,
  Check,
  Download,
  Eye,
  Github,
  Linkedin,
  Mail,
  Phone,
  ChevronDown,
  Loader2,
} from "lucide-react";
import packtLogo from "@/assets/packt-logo.jpg";
import googleLogo from "@/assets/google-logo.jpg";
import canonicalLogo from "@/assets/canonical-logo.jpg";
import dockerLogo from "@/assets/docker-logo.jpg";
import githubLogo from "@/assets/github-logo.jpg";
import awsLogo from "@/assets/aws-logo.jpg";

export const Route = createFileRoute("/")({
  component: PortfolioPage,
});

const GH_USER = "ppiyushhhhh";
const EMAIL = "piyush.piyushprasad.in";
const PHONE = "+91 9324236673";
const LINKEDIN = "https://linkedin.com/in/ppiyushhhh";
const GITHUB = "https://github.com/ppiyushhhhh";

/* ---------- Data ---------- */

const PROJECTS = [
  {
    idx: "01",
    title: "DevOps CI/CD Pipeline",
    subtitle: "AWS · Nginx · Cloudflare · GitHub Actions",
    year: "2025",
    body:
      "Designed and implemented a full CI/CD pipeline using GitHub Actions to automate deployment of a React application. Deployed on AWS EC2 (Ubuntu), configured Nginx as a reverse proxy. Managed domain routing with Cloudflare and implemented secure domain-based email via SPF, DKIM, and DMARC.",
    tech: ["CI/CD", "AWS EC2", "Nginx", "Cloudflare", "GitHub Actions", "SSH Auth"],
    link: { label: "kamleshprasad.xyz", href: "https://kamleshprasad.xyz" },
  },
  {
    idx: "02",
    title: "Production AWS EC2 + DevSecOps",
    subtitle: "Monitoring · Security · Prometheus · Grafana",
    year: "In Progress",
    body:
      "Deployed a production-grade React + Node.js application on AWS EC2 using Nginx reverse proxy with HTTPS via Certbot SSL. Implemented server hardening: UFW Firewall, rate limiting, and DDoS protection. Built a full monitoring stack with Prometheus, Grafana, and Node Exporter. Integrated Trivy vulnerability scanning in CI/CD.",
    tech: ["Prometheus", "Grafana", "Node Exporter", "Trivy", "UFW", "Certbot"],
    link: null,
  },
];

const EXPERIENCE = [
  {
    company: "Runtime Solutions",
    role: "IT Office Assistant",
    type: "Full-Time",
    period: "Dec 2024 — Present",
    bullets: [
      "Managed end-to-end ITSM ticket lifecycle including incidents, service requests, and escalations across multiple locations using ManageEngine ServiceDesk Plus.",
      "Maintained SLA compliance by prioritizing critical issues, minimizing downtime, and ensuring timely resolution.",
      "Administered IT asset lifecycle for laptops, desktops, access points, and biometric devices with accurate tracking and documentation.",
      "Coordinated with internal teams and external vendors to resolve hardware, network, and system issues within defined SLAs.",
      "Supported daily IT operations including ticket logging, categorization, escalation handling, and documentation.",
    ],
  },
  {
    company: "Credence Infotech",
    role: "IT Support Coordinator",
    type: "Full-Time",
    period: "Feb 2022 — Oct 2024",
    bullets: [
      "Provided operational support for IT infrastructure, service management, and change management processes.",
      "Acted as a coordination point between technical teams and stakeholders to ensure smooth and efficient service delivery.",
      "Monitored service performance and maintained adherence to defined operational standards and client SLAs.",
      "Contributed to process improvement initiatives to enhance service efficiency and overall customer satisfaction.",
      "Provided operational support and consultation to improve IT service quality and system reliability.",
    ],
  },
];

const SKILL_CATS = [
  { label: "Cloud", tags: ["AWS EC2", "AWS S3", "AWS IAM"] },
  { label: "Operating Systems", tags: ["Linux (Ubuntu)", "Server Administration"] },
  { label: "DevOps Tools", tags: ["GitHub", "GitHub Actions", "Trivy"] },
  { label: "Web Server", tags: ["Nginx", "Reverse Proxy", "Load Balancing"] },
  { label: "CI/CD", tags: ["Pipeline Automation", "Continuous Deployment", "SSH Auth"] },
  { label: "Monitoring", tags: ["Prometheus", "Grafana", "Node Exporter"] },
  { label: "Security", tags: ["SSL/HTTPS", "UFW Firewall", "Rate Limiting", "Vulnerability Scanning", "DKIM/SPF/DMARC"] },
  { label: "ITSM", tags: ["ManageEngine ServiceDesk Plus", "ITIL Practices", "SLA Management"] },
];

const CERTS: { name: string; issuer: string; url?: string; logo?: string }[] = [
  { name: "DevOps Complete Course Specialization", issuer: "Packt (Coursera)", url: "https://www.coursera.org/account/accomplishments/specialization/592LMXYN7KZK", logo: packtLogo },
  { name: "Google AI Essentials Specialization", issuer: "Google (Coursera)", logo: googleLogo, url: "https://www.coursera.org/account/accomplishments/specialization/EZS8GLRIG535" },
  { name: "Ubuntu Linux Professional Certificate", issuer: "Canonical", logo: canonicalLogo, url: "https://www.linkedin.com/learning/certificates/9d7f2b805f126a9612c6b1be485f14f90d4362bb9f0c6875bcb7702bc1274dbf" },
  { name: "Docker Foundations Professional Certificate", issuer: "Docker, Inc", logo: dockerLogo, url: "https://www.linkedin.com/learning/certificates/3f8f006fe458d2f993ddba0bd0f3c357f3caf92a5e15bad0718a01e1709241e0" },
  { name: "Career Essentials in GitHub Professional Certificate", issuer: "GitHub", logo: githubLogo, url: "https://www.linkedin.com/learning/certificates/9a7cce8c73b57d5e8629e5ac94a454a78c5fda6957c901ca4854a7c93e13a3e7" },
  { name: "AWS Knowledge: Cloud Essentials — Training Badge", issuer: "Amazon Web Services", logo: awsLogo, url: "https://www.credly.com/badges/1d7245e6-ebba-4b7b-970f-ad1d214a1c91/linked_in_profile" },
  
  { name: "DNS", issuer: "Packt", logo: packtLogo, url: "https://www.coursera.org/account/accomplishments/verify/JJJLW2JGJZBS" },
];

const EDUCATION = [
  { period: "Jan 2022 — Mar 2025", degree: "Bachelor of Commerce (B.Com)", school: "Tilak Education Society's J.K. College of Science & Commerce", extra: "University of Mumbai" },
  { period: "Aug 2019 — Jun 2021", degree: "Higher Secondary (Commerce)", school: "Allen Swami Vivekanand Junior College", extra: "MSSBHS" },
  { period: "Jun 2008 — Mar 2019", degree: "Secondary School", school: "Tilak Education Society's Tilak Global School", extra: "MSSBHS" },
];

const NAV = [
  { id: "projects", label: "Projects" },
  { id: "experience", label: "Experience" },
  { id: "skills", label: "Skills" },
  { id: "certifications", label: "Certifications" },
  { id: "github", label: "GitHub" },
  { id: "contact", label: "Contact" },
];

/* ---------- Motion helpers ---------- */

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 90, damping: 18, mass: 0.9 } },
};

/* ---------- Blueprint grid overlay ---------- */

function BlueprintGrid() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 1200 100">
        {Array.from({ length: 13 }).map((_, i) => (
          <motion.line
            key={i}
            x1={(i * 1200) / 12}
            x2={(i * 1200) / 12}
            y1={0}
            y2={100}
            stroke="#D1D1CB"
            strokeWidth={0.3}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.6 }}
            transition={{ duration: 1.2, delay: i * 0.05, ease: "easeOut" }}
          />
        ))}
      </svg>
    </div>
  );
}

/* ---------- Top nav ---------- */

function TopNav() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string>("hero");
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    const ids = ["hero", ...NAV.map((n) => n.id)];
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el);
    if (sections.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);
  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-all ${
        scrolled ? "bg-[#F4F4F2]/90 backdrop-blur-md border-b border-[#D1D1CB]" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-5 md:px-10">
        <a href="#hero" className="mono font-medium text-carbon">PP</a>
        <svg width="28" height="28" viewBox="0 0 28 28" className="hidden md:block" aria-hidden>
          <line x1="14" y1="2" x2="14" y2="26" stroke="#1A4BFF" strokeWidth="1" />
          <line x1="2" y1="14" x2="26" y2="14" stroke="#1A4BFF" strokeWidth="1" />
        </svg>
        <nav className="hidden items-center gap-8 md:flex" aria-label="Section navigation">
          {NAV.map((n) => {
            const isActive = active === n.id;
            return (
              <a
                key={n.id}
                href={`#${n.id}`}
                aria-current={isActive ? "location" : undefined}
                className={`mono relative text-[11px] transition-colors ${
                  isActive ? "text-cobalt" : "text-carbon hover:text-cobalt"
                }`}
              >
                {n.label}
                <span
                  aria-hidden
                  className={`absolute -bottom-1.5 left-0 h-[2px] bg-cobalt transition-all duration-300 ${
                    isActive ? "w-full" : "w-0"
                  }`}
                />
              </a>
            );
          })}
        </nav>
        <a
          href="#contact"
          className="mono text-[11px] md:hidden"
        >
          Menu
        </a>
      </div>
      {/* Mobile section indicator */}
      <div className="mono flex items-center justify-between border-t border-[#D1D1CB] bg-[#F4F4F2]/90 px-6 py-2 text-[10px] backdrop-blur-md md:hidden">
        <span className="text-carbon/50">SECTION</span>
        <span className="text-cobalt">
          {(NAV.find((n) => n.id === active)?.label) ?? "INTRO"}
        </span>
      </div>
    </header>
  );
}


/* ---------- Hero ---------- */

function Hero() {
  return (
    <section id="hero" className="relative min-h-screen px-6 pt-32 pb-20 md:px-10 md:pt-40">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(#0F1115 1px, transparent 1px), linear-gradient(90deg, #0F1115 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div className="relative mx-auto max-w-[1400px]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mono flex flex-wrap items-center gap-3 text-cobalt text-[11px]"
        >
          <span>PIYUSH_PRASAD.v2026</span>
          <span className="text-[#D1D1CB]">—</span>
          <span>NAVI MUMBAI, INDIA</span>
          <span className="text-[#D1D1CB]">—</span>
          <span className="inline-flex items-center gap-2">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cobalt opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-cobalt" />
            </span>
            AVAILABLE FOR OPPORTUNITIES
          </span>
        </motion.div>

        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-8">
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
              className="display text-[64px] leading-[0.88] md:text-[96px] lg:text-[128px]"
            >
              <span className="block">PIYUSH</span>
              <span className="block text-cobalt">PRASAD</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="show"
              transition={{ delay: 0.9 }}
              className="mono mt-8 text-[12px]"
            >
              CLOUD &amp; DEVOPS ENGINEER
            </motion.p>
            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="show"
              transition={{ delay: 1.05 }}
              className="mt-4 max-w-xl text-[17px] text-carbon/80"
            >
              Building scalable, secure, and observable infrastructure systems. Bridging ITSM and DevSecOps — from ticket queues to production pipelines.
            </motion.p>
          </div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ delay: 1.2 }}
            className="lg:col-span-4 lg:pt-24"
          >
            <ul className="mono space-y-3 text-[12px]">
              <li>
                <a href={`mailto:${EMAIL}`} className="group inline-flex items-center gap-2 hover:text-cobalt">
                  <ArrowUpRight className="h-3.5 w-3.5 text-cobalt transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  {EMAIL}
                </a>
              </li>
              <li>
                <a href={LINKEDIN} target="_blank" rel="noreferrer" className="group inline-flex items-center gap-2 hover:text-cobalt">
                  <ArrowUpRight className="h-3.5 w-3.5 text-cobalt transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  linkedin.com/in/ppiyushhhh
                </a>
              </li>
              <li>
                <a href={GITHUB} target="_blank" rel="noreferrer" className="group inline-flex items-center gap-2 hover:text-cobalt">
                  <ArrowUpRight className="h-3.5 w-3.5 text-cobalt transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  github.com/{GH_USER}
                </a>
              </li>
            </ul>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 0.8 }}
          className="mono mt-24 flex items-center gap-4 text-[11px] text-carbon/60"
        >
          <span className="h-px w-16 bg-carbon/40" />
          <span>SCROLL TO EXPLORE</span>
          <ChevronDown className="h-3.5 w-3.5" />
        </motion.div>
      </div>
    </section>
  );
}

/* ---------- Section header ---------- */

function SectionLabel({ n, label, dark = false }: { n: string; label: string; dark?: boolean }) {
  return (
    <div className={`mono mb-16 flex items-center gap-4 text-[11px] ${dark ? "text-white/60" : "text-carbon/70"}`}>
      <span className="text-cobalt">{n}</span>
      <span>/ {label}</span>
      <span className={`ml-4 h-px flex-1 ${dark ? "bg-white/20" : "bg-[#D1D1CB]"}`} />
    </div>
  );
}

/* ---------- Projects ---------- */

function Projects() {
  return (
    <section id="projects" className="relative px-6 py-24 md:px-10 md:py-32">
      <div className="mx-auto max-w-[1400px]">
        <SectionLabel n="001" label="SELECTED WORK" />
        <ul>
          {PROJECTS.map((p, i) => (
            <motion.li
              key={p.idx}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-80px" }}
              className={`group relative grid grid-cols-1 gap-6 border-t border-[#D1D1CB] py-12 transition-all duration-500 hover:bg-cobalt/5 hover:px-6 lg:grid-cols-12 lg:gap-10 lg:py-16 ${
                i === PROJECTS.length - 1 ? "border-b" : ""
              }`}
            >
              <div className="mono text-cobalt text-[12px] transition-transform duration-500 group-hover:translate-x-2 lg:col-span-1">{p.idx}</div>
              <div className="lg:col-span-6">
                <h3 className="display text-[40px] leading-[0.9] transition-all duration-500 group-hover:translate-x-2 group-hover:text-cobalt md:text-[64px] lg:text-[80px]">
                  {p.title}
                </h3>
                <p className="mono mt-4 text-cobalt text-[11px]">{p.subtitle}</p>
              </div>
              <div className="lg:col-span-5">
                <p className="mono text-[11px] text-carbon/60">{p.year}</p>
                <p className="mt-4 text-carbon/85">{p.body}</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {p.tech.map((t) => (
                    <span
                      key={t}
                      className="mono border border-[#D1D1CB] px-2.5 py-1 text-[10px] text-carbon/80 transition-colors duration-300 hover:border-cobalt hover:bg-cobalt hover:text-white"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                {p.link && (
                  <a
                    href={p.link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="mono mt-6 inline-flex items-center gap-2 text-cobalt text-[11px] hover:underline"
                  >
                    <ArrowUpRight className="h-4 w-4" /> {p.link.label}
                  </a>
                )}
              </div>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------- Experience ---------- */

function Experience() {
  const [active, setActive] = useState(0);
  const job = EXPERIENCE[active];
  return (
    <section id="experience" className="relative bg-carbon px-6 py-24 text-white md:px-10 md:py-32">
      <div className="mx-auto max-w-[1400px]">
        <SectionLabel n="002" label="EXPERIENCE" dark />
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <h2 className="display text-[56px] leading-[0.88] md:text-[80px]">
              WORK
              <br />
              <span className="text-cobalt">HISTORY</span>
            </h2>
            <ul className="mt-10 space-y-1">
              {EXPERIENCE.map((e, i) => {
                const isActive = i === active;
                return (
                  <li key={e.company}>
                    <button
                      onClick={() => setActive(i)}
                      className={`w-full border-l-2 py-4 pl-5 text-left transition-colors ${
                        isActive
                          ? "border-cobalt bg-white/[0.04]"
                          : "border-white/10 hover:border-white/40"
                      }`}
                    >
                      <div className={`mono text-[12px] ${isActive ? "text-cobalt" : "text-white"}`}>
                        {e.company.toUpperCase()}
                      </div>
                      <div className="mono mt-1 text-[10px] text-white/50">{e.period}</div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-8"
          >
            <span className="mono inline-block border border-cobalt px-3 py-1 text-cobalt text-[10px]">
              {job.type}
            </span>
            <h3 className="display mt-6 text-[40px] leading-[0.95] md:text-[56px]">{job.role.toUpperCase()}</h3>
            <p className="mono mt-3 text-cobalt text-[11px]">{job.period}</p>
            <ul className="mt-10 space-y-6">
              {job.bullets.map((b, i) => (
                <li key={i} className="flex gap-4">
                  <span className="mono mt-1 text-cobalt text-[11px]">→</span>
                  <span className="text-white/85">{b}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Skills ---------- */

function Skills() {
  const [toggle, setToggle] = useState(false);
  const [util, setUtil] = useState(65);
  const [pressed, setPressed] = useState<string | null>(null);
  const press = (id: string) => {
    setPressed(id);
    setTimeout(() => setPressed(null), 300);
  };
  return (
    <section id="skills" className="relative px-6 py-24 md:px-10 md:py-32">
      <div className="mx-auto max-w-[1400px]">
        <SectionLabel n="003" label="THE STACK" />
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <h2 className="display text-[56px] leading-[0.88] md:text-[80px]">
              THE
              <br />
              <span className="text-cobalt">STACK</span>
            </h2>
            <p className="mt-6 max-w-sm text-carbon/70">
              A live component library. Interact with the elements below — these reflect real design + engineering proficiency.
            </p>

            <div className="mt-10 border border-[#D1D1CB] bg-white/60 p-6">
              <div className="mono mb-5 text-[10px] text-carbon/60">INTERACTIVE COMPONENTS</div>
              <div className="flex flex-wrap gap-3">
                {[
                  { id: "aws", cmd: "$ aws deploy" },
                  { id: "nginx", cmd: "$ nginx -t" },
                  { id: "sys", cmd: "$ systemctl" },
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => press(c.id)}
                    className={`mono border px-3 py-2 text-[11px] transition-all ${
                      pressed === c.id
                        ? "border-cobalt bg-cobalt text-white scale-[0.97]"
                        : "border-cobalt text-cobalt hover:bg-cobalt hover:text-white"
                    }`}
                  >
                    {c.cmd}
                  </button>
                ))}
              </div>

              <div className="mt-6 flex items-center gap-3">
                <button
                  onClick={() => setToggle((t) => !t)}
                  aria-pressed={toggle}
                  className={`relative h-6 w-11 rounded-full border transition-colors ${
                    toggle ? "border-cobalt bg-cobalt" : "border-[#D1D1CB] bg-[#EAEAE4]"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${
                      toggle ? "left-6" : "left-0.5"
                    }`}
                  />
                </button>
                <span className="mono text-[10px] text-carbon/70">{toggle ? "ACTIVE" : "IDLE"}</span>
              </div>

              <div className="mt-6">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={util}
                  onChange={(e) => setUtil(Number(e.target.value))}
                  className="w-full accent-[#1A4BFF]"
                />
                <div className="mono mt-2 text-[10px] text-carbon/70">
                  UTILIZATION: <span className="text-cobalt">{util}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {SKILL_CATS.map((cat) => (
                <motion.div
                  key={cat.label}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: "-40px" }}
                  className="group border border-[#D1D1CB] bg-white/50 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-cobalt hover:bg-white hover:shadow-[0_8px_24px_-12px_rgba(26,75,255,0.35)]"
                >
                  <div className="mono mb-4 flex items-center gap-2 text-[10px] text-carbon/70 transition-colors group-hover:text-cobalt">
                    <span className="h-1.5 w-1.5 rounded-full bg-cobalt transition-transform group-hover:scale-150" />
                    {cat.label.toUpperCase()}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {cat.tags.map((t) => (
                      <span
                        key={t}
                        className="mono border border-[#D1D1CB] bg-white px-2.5 py-1 text-[10px] text-carbon/80 transition-all hover:border-cobalt hover:bg-cobalt hover:text-white"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Certifications & Education ---------- */

function Certifications() {
  return (
    <section id="certifications" className="relative px-6 py-24 md:px-10 md:py-32">
      <div className="mx-auto max-w-[1400px]">
        <SectionLabel n="004" label="CERTIFICATIONS & EDUCATION" />
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h2 className="display text-[48px] leading-[0.9] md:text-[72px]">CREDENTIALS</h2>
            <ul className="mt-10 divide-y divide-[#D1D1CB] border-t border-b border-[#D1D1CB]">
              {CERTS.map((c) => (
                <motion.li
                  key={c.name}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  className="flex items-center gap-5 py-5"
                >
                  <div className="mono group flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden border border-[#D1D1CB] text-cobalt text-[10px] transition-all duration-300 hover:scale-110 hover:border-cobalt hover:shadow-md">
                    {c.logo ? (
                      <img src={c.logo} alt={`${c.issuer} logo`} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" />
                    ) : (
                      c.issuer.slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1">
                    {c.url ? (
                      <a
                        href={c.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium underline decoration-cobalt/40 underline-offset-4 transition-colors hover:text-cobalt hover:decoration-cobalt"
                      >
                        {c.name} ↗
                      </a>
                    ) : (
                      <div className="font-medium">{c.name}</div>
                    )}
                    <div className="mono mt-1 text-cobalt text-[10px]">{c.issuer}</div>
                  </div>
                </motion.li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-5">
            <h2 className="display text-[48px] leading-[0.9] md:text-[72px]">EDUCATION</h2>
            <div className="mt-10 space-y-4">
              {EDUCATION.map((e) => (
                <motion.div
                  key={e.degree}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  className="border border-[#D1D1CB] bg-white/50 p-5"
                >
                  <div className="mono text-cobalt text-[10px]">{e.period}</div>
                  <div className="mt-3 font-semibold">{e.degree}</div>
                  <div className="mt-1 text-sm text-carbon/80">{e.school}</div>
                  <div className="mono mt-2 text-[10px] text-carbon/60">{e.extra}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- GitHub Activity ---------- */

type Repo = {
  id: number;
  name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  pushed_at: string;
  fork: boolean;
};
type Commit = { sha: string; commit: { message: string; author: { date: string } } };

const CACHE_VERSION = "v1";
const REPOS_TTL = 30 * 60_000; // 30 min fresh window
const COMMITS_TTL = 60 * 60_000; // 60 min fresh window
const CACHE_MAX_AGE = 7 * 24 * 60 * 60_000; // 7 day hard expiry

type CacheEntry<T> = { t: number; v: T };

function lsRead<T>(key: string): CacheEntry<T> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(`gh:${CACHE_VERSION}:${key}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CacheEntry<T>;
    if (!parsed || typeof parsed.t !== "number") return null;
    if (Date.now() - parsed.t > CACHE_MAX_AGE) return null;
    return parsed;
  } catch {
    return null;
  }
}

function lsWrite<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      `gh:${CACHE_VERSION}:${key}`,
      JSON.stringify({ t: Date.now(), v: value } satisfies CacheEntry<T>),
    );
  } catch {
    /* quota / private mode — ignore */
  }
}

async function fetchRepos(): Promise<Repo[]> {
  const r = await fetch(`https://api.github.com/users/${GH_USER}/repos?sort=pushed&per_page=6`);
  if (!r.ok) {
    const cached = lsRead<Repo[]>("repos");
    if (cached) return cached.v;
    throw new Error(r.status === 403 ? "GitHub rate limit reached." : `GitHub API error ${r.status}`);
  }
  const data = (await r.json()) as Repo[];
  const filtered = data.filter((r) => !r.fork).slice(0, 6);
  lsWrite("repos", filtered);
  return filtered;
}

async function fetchLatestCommit(repo: string): Promise<Commit | null> {
  try {
    const r = await fetch(`https://api.github.com/repos/${GH_USER}/${repo}/commits?per_page=1`);
    if (!r.ok) {
      const cached = lsRead<Commit | null>(`commit:${repo}`);
      return cached ? cached.v : null;
    }
    const data = (await r.json()) as Commit[];
    const latest = data[0] ?? null;
    lsWrite(`commit:${repo}`, latest);
    return latest;
  } catch {
    const cached = lsRead<Commit | null>(`commit:${repo}`);
    return cached ? cached.v : null;
  }
}

function relTime(iso: string) {
  const d = new Date(iso).getTime();
  const diff = Date.now() - d;
  const day = 86400000;
  if (diff < day) return "today";
  if (diff < day * 2) return "yesterday";
  if (diff < day * 30) return `${Math.floor(diff / day)}d ago`;
  if (diff < day * 365) return `${Math.floor(diff / (day * 30))}mo ago`;
  return `${Math.floor(diff / (day * 365))}y ago`;
}

function RepoCard({ repo }: { repo: Repo }) {
  const { data: commit } = useQuery({
    queryKey: ["commit", repo.name],
    queryFn: () => fetchLatestCommit(repo.name),
    staleTime: COMMITS_TTL,
    gcTime: CACHE_MAX_AGE,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  return (
    <a
      href={repo.html_url}
      target="_blank"
      rel="noreferrer"
      className="group flex flex-col border border-[#D1D1CB] bg-white/50 p-6 transition-colors hover:border-cobalt"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="mono text-[13px] font-medium group-hover:text-cobalt">{repo.name}</div>
        <ArrowUpRight className="h-4 w-4 text-carbon/40 transition-all group-hover:text-cobalt group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>
      {repo.language && (
        <div className="mono mt-3 flex items-center gap-2 text-[10px] text-carbon/70">
          <span className="h-1.5 w-1.5 rounded-full bg-cobalt" />
          {repo.language}
        </div>
      )}
      {repo.description && (
        <p className="mt-3 text-sm text-carbon/80">{repo.description}</p>
      )}
      <div className="mt-auto pt-6">
        <div className="mono text-[10px] text-carbon/60">LATEST COMMIT</div>
        {commit ? (
          <>
            <div className="mt-2 line-clamp-2 text-sm text-carbon/85">{commit.commit.message.split("\n")[0]}</div>
            <div className="mono mt-2 flex items-center gap-3 text-[10px] text-carbon/60">
              <span className="text-cobalt">{commit.sha.slice(0, 7)}</span>
              <span>{relTime(commit.commit.author.date)}</span>
            </div>
          </>
        ) : (
          <div className="mono mt-2 text-[10px] text-carbon/50">
            {relTime(repo.pushed_at)} · pushed
          </div>
        )}
      </div>
    </a>
  );
}

function GithubActivity() {
  const { data, isLoading, error, isFetching, dataUpdatedAt } = useQuery({
    queryKey: ["repos", GH_USER],
    queryFn: fetchRepos,
    staleTime: REPOS_TTL,
    gcTime: CACHE_MAX_AGE,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const showError = !!error && !data;
  const showStaleNotice = !!error && !!data;
  return (
    <section id="github" className="relative px-6 py-24 md:px-10 md:py-32">
      <div className="mx-auto max-w-[1400px]">
        <SectionLabel n="005" label="GITHUB ACTIVITY" />
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <h2 className="display text-[48px] leading-[0.9] md:text-[72px]">
            LIVE
            <br />
            <span className="text-cobalt">COMMITS</span>
          </h2>
          <a
            href={GITHUB}
            target="_blank"
            rel="noreferrer"
            className="mono inline-flex items-center gap-2 border border-[#D1D1CB] px-4 py-2 text-[11px] hover:border-cobalt hover:text-cobalt"
          >
            <Github className="h-3.5 w-3.5" />
            @{GH_USER}
          </a>
        </div>
        {isLoading && !data && (
          <div className="mono flex items-center gap-3 text-[11px] text-carbon/60">
            <Loader2 className="h-4 w-4 animate-spin" />
            Fetching repositories…
          </div>
        )}
        {showError && (
          <div className="mono border border-[#D1D1CB] p-6 text-[11px] text-carbon/70">
            {(error as Error).message} — try again later or view directly on GitHub.
          </div>
        )}
        {showStaleNotice && (
          <div className="mono mb-4 flex items-center gap-2 border border-[#D1D1CB] px-4 py-2 text-[10px] text-carbon/60">
            <span className="h-1.5 w-1.5 rounded-full bg-cobalt" />
            Showing cached activity — GitHub API unavailable.
          </div>
        )}
        {data && (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {data.map((r) => (
                <RepoCard key={r.id} repo={r} />
              ))}
            </div>
            {dataUpdatedAt > 0 && (
              <div className="mono mt-6 flex items-center gap-2 text-[10px] text-carbon/50">
                {isFetching && <Loader2 className="h-3 w-3 animate-spin" />}
                {isFetching ? "Revalidating…" : `Updated ${relTime(new Date(dataUpdatedAt).toISOString())}`}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

/* ---------- Contact ---------- */

function Contact() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // no-op
    }
  };
  return (
    <section id="contact" className="relative bg-carbon px-6 py-24 text-white md:px-10 md:py-32">
      <div className="mx-auto max-w-[1400px]">
        <SectionLabel n="006" label="CONTACT" dark />
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h2 className="display text-[64px] leading-[0.88] md:text-[112px] lg:text-[128px]">
              LET&apos;S
              <br />
              <span className="text-cobalt">BUILD</span>
              <br />
              TOGETHER
            </h2>
          </div>
          <div className="lg:col-span-5">
            <p className="text-white/70">
              Open to Cloud, DevOps, and DevSecOps opportunities. Let&apos;s connect and build something scalable, secure, and observable.
            </p>

            <div className="mt-10 space-y-6">
              <div>
                <div className="mono text-cobalt text-[10px]">EMAIL</div>
                <div className="mt-2 flex flex-wrap items-center gap-4">
                  <a href={`mailto:${EMAIL}`} className="text-[18px] hover:text-cobalt">
                    {EMAIL}
                  </a>
                  <button
                    onClick={copy}
                    className="mono inline-flex items-center gap-1.5 border border-white/20 px-2.5 py-1 text-[10px] transition-colors hover:border-cobalt hover:text-cobalt"
                  >
                    {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    {copied ? "COPIED" : "COPY"}
                  </button>
                </div>
              </div>

              <div>
                <div className="mono text-cobalt text-[10px]">PHONE</div>
                <a href={`tel:${PHONE.replace(/\s/g, "")}`} className="mt-2 block text-[18px] hover:text-cobalt">
                  {PHONE}
                </a>
              </div>

              <a
                href={LINKEDIN}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center justify-between border-b border-white/20 py-4 hover:border-cobalt"
              >
                <span className="inline-flex items-center gap-3 text-[16px]">
                  <Linkedin className="h-4 w-4 text-cobalt" />
                  LinkedIn
                </span>
                <ArrowUpRight className="h-5 w-5 text-cobalt transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </a>
              <a
                href={GITHUB}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center justify-between border-b border-white/20 py-4 hover:border-cobalt"
              >
                <span className="inline-flex items-center gap-3 text-[16px]">
                  <Github className="h-4 w-4 text-cobalt" />
                  GitHub
                </span>
                <ArrowUpRight className="h-5 w-5 text-cobalt transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </a>
            </div>
          </div>
        </div>
        <div className="mono mt-24 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-8 text-[10px] text-white/50">
          <span>© 2026 PIYUSH PRASAD — ALL RIGHTS RESERVED</span>
          <span>NAVI MUMBAI · IN</span>
        </div>
      </div>
    </section>
  );
}

/* ---------- CV Dock ---------- */

function CvDock() {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="fixed bottom-6 right-6 z-30 hidden sm:block"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <motion.div
        initial={false}
        animate={{ opacity: open ? 1 : 0, y: open ? 0 : 10, pointerEvents: open ? "auto" : "none" }}
        transition={{ duration: 0.2 }}
        className="mb-3 w-64 border border-[#D1D1CB] bg-white p-4 shadow-lg"
      >
        <div className="mono text-[10px] text-carbon/60">RESUME · 2026</div>
        <div className="display mt-2 text-[22px] leading-[0.95]">
          PIYUSH<br /><span className="text-cobalt">PRASAD</span>
        </div>
        <div className="mono mt-3 text-[9px] text-carbon/70">CLOUD &amp; DEVOPS ENGINEER</div>
        <div className="mt-3 border-t border-[#D1D1CB] pt-3 text-[11px] text-carbon/70">
          Preview inline or download the PDF.
        </div>
      </motion.div>
      <div className="flex items-center gap-2">
        <a
          href="/resume.pdf"
          target="_blank"
          rel="noreferrer"
          aria-label="View resume in new tab"
          className="mono inline-flex items-center gap-2 border border-carbon bg-white px-4 py-3 text-carbon text-[11px] shadow-lg transition-colors hover:bg-carbon hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-carbon focus-visible:ring-offset-2"
        >
          <Eye className="h-3.5 w-3.5" />
          VIEW
        </a>
        <a
          href="/resume.pdf"
          download="Piyush-Prasad-Resume.pdf"
          aria-label="Download resume PDF"
          className="mono inline-flex items-center gap-2 bg-carbon px-4 py-3 text-white text-[11px] shadow-lg transition-colors hover:bg-cobalt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt focus-visible:ring-offset-2"
        >
          <Download className="h-3.5 w-3.5" />
          DOWNLOAD CV
        </a>
      </div>

    </div>
  );
}

/* ---------- Page ---------- */

function PortfolioPage() {
  return (
    <div className="relative min-h-screen bg-stone text-carbon">
      <BlueprintGrid />
      <TopNav />
      <main className="relative z-10">
        <Hero />
        <Projects />
        <Experience />
        <Skills />
        <Certifications />
        <GithubActivity />
        <Contact />
      </main>
      <CvDock />
    </div>
  );
}
