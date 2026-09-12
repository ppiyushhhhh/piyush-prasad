import { createFileRoute } from "@tanstack/react-router";

import { MetricCard, PageHeader, Panel, EmptyState } from "@/components/dashboard/primitives";

export const Route = createFileRoute("/dashboard/cicd")({
  head: () => ({ meta: [{ name: "robots", content: "noindex, nofollow" }] }),
  component: CicdPage,
});

const CARDS = [
  "Latest deployment",
  "CI status",
  "CodeQL status",
  "Successful workflows",
  "Failed workflows",
  "Last execution",
];

function CicdPage() {
  return (
    <>
      <PageHeader title="CI/CD" subtitle="Pipeline runs, security scans and deployments." />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {CARDS.map((label) => (
          <MetricCard key={label} label={label} value={null} />
        ))}
      </div>
      <div className="mt-8">
        <Panel title="Recent runs">
          <EmptyState description="No pipeline data yet. Workflow runs will be listed here once results are collected." />
        </Panel>
      </div>
    </>
  );
}
