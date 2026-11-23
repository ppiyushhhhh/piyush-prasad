import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/guides/devsecops-tools")({
  beforeLoad: () => {
    throw redirect({ to: "/blog" });
  },
  component: () => null,
});
