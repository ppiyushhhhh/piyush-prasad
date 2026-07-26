## Current state

`src/routes/about.tsx` already has `head()` with title, description, og:title, og:description, og:type, and twitter:card. Two issues:

1. `canonical` is smuggled inside the `meta` array with `as never` — it belongs in `links`. TanStack merges `meta` and `links` separately; a rel/href object in `meta` is silently dropped by crawlers.
2. `canonical` points to `https://piyushprasad.in/about`, but the project's canonical host is `https://simply-profile-plain.lovable.app`. Wrong-host canonical tells Google "index the other URL instead" and effectively delists this page.

Also missing: `og:url`, `twitter:title`, `twitter:description`.

## Changes to `src/routes/about.tsx`

Rewrite the `head()` return to:

```ts
head: () => ({
  meta: [
    { title: "About — Piyush Prasad · Cloud & DevOps Engineer" },
    { name: "description", content: "About Piyush Prasad — a Cloud & DevOps engineer from Navi Mumbai focused on reliability, automation, and clean production systems." },
    { property: "og:title", content: "About — Piyush Prasad" },
    { property: "og:description", content: "The story behind the stack: from IT service management to building resilient cloud infrastructure." },
    { property: "og:type", content: "website" },
    { property: "og:url", content: "https://simply-profile-plain.lovable.app/about" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "About — Piyush Prasad" },
    { name: "twitter:description", content: "The story behind the stack: from IT service management to building resilient cloud infrastructure." },
  ],
  links: [
    { rel: "canonical", href: "https://simply-profile-plain.lovable.app/about" },
  ],
}),
```

No `og:image` — no About-specific hero image exists; hosting supplies the project preview.

## Not included

No changes to `__root.tsx`, other routes, or sitemap (already lists `/about`? — will verify during build).
