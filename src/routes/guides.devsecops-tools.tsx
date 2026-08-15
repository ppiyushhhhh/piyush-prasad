import { createFileRoute, Link } from "@tanstack/react-router";

const URL = "https://www.piyushprasad.in/guides/devsecops-tools";
const TITLE = "DevSecOps Tools: A Practical Stack Guide";
const DESC =
  "A practical guide to DevSecOps tools — SAST, SCA, container scanning, secrets detection, and monitoring — with how Trivy, GitHub Actions, and Prometheus fit together.";

export const Route = createFileRoute("/guides/devsecops-tools")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:type", content: "article" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:url", content: URL },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
    ],
    links: [{ rel: "canonical", href: URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "DevSecOps Tools: A Practical Stack Guide",
          description: DESC,
          datePublished: "2026",
          author: {
            "@type": "Person",
            name: "Piyush Prasad",
            url: "https://www.piyushprasad.in",
          },
          mainEntityOfPage: URL,
        }),
      },
    ],
  }),
  component: ToolsGuide,
});

const CATEGORIES = [
  {
    stage: "Secrets detection",
    tools: "gitleaks, trufflehog",
    why: "Catches credentials before they reach the remote. Cheapest possible failure — runs in seconds on every commit.",
  },
  {
    stage: "SAST (static analysis)",
    tools: "CodeQL, Semgrep",
    why: "Finds injection, unsafe deserialization, and auth mistakes in your own code. CodeQL is free for public repos on GitHub.",
  },
  {
    stage: "SCA (dependencies)",
    tools: "Trivy, Dependabot, osv-scanner",
    why: "Most real risk lives in transitive dependencies. Trivy reads lockfiles directly and reports fixed-in versions.",
  },
  {
    stage: "Container scanning",
    tools: "Trivy, Grype",
    why: "Scans the built image, not just the source — catches OS packages baked into the base layer.",
  },
  {
    stage: "IaC scanning",
    tools: "Trivy config, Checkov, tfsec",
    why: "Public S3 buckets and open security groups are configuration bugs, not code bugs.",
  },
  {
    stage: "Supply chain",
    tools: "syft (SBOM), cosign (signing)",
    why: "An SBOM turns 'are we affected?' into a query instead of an all-night grep.",
  },
  {
    stage: "Runtime monitoring",
    tools: "Prometheus, Grafana, Falco",
    why: "CVEs are published after you deploy. Re-scan on a schedule and alert on anomalous behaviour.",
  },
];

function ToolsGuide() {
  return (
    <main className="min-h-screen bg-white text-neutral-900">
      <div className="mx-auto max-w-3xl px-6 py-16 md:py-24">
        <nav className="mb-10 text-xs uppercase tracking-[0.2em] text-neutral-700">
          <Link to="/" className="hover:text-neutral-900">← Back to portfolio</Link>
        </nav>

        <header className="mb-12 border-b border-neutral-200 pb-8">
          <p className="mb-3 text-xs uppercase tracking-[0.25em] text-neutral-700">
            DevSecOps · Guide · 2026
          </p>
          <h1 className="text-3xl md:text-5xl font-semibold leading-tight tracking-tight">
            DevSecOps Tools: A Practical Stack Guide
          </h1>
          <p className="mt-5 text-lg text-neutral-700 leading-relaxed">
            There are hundreds of DevSecOps tools and you need maybe six. This is
            the stack I actually run — what each layer catches, which tool I reach
            for, and where the overlap is not worth paying for.
          </p>
        </header>

        <article className="prose prose-neutral max-w-none space-y-10 leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold mb-3">The layers that matter</h2>
            <p>
              Pick one tool per layer and wire it into CI. Adding a second tool in
              the same layer usually doubles the noise without doubling the
              coverage.
            </p>
            <div className="mt-6 overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-neutral-300 text-left">
                    <th className="py-2 pr-4 font-semibold">Layer</th>
                    <th className="py-2 pr-4 font-semibold">Tools</th>
                    <th className="py-2 font-semibold">Why it earns its slot</th>
                  </tr>
                </thead>
                <tbody>
                  {CATEGORIES.map((c) => (
                    <tr key={c.stage} className="border-b border-neutral-200 align-top">
                      <td className="py-3 pr-4 font-medium">{c.stage}</td>
                      <td className="py-3 pr-4 text-neutral-700">{c.tools}</td>
                      <td className="py-3 text-neutral-700">{c.why}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Why Trivy covers three layers</h2>
            <p>
              Trivy is the highest-leverage single tool here: one binary does
              dependency scanning, container image scanning, IaC misconfiguration
              checks, and SBOM generation. On my own projects it replaced three
              separate scanners.
            </p>
            <pre className="bg-neutral-950 text-neutral-100 text-xs md:text-sm p-4 rounded overflow-x-auto">
{`# dependencies + secrets in the repo
trivy fs --scanners vuln,secret --severity HIGH,CRITICAL .

# the built image, OS packages included
trivy image --ignore-unfixed --exit-code 1 app:latest

# terraform / kubernetes manifests
trivy config ./infra

# SBOM for the release
trivy sbom --format cyclonedx --output sbom.json app:latest`}
            </pre>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Wiring it into GitHub Actions</h2>
            <p>
              GitHub Actions is the cheapest place to enforce all of this: SARIF
              uploads surface findings in the Security tab, and OIDC removes the
              need for long-lived cloud keys.
            </p>
            <pre className="bg-neutral-950 text-neutral-100 text-xs md:text-sm p-4 rounded overflow-x-auto">
{`permissions:
  contents: read
  security-events: write
  id-token: write

steps:
  - uses: actions/checkout@v4
  - uses: gitleaks/gitleaks-action@v2
  - uses: github/codeql-action/init@v3
    with: { languages: javascript }
  - uses: aquasecurity/trivy-action@0.24.0
    with:
      scan-type: fs
      severity: HIGH,CRITICAL
      exit-code: '1'
      ignore-unfixed: true
      format: sarif
      output: trivy.sarif
  - uses: github/codeql-action/upload-sarif@v3
    with: { sarif_file: trivy.sarif }`}
            </pre>
            <p className="mt-4">
              For the full pipeline — build, image scan, SBOM, and deploy — see the{" "}
              <Link to="/guides/devsecops-pipeline" className="underline">
                secure CI/CD pipeline guide
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Choosing between overlapping tools</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Trivy vs Grype</strong> — both scan images well. Trivy wins if you also want IaC and secrets in the same binary.</li>
              <li><strong>CodeQL vs Semgrep</strong> — CodeQL is deeper and free on public repos; Semgrep is faster and easier to write custom rules for.</li>
              <li><strong>Dependabot vs Trivy</strong> — Dependabot opens the upgrade PRs, Trivy blocks the merge. They complement rather than compete.</li>
              <li><strong>Falco vs plain metrics</strong> — skip Falco until you have Prometheus and alerting working; runtime detection without on-call is decoration.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">A sane rollout order</h2>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Branch protection + secret scanning — one afternoon, immediate payoff.</li>
              <li>Trivy filesystem scan on pull requests, warning only.</li>
              <li>Flip it to <code>exit-code: 1</code> on HIGH/CRITICAL once the backlog is clear.</li>
              <li>Add image scanning at build time and OIDC for deploys.</li>
              <li>Generate SBOMs and sign artifacts.</li>
              <li>Add scheduled re-scans and runtime monitoring.</li>
            </ol>
          </section>

          <section className="border-t border-neutral-200 pt-8">
            <h2 className="text-2xl font-semibold mb-3">Wrap-up</h2>
            <p>
              A DevSecOps toolchain is not a shopping list — it is one enforced
              default per layer, each failing loudly in CI. Start with secrets and
              dependencies, and only add tools when a real incident shows you the gap.
            </p>
            <p className="mt-6 text-sm text-neutral-700">
              Written by Piyush Prasad — Cloud &amp; DevOps Engineer.{" "}
              <Link to="/" className="underline">Back to portfolio</Link>.
            </p>
          </section>
        </article>
      </div>
    </main>
  );
}
