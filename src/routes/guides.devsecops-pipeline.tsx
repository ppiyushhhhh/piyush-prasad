import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/guides/devsecops-pipeline")({
  beforeLoad: () => {
    throw redirect({ to: "/blog" });
  },
  component: () => null,
});
