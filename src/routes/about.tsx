import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
const ppLogo = { url: "/pp-logo.png" };

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Piyush Prasad · Cloud & DevOps Engineer" },
      {
        name: "description",
        content:
          "About Piyush Prasad — a Cloud & DevOps engineer from Navi Mumbai focused on reliability, automation, and clean production systems.",
      },
      { property: "og:title", content: "About — Piyush Prasad" },
      {
        property: "og:description",
        content:
          "The story behind the stack: from IT service management to building resilient cloud infrastructure.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://simply-profile-plain.lovable.app/about" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "About — Piyush Prasad" },
      {
        name: "twitter:description",
        content:
          "The story behind the stack: from IT service management to building resilient cloud infrastructure.",
      },
    ],
    links: [
      { rel: "canonical", href: "https://simply-profile-plain.lovable.app/about" },
    ],
  }),
  component: AboutPage,
});

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 90, damping: 18 },
  },
};

const FACTS = [
  { label: "Currently", value: "IT Service Management Consultant, Runtime Solutions" },
  { label: "Focus", value: "Cloud, CI/CD, DevSecOps, Observability" },
  { label: "Based in", value: "Navi Mumbai, India" },
  { label: "Status", value: "Open to opportunities" },
];

const PRINCIPLES = [
  {
    n: "01",
    title: "Reliability is a feature",
    body: "Systems earn trust by staying up under pressure. Every deploy, alert, and rollback is designed with that trust in mind.",
  },
  {
    n: "02",
    title: "Automate the boring, review the risky",
    body: "Pipelines handle repetition. Humans handle judgement — code review, incident response, and architectural calls.",
  },
  {
    n: "03",
    title: "Observability before optimisation",
    body: "You cannot improve what you cannot see. Logs, metrics, and traces come first — tuning follows evidence, not intuition.",
  },
  {
    n: "04",
    title: "Security is a default, not a phase",
    body: "Secrets management, least-privilege IAM, and dependency scanning belong in the pipeline — not in a post-launch checklist.",
  },
];

function AboutPage() {
  return (
    <main className="relative min-h-screen bg-[#F4F4F2] text-carbon">
      {/* Top bar */}
      <header className="fixed inset-x-0 top-0 z-40 bg-[#F4F4F2]/90 backdrop-blur-md border-b border-[#D1D1CB]">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-5 md:px-10">
          <Link to="/" className="flex items-center" aria-label="Piyush Prasad — home">
            <img src={ppLogo.url} alt="Piyush Prasad logo" className="h-8 w-auto md:h-9" />
          </Link>
          <nav className="flex items-center gap-6" aria-label="Primary">
            <Link to="/" className="mono text-[11px] text-carbon hover:text-cobalt">
              ← HOME
            </Link>
            <Link to="/resume" className="mono text-[11px] text-carbon hover:text-cobalt">
              RESUME
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-[1100px] px-6 pt-32 pb-24 md:px-10 md:pt-40">
        <motion.p
          initial="hidden"
          animate="show"
          variants={fadeUp}
          className="mono text-[11px] text-cobalt"
        >
          THE HUMAN BEHIND THE STACK
        </motion.p>

        <motion.h1
          initial="hidden"
          animate="show"
          variants={fadeUp}
          transition={{ delay: 0.05 }}
          className="mt-6 text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl"
        >
          I build systems <br className="hidden md:block" />
          that <span className="text-cobalt">don&apos;t break</span>.
        </motion.h1>

        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeUp}
          transition={{ delay: 0.1 }}
          className="mt-10 grid gap-6 text-lg leading-relaxed md:text-xl"
        >
          <p>
            I&apos;m a Cloud &amp; DevOps engineer who started in IT service management —
            triaging tickets, defending SLAs, and keeping end-users unblocked. That
            ground-level view shaped how I now build infrastructure: obsessed with
            reliability, security, and the small operational details others overlook.
          </p>
          <p>
            Today I automate deployments, harden servers, and stand up full
            observability stacks — bridging the gap between ITSM discipline and modern
            DevSecOps practice so production stays predictable.
          </p>
        </motion.div>

        {/* Quick facts */}
        <div className="mt-16 grid grid-cols-1 gap-x-10 gap-y-8 border-t border-[#D1D1CB] pt-10 md:grid-cols-2">
          {FACTS.map((f) => (
            <div key={f.label}>
              <div className="mono text-[11px] text-cobalt">{f.label.toUpperCase()}</div>
              <div className="mt-2 text-lg font-medium">{f.value}</div>
            </div>
          ))}
        </div>

        {/* Principles */}
        <div className="mt-24">
          <p className="mono text-[11px] text-cobalt">OPERATING PRINCIPLES</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            How I approach the work.
          </h2>
          <div className="mt-10 grid gap-8 md:grid-cols-2">
            {PRINCIPLES.map((p) => (
              <motion.div
                key={p.n}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5 }}
                className="group border-t border-[#D1D1CB] pt-6"
              >
                <div className="mono text-[11px] text-cobalt">{p.n}</div>
                <h3 className="mt-2 text-xl font-semibold group-hover:text-cobalt transition-colors">
                  {p.title}
                </h3>
                <p className="mt-3 text-base leading-relaxed text-carbon/80">{p.body}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-24 flex flex-col items-start gap-4 border-t border-[#D1D1CB] pt-10 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="mono text-[11px] text-cobalt">NEXT</p>
            <p className="mt-2 text-2xl font-semibold">See the work →</p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/"
              hash="projects"
              className="mono rounded-none border border-carbon bg-carbon px-5 py-3 text-[11px] text-[#F4F4F2] hover:bg-cobalt hover:border-cobalt transition-colors"
            >
              VIEW PROJECTS
            </Link>
            <Link
              to="/resume"
              className="mono rounded-none border border-carbon px-5 py-3 text-[11px] text-carbon hover:bg-carbon hover:text-[#F4F4F2] transition-colors"
            >
              VIEW RESUME
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#D1D1CB] py-8">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 md:px-10">
          <p className="mono text-[11px] text-carbon/70">
            © {new Date().getFullYear()} PIYUSH PRASAD
          </p>
          <Link to="/" className="mono text-[11px] text-carbon hover:text-cobalt">
            ← BACK HOME
          </Link>
        </div>
      </footer>
    </main>
  );
}
