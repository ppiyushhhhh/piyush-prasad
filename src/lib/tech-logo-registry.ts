/**
 * Central Tech Logo Registry
 *
 * Maps technologies, cloud providers, and architectural services to verified local SVGs
 * stored in `/public/tech-logos/` (including official AWS Architecture SVGs in `/tech-logos/aws/`).
 *
 * Matches case-insensitively and via substrings with specific precedence rules.
 */

export interface TechLogo {
  src: string;
  label: string;
  brandColor: string;
}

export const TECH_LOGO_REGISTRY: Record<string, TechLogo> = {
  // AWS Architecture Services
  "aws-ec2": { src: "/tech-logos/aws/ec2.svg", label: "AWS EC2", brandColor: "#FF9900" },
  "aws-s3": { src: "/tech-logos/aws/s3.svg", label: "AWS S3", brandColor: "#569A31" },
  "aws-rds": { src: "/tech-logos/aws/rds.svg", label: "AWS RDS", brandColor: "#3B48CC" },
  "aws-dynamodb": { src: "/tech-logos/aws/dynamodb.svg", label: "Amazon DynamoDB", brandColor: "#4053D6" },
  "aws-lambda": { src: "/tech-logos/aws/lambda.svg", label: "AWS Lambda", brandColor: "#FF9900" },
  "aws-api-gateway": { src: "/tech-logos/aws/api-gateway.svg", label: "Amazon API Gateway", brandColor: "#A166FF" },
  "aws-cloudfront": { src: "/tech-logos/aws/cloudfront.svg", label: "Amazon CloudFront", brandColor: "#A166FF" },
  "aws-route53": { src: "/tech-logos/aws/route53.svg", label: "Amazon Route 53", brandColor: "#A166FF" },
  "aws-vpc": { src: "/tech-logos/aws/vpc.svg", label: "Amazon VPC", brandColor: "#A166FF" },
  "aws-iam": { src: "/tech-logos/aws/iam.svg", label: "AWS IAM", brandColor: "#DD3522" },
  "aws-cloudwatch": { src: "/tech-logos/aws/cloudwatch.svg", label: "Amazon CloudWatch", brandColor: "#FF4F8B" },
  "aws-ses": { src: "/tech-logos/aws/ses.svg", label: "Amazon SES", brandColor: "#DD3522" },
  "aws-sns": { src: "/tech-logos/aws/sns.svg", label: "Amazon SNS", brandColor: "#FF4F8B" },
  "aws-backup": { src: "/tech-logos/aws/backup.svg", label: "AWS Backup", brandColor: "#DD3522" },
  "aws-waf": { src: "/tech-logos/aws/waf.svg", label: "AWS WAF", brandColor: "#DD3522" },
  "aws-shield": { src: "/tech-logos/aws/shield.svg", label: "AWS Shield", brandColor: "#DD3522" },
  "aws-secrets-manager": { src: "/tech-logos/aws/secretsmanager.svg", label: "AWS Secrets Manager", brandColor: "#DD3522" },
  "aws-cloudformation": { src: "/tech-logos/aws/cloudformation.svg", label: "AWS CloudFormation", brandColor: "#FF4F8B" },
  "aws-eventbridge": { src: "/tech-logos/aws/eventbridge.svg", label: "Amazon EventBridge", brandColor: "#FF4F8B" },
  "aws-elb": { src: "/tech-logos/aws/elb.svg", label: "Elastic Load Balancing", brandColor: "#A166FF" },
  "aws-ecs": { src: "/tech-logos/aws/ecs.svg", label: "Amazon ECS", brandColor: "#FF9900" },
  "aws-eks": { src: "/tech-logos/aws/eks.svg", label: "Amazon EKS", brandColor: "#FF9900" },
  aws: { src: "/tech-logos/aws.svg", label: "Amazon Web Services", brandColor: "#232F3E" },

  // Cloud & Hosting
  cloudflare: { src: "/tech-logos/cloudflare.svg", label: "Cloudflare", brandColor: "#F38020" },
  vercel: { src: "/tech-logos/vercel.svg", label: "Vercel", brandColor: "#000000" },
  supabase: { src: "/tech-logos/supabase.svg", label: "Supabase", brandColor: "#3ECF8E" },

  // Databases & Storage
  postgresql: { src: "/tech-logos/postgresql.svg", label: "PostgreSQL", brandColor: "#4169E1" },
  mysql: { src: "/tech-logos/mysql.svg", label: "MySQL", brandColor: "#4479A1" },
  mongodb: { src: "/tech-logos/mongodb.svg", label: "MongoDB", brandColor: "#13AA52" },
  sqlite: { src: "/tech-logos/sqlite.svg", label: "SQLite", brandColor: "#003B57" },
  redis: { src: "/tech-logos/redis.svg", label: "Redis", brandColor: "#DC382D" },
  upstash: { src: "/tech-logos/upstash.svg", label: "Upstash Redis", brandColor: "#00E9A3" },

  // Web Servers & Runtimes
  nginx: { src: "/tech-logos/nginx.svg", label: "Nginx", brandColor: "#009639" },
  express: { src: "/tech-logos/express.svg", label: "Express.js", brandColor: "#000000" },
  nodejs: { src: "/tech-logos/nodejs.svg", label: "Node.js", brandColor: "#5FA04E" },
  bun: { src: "/tech-logos/bun.svg", label: "Bun", brandColor: "#FBF0DF" },
  typescript: { src: "/tech-logos/typescript.svg", label: "TypeScript", brandColor: "#3178C6" },
  python: { src: "/tech-logos/python.svg", label: "Python", brandColor: "#3776AB" },

  // Containers & Orchestration
  docker: { src: "/tech-logos/docker.svg", label: "Docker", brandColor: "#2496ED" },
  ansible: { src: "/tech-logos/ansible.svg", label: "Ansible", brandColor: "#000000" },
  kubernetes: { src: "/tech-logos/kubernetes.svg", label: "Kubernetes", brandColor: "#326CE5" },
  terraform: { src: "/tech-logos/terraform.svg", label: "Terraform", brandColor: "#844FBA" },

  // CI/CD & Version Control
  git: { src: "/tech-logos/git.svg", label: "Git", brandColor: "#F05032" },
  github: { src: "/tech-logos/github.svg", label: "GitHub", brandColor: "#181717" },
  githubactions: { src: "/tech-logos/githubactions.svg", label: "GitHub Actions", brandColor: "#2088FF" },
  codeql: { src: "/tech-logos/codeql.svg", label: "CodeQL", brandColor: "#2DA44E" },
  dependabot: { src: "/tech-logos/dependabot.svg", label: "Dependabot", brandColor: "#02569B" },

  // Security & Certificates
  trivy: { src: "/tech-logos/trivy.svg", label: "Trivy", brandColor: "#001B44" },
  letsencrypt: { src: "/tech-logos/letsencrypt.svg", label: "Let's Encrypt", brandColor: "#003A70" },
  linux: { src: "/tech-logos/linux.svg", label: "Linux", brandColor: "#FCC624" },
  ubuntu: { src: "/tech-logos/ubuntu.svg", label: "Ubuntu", brandColor: "#E95420" },

  // Monitoring & Observability
  prometheus: { src: "/tech-logos/prometheus.svg", label: "Prometheus", brandColor: "#E6522C" },
  grafana: { src: "/tech-logos/grafana.svg", label: "Grafana", brandColor: "#F46800" },

  // Messaging, APIs & AI
  resend: { src: "/tech-logos/resend.svg", label: "Resend", brandColor: "#000000" },
  gmail: { src: "/tech-logos/gmail.svg", label: "Gmail / SMTP", brandColor: "#EA4335" },
  mail: { src: "/tech-logos/mail.svg", label: "Mail / SMTP", brandColor: "#0284C7" },
  pdf: { src: "/tech-logos/pdf.svg", label: "PDFKit / PDF", brandColor: "#DC2626" },
  gemini: { src: "/tech-logos/gemini.svg", label: "Google Gemini", brandColor: "#8E75FF" },
  telegram: { src: "/tech-logos/telegram.svg", label: "Telegram", brandColor: "#26A5E4" },

  // Frontend & Frameworks
  react: { src: "/tech-logos/react.svg", label: "React", brandColor: "#61DAFB" },
  tanstack: { src: "/tech-logos/tanstack.svg", label: "TanStack", brandColor: "#EE832B" },
  tailwindcss: { src: "/tech-logos/tailwindcss.svg", label: "Tailwind CSS", brandColor: "#06B6D4" },
};

/**
 * Normalizes input text for fuzzy substring matching.
 */
function normalize(str: string): string {
  return str.toLowerCase().replace(/[\s\-_/.]+/g, " ").trim();
}

/**
 * Resolves a technology string and optional provider to a verified brand logo.
 * Returns null when no confident logo exists, allowing callers to render category fallback icons.
 */
export function resolveLogo(
  techInput?: string | null,
  providerInput?: string | null
): TechLogo | null {
  if (!techInput && !providerInput) return null;

  const tech = techInput ? normalize(techInput) : "";
  const provider = providerInput ? normalize(providerInput) : "";
  const combined = `${tech} ${provider}`.trim();

  // 1. AWS Specific Services (match specific service before generic AWS)
  if (tech.includes("ec2") || tech.includes("t3 micro") || tech.includes("t2 micro")) {
    return TECH_LOGO_REGISTRY["aws-ec2"];
  }
  if (tech.includes("s3") || tech.includes("simple storage")) {
    return TECH_LOGO_REGISTRY["aws-s3"];
  }
  if (tech.includes("rds") || tech.includes("relational database")) {
    return TECH_LOGO_REGISTRY["aws-rds"];
  }
  if (tech.includes("dynamodb")) {
    return TECH_LOGO_REGISTRY["aws-dynamodb"];
  }
  if (tech.includes("lambda")) {
    return TECH_LOGO_REGISTRY["aws-lambda"];
  }
  if (tech.includes("api gateway") || tech.includes("apigateway")) {
    return TECH_LOGO_REGISTRY["aws-api-gateway"];
  }
  if (tech.includes("cloudfront")) {
    return TECH_LOGO_REGISTRY["aws-cloudfront"];
  }
  if (tech.includes("route 53") || tech.includes("route53")) {
    return TECH_LOGO_REGISTRY["aws-route53"];
  }
  if (
    tech.includes("vpc") ||
    tech.includes("subnets") ||
    tech.includes("nat gateway") ||
    tech.includes("internet gateway") ||
    tech.includes("security group")
  ) {
    return TECH_LOGO_REGISTRY["aws-vpc"];
  }
  if (tech.includes("iam") || tech.includes("identity and access")) {
    return TECH_LOGO_REGISTRY["aws-iam"];
  }
  if (tech.includes("cloudwatch")) {
    return TECH_LOGO_REGISTRY["aws-cloudwatch"];
  }
  if (tech.includes("ses") || tech.includes("simple email")) {
    return TECH_LOGO_REGISTRY["aws-ses"];
  }
  if (tech.includes("sns") || tech.includes("simple notification")) {
    return TECH_LOGO_REGISTRY["aws-sns"];
  }
  if (tech.includes("aws backup") || tech.includes("ebs snapshot") || tech.includes("ebs")) {
    return TECH_LOGO_REGISTRY["aws-backup"];
  }
  if (tech.includes("waf") || tech.includes("web application firewall")) {
    return TECH_LOGO_REGISTRY["aws-waf"];
  }
  if (tech.includes("shield")) {
    return TECH_LOGO_REGISTRY["aws-shield"];
  }
  if (tech.includes("secrets manager") || tech.includes("secretsmanager")) {
    return TECH_LOGO_REGISTRY["aws-secrets-manager"];
  }
  if (tech.includes("cloudformation")) {
    return TECH_LOGO_REGISTRY["aws-cloudformation"];
  }
  if (tech.includes("eventbridge")) {
    return TECH_LOGO_REGISTRY["aws-eventbridge"];
  }
  if (tech.includes("elb") || tech.includes("load balancer")) {
    return TECH_LOGO_REGISTRY["aws-elb"];
  }
  if (tech.includes("ecs") || tech.includes("fargate")) {
    return TECH_LOGO_REGISTRY["aws-ecs"];
  }
  if (tech.includes("eks")) {
    return TECH_LOGO_REGISTRY["aws-eks"];
  }

  // 2. Web Servers & Proxies (Nginx before generic certs)
  if (tech.includes("nginx")) {
    return TECH_LOGO_REGISTRY.nginx;
  }

  // 3. Security & Certs
  if (
    tech.includes("certbot") ||
    tech.includes("lets encrypt") ||
    tech.includes("let s encrypt") ||
    tech.includes("ssl") ||
    tech.includes("tls") ||
    tech.includes("https")
  ) {
    return TECH_LOGO_REGISTRY.letsencrypt;
  }
  if (tech.includes("codeql")) {
    return TECH_LOGO_REGISTRY.codeql;
  }
  if (tech.includes("dependabot")) {
    return TECH_LOGO_REGISTRY.dependabot;
  }
  if (tech.includes("trivy") || provider.includes("aqua security")) {
    return TECH_LOGO_REGISTRY.trivy;
  }

  // 3. AI & Communication
  if (tech.includes("gemini") || combined.includes("google ai") || combined.includes("vertex")) {
    return TECH_LOGO_REGISTRY.gemini;
  }
  if (tech.includes("telegram") || combined.includes("mtproto")) {
    return TECH_LOGO_REGISTRY.telegram;
  }
  if (tech.includes("resend") || provider.includes("resend")) {
    return TECH_LOGO_REGISTRY.resend;
  }
  if (tech.includes("gmail") || tech.includes("smtp") || tech.includes("nodemailer")) {
    return TECH_LOGO_REGISTRY.gmail;
  }
  if (tech.includes("pdf") || tech.includes("pdfkit")) {
    return TECH_LOGO_REGISTRY.pdf;
  }

  // 4. Monitoring & Observability
  if (tech.includes("prometheus") || tech.includes("node exporter")) {
    return TECH_LOGO_REGISTRY.prometheus;
  }
  if (tech.includes("grafana")) {
    return TECH_LOGO_REGISTRY.grafana;
  }

  // 5. Cloud Platforms & Edge
  if (tech.includes("cloudflare") || tech.includes("workers ai") || provider.includes("cloudflare")) {
    return TECH_LOGO_REGISTRY.cloudflare;
  }
  if (tech.includes("vercel") || provider.includes("vercel")) {
    return TECH_LOGO_REGISTRY.vercel;
  }
  if (tech.includes("supabase") || provider.includes("supabase")) {
    return TECH_LOGO_REGISTRY.supabase;
  }

  // 6. Databases
  if (tech.includes("mongo") || tech.includes("mongoose")) {
    return TECH_LOGO_REGISTRY.mongodb;
  }
  if (tech.includes("sqlite")) {
    return TECH_LOGO_REGISTRY.sqlite;
  }
  if (tech.includes("postgres") || tech.includes("psql")) {
    return TECH_LOGO_REGISTRY.postgresql;
  }
  if (tech.includes("mysql") || tech.includes("mariadb")) {
    return TECH_LOGO_REGISTRY.mysql;
  }
  if (tech.includes("upstash")) {
    return TECH_LOGO_REGISTRY.upstash;
  }
  if (tech.includes("redis")) {
    return TECH_LOGO_REGISTRY.redis;
  }

  // 7. CI/CD & Automation
  if (tech.includes("ansible")) {
    return TECH_LOGO_REGISTRY.ansible;
  }
  if (tech.includes("github action") || tech.includes("github actions")) {
    return TECH_LOGO_REGISTRY.githubactions;
  }
  if (tech.includes("github") || provider.includes("github")) {
    return TECH_LOGO_REGISTRY.github;
  }
  if (tech.includes("terraform")) {
    return TECH_LOGO_REGISTRY.terraform;
  }
  if (tech.includes("git cli") || tech.includes("git hook") || tech === "git") {
    return TECH_LOGO_REGISTRY.git;
  }

  // 8. Containers & Infrastructure
  if (tech.includes("docker") || tech.includes("container")) {
    return TECH_LOGO_REGISTRY.docker;
  }
  if (tech.includes("kubernetes") || tech.includes("k8s")) {
    return TECH_LOGO_REGISTRY.kubernetes;
  }
  if (tech.includes("nginx")) {
    return TECH_LOGO_REGISTRY.nginx;
  }

  // 9. OS & Networking
  if (
    tech.includes("ubuntu") ||
    provider.includes("ubuntu")
  ) {
    return TECH_LOGO_REGISTRY.ubuntu;
  }
  if (
    tech.includes("linux") ||
    tech.includes("bash") ||
    tech.includes("shell") ||
    tech.includes("ufw") ||
    tech.includes("iptables") ||
    tech.includes("fail2ban") ||
    tech.includes("openssh") ||
    tech.includes("ssh")
  ) {
    return TECH_LOGO_REGISTRY.linux;
  }

  // 10. Frontend & Frameworks
  if (tech.includes("tailwind")) {
    return TECH_LOGO_REGISTRY.tailwindcss;
  }
  if (tech.includes("tanstack") || tech.includes("nitro")) {
    return TECH_LOGO_REGISTRY.tanstack;
  }
  if (tech.includes("react")) {
    return TECH_LOGO_REGISTRY.react;
  }
  if (tech.includes("express")) {
    return TECH_LOGO_REGISTRY.express;
  }
  if (tech.includes("node") || tech.includes("pm2")) {
    return TECH_LOGO_REGISTRY.nodejs;
  }
  if (tech.includes("bun")) {
    return TECH_LOGO_REGISTRY.bun;
  }
  if (tech.includes("typescript") || tech.includes("ts")) {
    return TECH_LOGO_REGISTRY.typescript;
  }
  if (tech.includes("python") || tech.includes("py")) {
    return TECH_LOGO_REGISTRY.python;
  }

  // Generic AWS fallback if nothing matched a specific AWS service
  if (tech.includes("aws") || provider.includes("aws")) {
    return TECH_LOGO_REGISTRY.aws;
  }

  return null;
}
