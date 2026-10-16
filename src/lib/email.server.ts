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
 * Formatted exactly in the iconic Google Workspace transactional notification layout.
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

  const subject = `New Portfolio Contact: ${submission.name.trim()}`;

  const text = `New Contact Form Submission
===================================================

Hello Piyush,

You have received a new contact message submitted via your portfolio website (piyushprasad.in).

Account information
-------------------
Customer: ${submission.name.trim()}
Customer ID: ${submission.id}
Email: ${submission.email.trim()}
Subject: ${submission.subject?.trim() || "Portfolio Contact Inquiry"}
Date: ${formattedDate}

Message:
--------
${submission.message}

If you have any questions, please reply directly to this email.

Sincerely,
The Google Workspace Team
`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin: 0; padding: 40px 16px; background-color: #F8F9FA; font-family: 'Google Sans', Roboto, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; color: #202124; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center">
        
        <!-- Top Google Workspace Header Logo -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
          <tr>
            <td valign="middle" align="center">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td valign="middle">
                    <img src="https://www.gstatic.com/images/branding/googlelogo/2x/googlelogo_color_74x24dp.png" width="74" height="24" alt="Google" style="display: block; border: 0;" />
                  </td>
                  <td valign="middle" style="padding-left: 6px; font-family: 'Google Sans', Roboto, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; font-size: 20px; font-weight: 400; color: #5F6368; line-height: 24px; letter-spacing: -0.2px;">
                    Workspace
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- Main White Card Container -->
        <table role="presentation" width="100%" style="max-width: 580px; background-color: #FFFFFF; border: 1px solid #DADCE0; border-radius: 8px; overflow: hidden;" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="padding: 40px 36px 36px 36px; text-align: left;">

              <!-- Email Main Headline -->
              <h1 style="margin: 0 0 24px 0; font-family: 'Google Sans', Roboto, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; font-size: 24px; line-height: 1.33; font-weight: 500; color: #202124;">
                New contact form submission
              </h1>

              <!-- Greeting -->
              <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.5; color: #3C4043;">
                Hello,
              </p>

              <!-- Intro Paragraph -->
              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.5; color: #3C4043;">
                You have received a new contact inquiry from your portfolio website (<a href="${DEFAULT_SITE_URL}" style="color: #1A73E8; text-decoration: none;">piyushprasad.in</a>). All submitted details are provided below.
              </p>

              <!-- Account / Contact Information Gray Box -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F1F3F4; border-radius: 4px; margin: 24px 0;">
                <tr>
                  <td style="padding: 24px 28px;">
                    
                    <!-- Section Title Centered -->
                    <div style="font-family: 'Google Sans', Roboto, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; font-size: 14px; font-weight: 700; color: #202124; text-align: center; margin-bottom: 20px;">
                      Account information
                    </div>

                    <!-- Customer / Sender -->
                    <div style="margin-bottom: 16px;">
                      <div style="font-size: 13px; font-weight: 700; color: #202124; margin-bottom: 3px;">Customer:</div>
                      <div style="font-size: 14px; color: #3C4043;">
                        ${safeName} &lt;<a href="mailto:${safeEmail}" style="color: #1A73E8; text-decoration: none;">${safeEmail}</a>&gt;
                      </div>
                    </div>

                    <!-- Customer ID / Reference ID -->
                    <div style="margin-bottom: 16px;">
                      <div style="font-size: 13px; font-weight: 700; color: #202124; margin-bottom: 3px;">Customer ID:</div>
                      <div style="font-size: 13px; color: #3C4043; font-family: ui-monospace, Menlo, Consolas, monospace;">${escapeHtml(submission.id)}</div>
                    </div>

                    <!-- Subject -->
                    <div style="margin-bottom: 16px;">
                      <div style="font-size: 13px; font-weight: 700; color: #202124; margin-bottom: 3px;">Subject:</div>
                      <div style="font-size: 14px; color: #3C4043;">${safeSubject}</div>
                    </div>

                    <!-- Date & Time -->
                    <div style="margin-bottom: 16px;">
                      <div style="font-size: 13px; font-weight: 700; color: #202124; margin-bottom: 3px;">Date:</div>
                      <div style="font-size: 14px; color: #3C4043;">${escapeHtml(formattedDate)}</div>
                    </div>

                    <!-- Message Body Box -->
                    <div style="margin-bottom: 4px;">
                      <div style="font-size: 13px; font-weight: 700; color: #202124; margin-bottom: 6px;">Message:</div>
                      <div style="background-color: #FFFFFF; border: 1px solid #DADCE0; border-radius: 4px; padding: 14px 16px; font-size: 14px; line-height: 1.6; color: #202124; white-space: pre-wrap; word-break: break-word;">${safeMessage}</div>
                    </div>

                  </td>
                </tr>
              </table>

              <!-- Help / Direct Reply Text -->
              <p style="margin: 24px 0 20px 0; font-size: 14px; line-height: 1.5; color: #3C4043;">
                If you have any questions, please contact our support team or <a href="mailto:${safeEmail}?subject=Re:%20${encodeURIComponent(submission.subject || "Your Inquiry to Piyush Prasad")}" style="color: #1A73E8; text-decoration: none;">reply directly to this email</a>.
              </p>

              <!-- Primary Action Button (Google Blue) -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 28px 0;">
                <tr>
                  <td>
                    <a href="mailto:${safeEmail}?subject=Re:%20${encodeURIComponent(submission.subject || "Your Inquiry to Piyush Prasad")}" style="display: inline-block; background-color: #1A73E8; color: #FFFFFF; font-family: 'Google Sans', Roboto, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; font-size: 14px; font-weight: 500; text-decoration: none; padding: 10px 24px; border-radius: 4px; box-shadow: 0 1px 2px rgba(60,64,67,0.3);">
                      Reply to ${safeName}
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Sincerely Sign-off -->
              <div style="font-size: 14px; line-height: 1.5; color: #3C4043; margin-top: 24px;">
                Sincerely,<br>
                <strong style="color: #202124; font-weight: 500;">The Google Workspace Team</strong>
              </div>

            </td>
          </tr>
        </table>

        <!-- External Footer (Outside Card) -->
        <table role="presentation" width="100%" style="max-width: 580px; margin-top: 24px;" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td align="center">
              
              <!-- Bottom Google Workspace Logo -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 12px;">
                <tr>
                  <td valign="middle">
                    <img src="https://www.gstatic.com/images/branding/googlelogo/2x/googlelogo_color_74x24dp.png" width="60" height="19" alt="Google" style="display: block; border: 0;" />
                  </td>
                  <td valign="middle" style="padding-left: 5px; font-family: 'Google Sans', Roboto, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; font-size: 16px; font-weight: 400; color: #5F6368; line-height: 19px;">
                    Workspace
                  </td>
                </tr>
              </table>

              <!-- Copyright Line -->
              <div style="font-size: 11px; line-height: 1.5; color: #5F6368; margin-bottom: 6px;">
                &copy; 2026 Google LLC &bull; Piyush Prasad &bull; <a href="${DEFAULT_SITE_URL}" style="color: #1A73E8; text-decoration: none;">piyushprasad.in</a>
              </div>

              <!-- Mandatory Announcement Line -->
              <div style="font-size: 11px; line-height: 1.5; color: #5F6368; max-width: 480px; margin: 0 auto;">
                You're receiving this mandatory email service announcement to update you about new incoming contact messages from your Google Workspace product or portfolio account.
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
 * (sent to the visitor from support@piyushprasad.in)
 * Formatted in the iconic Google Workspace transactional notification layout.
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

  const text = `Hi ${submission.name.trim()},

Thank you for reaching out through my portfolio website.

Your message has been successfully received. I appreciate you taking the time to contact me and will review your inquiry and get back to you as soon as possible.

Account information
-------------------
Customer: ${submission.name.trim()}
Customer ID: ${submission.id}
Subject: ${submission.subject ? submission.subject.trim() : "General Inquiry"}
Date: ${formattedDate}

If you have any questions, please contact our support team.

Sincerely,
The Google Workspace Team
`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin: 0; padding: 40px 16px; background-color: #F8F9FA; font-family: 'Google Sans', Roboto, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; color: #202124; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center">
        
        <!-- Top Google Workspace Header Logo -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
          <tr>
            <td valign="middle" align="center">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td valign="middle">
                    <img src="https://www.gstatic.com/images/branding/googlelogo/2x/googlelogo_color_74x24dp.png" width="74" height="24" alt="Google" style="display: block; border: 0;" />
                  </td>
                  <td valign="middle" style="padding-left: 6px; font-family: 'Google Sans', Roboto, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; font-size: 20px; font-weight: 400; color: #5F6368; line-height: 24px; letter-spacing: -0.2px;">
                    Workspace
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- Main White Card Container -->
        <table role="presentation" width="100%" style="max-width: 580px; background-color: #FFFFFF; border: 1px solid #DADCE0; border-radius: 8px; overflow: hidden;" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="padding: 40px 36px 36px 36px; text-align: left;">

              <!-- Email Main Headline -->
              <h1 style="margin: 0 0 24px 0; font-family: 'Google Sans', Roboto, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; font-size: 24px; line-height: 1.33; font-weight: 500; color: #202124;">
                We received your message
              </h1>

              <!-- Greeting -->
              <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.5; color: #3C4043;">
                Hello ${safeName},
              </p>

              <!-- Intro Paragraph -->
              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.5; color: #3C4043;">
                Thank you for reaching out through my portfolio website (<a href="${DEFAULT_SITE_URL}" style="color: #1A73E8; text-decoration: none;">piyushprasad.in</a>). Your message has been successfully received. I appreciate you taking the time to contact me and will review your inquiry and get back to you as soon as possible.
              </p>

              <!-- Account / Submission Information Gray Box -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F1F3F4; border-radius: 4px; margin: 24px 0;">
                <tr>
                  <td style="padding: 24px 28px;">
                    
                    <!-- Section Title Centered -->
                    <div style="font-family: 'Google Sans', Roboto, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; font-size: 14px; font-weight: 700; color: #202124; text-align: center; margin-bottom: 20px;">
                      Account information
                    </div>

                    <!-- Customer -->
                    <div style="margin-bottom: 16px;">
                      <div style="font-size: 13px; font-weight: 700; color: #202124; margin-bottom: 3px;">Customer:</div>
                      <div style="font-size: 14px; color: #3C4043;">${safeName}</div>
                    </div>

                    <!-- Customer ID -->
                    <div style="margin-bottom: 16px;">
                      <div style="font-size: 13px; font-weight: 700; color: #202124; margin-bottom: 3px;">Customer ID:</div>
                      <div style="font-size: 13px; color: #3C4043; font-family: ui-monospace, Menlo, Consolas, monospace;">${escapeHtml(submission.id)}</div>
                    </div>

                    <!-- Subject -->
                    <div style="margin-bottom: 16px;">
                      <div style="font-size: 13px; font-weight: 700; color: #202124; margin-bottom: 3px;">Subject:</div>
                      <div style="font-size: 14px; color: #3C4043;">${safeSubject}</div>
                    </div>

                    <!-- Date & Time -->
                    <div style="margin-bottom: 4px;">
                      <div style="font-size: 13px; font-weight: 700; color: #202124; margin-bottom: 3px;">Date:</div>
                      <div style="font-size: 14px; color: #3C4043;">${escapeHtml(formattedDate)}</div>
                    </div>

                  </td>
                </tr>
              </table>

              <!-- Help / Support Text -->
              <p style="margin: 24px 0 24px 0; font-size: 14px; line-height: 1.5; color: #3C4043;">
                If you have any questions or need to provide additional details, please contact our support team by replying directly to this email.
              </p>

              <!-- Sincerely Sign-off -->
              <div style="font-size: 14px; line-height: 1.5; color: #3C4043; margin-top: 24px;">
                Sincerely,<br>
                <strong style="color: #202124; font-weight: 500;">The Google Workspace Team</strong>
              </div>

            </td>
          </tr>
        </table>

        <!-- External Footer (Outside Card) -->
        <table role="presentation" width="100%" style="max-width: 580px; margin-top: 24px;" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td align="center">
              
              <!-- Bottom Google Workspace Logo -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 12px;">
                <tr>
                  <td valign="middle">
                    <img src="https://www.gstatic.com/images/branding/googlelogo/2x/googlelogo_color_74x24dp.png" width="60" height="19" alt="Google" style="display: block; border: 0;" />
                  </td>
                  <td valign="middle" style="padding-left: 5px; font-family: 'Google Sans', Roboto, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; font-size: 16px; font-weight: 400; color: #5F6368; line-height: 19px;">
                    Workspace
                  </td>
                </tr>
              </table>

              <!-- Copyright Line -->
              <div style="font-size: 11px; line-height: 1.5; color: #5F6368; margin-bottom: 6px;">
                &copy; 2026 Google LLC &bull; Piyush Prasad &bull; <a href="${DEFAULT_SITE_URL}" style="color: #1A73E8; text-decoration: none;">piyushprasad.in</a>
              </div>

              <!-- Mandatory Announcement Line -->
              <div style="font-size: 11px; line-height: 1.5; color: #5F6368; max-width: 480px; margin: 0 auto;">
                You're receiving this mandatory email service announcement to update you about important changes to your Google Workspace product or account.
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
