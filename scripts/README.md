# Daily Website Health Report

Free, self-contained daily monitoring for **https://piyushprasad.in**.
No third-party monitoring service — everything runs inside GitHub Actions.

## What it collects

- **Website status:** URL, online/offline, HTTP status code, response time, final URL
- **DNS:** A / AAAA records
- **Assets:** `/robots.txt`, `/sitemap.xml`, `/favicon.ico` availability
- **SSL:** validity, issuer, expiry date, days remaining
- **Lighthouse (headless Chrome):** Performance, Accessibility, Best Practices, SEO scores + FCP, LCP, TBT, CLS, Speed Index
- **Overall Health Score** (0–100 + grade: Excellent / Healthy / Fair / At Risk / Critical)

Report is rendered to a branded PDF with a cover page, executive summary, per-section tables, and recommendations, then emailed via SMTP. On any failure, a stack-trace alert is sent to `ALERT_TO` (fallback: `REPORT_TO`).

## Installation

```bash
cd scripts
npm install
```

Lighthouse requires Chrome/Chromium. Locally, install Chrome; in CI the workflow installs it via `browser-actions/setup-chrome`.

## Run locally

```bash
cd scripts
SITE_DOMAIN=piyushprasad.in \
SMTP_HOST=smtp.gmail.com SMTP_PORT=465 \
SMTP_USER=you@gmail.com SMTP_PASS='<app-password>' \
REPORT_TO=hello@piyushprasad.in \
node generate-report.mjs
```

Use `SKIP_EMAIL=1` to generate the PDF only. Output lands in `scripts/reports/Daily-Website-Report-YYYY-MM-DD.pdf`.

## Required GitHub Secrets

Settings → Secrets and variables → Actions:

| Secret | Example | Purpose |
| --- | --- | --- |
| `SITE_DOMAIN` | `piyushprasad.in` | Site to monitor |
| `SMTP_HOST` | `smtp.gmail.com` | SMTP server |
| `SMTP_PORT` | `465` | 465 (SSL) or 587 (STARTTLS) |
| `SMTP_USER` | `you@gmail.com` | SMTP username / sender |
| `SMTP_PASS` | *(app password)* | Gmail app password or provider secret |
| `REPORT_TO` | `hello@piyushprasad.in` | Recipient |
| `REPORT_FROM` | *(optional)* | Custom From, defaults to `SMTP_USER` |
| `ALERT_TO` | *(optional)* | Failure alerts; falls back to `REPORT_TO` |

> **Gmail:** create an App Password at https://myaccount.google.com/apppasswords and paste it into `SMTP_PASS`. Never use the account password.

## Schedule

Configured in `.github/workflows/daily-report.yml`:

```yaml
- cron: "30 13 * * *"   # 13:30 UTC = 19:00 IST
```

Also triggerable via **Actions → Daily Website Health Report → Run workflow**.

## Health Score

Starts at 100 and subtracts penalties for:
- Site offline (-40) or slow response (-8 to -15)
- SSL invalid (-20) or expiring soon (-5 to -10)
- DNS failure (-10)
- Missing robots.txt / sitemap.xml / favicon (-2 to -3 each)
- Lighthouse category shortfalls below 90

Clamped to 0–100. Grades: 95+ Excellent, 85+ Healthy, 70+ Fair, 50+ At Risk, else Critical.

## Notes

- Runtime: Node.js 20.
- Every PDF is uploaded as a workflow artifact (30-day retention).
- No credentials are hardcoded; all secrets come from environment variables.
