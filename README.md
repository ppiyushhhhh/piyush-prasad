# Piyush Prasad — Portfolio

Personal portfolio for **Piyush Prasad** (Aspiring Cloud & DevOps Engineer), deployed on Vercel at **https://piyushprasad.in**.

A free, self-contained **Daily Website Health Report** runs every day via GitHub Actions — no third-party monitoring service required. See [`scripts/README.md`](./scripts/README.md).

---

## Stack

- **Frontend:** React 19 + TanStack Start (Vite 7), Tailwind CSS v4
- **Hosting:** Vercel (auto-deploy on push to `main`)
- **Monitoring:** Self-hosted Node.js health report (HTTP + SSL + DNS + Lighthouse → PDF → Email)

---

## Local Development

```bash
bun install
bun dev
```

---

## Daily Health Report

Runs at **19:00 IST (13:30 UTC)** via `.github/workflows/daily-report.yml`.

Collects: availability, HTTP status, response time, SSL validity + expiry, DNS records, `robots.txt` / `sitemap.xml` / `favicon.ico` availability, and full Lighthouse audit (Performance, Accessibility, Best Practices, SEO, FCP, LCP, TBT, CLS, Speed Index). Renders a branded PDF and emails it via SMTP.

Required GitHub Secrets: `SITE_DOMAIN`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `REPORT_TO` (optional: `REPORT_FROM`, `ALERT_TO`).

---

## Links

- **Live site:** https://piyushprasad.in
- **Resume:** https://piyushprasad.in/resume
- **LinkedIn:** https://www.linkedin.com/in/ppiyushhhh
- **GitHub:** https://github.com/ppiyushhhhh
