import { useState } from "react";
import { ContactForm } from "@/components/ContactForm";
import { EMAIL, GITHUB, LINKEDIN, PHONE } from "@/lib/site";
import {
  ArrowUpRight,
  Copy,
  Check,
  Github,
  Linkedin,
  Mail,
  Phone as PhoneIcon,
  MapPin,
  Clock,
} from "lucide-react";

export function ContactSection() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <section id="contact" className="relative border-b border-border bg-background py-12 md:py-16 scroll-mt-20">
      <div className="mx-auto max-w-[1240px] px-6 md:px-10">
        {/* Section Heading Bar */}
        <div className="mb-8 md:mb-10 border-b border-border pb-6">
          <div className="mono mb-3 flex items-center gap-3 text-[11px] font-medium text-text-muted">
            <span className="font-bold text-accent">05</span>
            <span className="text-text-muted/40">/</span>
            <span className="tracking-[0.16em] text-text uppercase">GET IN TOUCH</span>
            <span className="ml-3 h-px flex-1 bg-border" />
          </div>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-xl">
              <h2 className="display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-text uppercase leading-tight">
                LET&apos;S BUILD SOMETHING GREAT
              </h2>
            </div>
            <p className="max-w-md lg:max-w-lg text-sm sm:text-base leading-relaxed text-text-muted">
              Available for Cloud, DevOps, and DevSecOps engineering roles. Open to discussing infrastructure projects, automated deployment pipelines, and observability systems.
            </p>
          </div>
        </div>

        {/* Balanced Two-Column Layout: Left (55%) Form, Right (45%) Information */}
        <div className="grid grid-cols-1 lg:grid-cols-[55%_1fr] gap-6 lg:gap-8 items-start">
          {/* Left Column (55%): Contact Form Card */}
          <div className="border border-border bg-surface p-5 sm:p-6 shadow-2xs rounded-xs">
            <div className="border-b border-border pb-4">
              <h3 className="text-xl sm:text-2xl font-bold text-text tracking-tight">
                Start a Conversation
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-text-muted leading-relaxed">
                Fill out the form below to connect directly with Piyush. Messages are delivered to the primary inbox.
              </p>
            </div>

            <ContactForm />
          </div>

          {/* Right Column (45%): Aligned Contact Information Cards */}
          <div className="space-y-3.5">
            {/* Card 1 — Primary Email */}
            <div className="border border-border bg-surface p-4 sm:p-5 shadow-2xs rounded-xs">
              <div className="mono flex items-center justify-between text-[10px] text-text-muted uppercase tracking-wider mb-2">
                <span className="flex items-center gap-1.5 font-bold text-text">
                  <Mail className="h-3.5 w-3.5 text-accent" />
                  PRIMARY EMAIL
                </span>
                <span className="mono text-[9px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-700">
                  REPLY &lt; 24H
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
                <a
                  href={`mailto:${EMAIL}`}
                  className="text-sm sm:text-base font-bold text-text hover:text-accent transition-colors break-all"
                >
                  {EMAIL}
                </a>

                <button
                  type="button"
                  onClick={handleCopy}
                  className="mono inline-flex items-center gap-1.5 border border-border bg-surface-muted px-2.5 py-1 text-[10px] font-bold text-text transition-all hover:border-accent hover:text-accent cursor-pointer shadow-2xs rounded-xs"
                  aria-label="Copy primary email address"
                  title="Copy email to clipboard"
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-600" />
                      <span className="text-emerald-700">COPIED</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>COPY EMAIL</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Card 2 — Telephone */}
            <div className="border border-border bg-surface p-4 sm:p-5 shadow-2xs rounded-xs">
              <div className="mono flex items-center justify-between text-[10px] text-text-muted uppercase tracking-wider mb-2">
                <span className="flex items-center gap-1.5 font-bold text-text">
                  <PhoneIcon className="h-3.5 w-3.5 text-accent" />
                  TELEPHONE
                </span>
                <span className="mono text-[9px] text-text-muted">DIRECT LINE</span>
              </div>

              <div className="pt-1">
                <a
                  href={`tel:${PHONE.replace(/\s/g, "")}`}
                  className="text-sm sm:text-base font-bold text-text hover:text-accent transition-colors"
                >
                  {PHONE}
                </a>
              </div>
            </div>

            {/* Card 3 — LinkedIn */}
            <a
              href={LINKEDIN}
              target="_blank"
              rel="noreferrer"
              className="group block border border-border bg-surface p-4 sm:p-5 shadow-2xs rounded-xs transition-all hover:border-accent hover:-translate-y-0.5"
            >
              <div className="mono flex items-center justify-between text-[10px] text-text-muted uppercase tracking-wider mb-2">
                <span className="flex items-center gap-1.5 font-bold text-text">
                  <Linkedin className="h-3.5 w-3.5 text-accent" />
                  LINKEDIN
                </span>
                <span className="mono text-[9px] font-bold text-accent group-hover:underline">
                  CONNECT
                </span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-sm sm:text-base font-bold text-text group-hover:text-accent transition-colors">
                  linkedin.com/in/ppiyushhhh
                </span>
                <ArrowUpRight className="h-4 w-4 text-text-muted group-hover:text-accent transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shrink-0 ml-2" />
              </div>
            </a>

            {/* Card 4 — GitHub */}
            <a
              href={GITHUB}
              target="_blank"
              rel="noreferrer"
              className="group block border border-border bg-surface p-4 sm:p-5 shadow-2xs rounded-xs transition-all hover:border-accent hover:-translate-y-0.5"
            >
              <div className="mono flex items-center justify-between text-[10px] text-text-muted uppercase tracking-wider mb-2">
                <span className="flex items-center gap-1.5 font-bold text-text">
                  <Github className="h-4 w-4 text-accent" />
                  GITHUB
                </span>
                <span className="mono text-[9px] font-bold text-accent group-hover:underline">
                  REPOSITORIES
                </span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-sm sm:text-base font-bold text-text group-hover:text-accent transition-colors">
                  github.com/ppiyushhhhh
                </span>
                <ArrowUpRight className="h-4 w-4 text-text-muted group-hover:text-accent transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shrink-0 ml-2" />
              </div>
            </a>

            {/* Card 5 — Location & Timezone */}
            <div className="border border-border bg-surface p-4 sm:p-5 shadow-2xs rounded-xs">
              <div className="mono flex items-center justify-between text-[10px] text-text-muted uppercase tracking-wider mb-2">
                <span className="flex items-center gap-1.5 font-bold text-text">
                  <MapPin className="h-3.5 w-3.5 text-accent" />
                  LOCATION &amp; TIMEZONE
                </span>
                <span className="flex items-center gap-1 text-[9px] text-text-muted">
                  <Clock className="h-3 w-3 text-accent" />
                  <span>UTC +05:30</span>
                </span>
              </div>

              <div className="pt-1">
                <div className="text-sm sm:text-base font-bold text-text">
                  Navi Mumbai, Maharashtra, India
                </div>
                <div className="mono mt-1 text-[11px] text-text-muted">
                  Timezone: IST (UTC+05:30) &bull; Open to Remote &amp; Relocation
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
