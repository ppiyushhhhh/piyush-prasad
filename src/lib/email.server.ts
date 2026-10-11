import nodemailer from "nodemailer";

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

const DEFAULT_SUPPORT_EMAIL = "support@piyushprasad.in";
const DEFAULT_SITE_URL = "https://piyushprasad.in";

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
 * Generates Admin Notification Email (sent to support@piyushprasad.in)
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
  const initials = escapeHtml(getInitials(submission.name));

  const subject = `New Portfolio Contact: ${submission.name.trim()}`;

  const text = `New Portfolio Message from ${submission.name.trim()}
===================================================
Sender: ${submission.name.trim()} <${submission.email.trim()}>
Subject: ${submission.subject?.trim() || "Portfolio Contact Inquiry"}
Date: ${formattedDate}
Reference ID: ${submission.id}
Source: piyushprasad.in

Message:
--------
${submission.message}

Reply directly to: ${submission.email.trim()}
`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin: 0; padding: 32px 16px; background-color: #F4F4F5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #18181B; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table role="presentation" width="100%" style="max-width: 580px; background-color: #FFFFFF; border: 1px solid #E4E4E7; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);" cellpadding="0" cellspacing="0" border="0">
          
          <!-- Top Header Bar -->
          <tr>
            <td style="padding: 20px 28px; border-bottom: 1px solid #F4F4F5; background: #FAFAFA;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="background-color: #18181B; color: #FFFFFF; font-weight: 700; font-size: 11px; padding: 4px 7px; border-radius: 4px; letter-spacing: 0.5px; font-family: ui-monospace, Menlo, monospace;">PP</td>
                        <td style="padding-left: 10px; font-size: 13px; font-weight: 600; color: #18181B; letter-spacing: -0.2px;">Piyush Prasad <span style="color: #A1A1AA; font-weight: 400;">/ Dispatch</span></td>
                      </tr>
                    </table>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; font-size: 11px; font-weight: 600; color: #15803D; background-color: #ECFDF5; border: 1px solid #BBF7D0; padding: 3px 8px; border-radius: 20px; font-family: ui-monospace, Menlo, monospace;">
                      ● Direct Inquiry
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Sender Identity Block -->
          <tr>
            <td style="padding: 28px 28px 20px 28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="48" valign="top">
                    <div style="width: 44px; height: 44px; border-radius: 50%; background-color: #F4F4F5; border: 1px solid #E4E4E7; color: #18181B; font-weight: 700; font-size: 14px; text-align: center; line-height: 44px; font-family: ui-monospace, Menlo, monospace;">
                      ${initials}
                    </div>
                  </td>
                  <td style="padding-left: 14px;" valign="top">
                    <div style="font-size: 18px; font-weight: 700; color: #09090B; letter-spacing: -0.3px;">${safeName}</div>
                    <div style="font-size: 13px; color: #52525B; margin-top: 3px;">
                      <a href="mailto:${safeEmail}" style="color: #2563EB; text-decoration: none;">${safeEmail}</a>
                      <span style="color: #D4D4D8; margin: 0 6px;">&bull;</span>
                      <span style="color: #71717A; font-size: 12px;">${escapeHtml(formattedDate)}</span>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Subject Line -->
          <tr>
            <td style="padding: 0 28px 16px 28px;">
              <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 10px 14px;">
                <span style="font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase; font-family: ui-monospace, Menlo, monospace; letter-spacing: 0.5px;">Subject</span>
                <div style="font-size: 14px; font-weight: 600; color: #0F172A; margin-top: 2px;">
                  ${safeSubject}
                </div>
              </div>
            </td>
          </tr>

          <!-- Message Body (Hero Content) -->
          <tr>
            <td style="padding: 0 28px 24px 28px;">
              <div style="font-size: 11px; font-weight: 700; color: #71717A; text-transform: uppercase; font-family: ui-monospace, Menlo, monospace; letter-spacing: 0.5px; margin-bottom: 8px;">Message</div>
              <div style="background-color: #FAFAFA; border: 1px solid #E4E4E7; border-left: 3px solid #18181B; border-radius: 8px; padding: 18px 20px; font-size: 14.5px; line-height: 1.65; color: #18181B;">
                ${safeMessage}
              </div>
            </td>
          </tr>

          <!-- Action Button -->
          <tr>
            <td style="padding: 0 28px 28px 28px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <a href="mailto:${safeEmail}?subject=Re:%20${encodeURIComponent(submission.subject || "Your Inquiry to Piyush Prasad")}" style="display: inline-block; background-color: #18181B; color: #FFFFFF; font-size: 13px; font-weight: 600; text-decoration: none; padding: 11px 22px; border-radius: 6px; letter-spacing: -0.1px; box-shadow: 0 1px 2px rgba(0,0,0,0.08);">
                      Reply to ${safeName} &rarr;
                    </a>
                  </td>
                  <td style="padding-left: 12px;">
                    <a href="${DEFAULT_SITE_URL}" style="display: inline-block; background-color: #FFFFFF; color: #52525B; font-size: 13px; font-weight: 500; text-decoration: none; padding: 10px 16px; border: 1px solid #E4E4E7; border-radius: 6px;">
                      Visit Portfolio
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Telemetry Specs Footer Strip -->
          <tr>
            <td style="background-color: #FAFAFA; border-top: 1px solid #F4F4F5; padding: 16px 28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="font-size: 11px; color: #71717A; font-family: ui-monospace, Menlo, monospace;">
                    <div><strong style="color: #52525B;">REF:</strong> ${escapeHtml(submission.id)}</div>
                  </td>
                  <td align="right" style="font-size: 11px; color: #71717A; font-family: ui-monospace, Menlo, monospace;">
                    <div><strong style="color: #52525B;">SRC:</strong> piyushprasad.in</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>

        <!-- External Footer Note -->
        <table role="presentation" width="100%" style="max-width: 580px;" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="padding: 16px 8px; text-align: center; font-size: 12px; color: #71717A;">
              Sent by your portfolio contact engine. Direct replies deliver straight to <a href="mailto:${safeEmail}" style="color: #18181B; text-decoration: underline;">${safeEmail}</a>.
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
 * (sent to the visitor from support@piyushprasad.in)
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

  // Exact plain-text structure requested by specification
  const text = `Hi ${submission.name.trim()},

Thank you for reaching out through my portfolio website.

Your message has been successfully received. I appreciate you taking the time to contact me and will review your inquiry and get back to you as soon as possible.

Here are your submission details:
Reference ID: ${submission.id}
Subject: ${submission.subject ? submission.subject.trim() : "General Inquiry"}
Date: ${formattedDate}

If you need to provide additional information, you can reply to this email.

Best regards,
Piyush Prasad
Support Team
${DEFAULT_SUPPORT_EMAIL}
${DEFAULT_SITE_URL}
`;

  // Professional responsive HTML matching the exact text requirement
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(subject)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FAF9F6; color: #1A1A1A; margin: 0; padding: 24px; line-height: 1.6; }
    .container { max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid #E5E5DF; padding: 36px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
    .header { border-bottom: 2px solid #0052FF; padding-bottom: 20px; margin-bottom: 24px; }
    .brand { font-size: 16px; font-weight: 700; color: #1A1A1A; letter-spacing: -0.02em; }
    .brand-sub { font-family: ui-monospace, Menlo, monospace; font-size: 11px; color: #0052FF; text-transform: uppercase; margin-top: 4px; }
    .content { font-size: 15px; color: #2A2A28; line-height: 1.6; }
    .details-card { background: #FAF9F6; border: 1px solid #E5E5DF; padding: 20px; margin: 24px 0; }
    .details-title { font-family: ui-monospace, Menlo, monospace; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #666660; margin-bottom: 12px; letter-spacing: 0.05em; }
    .details-row { font-size: 14px; margin-bottom: 8px; }
    .details-row strong { color: #1A1A1A; display: inline-block; width: 120px; }
    .mono-value { font-family: ui-monospace, Menlo, monospace; font-size: 13px; color: #0052FF; }
    .sign-off { margin-top: 32px; border-top: 1px solid #E5E5DF; padding-top: 20px; font-size: 14px; color: #4A4A46; }
    .sign-off strong { color: #1A1A1A; }
    .footer-links { margin-top: 8px; font-size: 13px; }
    .footer-links a { color: #0052FF; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand">Piyush Prasad</div>
      <div class="brand-sub">Cloud &amp; DevOps Engineering // Message Confirmation</div>
    </div>

    <div class="content">
      <p>Hi ${safeName},</p>
      
      <p>Thank you for reaching out through my portfolio website.</p>
      
      <p>Your message has been successfully received. I appreciate you taking the time to contact me and will review your inquiry and get back to you as soon as possible.</p>

      <div class="details-card">
        <div class="details-title">Here are your submission details:</div>
        <div class="details-row"><strong>Reference ID:</strong> <span class="mono-value">${escapeHtml(submission.id)}</span></div>
        <div class="details-row"><strong>Subject:</strong> <span>${safeSubject}</span></div>
        <div class="details-row"><strong>Date:</strong> <span>${escapeHtml(formattedDate)}</span></div>
      </div>

      <p>If you need to provide additional information, you can reply directly to this email.</p>

      <div class="sign-off">
        Best regards,<br>
        <strong>Piyush Prasad</strong><br>
        Support Team<br>
        <div class="footer-links">
          <a href="mailto:${DEFAULT_SUPPORT_EMAIL}">${DEFAULT_SUPPORT_EMAIL}</a> &bull; 
          <a href="${DEFAULT_SITE_URL}">${DEFAULT_SITE_URL}</a>
        </div>
      </div>
    </div>
  </div>
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
  const fromAddress =
    options.from || getEnv("CONTACT_FROM_EMAIL") || `"Piyush Prasad" <${DEFAULT_SUPPORT_EMAIL}>`;

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
        const errMsg = data.message || `Resend HTTP error ${response.status}`;
        console.error("[Email/Resend] Delivery failed:", errMsg);
        return { success: false, error: errMsg };
      }

      return { success: true, messageId: data.id };
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
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
      const errMsg = err instanceof Error ? err.message : String(err);
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
