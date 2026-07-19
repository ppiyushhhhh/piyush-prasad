# Architectural Empathy Portfolio Redesign

Replace the current notebook design with a Swiss International Style single-page site, using a 12-column blueprint grid, the Stone White / Deep Carbon / System Cobalt palette, and giant condensed uppercase typography. All content (projects, experience, certs, education, contact) is preserved from the existing resume data.

## Route architecture

Stay on the single `/` route with anchor-scrolled sections. Sticky top nav with anchor links: Projects · Experience · Skills · Certifications · GitHub · Contact.

```text
/  (single page)
 ├─ #hero
 ├─ #projects
 ├─ #experience   (dark #0F1115)
 ├─ #skills
 ├─ #certifications
 ├─ #github
 └─ #contact      (dark #0F1115)
```

## Visual system

**Palette (inline hex where tokens don't cover):**
- `--stone: #F4F4F2` (base bg)
- `--carbon: #0F1115` (ink + dark sections)
- `--cobalt: #1A4BFF` (accent)
- `--aluminum: #D1D1CB` (grid lines, hairlines, borders)

**Typography (Google Fonts via `<link>` in `__root.tsx`):**
- Body: Inter 400/500 — 18px / 1.6
- Display: Archivo Black (condensed black) — up to 120px / 0.88, tracking -0.03em, uppercase
- Mono: JetBrains Mono 400/500 — 11–14px, tracking 0.15em, uppercase

**Grid:** persistent 12-column overlay at ~6% opacity via a fixed SVG background; vertical lines animate `pathLength 0→1` on page load with 300ms stagger.

**Motion:** IntersectionObserver + Framer Motion `whileInView` for staggered fade-up (24px, ease-out, momentum spring). "Curtain reveal" clip-path animation on images (inset 0 50% 0 50% → inset 0). Respects `prefers-reduced-motion` via existing `MotionConfig`.

## Section specs

**Hero** — mono metadata strip (`PIYUSH_PRASAD.v2026 — NAVI MUMBAI, INDIA — AVAILABLE FOR OPPORTUNITIES`), two-line uppercase name with "PRASAD" in cobalt, role subtitle, short intro, contact links on the right (email/linkedin/github mono list with cobalt arrows). Faint blueprint-paper image at 7% opacity behind. Scroll cue at bottom.

**Projects** — full-width list rows separated by 1px `--aluminum` hairlines. Each row: `01` mono index left, giant title (hover → cobalt + faint project image fades in behind via clip-path reveal), cobalt mono subtitle, description + tech pill tags + `→ live link` right column. Two projects (existing: DevOps CI/CD Pipeline, Production AWS EC2 + DevSecOps).

**Experience** — dark carbon section. Left sticky column: company selector buttons (Runtime Solutions / Credence Infotech) with cobalt left-border on active. Right column: role title, "Full-Time" cobalt outline badge, mono period, bulleted responsibilities with cobalt `→` arrows. Content from existing full bullet lists.

**Skills** — Left column: "THE STACK" giant heading, short paragraph, and a "live component library" card containing three CLI-labeled buttons (`$ aws deploy`, `$ nginx -t`, `$ systemctl`), a working toggle (IDLE ↔ ACTIVE state), and a draggable range slider bound to a "Utilization: X%" readout. Right column: 2-col grid of category cards (Cloud, Operating Systems, DevOps Tools, Web Server, CI/CD, Monitoring, Security, ITSM), each with a cobalt dot, mono label, and pill tags.

**Certifications & Education** — Two columns. Left: credential rows with a mono-bordered icon box + credential name + issuer in cobalt mono (Canonical, GitHub, AWS, LinkedIn, Packt). Right: education cards (B.Com — Tilak / Univ. of Mumbai, HSC — Allen Swami Vivekanand, SSC — Tilak Global) with mono period on top.

**GitHub Activity** — fetch `https://api.github.com/users/ppiyushhhhh/repos?sort=pushed&per_page=6` on the client via `useQuery`, then for each repo fetch latest commit from `/repos/{owner}/{repo}/commits?per_page=1`. 2-col card grid: repo name, language badge (cobalt dot + name), description, latest commit message + short SHA (7 chars) + relative date. Loading spinner, error/rate-limit fallback message. Public REST — no auth; unauthenticated rate limit (60/hr per IP) is acceptable for a portfolio.

**Contact** — dark carbon. Giant "LET'S BUILD TOGETHER" with "BUILD" in cobalt. Copy-to-clipboard email button (shows `COPIED ✓` for 1.5s), phone `tel:` link, LinkedIn + GitHub rows with animated arrow nudge on hover. Footer: `© 2026 PIYUSH PRASAD — ALL RIGHTS RESERVED` and `NAVI MUMBAI` right-aligned.

**Persistent CV button** — fixed bottom-right, dark pill with `↓ DOWNLOAD CV`. On hover, expands upward into a small preview card (name, role, "Cloud & DevOps · 2026" mono line). Click downloads `/resume.pdf` (existing public asset, or a placeholder if not present — will note if missing during build).

## Files to change

- `src/routes/__root.tsx` — swap fonts to Inter + Archivo Black + JetBrains Mono; keep existing SEO/OG tags.
- `src/styles.css` — replace notebook tokens with architectural palette + font stacks; remove `paper`, `marker-hi`, `ink-underline` utilities.
- `src/routes/index.tsx` — full rewrite as thin composition importing section components.
- `src/components/portfolio/` (new): `TopNav.tsx`, `BlueprintGrid.tsx`, `Hero.tsx`, `Projects.tsx`, `Experience.tsx`, `Skills.tsx`, `Certifications.tsx`, `GithubActivity.tsx`, `Contact.tsx`, `CvDock.tsx`.
- `src/components/notebook/*` — delete (superseded).

## Dependencies

- `framer-motion` — already installed.
- `@tanstack/react-query` — already installed; used for GitHub fetch.
- No new packages.

## Out of scope

- No dark mode toggle (spec explicitly says no standard dark mode; dark is only Experience + Contact by design).
- No real macro studio photos — will use CSS-generated blueprint patterns + subtle SVG textures at 7% opacity as the imagery layer. **Question: is that acceptable, or do you want me to generate cobalt/carbon macro studio photos (keyboard switches, calipers, blueprint paper) via image gen?**
- GitHub API is called unauthenticated (60/hr/IP). If you want higher limits, a server function with a token is a follow-up.
