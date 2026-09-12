import { createFileRoute } from "@tanstack/react-router";

import { PageHeader, Panel, EmptyState } from "@/components/dashboard/primitives";

export const Route = createFileRoute("/dashboard/settings")({
  head: () => ({ meta: [{ name: "robots", content: "noindex, nofollow" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" subtitle="Monitoring configuration." />
      <div className="space-y-6">
        <Panel title="Monitoring configuration">
          <EmptyState description="No configurable monitoring options yet." />
        </Panel>
      </div>
    </>
  );
}
