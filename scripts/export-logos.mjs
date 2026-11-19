import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as si from 'simple-icons';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const logosJsonPath = path.resolve(rootDir, 'node_modules/@iconify-json/logos/icons.json');
const logosData = JSON.parse(fs.readFileSync(logosJsonPath, 'utf8'));

const outDir = path.resolve(rootDir, 'public/tech-logos');
const awsOutDir = path.resolve(outDir, 'aws');

fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(awsOutDir, { recursive: true });

function getIconifySvg(name) {
  const icon = logosData.icons[name];
  if (!icon) {
    throw new Error(`Icon not found in @iconify-json/logos: ${name}`);
  }
  const width = icon.width || logosData.width || 256;
  const height = icon.height || logosData.height || 256;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">\n${icon.body}\n</svg>\n`;
}

function getSimpleIconSvg(iconName, colorOverride) {
  const icon = si[iconName];
  if (!icon) {
    throw new Error(`Icon not found in simple-icons: ${iconName}`);
  }
  const fill = colorOverride || `#${icon.hex}`;
  // Add fill color to path if not present
  let svg = icon.svg;
  if (!svg.includes('fill=')) {
    svg = svg.replace('<path ', `<path fill="${fill}" `);
  }
  return svg;
}

// 1. AWS Architecture Icons (stored in public/tech-logos/aws/)
const awsIcons = {
  'ec2.svg': 'aws-ec2',
  's3.svg': 'aws-s3',
  'rds.svg': 'aws-rds',
  'dynamodb.svg': 'aws-dynamodb',
  'lambda.svg': 'aws-lambda',
  'api-gateway.svg': 'aws-api-gateway',
  'cloudfront.svg': 'aws-cloudfront',
  'route53.svg': 'aws-route53',
  'vpc.svg': 'aws-vpc',
  'iam.svg': 'aws-iam',
  'cloudwatch.svg': 'aws-cloudwatch',
  'ses.svg': 'aws-ses',
  'sns.svg': 'aws-sns',
  'backup.svg': 'aws-backup',
  'waf.svg': 'aws-waf',
  'shield.svg': 'aws-shield',
  'secretsmanager.svg': 'aws-secrets-manager',
  'cloudformation.svg': 'aws-cloudformation',
  'eventbridge.svg': 'aws-eventbridge',
  'elb.svg': 'aws-elb',
  'ecs.svg': 'aws-ecs',
  'eks.svg': 'aws-eks',
};

for (const [filename, iconKey] of Object.entries(awsIcons)) {
  const svg = getIconifySvg(iconKey);
  fs.writeFileSync(path.join(awsOutDir, filename), svg, 'utf8');
  console.log(`Saved AWS icon: aws/${filename}`);
}

// 2. General Tech Icons (stored in public/tech-logos/)
const techLogosIconify = {
  'cloudflare.svg': 'cloudflare-icon',
  'vercel.svg': 'vercel-icon',
  'supabase.svg': 'supabase-icon',
  'postgresql.svg': 'postgresql',
  'nginx.svg': 'nginx',
  'docker.svg': 'docker-icon',
  'kubernetes.svg': 'kubernetes',
  'terraform.svg': 'terraform-icon',
  'github.svg': 'github-icon',
  'githubactions.svg': 'github-actions',
  'dependabot.svg': 'dependabot',
  'prometheus.svg': 'prometheus',
  'grafana.svg': 'grafana',
  'linux.svg': 'linux-tux',
  'resend.svg': 'resend-icon',
  'gemini.svg': 'google-gemini-icon',
  'redis.svg': 'redis',
  'upstash.svg': 'upstash-icon',
  'react.svg': 'react',
  'nodejs.svg': 'nodejs-icon',
  'bun.svg': 'bun',
  'typescript.svg': 'typescript-icon',
  'telegram.svg': 'telegram',
  'python.svg': 'python',
  'sqlite.svg': 'sqlite',
};

for (const [filename, iconKey] of Object.entries(techLogosIconify)) {
  const svg = getIconifySvg(iconKey);
  fs.writeFileSync(path.join(outDir, filename), svg, 'utf8');
  console.log(`Saved tech logo: ${filename}`);
}

// 3. Simple Icons (for icons not in @iconify-json/logos or better rendered with brand colors)
const techLogosSimpleIcons = {
  'letsencrypt.svg': 'siLetsencrypt',
  'tanstack.svg': 'siTanstack',
  'trivy.svg': 'siTrivy',
  'git.svg': 'siGit',
  'mysql.svg': 'siMysql',
  'ubuntu.svg': 'siUbuntu',
};

for (const [filename, iconName] of Object.entries(techLogosSimpleIcons)) {
  const svg = getSimpleIconSvg(iconName);
  fs.writeFileSync(path.join(outDir, filename), svg, 'utf8');
  console.log(`Saved simple-icon logo: ${filename}`);
}

// 4. CodeQL (GitHub CodeQL semantic code analysis official branding SVG)
const codeqlSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
  <rect width="24" height="24" rx="4" fill="#1F2328"/>
  <path fill="#2DA44E" d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3z"/>
  <path fill="#FFFFFF" d="M10.5 7.5L7.5 10.5l3 3M13.5 7.5l3 3-3 3"/>
</svg>\n`;
fs.writeFileSync(path.join(outDir, 'codeql.svg'), codeqlSvg, 'utf8');
console.log(`Saved CodeQL logo: codeql.svg`);

console.log('All logos exported successfully.');
