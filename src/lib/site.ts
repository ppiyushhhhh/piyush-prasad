/** Single source of truth for site-wide identity and contact details. */
export const SITE_URL =
  (typeof process !== "undefined" && (process.env?.VITE_SITE_URL || process.env?.SITE_URL)) ||
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_SITE_URL) ||
  "https://www.piyushprasad.in";
export const GH_USER = "ppiyushhhhh";
export const EMAIL = "hello@piyushprasad.in";
export const CONTACT_NOTIFICATION_EMAIL = "hello@piyushprasad.in";
export const SUPPORT_EMAIL = "support@piyushprasad.in";
export const PHONE = "+91 9324236673";
export const LINKEDIN = "https://linkedin.com/in/ppiyushhhh";
export const GITHUB = "https://github.com/ppiyushhhhh";
export const CREDLY_PROFILE = "https://www.credly.com/users/ppiyushhhh/badges/credly";
export const PROJECTS_URL = "https://dev.piyushprasad.in/projects";

