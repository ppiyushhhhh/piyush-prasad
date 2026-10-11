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

/**
 * Generates Admin Notification Email (sent to support@piyushprasad.in)
 */
export function renderAdminNotificationEmail(submission: ContactSubmission): {
  subject: string;
  html: string;
  text: string;
} {
  const safeName = escapeHtml(submission.name);
  const safeEmail = escapeHtml(submission.email);
  const safeSubject = escapeHtml(submission.subject || "Portfolio Contact Inquiry");
  const safeMessage = escapeHtml(submission.message).replace(/\n/g, "<br/>");
  const formattedDate = formatSubmissionDate(submission.created_at);

  const subject = `New Portfolio Contact: ${submission.name.trim()}`;

  const text = `New Contact Form Submission
============================
Website Source: piyushprasad.in
Reference ID: ${submission.id}
Date & Time: ${formattedDate}

Visitor Details:
----------------
Name: ${submission.name}
Email: ${submission.email}
Subject: ${submission.subject || "(No subject provided)"}

Message:
--------
${submission.message}

Reply-To is configured to: ${submission.email}
`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(subject)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FAF9F6; color: #1A1A1A; margin: 0; padding: 24px; line-height: 1.5; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #E5E5DF; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
    .header { border-bottom: 2px solid #0052FF; padding-bottom: 16px; margin-bottom: 24px; }
    .tag { display: inline-block; font-family: ui-monospace, Menlo, Consolas, monospace; font-size: 11px; background: #F0F4FF; color: #0052FF; padding: 4px 8px; border: 1px solid #D0E0FF; font-weight: 600; text-transform: uppercase; margin-bottom: 8px; }
    h1 { font-size: 20px; margin: 0; color: #1A1A1A; }
    .table-details { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 14px; }
    .table-details td { padding: 8px 12px; border-bottom: 1px solid #F0F0EB; vertical-align: top; }
    .table-details td.label { font-weight: 600; color: #666660; width: 130px; font-family: ui-monospace, Menlo, monospace; font-size: 12px; }
    .message-box { background: #FAF9F6; border: 1px solid #E5E5DF; border-left: 3px solid #0052FF; padding: 16px; margin: 20px 0; font-size: 14px; color: #1A1A1A; white-space: normal; line-height: 1.6; }
    .footer { border-top: 1px solid #E5E5DF; padding-top: 16px; font-size: 12px; color: #888880; font-family: ui-monospace, monospace; }
    .reply-btn { display: inline-block; background: #0052FF; color: #ffffff !important; text-decoration: none; padding: 10px 18px; font-size: 13px; font-weight: 600; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="tag">NEW INQUIRY // PIYUSHPRASAD.IN</div>
      <h1>New Portfolio Contact: ${safeName}</h1>
    </div>

    <table class="table-details">
      <tr>
        <td class="label">REFERENCE ID</td>
        <td style="font-family: ui-monospace, monospace; font-size: 12px;">${escapeHtml(submission.id)}</td>
      </tr>
      <tr>
        <td class="label">SENDER NAME</td>
        <td><strong>${safeName}</strong></td>
      </tr>
      <tr>
        <td class="label">EMAIL ADDRESS</td>
        <td><a href="mailto:${safeEmail}" style="color: #0052FF;">${safeEmail}</a></td>
      </tr>
      <tr>
        <td class="label">SUBJECT</td>
        <td>${safeSubject}</td>
      </tr>
      <tr>
        <td class="label">TIMESTAMP</td>
        <td style="font-family: ui-monospace, monospace; font-size: 12px;">${escapeHtml(formattedDate)}</td>
      </tr>
      <tr>
        <td class="label">SOURCE</td>
        <td><a href="${DEFAULT_SITE_URL}" style="color: #0052FF;">piyushprasad.in</a></td>
      </tr>
    </table>

    <div style="font-weight: 600; font-size: 13px; color: #666660; font-family: ui-monospace, monospace;">MESSAGE CONTENT:</div>
    <div class="message-box">
      ${safeMessage}
    </div>

    <div style="margin-top: 24px;">
      <a href="mailto:${safeEmail}?subject=Re:%20${encodeURIComponent(submission.subject || "Your Inquiry to Piyush Prasad")}" class="reply-btn">Reply to ${safeName}</a>
    </div>

    <div class="footer" style="margin-top: 32px;">
      Sent automatically by the Portfolio Contact Engine. Direct reply goes to ${safeEmail}.
    </div>
  </div>
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

/**
 * Universal server-side email dispatcher.
 * Supports Resend API (HTTP) as primary provider, with SMTP/Nodemailer fallback.
 */
export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  const fromAddress =
    options.from || process.env.CONTACT_FROM_EMAIL || `"Piyush Prasad" <${DEFAULT_SUPPORT_EMAIL}>`;

  // 1. Primary Provider: Resend (via REST API)
  const resendApiKey = process.env.RESEND_API_KEY?.trim();
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
  const smtpHost = process.env.SMTP_HOST?.trim();
  const smtpUser = process.env.SMTP_USER?.trim();
  const smtpPass = process.env.SMTP_PASS?.trim();
  const smtpPort = parseInt(process.env.SMTP_PORT || "465", 10);

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
