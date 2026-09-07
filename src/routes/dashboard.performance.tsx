import { createFileRoute } from "@tanstack/react-router";

import { MetricCard, PageHeader, Panel, EmptyState } from "@/components/dashboard/primitives";

export const Route = createFileRoute("/dashboard/performance")({
  component: PerformancePage,
});

const SCORES = ["Performance", "Accessibility", "Best Practices", "SEO"];

function PerformancePage() {
  return (
    <>
      <PageHeader
        title="Performance"
        subtitle="Lighthouse scores and their trend over time."
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {SCORES.map((label) => (
          <MetricCard key={label} label={label} value={null} hint="Latest Lighthouse run" />
        ))}
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Panel title="Lighthouse trend">
          <EmptyState
            title="No performance history yet"
            description="Chart appears once at least two Lighthouse runs are stored."
          />
        </Panel>
        <Panel title="Health score trend">
          <EmptyState
            title="No health history yet"
            description="Chart appears once health checks start recording scores."
          />
        </Panel>
      </div>
    </>
  );
}
