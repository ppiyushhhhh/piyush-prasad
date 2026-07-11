import { createFileRoute } from "@tanstack/react-router";
import { Mail, Phone, Linkedin, Github } from "lucide-react";
import runtimeLogo from "@/assets/runtime-solutions.png.asset.json";
import credenceLogo from "@/assets/credence-infotech.jpg.asset.json";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <main
      className="min-h-screen py-10 sm:py-16 font-sans text-[15px] leading-relaxed"
      style={{ backgroundColor: "#e8edf3", color: "#0f1b3d" }}
    >
      <article
        className="mx-auto max-w-3xl bg-white px-8 py-12 sm:px-14 sm:py-16 shadow-[0_1px_2px_rgba(15,27,61,0.06),0_20px_50px_-20px_rgba(15,27,61,0.25)]"
        style={{ borderTop: "6px solid #0f1b3d" }}
      >
        {/* Header */}
        <header className="pb-6 mb-8 border-b" style={{ borderColor: "#e8edf3" }}>
          <h1
            className="font-serif text-4xl sm:text-5xl font-bold tracking-tight"
            style={{ color: "#0f1b3d" }}
          >
            Piyush Prasad
          </h1>
          <p
            className="mt-2 text-base uppercase tracking-[0.18em] font-medium"
            style={{ color: "#3b6fa0" }}
          >
            Aspiring Cloud &amp; DevOps Engineer
          </p>
          <div
            className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm"
            style={{ color: "#1e3a5f" }}
          >
            <a href="mailto:piyush.piyushprasad.in" className="inline-flex items-center gap-2 hover:underline">
              <Mail size={14} aria-hidden="true" style={{ color: "#3b6fa0" }} />
              piyush.piyushprasad.in
            </a>
            <a href="tel:+919324236673" className="inline-flex items-center gap-2 hover:underline">
              <Phone size={14} aria-hidden="true" style={{ color: "#3b6fa0" }} />
              +91 93242 36673
            </a>
            <a
              href="https://linkedin.com/in/ppiyushhhh"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 hover:underline"
            >
              <Linkedin size={14} aria-hidden="true" style={{ color: "#3b6fa0" }} />
              linkedin.com/in/ppiyushhhh
            </a>
            <a
              href="https://github.com/ppiyushhhhh"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 hover:underline"
            >
              <Github size={14} aria-hidden="true" style={{ color: "#3b6fa0" }} />
              github.com/ppiyushhhhh
            </a>
          </div>
        </header>

        <SectionHeading>Summary</SectionHeading>
        <p className="mb-10">
          IT professional with hands-on experience in IT Service Management and a strong transition into Cloud
          and DevOps engineering. Skilled in designing and deploying production-ready infrastructure on AWS EC2
          with CI/CD pipelines, Nginx reverse proxy, and Linux-based environments. Experienced in implementing
          server-level security, monitoring (Prometheus, Grafana), and automation using GitHub Actions. Focused
          on building scalable, secure, observable, and security-driven (DevSecOps) systems.
        </p>

        <SectionHeading>Experience</SectionHeading>
        <div className="mb-10 space-y-6">
          <Role
            title="IT Office Assistant"
            company="Runtime Solutions"
            logo={runtimeLogo.url}
            period="Dec 2024 – Present"
            bullets={[
              "Managed end-to-end ITSM ticket lifecycle including incidents, service requests, and escalations across multiple locations using ManageEngine ServiceDesk Plus.",
              "Maintained SLA compliance by prioritizing critical issues, minimizing downtime, and ensuring timely resolution.",
              "Administered IT asset lifecycle for laptops, desktops, access points, and biometric devices.",
              "Coordinated with internal teams and external vendors to resolve hardware, network, and system issues within SLAs.",
              "Supported daily IT operations including ticket logging, categorization, and escalation handling.",
            ]}
          />
          <Role
            title="IT Service Management Consultant"
            company="Credence Infotech"
            logo={credenceLogo.url}
            period="Feb 2022 – Oct 2024"
            bullets={[
              "Delivered ITSM operations aligned with ITIL best practices.",
              "Acted as coordination point between technical teams and stakeholders.",
              "Monitored service performance and maintained adherence to SLAs.",
              "Contributed to process improvement initiatives.",
              "Provided operational support to improve IT service quality and reliability.",
            ]}
          />
        </div>

        <SectionHeading>Projects</SectionHeading>
        <div className="mb-10 space-y-6">
          <Project
            title="DevOps CI/CD Deployment with AWS, Nginx & Cloudflare"
            link={{ href: "https://kamleshprasad.xyz", label: "kamleshprasad.xyz" }}
            bullets={[
              "Designed and implemented a CI/CD pipeline using GitHub Actions to automate deployment of a React application on every push, with SSH authentication and GitHub Secrets.",
              "Deployed and hosted the application on AWS EC2 (Ubuntu), with Nginx configured as a reverse proxy and production web server.",
              "Managed domain routing and DNS through Cloudflare, and set up a domain-based email system using Cloudflare Email Routing and Gmail SMTP.",
              "Configured SPF, DKIM, and DMARC records to ensure secure and authenticated email delivery.",
            ]}
            tech={["AWS EC2", "Ubuntu", "Nginx", "GitHub Actions", "Cloudflare", "React", "SSH", "Gmail SMTP"]}
          />
          <Project
            title="Production-Ready Deployment on AWS EC2 with Monitoring & Security"
            period="In Progress · Live Project"
            bullets={[
              "Deployed a production-grade React and Node.js application on AWS EC2 with Nginx reverse proxy and HTTPS enabled via Certbot SSL.",
              "Hardened the server with UFW Firewall, Basic Authentication, Nginx return 444, rate limiting, and DDoS protection.",
              "Built a monitoring stack using Prometheus, Grafana, and Node Exporter to track CPU, memory, disk, uptime, and network metrics.",
              "Integrated Trivy vulnerability scanning into CI/CD workflows, gaining hands-on DevSecOps and Linux server hardening experience.",
            ]}
            tech={["AWS EC2", "Nginx", "Certbot", "UFW", "Prometheus", "Grafana", "Node Exporter", "Trivy", "GitHub Actions", "React", "Node.js"]}
          />
        </div>

        <SectionHeading>Technical Skills</SectionHeading>
        <div className="mb-10 flex flex-wrap gap-2">
          {[
            "AWS (EC2, S3, IAM)",
            "Linux (Ubuntu)",
            "GitHub Actions",
            "CI/CD Pipelines",
            "Nginx",
            "SSL / HTTPS",
            "UFW Firewall",
            "Rate Limiting",
            "Prometheus",
            "Grafana",
            "Node Exporter",
            "Trivy",
            "Vulnerability Scanning",
            "ManageEngine ServiceDesk Plus",
          ].map((skill) => (
            <span
              key={skill}
              className="rounded-sm px-2.5 py-1 text-xs font-medium"
              style={{ backgroundColor: "#e8edf3", color: "#0f1b3d" }}
            >
              {skill}
            </span>
          ))}
        </div>

        <SectionHeading>Education</SectionHeading>
        <ul className="mb-10 space-y-3">
          <EducationItem
            degree="Bachelor of Commerce (B.Com)"
            institution="University of Mumbai · Tilak Education Society's J.K. College of Science & Commerce"
            period="Jan 2022 – Mar 2025"
          />
          <EducationItem
            degree="Higher Secondary (Commerce)"
            institution="MSSBHS · Allen Swami Vivekanand Junior College"
            period="Aug 2019 – Jun 2021"
          />
          <EducationItem
            degree="Secondary School"
            institution="MSSBHS · Tilak Education Society's Tilak Global School"
            period="Jun 2008 – Mar 2019"
          />
        </ul>

        <SectionHeading>Certifications</SectionHeading>
        <ul className="mb-10 space-y-1.5 text-sm">
          {[
            ["Ubuntu Linux Professional Certificate", "Canonical"],
            ["Career Essentials in GitHub Professional Certificate", "GitHub"],
            ["AWS Knowledge: Cloud Essentials – Training Badge", "AWS"],
            ["Linux System Upgrade and Patch Management", "LinkedIn"],
            ["DNS", "Packt"],
          ].map(([name, issuer]) => (
            <li key={name} className="flex justify-between gap-4">
              <span>{name}</span>
              <span style={{ color: "#3b6fa0" }}>{issuer}</span>
            </li>
          ))}
        </ul>

        <SectionHeading>Languages</SectionHeading>
        <p className="text-sm">
          Hindi <span style={{ color: "#3b6fa0" }}>(Native)</span> · English{" "}
          <span style={{ color: "#3b6fa0" }}>(Working Proficiency)</span> · Marathi{" "}
          <span style={{ color: "#3b6fa0" }}>(Elementary)</span>
        </p>
      </article>
    </main>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="font-serif text-xs uppercase tracking-[0.24em] font-bold mb-4 pb-2 border-b"
      style={{ color: "#0f1b3d", borderColor: "#e8edf3" }}
    >
      {children}
    </h2>
  );
}

function Role({
  title,
  company,
  logo,
  period,
  bullets,
}: {
  title: string;
  company: string;
  logo?: string;
  period: string;
  bullets: string[];
}) {
  return (
    <div className="flex gap-4">
      {logo && (
        <img
          src={logo}
          alt={`${company} logo`}
          className="h-12 w-12 flex-shrink-0 rounded-sm object-contain bg-white"
          style={{ border: "1px solid #e8edf3" }}
        />
      )}
      <div className="flex-1">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4">
          <h3 className="font-serif text-lg font-bold" style={{ color: "#0f1b3d" }}>
            {title} <span className="font-normal italic" style={{ color: "#1e3a5f" }}>· {company}</span>
          </h3>
          <p className="text-xs uppercase tracking-wider" style={{ color: "#3b6fa0" }}>
            {period}
          </p>
        </div>
        <ul className="mt-2 space-y-1.5 pl-5 list-disc marker:text-[color:#3b6fa0]">
          {bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Project({
  title,
  link,
  period,
  bullets,
  tech,
}: {
  title: string;
  link?: { href: string; label: string };
  period?: string;
  bullets: string[];
  tech: string[];
}) {
  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4">
        <h3 className="font-serif text-lg font-bold" style={{ color: "#0f1b3d" }}>
          {title}
          {link && (
            <>
              {" "}
              <a
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="font-normal text-sm italic underline"
                style={{ color: "#3b6fa0" }}
              >
                {link.label}
              </a>
            </>
          )}
        </h3>
        {period && (
          <p className="text-xs uppercase tracking-wider" style={{ color: "#3b6fa0" }}>
            {period}
          </p>
        )}
      </div>
      <ul className="mt-2 space-y-1.5 pl-5 list-disc marker:text-[color:#3b6fa0]">
        {bullets.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {tech.map((t) => (
          <span
            key={t}
            className="rounded-sm border px-2 py-0.5 text-[11px] font-medium"
            style={{ borderColor: "#e8edf3", color: "#1e3a5f", backgroundColor: "#fbfcfe" }}
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

function EducationItem({
  degree,
  institution,
  period,
}: {
  degree: string;
  institution: string;
  period: string;
}) {
  return (
    <li>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4">
        <p className="font-serif font-bold" style={{ color: "#0f1b3d" }}>
          {degree}
        </p>
        <p className="text-xs uppercase tracking-wider" style={{ color: "#3b6fa0" }}>
          {period}
        </p>
      </div>
      <p className="text-sm italic" style={{ color: "#1e3a5f" }}>
        {institution}
      </p>
    </li>
  );
}
