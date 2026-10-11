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
      { property: "og:type", content: "website" },
      { property: "og:title", content: "Page Not Found | Piyush Prasad" },
      {
        property: "og:description",
        content:
          "The requested page could not be found. Explore Piyush Prasad's DevOps portfolio, resume, and technical engineering guides.",
      },
      { property: "og:url", content: "https://www.piyushprasad.in/404" },
      { property: "og:image", content: "https://www.piyushprasad.in/og-image.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Page Not Found | Piyush Prasad" },
      {
        name: "twitter:description",
        content:
          "The requested page could not be found. Explore Piyush Prasad's DevOps portfolio, resume, and technical engineering guides.",
      },
      { name: "twitter:image", content: "https://www.piyushprasad.in/og-image.png" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  loader: () => {
    throw notFound();
  },
});
