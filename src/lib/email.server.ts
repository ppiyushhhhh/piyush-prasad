import nodemailer from "nodemailer";
import { isStaging } from "./staging.guard";

export type ContactSubmission = {
  id: string;
  name: string;
  email: string;
  subject?: string | null;
  message: string;
  created_at: string;
};

export type SendEmailOptions = {
  from?: string;
  to: string;
  replyTo?: string;
  subject: string;
  html: string;
  text: string;
};

export type SendEmailResult = {
  success: boolean;
  messageId?: string;
  error?: string;
};

/**
 * Centralized Primary Notification Email.
 * All incoming contact form submissions are routed directly to this address.
 */
export const DEFAULT_NOTIFICATION_EMAIL = "piyush@piyushprasad.in";
export const DEFAULT_SENDER_EMAIL = "notification@piyushprasad.in";
export const DEFAULT_SUPPORT_EMAIL = "piyush@piyushprasad.in";
const DEFAULT_SITE_URL = "https://piyushprasad.in";

/**
 * Resolves the authoritative recipient for contact form inquiry notifications.
 * Prioritizes CONTACT_NOTIFICATION_EMAIL environment variable, defaulting strictly to hello@piyushprasad.in.
 */
export function getContactNotificationEmail(): string {
  return getEnv("CONTACT_NOTIFICATION_EMAIL")?.trim() || DEFAULT_NOTIFICATION_EMAIL;
}

/**
 * Resolves the outbound sender address configured in the email provider.
 * Independent of the notification recipient.
 */
export function getContactSenderEmail(): string {
  return getEnv("CONTACT_FROM_EMAIL")?.trim() || `"Piyush Prasad" <${DEFAULT_SENDER_EMAIL}>`;
}

/**
 * Sanitizes error messages to prevent leaking API keys, secrets, or bearer tokens.
 */
export function sanitizeEmailError(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err);
  return raw
    .replace(/re_[a-zA-Z0-9_-]+/g, "[REDACTED_RESEND_KEY]")
    .replace(/Bearer\s+[a-zA-Z0-9._-]+/gi, "Bearer [REDACTED_TOKEN]")
    .replace(/key-[a-zA-Z0-9]+/g, "[REDACTED_API_KEY]")
    .replace(/password[:=]\s*\S+/gi, "password=[REDACTED]");
}

/**
 * Escapes user-controlled text to prevent HTML injection in emails.
 */
export function escapeHtml(input: string | null | undefined): string {
  if (!input) return "";
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Formats ISO timestamps into readable UTC string.
 */
export function formatSubmissionDate(isoDate: string): string {
  try {
    const d = new Date(isoDate);
    return isNaN(d.getTime()) ? isoDate : d.toUTCString();
  } catch {
    return isoDate;
  }
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "IN";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Generates Admin Notification Email (sent to hello@piyushprasad.in)
 * Premium, minimal, modern personal portfolio notification layout.
 */
export function renderAdminNotificationEmail(submission: ContactSubmission): {
  subject: string;
  html: string;
  text: string;
} {
  const safeName = escapeHtml(submission.name.trim());
  const safeEmail = escapeHtml(submission.email.trim());
  const safeSubject = escapeHtml(submission.subject?.trim() || "Portfolio Contact Inquiry");
  const safeMessage = escapeHtml(submission.message).replace(/\n/g, "<br/>");
  const formattedDate = formatSubmissionDate(submission.created_at);

  const subject = `New Message Received: ${submission.name.trim()}`;

  const text = `New Message Received
===================================================

You have received a new message through your portfolio website. Here are the details of the inquiry.

From: ${submission.name.trim()}
Email: ${submission.email.trim()}
Subject: ${submission.subject?.trim() || "Portfolio Contact Inquiry"}
Received: ${formattedDate}

Message:
--------
${submission.message}

Reply to this message:
mailto:${submission.email.trim()}?subject=Re:%20${encodeURIComponent(submission.subject?.trim() || "Your Inquiry to Piyush Prasad")}

Regards,
Piyush Prasad
IT Operations | Cloud & DevOps Engineering
Website: https://piyushprasad.in
Email: hello@piyushprasad.in
`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin: 0; padding: 40px 16px; background-color: #F8F9FA; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1F2937; -webkit-font-smoothing: antialiased; line-height: 1.5;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center">
        
        <!-- Top Portfolio Header -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
          <tr>
            <td valign="middle" align="center">
              <a href="${DEFAULT_SITE_URL}" style="text-decoration: none; display: inline-block;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td valign="middle">
                      <img src="${DEFAULT_SITE_URL}/pp-logo.png" width="36" height="36" alt="Piyush Prasad Logo" style="display: block; border: 0; border-radius: 6px;" />
                    </td>
                    <td valign="middle" style="padding-left: 12px; text-align: left;">
                      <div style="font-size: 18px; font-weight: 700; color: #111827; line-height: 1.2;">
                        Piyush Prasad
                      </div>
                      <div style="font-size: 12px; font-weight: 500; color: #6B7280; line-height: 1.2; margin-top: 2px;">
                        Portfolio Contact Notification
                      </div>
                    </td>
                  </tr>
                </table>
              </a>
            </td>
          </tr>
        </table>

        <!-- Main Card Container -->
        <table role="presentation" width="100%" style="max-width: 580px; background-color: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); overflow: hidden;" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="padding: 36px 32px; text-align: left;">

              <!-- Main Heading -->
              <h1 style="margin: 0 0 12px 0; font-size: 22px; line-height: 1.3; font-weight: 700; color: #111827;">
                New Message Received
              </h1>

              <!-- Introduction -->
              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #4B5563;">
                You have received a new message through your portfolio website. Here are the details of the inquiry.
              </p>

              <!-- Sender Information Section Card -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px; margin: 0 0 20px 0;">
                <tr>
                  <td style="padding: 20px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td valign="top" style="padding-bottom: 12px; width: 85px; font-size: 13px; font-weight: 600; color: #6B7280;">From:</td>
                        <td valign="top" style="padding-bottom: 12px; font-size: 14px; font-weight: 600; color: #111827;">${safeName}</td>
                      </tr>
                      <tr>
                        <td valign="top" style="padding-bottom: 12px; width: 85px; font-size: 13px; font-weight: 600; color: #6B7280;">Email:</td>
                        <td valign="top" style="padding-bottom: 12px; font-size: 14px; color: #2563EB;">
                          <a href="mailto:${safeEmail}" style="color: #2563EB; text-decoration: none; font-weight: 500;">${safeEmail}</a>
                        </td>
                      </tr>
                      <tr>
                        <td valign="top" style="padding-bottom: 12px; width: 85px; font-size: 13px; font-weight: 600; color: #6B7280;">Subject:</td>
                        <td valign="top" style="padding-bottom: 12px; font-size: 14px; color: #1F2937;">${safeSubject}</td>
                      </tr>
                      <tr>
                        <td valign="top" style="width: 85px; font-size: 13px; font-weight: 600; color: #6B7280;">Received:</td>
                        <td valign="top" style="font-size: 14px; color: #4B5563;">${escapeHtml(formattedDate)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Message Section Card -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px; margin: 0 0 24px 0;">
                <tr>
                  <td style="padding: 20px;">
                    <div style="font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #6B7280; margin-bottom: 10px;">
                      Message
                    </div>
                    <div style="background-color: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 6px; padding: 16px; font-size: 14px; line-height: 1.6; color: #1F2937; white-space: pre-wrap; word-break: break-word;">${safeMessage}</div>
                  </td>
                </tr>
              </table>

              <!-- Reply Action Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 28px 0;">
                <tr>
                  <td>
                    <a href="mailto:${safeEmail}?subject=Re:%20${encodeURIComponent(submission.subject || "Your Inquiry to Piyush Prasad")}" style="display: inline-block; background-color: #2563EB; color: #FFFFFF; font-size: 14px; font-weight: 600; text-decoration: none; padding: 12px 28px; border-radius: 6px;">
                      Reply to This Message
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 24px 0;" />

              <!-- Footer Design -->
              <div style="font-size: 14px; line-height: 1.6; color: #4B5563;">
                Regards,<br>
                <strong style="color: #111827; font-weight: 600;">Piyush Prasad</strong><br>
                <span style="color: #4B5563; font-size: 13px;">IT Operations | Cloud &amp; DevOps Engineering</span><br>
                <span style="color: #6B7280; font-size: 13px;">Website: <a href="https://piyushprasad.in" style="color: #2563EB; text-decoration: none;">https://piyushprasad.in</a></span><br>
                <span style="color: #6B7280; font-size: 13px;">Email: <a href="mailto:hello@piyushprasad.in" style="color: #2563EB; text-decoration: none;">hello@piyushprasad.in</a></span>
              </div>

            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, html, text };
}

/**
 * Generates Visitor Acknowledgment Confirmation Email
 * (sent to the visitor from notification@piyushprasad.in)
 * Premium, minimal, modern personal portfolio layout.
 */
export function renderVisitorConfirmationEmail(submission: ContactSubmission): {
  subject: string;
  html: string;
  text: string;
} {
  const safeName = escapeHtml(submission.name.trim());
  const safeSubject = escapeHtml(submission.subject ? submission.subject.trim() : "General Inquiry");
  const formattedDate = formatSubmissionDate(submission.created_at);

  const subject = "We received your message | Piyush Prasad";

  const text = `Hello ${submission.name.trim()},

Thank you for contacting me through my portfolio website.

Your message has been successfully received. I appreciate you taking the time to connect with me.
I will review your inquiry and get back to you within 24 hours.

Your Message Summary
-------------------
Subject: ${submission.subject ? submission.subject.trim() : "General Inquiry"}
Submitted on: ${formattedDate}

Need to share something else?
You can reply to this email or reach me directly at:
hello@piyushprasad.in

Regards,
Piyush Prasad
Cloud & DevOps Engineering
https://piyushprasad.in
hello@piyushprasad.in

---------------------------------------------------
© 2026 Piyush Prasad. All rights reserved.
piyushprasad.in
You received this email because you submitted a message through my portfolio website.
`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin: 0; padding: 40px 16px; background-color: #F8F9FA; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1F2937; -webkit-font-smoothing: antialiased; line-height: 1.5;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center">
        
        <!-- Header: Centered Portfolio Logo & Branding -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
          <tr>
            <td valign="middle" align="center">
              <a href="${DEFAULT_SITE_URL}" style="text-decoration: none; display: inline-block;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td valign="middle">
                      <img src="${DEFAULT_SITE_URL}/pp-logo.png" width="36" height="36" alt="Piyush Prasad Logo" style="display: block; border: 0; border-radius: 6px;" />
                    </td>
                    <td valign="middle" style="padding-left: 12px; text-align: left;">
                      <div style="font-size: 18px; font-weight: 700; color: #111827; line-height: 1.2;">
                        Piyush Prasad
                      </div>
                      <div style="font-size: 12px; font-weight: 500; color: #6B7280; line-height: 1.2; margin-top: 2px;">
                        Personal Portfolio
                      </div>
                    </td>
                  </tr>
                </table>
              </a>
            </td>
          </tr>
        </table>

        <!-- Main White Card Container -->
        <table role="presentation" width="100%" style="max-width: 580px; background-color: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); overflow: hidden;" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="padding: 36px 32px; text-align: left;">

              <!-- Main Heading -->
              <h1 style="margin: 0 0 16px 0; font-size: 22px; line-height: 1.3; font-weight: 700; color: #111827;">
                Thank You for Reaching Out!
              </h1>

              <!-- Greeting -->
              <p style="margin: 0 0 16px 0; font-size: 15px; font-weight: 600; line-height: 1.5; color: #111827;">
                Hello ${safeName},
              </p>

              <!-- Intro / Body Paragraphs -->
              <p style="margin: 0 0 14px 0; font-size: 14px; line-height: 1.6; color: #4B5563;">
                Thank you for contacting me through my portfolio website.
              </p>
              <p style="margin: 0 0 14px 0; font-size: 14px; line-height: 1.6; color: #4B5563;">
                Your message has been successfully received. I appreciate you taking the time to connect with me.
              </p>
              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #4B5563;">
                I will review your inquiry and get back to you within 24 hours.
              </p>

              <!-- Message Details Card (Compact Summary) -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px; margin: 0 0 24px 0;">
                <tr>
                  <td style="padding: 18px 20px;">
                    <div style="font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #6B7280; margin-bottom: 12px;">
                      Your Message Summary
                    </div>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td valign="top" style="padding-bottom: 8px; width: 110px; font-size: 13px; font-weight: 600; color: #6B7280;">Subject:</td>
                        <td valign="top" style="padding-bottom: 8px; font-size: 14px; font-weight: 500; color: #111827;">${safeSubject}</td>
                      </tr>
                      <tr>
                        <td valign="top" style="width: 110px; font-size: 13px; font-weight: 600; color: #6B7280;">Submitted on:</td>
                        <td valign="top" style="font-size: 14px; color: #4B5563;">${escapeHtml(formattedDate)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Contact Information Section -->
              <div style="background-color: #F0F7FF; border: 1px solid #DBEAFE; border-radius: 8px; padding: 16px 20px; margin: 0 0 28px 0;">
                <div style="font-size: 13px; font-weight: 600; color: #1E40AF; margin-bottom: 4px;">
                  Need to share something else?
                </div>
                <div style="font-size: 14px; line-height: 1.5; color: #1E3A8A;">
                  You can reply to this email or reach me directly at <a href="mailto:hello@piyushprasad.in" style="color: #2563EB; font-weight: 600; text-decoration: underline;">hello@piyushprasad.in</a>.
                </div>
              </div>

              <!-- Divider -->
              <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 24px 0;" />

              <!-- Professional Signature -->
              <div style="font-size: 14px; line-height: 1.6; color: #4B5563;">
                Regards,<br>
                <strong style="color: #111827; font-weight: 600;">Piyush Prasad</strong><br>
                <span style="color: #4B5563; font-size: 13px;">Cloud &amp; DevOps Engineering</span><br>
                <span style="color: #6B7280; font-size: 13px;"><a href="https://piyushprasad.in" style="color: #2563EB; text-decoration: none;">https://piyushprasad.in</a></span><br>
                <span style="color: #6B7280; font-size: 13px;"><a href="mailto:hello@piyushprasad.in" style="color: #2563EB; text-decoration: none;">hello@piyushprasad.in</a></span>
              </div>

            </td>
          </tr>
        </table>

        <!-- External Footer (Outside Card) -->
        <table role="presentation" width="100%" style="max-width: 580px; margin-top: 24px;" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td align="center">
              <div style="font-size: 12px; line-height: 1.5; color: #6B7280; margin-bottom: 4px;">
                &copy; 2026 Piyush Prasad. All rights reserved. &bull; <a href="https://piyushprasad.in" style="color: #2563EB; text-decoration: none;">piyushprasad.in</a>
              </div>
              <div style="font-size: 12px; line-height: 1.5; color: #9CA3AF; max-width: 480px; margin: 0 auto;">
                You received this email because you submitted a message through my portfolio website.
              </div>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, html, text };
}

export function getEnv(name: string): string | undefined {
  if (typeof process !== "undefined" && process?.env) {
    if (process.env[name]) return process.env[name];
    if (process.env[`VITE_${name}`]) return process.env[`VITE_${name}`];
  }
  if (typeof globalThis !== "undefined") {
    const g = globalThis as Record<string, unknown>;
    if (typeof g[name] === "string") return g[name] as string;
    if (g.process && typeof g.process === "object") {
      const p = g.process as { env?: Record<string, string> };
      if (p.env?.[name]) return p.env[name];
      if (p.env?.[`VITE_${name}`]) return p.env[`VITE_${name}`];
    }
  }
  return undefined;
}

/**
 * Universal server-side email dispatcher.
 * Supports Resend API (HTTP) as primary provider, with SMTP/Nodemailer fallback.
 */
export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  // Staging Isolation Guard: Prevent sending live emails in staging test environment
  if (isStaging || getEnv("SKIP_EMAIL") === "1") {
    console.info(
      `[STAGING EMAIL GUARD] Intercepted email delivery in staging:\n  To: ${options.to}\n  Subject: "${options.subject}"\n  Action: Simulated delivery only (no live outbound requests).`
    );
    return {
      success: true,
      messageId: `staging-simulated-${Date.now()}`,
    };
  }

  const fromAddress =
    options.from || getContactSenderEmail();

  // 1. Primary Provider: Resend (via REST API)
  const resendApiKey = getEnv("RESEND_API_KEY")?.trim();
  if (resendApiKey) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [options.to],
          subject: options.subject,
          html: options.html,
          text: options.text,
          reply_to: options.replyTo,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        id?: string;
        message?: string;
        name?: string;
      };

      if (!response.ok) {
        const errMsg = sanitizeEmailError(data.message || `Resend HTTP error ${response.status}`);
        console.error("[Email/Resend] Delivery failed:", errMsg);
        return { success: false, error: errMsg };
      }

      return { success: true, messageId: data.id };
    } catch (err) {
      const errMsg = sanitizeEmailError(err);
      console.error("[Email/Resend] Network exception:", errMsg);
      return { success: false, error: errMsg };
    }
  }

  // 2. Secondary Provider: SMTP (via Nodemailer)
  const smtpHost = getEnv("SMTP_HOST")?.trim();
  const smtpUser = getEnv("SMTP_USER")?.trim();
  const smtpPass = getEnv("SMTP_PASS")?.trim();
  const smtpPort = parseInt(getEnv("SMTP_PORT") || "465", 10);

  if (smtpHost && smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      const info = await transporter.sendMail({
        from: fromAddress,
        to: options.to,
        replyTo: options.replyTo,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });

      return { success: true, messageId: info.messageId };
    } catch (err) {
      const errMsg = sanitizeEmailError(err);
      console.error("[Email/SMTP] Delivery failed:", errMsg);
      return { success: false, error: errMsg };
    }
  }

  // 3. Neither provider configured
  const warning =
    "No email provider configured. Please set RESEND_API_KEY (recommended) or SMTP credentials.";
  console.warn(`[Email] ${warning}`);
  return {
    success: false,
    error: warning,
  };
}

/**
 * Returns configuration diagnostic info for the email dispatch system.
 * Safe for admin dashboard rendering.
 */
export function getEmailProviderStatus() {
  const hasResend = !!getEnv("RESEND_API_KEY")?.trim();
  const hasSmtp = !!(getEnv("SMTP_HOST")?.trim() && getEnv("SMTP_USER")?.trim());
  let activeProvider: "resend" | "smtp" | "none" = "none";
  if (hasResend) activeProvider = "resend";
  else if (hasSmtp) activeProvider = "smtp";

  return {
    notificationRecipient: getContactNotificationEmail(),
    senderAddress: getContactSenderEmail(),
    activeProvider,
    hasResendKey: hasResend,
    hasSmtpConfig: hasSmtp,
    isStagingSimulated: isStaging || getEnv("SKIP_EMAIL") === "1",
  };
}
