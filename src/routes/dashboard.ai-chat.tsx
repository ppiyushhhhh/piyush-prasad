import { createFileRoute } from "@tanstack/react-router";

import { MetricCard, PageHeader, Panel, EmptyState } from "@/components/dashboard/primitives";

export const Route = createFileRoute("/dashboard/ai-chat")({
  head: () => ({ meta: [{ name: "robots", content: "noindex, nofollow" }] }),
  component: AiChatPage,
});

const CARDS = ["Total requests", "Errors", "Rate limits hit", "Last request"];

function AiChatPage() {
  return (
    <>
      <PageHeader title="AI Chat" subtitle="Usage and reliability of the portfolio assistant." />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {CARDS.map((label) => (
          <MetricCard key={label} label={label} value={null} />
        ))}
      </div>
      <div className="mt-8">
        <Panel title="Recent activity">
          <EmptyState description="No chat activity recorded yet." />
        </Panel>
      </div>
    </>
  );
}
