import { useState } from "react";
import { Send } from "lucide-react";

// Web3Forms access keys are public client-side identifiers by design (they are
// visible in any browser request). They are NOT privileged secrets — no SMTP
// or backend credentials are used in the browser.
// Vite inlines VITE_* vars at build time; the literal is the deploy-safe fallback
// so the form keeps working even if the env var is missing on Vercel.
const ACCESS_KEY =
  (import.meta.env['VITE_WEB3FORMS_ACCESS_KEY'] as string | undefined)?.trim() ||
  "752a0c12-46b4-4eec-8ad7-e82e229e3e43";
const SUBMIT_TIMEOUT_MS = 15_000;
const MIN_MESSAGE_LENGTH = 10;
const ENDPOINT = "https://api.web3forms.com/submit";

type Fields = { name: string; email: string; subject: string; message: string };
type Errors = Partial<Record<keyof Fields, string>>;

const EMPTY: Fields = { name: "", email: "", subject: "", message: "" };

function validate(values: Fields): Errors {
  const errors: Errors = {};
  if (!values.name.trim()) errors.name = "Please enter your name.";
  if (!values.email.trim()) errors.email = "Please enter your email address.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim()))
    errors.email = "Please enter a valid email address.";
  if (!values.subject.trim()) errors.subject = "Please enter a subject.";
  if (!values.message.trim()) errors.message = "Please enter a message.";
  else if (values.message.trim().length < MIN_MESSAGE_LENGTH)
    errors.message = `Please write at least ${MIN_MESSAGE_LENGTH} characters.`;
  return errors;
}

const fieldClass =
  "mt-2 w-full border border-white/20 bg-transparent px-3 py-2.5 text-[16px] text-white placeholder-white/40 transition-colors focus:border-cobalt focus:outline-none focus-visible:ring-2 focus-visible:ring-cobalt";

export function ContactForm() {
  const [values, setValues] = useState<Fields>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  // Honeypot: real users never see or fill this field; bots usually do.
  const [botField, setBotField] = useState("");

  const set = (key: keyof Fields) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === "sending") return;

    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    // Silently accept-and-drop honeypot hits so bots get no useful signal.
    if (botField.trim() !== "") {
      setValues(EMPTY);
      setStatus("success");
      return;
    }

    if (!ACCESS_KEY) {
      console.error("[ContactForm] Missing Web3Forms access key (VITE_WEB3FORMS_ACCESS_KEY).");
      setErrorMessage("The contact form isn't configured yet. Please email me directly.");
      setStatus("error");
      return;
    }

    setStatus("sending");
    setErrorMessage("");
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), SUBMIT_TIMEOUT_MS);
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: ACCESS_KEY,
          from_name: "Portfolio Contact Form",
          subject: values.subject.trim(),
          name: values.name.trim(),
          email: values.email.trim(),
          message: values.message.trim(),
          replyto: values.email.trim(),
        }),
      });

      const raw = await res.text();
      let data: { success?: boolean; message?: string } = {};
      try {
        data = JSON.parse(raw) as { success?: boolean; message?: string };
      } catch {
        // Non-JSON response — keep the raw text for the console log below.
      }
      console.log("[ContactForm] Web3Forms response", { status: res.status, body: data.message ? data : raw });

      if (!res.ok || !data.success) {
        setErrorMessage(
          data.message
            ? `Couldn't send your message: ${data.message}`
            : "Something went wrong sending your message. Please try again, or email me directly.",
        );
        setStatus("error");
        return;
      }

      setValues(EMPTY);
      setStatus("success");
      setTimeout(() => setStatus((s) => (s === "success" ? "idle" : s)), 8000);
    } catch (err) {
      const aborted = err instanceof DOMException && err.name === "AbortError";
      console.error("[ContactForm] Submission failed", err);
      setErrorMessage(
        aborted
          ? "The request timed out. Please check your connection and try again."
          : "Network error — your message couldn't be sent. Please try again, or email me directly.",
      );
      setStatus("error");
    } finally {
      clearTimeout(timer);
    }
  };

  const sending = status === "sending";

  return (
    <form onSubmit={onSubmit} noValidate className="relative mt-12 max-w-[560px]">
      <div className="mono text-cobalt text-[10px]">SEND A MESSAGE</div>

      <div className="mt-6 space-y-5">
        <div>
          <label htmlFor="cf-name" className="mono block text-[10px] text-white/70">
            FULL NAME
          </label>
          <input
            id="cf-name"
            name="name"
            type="text"
            autoComplete="name"
            value={values.name}
            onChange={set("name")}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "cf-name-error" : undefined}
            className={fieldClass}
            placeholder="Your name"
          />
          {errors.name && (
            <p id="cf-name-error" className="mt-1.5 text-[13px] text-red-300">
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="cf-email" className="mono block text-[10px] text-white/70">
            EMAIL ADDRESS
          </label>
          <input
            id="cf-email"
            name="email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={set("email")}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "cf-email-error" : undefined}
            className={fieldClass}
            placeholder="you@example.com"
          />
          {errors.email && (
            <p id="cf-email-error" className="mt-1.5 text-[13px] text-red-300">
              {errors.email}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="cf-subject" className="mono block text-[10px] text-white/70">
            SUBJECT
          </label>
          <input
            id="cf-subject"
            name="subject"
            type="text"
            autoComplete="off"
            value={values.subject}
            onChange={set("subject")}
            aria-invalid={!!errors.subject}
            aria-describedby={errors.subject ? "cf-subject-error" : undefined}
            className={fieldClass}
            placeholder="What is this about?"
          />
          {errors.subject && (
            <p id="cf-subject-error" className="mt-1.5 text-[13px] text-red-300">
              {errors.subject}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="cf-message" className="mono block text-[10px] text-white/70">
            MESSAGE
          </label>
          <textarea
            id="cf-message"
            name="message"
            rows={5}
            value={values.message}
            onChange={set("message")}
            aria-invalid={!!errors.message}
            aria-describedby={errors.message ? "cf-message-error" : undefined}
            className={fieldClass}
            placeholder="Tell me a bit about the role or project."
          />
          {errors.message && (
            <p id="cf-message-error" className="mt-1.5 text-[13px] text-red-300">
              {errors.message}
            </p>
          )}
        </div>
      </div>

      {/* Honeypot — hidden from users and assistive tech, attractive to bots. */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="cf-company">Company (leave this field empty)</label>
        <input
          id="cf-company"
          name="botcheck"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={botField}
          onChange={(e) => setBotField(e.target.value)}
        />
      </div>

      <button
        type="submit"
        disabled={sending}
        className="mono mt-8 inline-flex items-center gap-2 bg-cobalt px-5 py-3 text-[11px] text-white transition-colors hover:bg-white hover:text-carbon focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt focus-visible:ring-offset-2 focus-visible:ring-offset-carbon disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Send className="h-3.5 w-3.5" />
        {sending ? "SENDING..." : "SEND MESSAGE"}
      </button>

      <p aria-live="polite" className="mt-4 text-[15px]">
        {status === "success" && (
          <span className="text-cobalt">
            Thank you for contacting me. Your message has been sent successfully.
          </span>
        )}
        {status === "error" && (
          <span className="text-red-300">
            Something went wrong sending your message. Please try again, or email me directly.
          </span>
        )}
      </p>
    </form>
  );
}
