import { createFileRoute } from "@tanstack/react-router";

import { MetricCard, PageHeader, Panel, EmptyState } from "@/components/dashboard/primitives";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({ meta: [{ name: "robots", content: "noindex, nofollow" }] }),
  component: Overview,
});

const CARDS = [
  "Website status",
  "HTTP response time",
  "SSL status",
  "SSL expiry",
  "DNS status",
  "Lighthouse performance",
  "SEO score",
  "Accessibility score",
  "Last health check",
  "Overall health score",
];

function Overview() {
  return (
    <>
      <PageHeader
        title="Overview"
        subtitle="Live status of piyushprasad.in across availability, security and performance."
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {CARDS.map((label) => (
          <MetricCard key={label} label={label} value={null} />
        ))}
      </div>
      <div className="mt-8">
        <Panel title="Monitoring status">
          <EmptyState description="No monitoring data yet. Once health checks and Lighthouse runs start writing results, these cards fill in automatically." />
        </Panel>
      </div>
    </>
  );
}
