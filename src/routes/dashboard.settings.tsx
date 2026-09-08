import { createFileRoute } from "@tanstack/react-router";

import { PageHeader, Panel, EmptyState } from "@/components/dashboard/primitives";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/dashboard/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { session, isAdmin } = useAuth();

  return (
    <>
      <PageHeader title="Settings" subtitle="Account and monitoring configuration." />
      <div className="space-y-6">
        <Panel title="Account">
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Signed in as</dt>
              <dd className="mt-1 text-sm text-slate-200">{session?.user.email ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Role</dt>
              <dd className="mt-1 text-sm text-slate-200">{isAdmin ? "Admin" : "Standard"}</dd>
            </div>
          </dl>
        </Panel>
        <Panel title="Monitoring configuration">
          <EmptyState description="No configurable monitoring options yet." />
        </Panel>
      </div>
    </>
  );
}
