import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <div className="mx-auto max-w-2xl px-6 py-12 leading-relaxed">
        <header className="mb-10">
          <h1 className="text-3xl font-semibold">Piyush Prasad</h1>
          <p className="mt-1 text-lg text-gray-700">Aspiring Cloud & DevOps Engineer</p>
          <p className="mt-3 text-sm text-gray-700">
            <a href="mailto:piyushprasad8122@gmail.com" className="underline">piyushprasad8122@gmail.com</a>
            {" · "}
            <a href="tel:+919324236673" className="underline">9324236673</a>
            {" · "}
            <a href="https://linkedin.com/in/ppiyushhhh" target="_blank" rel="noreferrer" className="underline">linkedin.com/in/ppiyushhhh</a>
            {" · "}
            <a href="https://github.com/ppiyushhhhh" target="_blank" rel="noreferrer" className="underline">github.com/ppiyushhhhh</a>
          </p>
        </header>

        <section className="mb-10">
          <h2 className="mb-2 text-xl font-semibold">Summary</h2>
          <p>
            IT professional with hands-on experience in IT Service Management and a strong transition into Cloud and DevOps engineering. Skilled in designing and deploying production-ready infrastructure on AWS EC2 with CI/CD pipelines, Nginx reverse proxy, and Linux-based environments. Experienced in implementing server-level security, monitoring (Prometheus, Grafana), and automation using GitHub Actions. Focused on building scalable, secure, observable, and security-driven (DevSecOps) systems.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="mb-3 text-xl font-semibold">Experience</h2>

          <div className="mb-5">
            <h3 className="font-semibold">IT Office Assistant — Runtime Solutions</h3>
            <p className="text-sm text-gray-700">Dec 2024 – Present</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Managed end-to-end ITSM ticket lifecycle including incidents, service requests, and escalations across multiple locations using ManageEngine ServiceDesk Plus.</li>
              <li>Maintained SLA compliance by prioritizing critical issues, minimizing downtime, and ensuring timely resolution.</li>
              <li>Administered IT asset lifecycle for laptops, desktops, access points, and biometric devices.</li>
              <li>Coordinated with internal teams and external vendors to resolve hardware, network, and system issues within SLAs.</li>
              <li>Supported daily IT operations including ticket logging, categorization, and escalation handling.</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold">IT Service Management Consultant — Credence Infotech</h3>
            <p className="text-sm text-gray-700">Feb 2022 – Oct 2024</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Delivered ITSM operations aligned with ITIL best practices.</li>
              <li>Acted as coordination point between technical teams and stakeholders.</li>
              <li>Monitored service performance and maintained adherence to SLAs.</li>
              <li>Contributed to process improvement initiatives.</li>
              <li>Provided operational support to improve IT service quality and reliability.</li>
            </ul>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-3 text-xl font-semibold">Projects</h2>

          <div className="mb-5">
            <h3 className="font-semibold">
              DevOps CI/CD Deployment with AWS, Nginx & Cloudflare —{" "}
              <a href="https://kamleshprasad.xyz" target="_blank" rel="noreferrer" className="underline font-normal">
                kamleshprasad.xyz
              </a>
            </h3>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Designed and implemented a CI/CD pipeline using GitHub Actions to automate deployment of a React application.</li>
              <li>Deployed and hosted the application on AWS EC2 (Ubuntu).</li>
              <li>Configured Nginx as a reverse proxy and production web server.</li>
              <li>Managed domain routing and DNS using Cloudflare.</li>
              <li>Automated deployments on every GitHub push using SSH authentication and GitHub Secrets.</li>
              <li>Implemented domain-based email system using Cloudflare Email Routing and Gmail SMTP.</li>
              <li>Configured SPF, DKIM, and DMARC records for secure email delivery.</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold">Production-Ready Deployment on AWS EC2 with Monitoring & Security</h3>
            <p className="text-sm text-gray-700">Feb 2026 – April 2026 · Live Project</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Deployed a production-grade React and Node.js application on AWS EC2 using Nginx reverse proxy with HTTPS via Certbot SSL.</li>
              <li>Implemented server security using UFW Firewall, Basic Authentication, Nginx return 444, rate limiting, and DDoS protection.</li>
              <li>Built a monitoring stack using Prometheus, Grafana, and Node Exporter for CPU, memory, disk, uptime, and network metrics.</li>
              <li>Integrated Trivy vulnerability scanning within CI/CD workflows.</li>
              <li>Gained hands-on experience in DevSecOps, reverse proxy architecture, Linux server hardening, and production troubleshooting.</li>
            </ul>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-2 text-xl font-semibold">Technical Skills</h2>
          <p>
            AWS (EC2, S3, IAM), Linux (Ubuntu), GitHub Actions, Trivy, Nginx, CI/CD Pipelines, Prometheus, Grafana, Node Exporter, SSL/HTTPS, UFW Firewall, Rate Limiting, Vulnerability Scanning, ManageEngine ServiceDesk Plus.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="mb-3 text-xl font-semibold">Education</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <span className="font-semibold">Bachelor of Commerce (B.Com)</span> — University of Mumbai, Tilak Education Society's J.K. College of Science & Commerce (Jan 2022 – Mar 2025)
            </li>
            <li>
              <span className="font-semibold">Higher Secondary (Commerce)</span> — MSSBHS, Allen Swami Vivekanand Junior College (Aug 2019 – Jun 2021)
            </li>
            <li>
              <span className="font-semibold">Secondary School</span> — MSSBHS, Tilak Education Society's Tilak Global School (Jun 2008 – Mar 2019)
            </li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="mb-3 text-xl font-semibold">Certifications</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Ubuntu Linux Professional Certificate — Canonical</li>
            <li>Career Essentials in GitHub Professional Certificate — GitHub</li>
            <li>AWS Knowledge: Cloud Essentials - Training Badge — AWS</li>
            <li>Linux System Upgrade and Patch Management — LinkedIn</li>
            <li>DNS — Packt</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold">Languages</h2>
          <p>Hindi (Native) · English (Working Proficiency) · Marathi (Elementary)</p>
        </section>
      </div>
    </main>
  );
}
