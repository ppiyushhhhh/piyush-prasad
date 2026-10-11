import React from "react";

interface LogoProps {
  className?: string;
  alt?: string;
}

const LOGO_CONFIG: Record<string, { src: string; defaultAlt: string }> = {
  aws: { src: "/tech-logos/aws.svg", defaultAlt: "Amazon Web Services (AWS) logo" },
  linux: { src: "/tech-logos/linux.svg", defaultAlt: "Linux (Tux) logo" },
  docker: { src: "/tech-logos/docker.svg", defaultAlt: "Docker logo" },
  kubernetes: { src: "/tech-logos/kubernetes.svg", defaultAlt: "Kubernetes logo" },
  "github actions": { src: "/tech-logos/githubactions.svg", defaultAlt: "GitHub Actions logo" },
  github: { src: "/tech-logos/githubactions.svg", defaultAlt: "GitHub Actions logo" },
  nginx: { src: "/tech-logos/nginx.svg", defaultAlt: "Nginx logo" },
  mysql: { src: "/tech-logos/mysql.svg", defaultAlt: "MySQL logo" },
  prometheus: { src: "/tech-logos/prometheus.svg", defaultAlt: "Prometheus logo" },
  grafana: { src: "/tech-logos/grafana.svg", defaultAlt: "Grafana logo" },
  terraform: { src: "/tech-logos/terraform.svg", defaultAlt: "Terraform logo" },
  git: { src: "/tech-logos/git.svg", defaultAlt: "Git logo" },
  trivy: { src: "/tech-logos/trivy.svg", defaultAlt: "Trivy logo" },
};

/**
 * High-fidelity, official vector brand logos for production infrastructure stack.
 * Loaded from authentic official brand SVGs (Devicon & Simple Icons).
 */
function OfficialBrandLogo({
  id,
  className = "h-5 w-5",
  alt,
}: {
  id: string;
  className?: string;
  alt?: string;
}) {
  const item = LOGO_CONFIG[id.toLowerCase().trim()];
  if (!item) return null;

  return (
    <img
      src={item.src}
      alt={alt || item.defaultAlt}
      loading="lazy"
      decoding="async"
      className={`object-contain select-none pointer-events-none ${className}`}
    />
  );
}

export function AwsLogo({ className, alt }: LogoProps) {
  return <OfficialBrandLogo id="aws" className={className} alt={alt} />;
}

export function LinuxLogo({ className, alt }: LogoProps) {
  return <OfficialBrandLogo id="linux" className={className} alt={alt} />;
}

export function DockerLogo({ className, alt }: LogoProps) {
  return <OfficialBrandLogo id="docker" className={className} alt={alt} />;
}

export function KubernetesLogo({ className, alt }: LogoProps) {
  return <OfficialBrandLogo id="kubernetes" className={className} alt={alt} />;
}

export function GitHubActionsLogo({ className, alt }: LogoProps) {
  return <OfficialBrandLogo id="github actions" className={className} alt={alt} />;
}

export function NginxLogo({ className, alt }: LogoProps) {
  return <OfficialBrandLogo id="nginx" className={className} alt={alt} />;
}

export function MySqlLogo({ className, alt }: LogoProps) {
  return <OfficialBrandLogo id="mysql" className={className} alt={alt} />;
}

export function PrometheusLogo({ className, alt }: LogoProps) {
  return <OfficialBrandLogo id="prometheus" className={className} alt={alt} />;
}

export function GrafanaLogo({ className, alt }: LogoProps) {
  return <OfficialBrandLogo id="grafana" className={className} alt={alt} />;
}

export function TerraformLogo({ className, alt }: LogoProps) {
  return <OfficialBrandLogo id="terraform" className={className} alt={alt} />;
}

export function GitLogo({ className, alt }: LogoProps) {
  return <OfficialBrandLogo id="git" className={className} alt={alt} />;
}

export function TrivyLogo({ className, alt }: LogoProps) {
  return <OfficialBrandLogo id="trivy" className={className} alt={alt} />;
}

/**
 * Dynamic resolver for technology logos by name.
 */
export function TechLogo({
  name,
  className = "h-5 w-5",
  alt,
}: {
  name: string;
  className?: string;
  alt?: string;
}) {
  const normalized = name.toLowerCase().trim();
  const config = LOGO_CONFIG[normalized];
  if (!config) return null;

  return (
    <img
      src={config.src}
      alt={alt || config.defaultAlt}
      loading="lazy"
      decoding="async"
      className={`object-contain select-none pointer-events-none ${className}`}
    />
  );
}

