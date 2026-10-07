import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { SectionHeader } from "./SectionHeader";
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
  const shouldReduceMotion = useReducedMotion();

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
    <section id="contact" className="relative border-b border-border bg-[#FAF9F6] py-20 md:py-28">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <SectionHeader
          n="06"
          label="GET IN TOUCH"
          title="Let's Build Something Great"
          description="Available for Cloud, DevOps, and DevSecOps engineering roles. Open to discussing infrastructure projects, automated deployment pipelines, and observability systems."
        />

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-14">
          {/* Left Column: Contact Form */}
          <div className="border border-border bg-white p-6 sm:p-8 md:p-10 shadow-2xs lg:col-span-7">
            <h3 className="text-xl sm:text-2xl font-bold text-carbon">
              Start a Conversation
            </h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Fill out the form below to connect directly with Piyush. Messages are delivered straight to my primary inbox.
            </p>

            <ContactForm />
          </div>

          {/* Right Column: Contact Details & Channels */}
          <div className="flex flex-col justify-between space-y-8 lg:col-span-5">
            <div className="space-y-6">
              {/* Email Card */}
              <div className="border border-border bg-white p-6 shadow-2xs">
                <div className="mono flex items-center justify-between text-[10px] text-muted-foreground uppercase tracking-wider">
                  <span className="flex items-center gap-1.5 font-semibold text-carbon">
                    <Mail className="h-3.5 w-3.5 text-cobalt" />
                    PRIMARY EMAIL
                  </span>
                  <span className="text-emerald-700 font-bold">REPLY &lt; 24H</span>
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <a
                    href={`mailto:${EMAIL}`}
                    className="text-base sm:text-lg font-bold text-carbon hover:text-cobalt transition-colors break-all"
                  >
                    {EMAIL}
                  </a>

                  <button
                    type="button"
                    onClick={handleCopy}
                    className="mono inline-flex items-center gap-1.5 border border-border bg-[#FAF9F6] px-3 py-1.5 text-[10px] font-semibold text-carbon transition-colors hover:border-cobalt hover:text-cobalt"
                    aria-label="Copy email address"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-600" />
                        <span className="text-emerald-600 font-bold">COPIED</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>COPY</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Direct Channels */}
              <div className="border border-border bg-white divide-y divide-border shadow-2xs">
                {/* Phone */}
                <div className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center border border-border bg-[#FAF9F6] text-cobalt">
                      <PhoneIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="mono text-[9px] text-muted-foreground uppercase">
                        TELEPHONE
                      </div>
                      <a
                        href={`tel:${PHONE.replace(/\s/g, "")}`}
                        className="text-sm font-bold text-carbon hover:text-cobalt transition-colors"
                      >
                        {PHONE}
                      </a>
                    </div>
                  </div>
                  <span className="mono text-[10px] text-muted-foreground">IN (+91)</span>
                </div>

                {/* LinkedIn */}
                <a
                  href={LINKEDIN}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center justify-between p-5 transition-colors hover:bg-[#FAF9F6]"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center border border-border bg-[#FAF9F6] text-cobalt group-hover:border-cobalt">
                      <Linkedin className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="mono text-[9px] text-muted-foreground uppercase">
                        LINKEDIN PROFILE
                      </div>
                      <div className="text-sm font-bold text-carbon group-hover:text-cobalt transition-colors">
                        linkedin.com/in/ppiyushhhh
                      </div>
                    </div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-carbon/40 group-hover:text-cobalt transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>

                {/* GitHub */}
                <a
                  href={GITHUB}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center justify-between p-5 transition-colors hover:bg-[#FAF9F6]"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center border border-border bg-[#FAF9F6] text-cobalt group-hover:border-cobalt">
                      <Github className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="mono text-[9px] text-muted-foreground uppercase">
                        CODE REPOSITORIES
                      </div>
                      <div className="text-sm font-bold text-carbon group-hover:text-cobalt transition-colors">
                        github.com/ppiyushhhhh
                      </div>
                    </div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-carbon/40 group-hover:text-cobalt transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </div>

              {/* Location & Timezone Card */}
              <div className="border border-border bg-white p-5 shadow-2xs">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-border bg-[#FAF9F6] text-cobalt">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="mono text-[9px] text-muted-foreground uppercase">
                      LOCATION &amp; TIMEZONE
                    </div>
                    <div className="text-sm font-bold text-carbon">
                      Navi Mumbai, Maharashtra, India
                    </div>
                    <div className="mono mt-1 text-[10px] text-muted-foreground">
                      IST (UTC +05:30) &bull; Open to Remote &amp; On-site Roles
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
