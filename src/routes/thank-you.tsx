import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Check } from "lucide-react";

export const Route = createFileRoute("/thank-you")({
  head: () => ({
    meta: [
      { title: "Message Sent — Piyush Prasad | Cloud & DevOps Engineer" },
      {
        name: "description",
        content:
          "Thank you for reaching out to Piyush Prasad. Your message has been received and will get a reply shortly.",
      },
      { property: "og:title", content: "Message Sent — Piyush Prasad" },
      {
        property: "og:description",
        content:
          "Thank you for reaching out to Piyush Prasad. Your message has been received and will get a reply shortly.",
      },
      { property: "og:url", content: "https://www.piyushprasad.in/thank-you" },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "Message Sent — Piyush Prasad" },
      {
        name: "twitter:description",
        content:
          "Thank you for reaching out to Piyush Prasad. Your message has been received and will get a reply shortly.",
      },
      { name: "robots", content: "noindex, follow" },
    ],
    links: [{ rel: "canonical", href: "https://www.piyushprasad.in/thank-you" }],
  }),
  component: ThankYouPage,
});

function ThankYouPage() {
  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-carbon px-6 py-16 text-white sm:px-10">
      <div className="w-full max-w-[560px]">
        <div
          aria-hidden="true"
          className="relative flex h-16 w-16 items-center justify-center border border-cobalt/60"
        >
          <span className="absolute inset-0 animate-ping bg-cobalt/20" />
          <Check className="relative h-7 w-7 text-cobalt" strokeWidth={2.5} />
        </div>

        <div className="mono mt-8 text-[10px] text-cobalt">FORM SUBMISSION</div>

        <h1 className="display mt-4 text-[clamp(2rem,7vw,3.5rem)]">
          Message Sent Successfully
        </h1>

        <p className="mt-6 max-w-[46ch] text-[16px] leading-relaxed text-white/70 sm:text-[18px]">
          Thank you for reaching out. Your message has been received successfully. I&rsquo;ll get
          back to you as soon as possible.
        </p>

        <Link
          to="/"
          className="mono mt-10 inline-flex items-center gap-2 bg-cobalt px-5 py-3 text-[11px] text-white transition-colors hover:bg-white hover:text-carbon focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt focus-visible:ring-offset-2 focus-visible:ring-offset-carbon"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          BACK TO PORTFOLIO
        </Link>
      </div>
    </main>
  );
}
