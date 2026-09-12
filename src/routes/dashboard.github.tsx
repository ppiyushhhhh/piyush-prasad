import { createFileRoute } from "@tanstack/react-router";

import { PageHeader, Panel, EmptyState } from "@/components/dashboard/primitives";
import { GithubActivity } from "@/components/portfolio/GithubActivity";

export const Route = createFileRoute("/dashboard/github")({
  head: () => ({ meta: [{ name: "robots", content: "noindex, nofollow" }] }),
  component: GithubPage,
});

function GithubPage() {
  return (
    <>
      <PageHeader
        title="GitHub"
        subtitle="Repositories, recent commits and workflow status."
      />
      <div className="space-y-6">
        <Panel title="Repositories & commits">
          <div className="rounded bg-white p-4 text-neutral-900">
            <GithubActivity />
          </div>
        </Panel>
        <Panel title="GitHub Actions">
          <EmptyState
            title="No workflow data yet"
            description="Latest workflow, successful and failed runs will be listed here once workflow results are collected."
          />
        </Panel>
      </div>
    </>
  );
}
