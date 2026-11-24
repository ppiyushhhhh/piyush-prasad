import { useState } from "react";
import { Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

const SUBMIT_TIMEOUT_MS = 20_000;
const MIN_MESSAGE_LENGTH = 10;
const ENDPOINT = "/api/contact";

type Fields = { name: string; email: string; subject: string; message: string };
type Errors = Partial<Record<keyof Fields, string>>;

const EMPTY: Fields = { name: "", email: "", subject: "", message: "" };

function validate(values: Fields): Errors {
  const errors: Errors = {};
  if (!values.name.trim()) {
    errors.name = "Please enter your full name.";
  }
  if (!values.email.trim()) {
    errors.email = "Please enter your email address.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }
  if (!values.subject.trim()) {
    errors.subject = "Please enter a subject.";
  }
  if (!values.message.trim()) {
    errors.message = "Please write a message.";
  } else if (values.message.trim().length < MIN_MESSAGE_LENGTH) {
    errors.message = `Please write at least ${MIN_MESSAGE_LENGTH} characters.`;
  }
  return errors;
}

const inputClasses =
  "w-full border border-border bg-surface px-3.5 py-2.5 text-sm text-text placeholder:text-text-muted/60 transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent rounded-xs shadow-2xs";

export function ContactForm() {
  const [values, setValues] = useState<Fields>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
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

    setStatus("sending");
    setErrorMessage("");
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), SUBMIT_TIMEOUT_MS);

    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: values.name.trim(),
          email: values.email.trim(),
          subject: values.subject.trim(),
          message: values.message.trim(),
          botcheck: botField.trim(),
        }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        message?: string;
        error?: string;
      };

      if (!res.ok || !data.success) {
        const errorText =
          data.error ||
          "Sorry, we couldn't deliver your message right now. Please try again in a moment.";
        setErrorMessage(errorText);
        setStatus("error");
        return;
      }

      // Reset form upon confirmed backend delivery
      setValues(EMPTY);
      setBotField("");
      setStatus("success");
      setTimeout(() => setStatus((s) => (s === "success" ? "idle" : s)), 10000);
    } catch (err) {
      const aborted = err instanceof DOMException && err.name === "AbortError";
      console.error("[ContactForm] Submission failed:", err);
      setErrorMessage(
        aborted
          ? "The request timed out. Please check your connection and try again."
          : "Sorry, we couldn't deliver your message right now. Please try again in a moment.",
      );
      setStatus("error");
    } finally {
      clearTimeout(timer);
    }
  };

  const sending = status === "sending";

  return (
    <form onSubmit={onSubmit} noValidate className="relative mt-6 space-y-4">
      {/* Full Name */}
      <div>
        <label
          htmlFor="cf-name"
          className="mono block text-[11px] font-semibold text-text uppercase tracking-wider mb-1.5"
        >
          Full Name <span className="text-rose-500 font-bold">*</span>
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
          className={`${inputClasses} ${errors.name ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500" : ""}`}
          placeholder="e.g. Alex Morgan"
        />
        {errors.name && (
          <p id="cf-name-error" className="mt-1 text-xs text-rose-600 font-medium">
            {errors.name}
          </p>
        )}
      </div>

      {/* Email Address */}
      <div>
        <label
          htmlFor="cf-email"
          className="mono block text-[11px] font-semibold text-text uppercase tracking-wider mb-1.5"
        >
          Email Address <span className="text-rose-500 font-bold">*</span>
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
          className={`${inputClasses} ${errors.email ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500" : ""}`}
          placeholder="e.g. alex@company.com"
        />
        {errors.email && (
          <p id="cf-email-error" className="mt-1 text-xs text-rose-600 font-medium">
            {errors.email}
          </p>
        )}
      </div>

      {/* Subject */}
      <div>
        <label
          htmlFor="cf-subject"
          className="mono block text-[11px] font-semibold text-text uppercase tracking-wider mb-1.5"
        >
          Subject <span className="text-rose-500 font-bold">*</span>
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
          className={`${inputClasses} ${errors.subject ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500" : ""}`}
          placeholder="e.g. Cloud Infrastructure / DevOps Role"
        />
        {errors.subject && (
          <p id="cf-subject-error" className="mt-1 text-xs text-rose-600 font-medium">
            {errors.subject}
          </p>
        )}
      </div>

      {/* Message */}
      <div>
        <label
          htmlFor="cf-message"
          className="mono block text-[11px] font-semibold text-text uppercase tracking-wider mb-1.5"
        >
          Message <span className="text-rose-500 font-bold">*</span>
        </label>
        <textarea
          id="cf-message"
          name="message"
          rows={4}
          value={values.message}
          onChange={set("message")}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? "cf-message-error" : undefined}
          className={`${inputClasses} resize-y min-h-[96px] ${errors.message ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500" : ""}`}
          placeholder="Tell me about your project scope, team requirements, or role details."
        />
        {errors.message && (
          <p id="cf-message-error" className="mt-1 text-xs text-rose-600 font-medium">
            {errors.message}
          </p>
        )}
      </div>

      {/* Honeypot field for bot prevention */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="cf-company">Company</label>
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

      {/* Submit Button */}
      <button
        type="submit"
        disabled={sending}
        className="mono mt-2 w-full inline-flex items-center justify-center gap-2 bg-accent px-6 py-3.5 text-xs font-bold tracking-wider text-text-on-accent transition-all hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-60 shadow-2xs cursor-pointer rounded-xs"
      >
        {sending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>SENDING MESSAGE…</span>
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            <span>SEND MESSAGE</span>
          </>
        )}
      </button>

      {/* Inline Feedback Alert */}
      <div aria-live="polite">
        {status === "success" && (
          <div className="flex items-start gap-2.5 text-emerald-900 bg-emerald-50 border border-emerald-300 p-3.5 text-xs rounded-xs shadow-2xs">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Thank you for reaching out!</strong> Your message has been delivered directly to Piyush&apos;s primary inbox (piyush@piyushprasad.in). I will review it and reply shortly.
            </div>
          </div>
        )}
        {status === "error" && (
          <div className="flex items-start gap-2.5 text-rose-900 bg-rose-50 border border-rose-300 p-3.5 text-xs rounded-xs shadow-2xs">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              {errorMessage ||
                "Sorry, we couldn't deliver your message right now. Please try again or email directly at piyush@piyushprasad.in."}
            </div>
          </div>
        )}
      </div>
    </form>
  );
}
