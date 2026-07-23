import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/guides/devsecops-pipeline")({
  head: () => ({
    meta: [
      { title: "Building a Secure CI/CD Pipeline with GitHub Actions and Trivy — DevSecOps Guide" },
      {
        name: "description",
        content:
          "A practical DevSecOps guide to building a secure CI/CD pipeline with GitHub Actions, Trivy vulnerability scanning, secrets management, and container hardening.",
      },
      { property: "og:type", content: "article" },
      { property: "og:title", content: "Building a Secure CI/CD Pipeline with GitHub Actions and Trivy" },
      {
        property: "og:description",
        content:
          "Step-by-step DevSecOps guide: shift-left security, Trivy scans, GitHub Actions workflows, secrets, SBOMs, and production hardening.",
      },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Building a Secure CI/CD Pipeline with GitHub Actions and Trivy" },
      {
        name: "twitter:description",
        content:
          "Practical DevSecOps pipeline: Trivy, GitHub Actions, SBOMs, secrets management, and hardening.",
      },
    ],
  }),
  component: GuidePage,
});

function GuidePage() {
  return (
    <main className="min-h-screen bg-white text-neutral-900">
      <div className="mx-auto max-w-3xl px-6 py-16 md:py-24">
        <nav className="mb-10 text-xs uppercase tracking-[0.2em] text-neutral-500">
          <Link to="/" className="hover:text-neutral-900">← Back to portfolio</Link>
        </nav>

        <header className="mb-12 border-b border-neutral-200 pb-8">
          <p className="mb-3 text-xs uppercase tracking-[0.25em] text-neutral-500">
            DevSecOps · Guide · 2026
          </p>
          <h1 className="text-3xl md:text-5xl font-semibold leading-tight tracking-tight">
            Building a Secure CI/CD Pipeline with GitHub Actions and Trivy
          </h1>
          <p className="mt-5 text-lg text-neutral-700 leading-relaxed">
            A practical, opinionated walkthrough for shifting security left — from
            source commit to production deploy — using GitHub Actions, Trivy,
            OIDC, and a handful of small, boring guardrails that actually work.
          </p>
        </header>

        <article className="prose prose-neutral max-w-none space-y-10 leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold mb-3">Why DevSecOps</h2>
            <p>
              Traditional pipelines treat security as a gate at the end. DevSecOps
              flips that: every commit is scanned, every dependency is checked,
              every image is verified before it reaches production. The goal is
              not to add friction — it is to catch the boring 90% of issues
              automatically so humans can focus on the interesting 10%.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Pipeline Stages</h2>
            <ol className="list-decimal pl-6 space-y-2">
              <li><strong>Source</strong> — signed commits, branch protection, required reviews.</li>
              <li><strong>Static analysis</strong> — CodeQL / Semgrep for SAST.</li>
              <li><strong>Dependencies</strong> — Trivy or Dependabot for SCA + license checks.</li>
              <li><strong>Build</strong> — reproducible container images, pinned base images.</li>
              <li><strong>Image scan</strong> — Trivy scan on the built image, fail on HIGH/CRITICAL.</li>
              <li><strong>SBOM</strong> — generate + attach a Software Bill of Materials.</li>
              <li><strong>Deploy</strong> — OIDC to cloud, no long-lived keys, immutable tags.</li>
              <li><strong>Runtime</strong> — monitoring, alerting, and periodic re-scans.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">A Minimal Secure Workflow</h2>
            <p>
              The workflow below runs on every push. It installs dependencies,
              runs a filesystem scan with Trivy, builds a Docker image, scans the
              image, and uploads the SARIF report to GitHub's Security tab.
            </p>
            <pre className="bg-neutral-950 text-neutral-100 text-xs md:text-sm p-4 rounded overflow-x-auto">
{`name: ci-secure

on:
  push:
    branches: [main]
  pull_request:

permissions:
  contents: read
  security-events: write
  id-token: write        # for OIDC to AWS/GCP

jobs:
  build-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Trivy filesystem scan
        uses: aquasecurity/trivy-action@0.24.0
        with:
          scan-type: fs
          scan-ref: .
          severity: HIGH,CRITICAL
          exit-code: '1'
          ignore-unfixed: true
          format: sarif
          output: trivy-fs.sarif

      - name: Upload SARIF
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: trivy-fs.sarif

      - name: Build image
        run: docker build -t app:\${{ github.sha }} .

      - name: Trivy image scan
        uses: aquasecurity/trivy-action@0.24.0
        with:
          image-ref: app:\${{ github.sha }}
          severity: HIGH,CRITICAL
          exit-code: '1'
          ignore-unfixed: true`}
            </pre>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Secrets Management</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Never commit <code>.env</code> — use GitHub Encrypted Secrets or a cloud secret store.</li>
              <li>Prefer <strong>OIDC</strong> over long-lived cloud keys (AWS <code>configure-aws-credentials</code>, GCP Workload Identity).</li>
              <li>Rotate anything that ever appeared in a log. Assume it is compromised.</li>
              <li>Run <a href="https://github.com/gitleaks/gitleaks" className="underline">gitleaks</a> in CI to catch accidental secret commits.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Container Hardening</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Use minimal base images (<code>distroless</code>, <code>alpine</code>, or <code>chainguard</code>).</li>
              <li>Pin by digest, not by tag: <code>FROM node@sha256:...</code>.</li>
              <li>Run as a non-root <code>USER</code>. Drop Linux capabilities.</li>
              <li>Set <code>readOnlyRootFilesystem: true</code> in Kubernetes.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">SBOM &amp; Supply Chain</h2>
            <p>
              Generate an SBOM with <code>trivy sbom</code> or <code>syft</code>,
              attach it to the release, and sign artifacts with <code>cosign</code>.
              This gives you a queryable inventory the day a new CVE drops —
              instead of grepping repositories at 2am.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Failing Loudly</h2>
            <p>
              A scan that warns is a scan that gets ignored. Set{" "}
              <code>exit-code: 1</code> on HIGH/CRITICAL and let the pipeline
              fail. Then triage — either fix, upgrade, or explicitly waive with a
              tracked <code>.trivyignore</code> entry and an expiry date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Beyond the Pipeline</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Re-scan running images on a schedule — CVEs are published continuously.</li>
              <li>Ship logs and metrics (Prometheus + Grafana, or a hosted stack).</li>
              <li>Practice restoring from backups. An untested backup is a hope.</li>
            </ul>
          </section>

          <section className="border-t border-neutral-200 pt-8">
            <h2 className="text-2xl font-semibold mb-3">Wrap-up</h2>
            <p>
              A secure pipeline is not a single tool — it is a chain of small,
              enforced defaults. Start with Trivy + branch protection + OIDC, add
              SBOMs and image signing next, and layer on runtime monitoring once
              the basics are boring. The best security work is invisible.
            </p>
            <p className="mt-6 text-sm text-neutral-500">
              Written by Piyush Prasad — Cloud &amp; DevOps Engineer.{" "}
              <Link to="/" className="underline">Back to portfolio</Link>.
            </p>
          </section>
        </article>
      </div>
    </main>
  );
}
