import { createFileRoute, notFound } from "@tanstack/react-router";

export const Route = createFileRoute("/$")({
  head: () => ({
    meta: [
      { title: "Page Not Found | Piyush Prasad" },
      {
        name: "description",
        content:
          "The requested page could not be found. Explore Piyush Prasad's DevOps portfolio, resume, and technical engineering guides.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  loader: () => {
    throw notFound();
  },
});
