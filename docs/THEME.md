# Design System & Theme Specification: Restored Backgrounds + Teal Accent

This document specifies the exact design tokens used in the application. Large background surfaces use the original warm off-white and dark-mode backgrounds, while interactive elements, active indicators, and focus rings use the modern Teal Ops accent.

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
| **Accent** | `--accent` | `#0F766E` | Deep Teal Ops accent for links, primary buttons, active tabs (5.20:1 contrast ratio) |
| **Accent Hover** | `--accent-hover` | `#0D5F59` | Hover state for accent buttons and links |
| **Accent Soft** | `--accent-soft` | `#E4F2F0` | Subtle teal tint for small highlight chips and selected rows |
| **Text on Accent** | `--text-on-accent`| `#FFFFFF` | Text rendered on top of `--accent` (5.47:1 contrast ratio) |
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
| **Accent** | `--accent` | `#2DD4BF` | Vibrant teal accent for dark backgrounds (10.30:1 contrast ratio) |
| **Accent Hover** | `--accent-hover` | `#5EEAD4` | Hover state for dark accent |
| **Accent Soft** | `--accent-soft` | `#0F2A27` | Deep teal tint for dark mode badges and active containers |
| **Text on Accent** | `--text-on-accent`| `#0A0A0A` | High-contrast dark text on bright accent (10.64:1 contrast ratio) |
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
  - `theme_color`: `#0F766E`
