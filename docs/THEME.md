# Design System & Theme Specification: Restored Original Palette

This document specifies the exact design tokens used across the application. The system faithfully reflects the original portfolio design: warm stone off-white backgrounds, pure white cards, and vibrant Cobalt Blue (`#1A4BFF`) interactive accents.

---

## 1. Palette Tokens

### Light Mode
| Token | Variable | Value | Purpose |
| :--- | :--- | :--- | :--- |
| **Page Background** | `--background` | `#FAF9F6` | Original warm stone off-white for body and page sections |
| **Surface / Card** | `--surface` | `#FFFFFF` | Pure white for cards, panels, containers, and dialogs |
| **Surface Muted** | `--surface-muted`| `#F3F3ED` | Original warm muted tint for subtle node containers, badges, and code blocks |
| **Border** | `--border` | `#E5E5DF` | Original aluminum border token |
| **Text Primary** | `--text` | `#121316` | High-contrast carbon text (17.64:1 contrast ratio on `#FAF9F6`) |
| **Text Muted** | `--text-muted` | `#5A5C66` | Secondary body text and labels (6.32:1 contrast ratio) |
| **Accent** | `--accent` | `#1A4BFF` | Original Cobalt Blue accent for links, buttons, active nav, and highlights (5.69:1 contrast ratio) |
| **Accent Hover** | `--accent-hover` | `#1439CC` | Hover state for accent buttons and links |
| **Accent Soft** | `--accent-soft` | `#EEF2FF` | Subtle cobalt blue tint for small highlight chips and badges |
| **Text on Accent** | `--text-on-accent`| `#FFFFFF` | Text rendered on top of `--accent` (6.03:1 contrast ratio) |
| **Highlight** | `--highlight` | `#F59E0B` | Secondary warm amber highlight (never used for body text) |
| **Success** | `--success` | `#16A34A` | Status green |
| **Warning** | `--warning` | `#D97706` | Status amber |
| **Danger** | `--danger` | `#DC2626` | Status red |
| **Info** | `--info` | `#0284C7` | Status blue |

### Dark Mode
| Token | Variable | Value | Purpose |
| :--- | :--- | :--- | :--- |
| **Page Background** | `--background` | `#0E0F12` | Original dark carbon background for page body and viewport |
| **Surface / Card** | `--surface` | `#121316` | Deep neutral surface for cards, dialogs, and navigation |
| **Surface Muted** | `--surface-muted`| `#1A1B20` | Elevated muted surface for secondary sections |
| **Border** | `--border` | `#262626` | Neutral dark border |
| **Text Primary** | `--text` | `#EDEDED` | Off-white primary text (16.37:1 contrast ratio on `#0E0F12`) |
| **Text Muted** | `--text-muted` | `#9E9E9E` | Secondary dark text (7.15:1 contrast ratio) |
| **Accent** | `--accent` | `#3B82F6` | Vibrant blue accent for dark backgrounds (9.8:1 contrast ratio) |
| **Accent Hover** | `--accent-hover` | `#60A5FA` | Hover state for dark accent |
| **Accent Soft** | `--accent-soft` | `#1E293B` | Deep blue tint for dark mode badges and active containers |
| **Text on Accent** | `--text-on-accent`| `#FFFFFF` | High-contrast text on bright accent |
| **Highlight** | `--highlight` | `#F59E0B` | Amber highlight |
| **Success** | `--success` | `#4ADE80` | Status green |
| **Warning** | `--warning` | `#FBBF24` | Status amber |
| **Danger** | `--danger` | `#F87171` | Status red |
| **Info** | `--info` | `#38BDF8` | Status blue |

---

## 2. Meta Tags & Manifest Configuration

- **`src/routes/__root.tsx`**:
  - Light theme-color meta tag: `#FAF9F6`
  - Dark theme-color meta tag: `#0E0F12`
- **`public/site.webmanifest`**:
  - `background_color`: `#FAF9F6`
  - `theme_color`: `#1A4BFF`

