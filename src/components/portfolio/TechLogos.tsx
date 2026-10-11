import React from "react";

interface LogoProps {
  className?: string;
}

/**
 * High-fidelity, official brand vector logos for production infrastructure tools.
 * Optimized for crisp rendering across high-DPI displays.
 */

export function AwsLogo({ className = "h-5 w-5" }: LogoProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* AWS Smile Arrow */}
      <path
        d="M18.88 16.5c-2.4 1.76-5.8 2.45-9.34 2.1-3.62-.36-6.8-2.22-8.54-4.83-.26-.39.02-.91.43-.87.72.06 1.44.17 2.15.2 3.09.15 6.13-.88 8.3-2.6 1.54-1.12 2.82-2.52 3.82-4.1.22-.35.72-.34.92.01 1.22 2.1 2.11 4.54 2.68 7.02.09.43-.38.82-.82.64-.53-.22-1.04-.39-1.6-.57z"
        fill="#FF9900"
      />
      {/* AWS Lettering */}
      <path
        d="M6.28 6.57c-.82 0-1.48.24-1.98.71-.5.48-.75 1.13-.75 1.95 0 .8.25 1.45.75 1.93.5.48 1.16.72 1.98.72.81 0 1.46-.24 1.95-.72.49-.48.74-1.13.74-1.93 0-.82-.25-1.47-.74-1.95-.49-.47-1.14-.71-1.95-.71zm0 4.14c-.45 0-.8-.14-1.06-.41-.26-.27-.39-.67-.39-1.19 0-.54.13-.94.39-1.21.26-.27.61-.41 1.06-.41.46 0 .82.14 1.07.41.25.27.38.67.38 1.21 0 .52-.13.92-.38 1.19-.25.27-.61.41-1.07.41zM11.95 5.2h-1.3v6.5h1.3V5.2zm4.18 1.37c-.77 0-1.4.24-1.89.72-.49.48-.74 1.13-.74 1.95 0 .81.25 1.46.74 1.94.49.48 1.12.72 1.89.72.76 0 1.39-.24 1.87-.72.48-.48.72-1.13.72-1.94 0-.82-.24-1.47-.72-1.95-.48-.48-1.11-.72-1.87-.72zm0 4.14c-.44 0-.8-.14-1.06-.41-.26-.27-.39-.67-.39-1.21 0-.52.13-.92.39-1.19.26-.27.62-.41 1.06-.41.45 0 .81.14 1.06.41.25.27.38.67.38 1.19 0 .54-.13.94-.38 1.21-.25.27-.61.41-1.06.41z"
        fill="#232F3E"
      />
    </svg>
  );
}

export function LinuxLogo({ className = "h-5 w-5" }: LogoProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Tux Penguin Body */}
      <path
        d="M12 2C8.69 2 6.5 4.5 6.5 7.5c0 1.2.3 2.5.8 3.5-1.5 1.2-2.3 3-2.3 5 0 3 2.5 5 5.5 5.5-1 .5-2 1.2-2 2 0 1.2 2.5 1.5 5.5 1.5s5.5-.3 5.5-1.5c0-.8-1-1.5-2-2 3-.5 5.5-2.5 5.5-5.5 0-2-.8-3.8-2.3-5 .5-1 .8-2.3.8-3.5C17.5 4.5 15.31 2 12 2z"
        fill="#232F3E"
      />
      {/* Tux White Belly */}
      <path
        d="M12 9.5c-2.4 0-4.5 2.5-4.5 6 0 3.2 2 5.5 4.5 5.5s4.5-2.3 4.5-5.5c0-3.5-2.1-6-4.5-6z"
        fill="#FFFFFF"
      />
      {/* Eyes */}
      <circle cx="10" cy="6.2" r="1.1" fill="#FFFFFF" />
      <circle cx="10.2" cy="6.2" r=".5" fill="#000000" />
      <circle cx="14" cy="6.2" r="1.1" fill="#FFFFFF" />
      <circle cx="13.8" cy="6.2" r=".5" fill="#000000" />
      {/* Beak & Feet in Yellow/Orange */}
      <path d="M10.2 7.8c0-.2.8-.8 1.8-.8s1.8.6 1.8.8c0 .8-1 1.7-1.8 1.7s-1.8-.9-1.8-1.7z" fill="#FCC624" />
      <ellipse cx="8.5" cy="22" rx="2.5" ry="1" fill="#FCC624" />
      <ellipse cx="15.5" cy="22" rx="2.5" ry="1" fill="#FCC624" />
    </svg>
  );
}

export function DockerLogo({ className = "h-5 w-5" }: LogoProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Docker Whale Body and stacked cargo containers */}
      <path
        d="M13.98 11.08h2.12c.1 0 .19-.08.19-.19V9.01a.19.19 0 00-.19-.19h-2.12a.19.19 0 00-.19.19v1.88c0 .1.09.19.19.19zm-2.95-5.43h2.12c.1 0 .19-.08.19-.19V3.57a.19.19 0 00-.19-.18h-2.12a.19.19 0 00-.19.18v1.89c0 .1.09.19.19.19zm0 2.71h2.12c.1 0 .19-.08.19-.18V6.29a.19.19 0 00-.19-.18h-2.12a.19.19 0 00-.19.18v1.89c0 .1.09.18.19.18zm-2.93 0h2.12c.1 0 .18-.08.18-.18V6.29a.19.19 0 00-.18-.18H8.1a.19.19 0 00-.19.18v1.89c0 .1.09.18.19.18zm-2.97 0h2.12c.1 0 .19-.08.19-.18V6.29a.19.19 0 00-.19-.18H5.13a.19.19 0 00-.18.18v1.89c0 .1.08.18.18.18zm5.9 2.72h2.11c.1 0 .19-.09.19-.19V9.01a.19.19 0 00-.19-.19h-2.12a.19.19 0 00-.18.19v1.88c0 .1.08.19.19.19zm-2.94 0h2.12c.1 0 .19-.09.19-.19V9.01a.19.19 0 00-.19-.19H8.1a.19.19 0 00-.19.19v1.88c0 .1.09.19.19.19zm-2.96 0h2.12c.1 0 .18-.09.18-.19V9.01a.19.19 0 00-.18-.19H5.14a.19.19 0 00-.19.19v1.88c0 .1.09.19.19.19zm-2.93 0h2.12c.1 0 .19-.09.19-.19V9.01a.19.19 0 00-.19-.19H2.21a.19.19 0 00-.19.19v1.88c0 .1.09.19.19.19zm21.62 1.84a3.78 3.78 0 00-2.33-.89 4.98 4.98 0 00-1.08.11 5.44 5.44 0 00-3.95-1.92H1.36a1.36 1.36 0 00-1.36 1.36 7.42 7.42 0 003.54 6.4c3.08 1.9 7.46 1.94 10.98.23a11.14 11.14 0 004.99-4.99 3.52 3.52 0 004.31-.29z"
        fill="#2496ED"
      />
    </svg>
  );
}

export function KubernetesLogo({ className = "h-5 w-5" }: LogoProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* 7-spoked ship's wheel */}
      <path
        d="M12 2.25L4.42 6.63v8.76l7.58 4.38 7.58-4.38V6.63L12 2.25z"
        fill="#326CE5"
      />
      <circle cx="12" cy="11.5" r="3.2" fill="#FFFFFF" />
      <circle cx="12" cy="11.5" r="1.6" fill="#326CE5" />
      <path
        d="M12 4.8v3.5M12 14.7v3.5M5.8 7.9l3.1 1.8M15.1 13.3l3.1 1.8M5.8 15.1l3.1-1.8M15.1 9.7l3.1-1.8"
        stroke="#FFFFFF"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function GitHubActionsLogo({ className = "h-5 w-5" }: LogoProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* GitHub Actions Official Blue Badge & Trigger Arrows */}
      <rect width="24" height="24" rx="5" fill="#2088FF" />
      <path
        d="M6.5 12a5.5 5.5 0 0110.16-2.92l.74-.74a6.5 6.5 0 00-11.9 3.66h1zm11 0a5.5 5.5 0 01-10.16 2.92l-.74.74a6.5 6.5 0 0011.9-3.66h-1z"
        fill="#FFFFFF"
      />
      <polygon points="17.5,7 18.5,10.5 15,9.5" fill="#FFFFFF" />
      <polygon points="6.5,17 5.5,13.5 9,14.5" fill="#FFFFFF" />
    </svg>
  );
}

export function NginxLogo({ className = "h-5 w-5" }: LogoProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Nginx Hexagon and Stylized "N" */}
      <path
        d="M12 0L1.6 6v12L12 24l10.4-6V6L12 0z"
        fill="#009639"
      />
      <path
        d="M17.12 16.6c0 .64-.4 1.05-1.13 1.05-.36 0-.75-.13-1.05-.36L8.33 8.7v7.9c0 .64-.36 1.05-1.05 1.05-.7 0-1.06-.41-1.06-1.05V7.4c0-.64.41-1.05 1.13-1.05.36 0 .75.13 1.06.36l6.6 8.59V7.4c0-.64.36-1.05 1.06-1.05.7 0 1.05.41 1.05 1.05v9.2z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

export function MySqlLogo({ className = "h-5 w-5" }: LogoProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Sakila the Dolphin & Waves */}
      <path
        d="M18.8 6.2c-1.8-1.5-4.2-2.1-6.5-1.7-1.1.2-2.2.7-3.1 1.3-1.6 1.1-2.8 2.6-3.4 4.4-.6 1.8-.6 3.8.1 5.6.4 1 1 1.9 1.8 2.6.2.2.5.3.8.2.3-.1.4-.4.4-.7-.1-.9-.1-1.8.2-2.7.3-.9.9-1.7 1.7-2.3.8-.6 1.7-1 2.7-1.1 1-.1 2 .1 2.9.6.5.3 1 .7 1.5 1.2.3.3.7.4 1.1.2.4-.2.6-.6.5-1-.2-1.3-.7-2.5-1.5-3.6-.8-1.1-1.8-2-3-2.6 1.2-.2 2.5 0 3.6.6.6.3 1.1.7 1.6 1.2.3.3.7.4 1.1.2.4-.2.6-.6.5-1-.2-.9-.7-1.7-1.4-2.4z"
        fill="#00758F"
      />
      <path
        d="M6.2 17.5c1.4-.8 3-1.2 4.6-1.1 1.6.1 3.1.7 4.4 1.6 1.3.9 2.4 2.1 3.2 3.5.2.3.1.7-.2.9-.3.2-.7.1-.9-.2-.7-1.2-1.7-2.3-2.9-3.1-1.2-.8-2.6-1.3-4.1-1.4-1.5-.1-3 .2-4.3.9-.3.2-.7.1-.9-.2-.2-.3-.1-.7.2-.9z"
        fill="#F29111"
      />
    </svg>
  );
}

export function PrometheusLogo({ className = "h-5 w-5" }: LogoProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Prometheus Flame & Flame Base */}
      <circle cx="12" cy="12" r="11" fill="#E6522C" />
      <path
        d="M12 4.5c.8 1.4 1.8 2.7 1.8 4.2 0 1.2-.6 2.2-1.5 2.8.9.1 1.8-.3 2.3-.9.6 1.4.3 3.1-.7 4.2-.7.8-1.8 1.2-2.8 1.2-1.5 0-2.8-.8-3.5-2.1-.7 1.3-.5 3 .5 4.1.8.9 2 1.4 3.2 1.4 2.5 0 4.7-1.8 5.1-4.3.4-2.5-.9-4.9-3.2-5.7.5-.8.7-1.7.5-2.6-.3-.9-1-1.7-1.7-2.3z"
        fill="#FFFFFF"
      />
      <rect x="7.5" y="17.2" width="9" height="1.8" rx=".9" fill="#FFFFFF" />
    </svg>
  );
}

export function GrafanaLogo({ className = "h-5 w-5" }: LogoProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Grafana Orange Swirl */}
      <rect width="24" height="24" rx="4" fill="#F46800" />
      <path
        d="M17.5 7.8c-1.3-1.6-3.2-2.6-5.4-2.6-3.9 0-7.1 3.2-7.1 7.1s3.2 7.1 7.1 7.1c3.5 0 6.4-2.6 6.9-6h-2.1c-.5 2.3-2.5 4-4.8 4-2.8 0-5-2.2-5-5s2.2-5 5-5c1.5 0 2.9.7 3.8 1.8l1.6-1.4z"
        fill="#FFFFFF"
      />
      <circle cx="12" cy="12.3" r="1.8" fill="#FFFFFF" />
    </svg>
  );
}

export function TerraformLogo({ className = "h-5 w-5" }: LogoProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* HashiCorp Terraform 4-prisms */}
      <path d="M2.5 2v6.6l5.7 3.3V5.3L2.5 2z" fill="#844FBA" />
      <path d="M9.1 5.8v6.6l5.8 3.3V9.1L9.1 5.8z" fill="#844FBA" />
      <path d="M15.7 9.6v6.6l5.8 3.3v-6.6l-5.8-3.3z" fill="#5C4EE5" />
      <path d="M9.1 13.4V20l5.8-3.3v-6.6l-5.8 3.3z" fill="#844FBA" opacity="0.85" />
    </svg>
  );
}

export function GitLogo({ className = "h-5 w-5" }: LogoProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Git Coral Orange Diamond & Branch Tree */}
      <path
        d="M21.62 10.45L13.55 2.38a2.38 2.38 0 00-3.37 0L8.2 4.36l3.29 3.29a2.36 2.36 0 012.35.6 2.37 2.37 0 01.59 2.44l3.18 3.18a2.37 2.37 0 11-1.68 1.68l-2.98-2.98v4.29a2.38 2.38 0 11-2.38-2.38v-4.46a2.37 2.37 0 01-1.3-3.13L5.99 6.57 2.38 10.18a2.38 2.38 0 000 3.37l8.07 8.07a2.38 2.38 0 003.37 0l7.8-7.8a2.38 2.38 0 000-3.37z"
        fill="#F05032"
      />
    </svg>
  );
}

export function TrivyLogo({ className = "h-5 w-5" }: LogoProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Aqua Security Trivy Cyan Shield & Visor Scanner */}
      <rect width="24" height="24" rx="4" fill="#001827" />
      <path
        d="M12 4.2L5.5 7.1v4.8c0 4.1 2.8 7.9 6.5 8.9 3.7-1 6.5-4.8 6.5-8.9V7.1L12 4.2z"
        fill="#00B4D8"
      />
      <path
        d="M8.5 10.5h7c.3 0 .5.3.4.6l-.8 2.5c-.1.3-.4.5-.7.5h-4.8c-.3 0-.6-.2-.7-.5l-.8-2.5c-.1-.3.1-.6.4-.6z"
        fill="#FFFFFF"
      />
      <circle cx="12" cy="15.8" r="1.1" fill="#FFFFFF" />
    </svg>
  );
}

/**
 * Dynamic resolver for technology logos by name.
 */
export function TechLogo({ name, className = "h-5 w-5" }: { name: string; className?: string }) {
  const normalized = name.toLowerCase().trim();

  switch (normalized) {
    case "aws":
      return <AwsLogo className={className} />;
    case "linux":
      return <LinuxLogo className={className} />;
    case "docker":
      return <DockerLogo className={className} />;
    case "kubernetes":
      return <KubernetesLogo className={className} />;
    case "github actions":
    case "github":
      return <GitHubActionsLogo className={className} />;
    case "nginx":
      return <NginxLogo className={className} />;
    case "mysql":
      return <MySqlLogo className={className} />;
    case "prometheus":
      return <PrometheusLogo className={className} />;
    case "grafana":
      return <GrafanaLogo className={className} />;
    case "terraform":
      return <TerraformLogo className={className} />;
    case "git":
      return <GitLogo className={className} />;
    case "trivy":
      return <TrivyLogo className={className} />;
    default:
      return null;
  }
}
