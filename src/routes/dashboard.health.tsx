import { createFileRoute } from "@tanstack/react-router";

import { MetricCard, PageHeader, Panel, EmptyState } from "@/components/dashboard/primitives";

export const Route = createFileRoute("/dashboard/health")({
  component: HealthPage,
});

const CHECKS = [
  "HTTP status",
  "Response time",
  "SSL certificate",
  "SSL expiry",
  "DNS",
  "robots.txt",
  "sitemap.xml",
  "favicon",
  "Overall health",
];

function HealthPage() {
  return (
    <>
      <PageHeader
        title="Website Health"
        subtitle="Availability, TLS, DNS and crawlability checks for the public site."
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {CHECKS.map((label) => (
          <MetricCard key={label} label={label} value={null} />
        ))}
      </div>
      <div className="mt-8">
        <Panel title="Check history">
          <EmptyState description="No health checks recorded yet. Each completed check will appear here with its timestamp and result." />
        </Panel>
      </div>
    </>
  );
}
