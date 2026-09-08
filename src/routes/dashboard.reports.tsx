import { createFileRoute } from "@tanstack/react-router";

import { MetricCard, PageHeader, Panel, EmptyState } from "@/components/dashboard/primitives";

export const Route = createFileRoute("/dashboard/reports")({
  component: ReportsPage,
});

const CARDS = ["Last report date", "Health score", "Performance score", "Report status"];

function ReportsPage() {
  return (
    <>
      <PageHeader title="Reports" subtitle="Daily website health reports and their delivery status." />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {CARDS.map((label) => (
          <MetricCard key={label} label={label} value={null} />
        ))}
      </div>
      <div className="mt-8">
        <Panel title="Report archive">
          <EmptyState description="No reports stored yet. Generated PDF reports will be listed here." />
        </Panel>
      </div>
    </>
  );
}
