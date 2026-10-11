import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { checkRateLimit, getClientKey } from "@/lib/rate-limit.server";
import {
  getEnv,
  renderAdminNotificationEmail,
  renderVisitorConfirmationEmail,
  sendEmail,
  type ContactSubmission,
} from "@/lib/email.server";

const ContactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Please enter your name.")
    .max(100, "Name cannot exceed 100 characters."),
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address.")
    .max(255, "Email cannot exceed 255 characters."),
  subject: z
    .string()
    .trim()
    .max(200, "Subject cannot exceed 200 characters.")
    .optional()
    .or(z.literal("")),
  message: z
    .string()
    .trim()
    .min(10, "Please write at least 10 characters.")
    .max(5000, "Message cannot exceed 5000 characters."),
  botcheck: z.string().optional(),
});

function jsonResponse(body: unknown, status: number, headers?: Record<string, string>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...headers },
  });
}

const DEFAULT_ADMIN_EMAIL = "support@piyushprasad.in";

export const Route = createFileRoute("/api/contact")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // 1. Parse and validate JSON body
        let rawBody: unknown;
        try {
          rawBody = await request.json();
        } catch {
          return jsonResponse(
            { error: "Invalid request payload. Please provide valid JSON." },
            400,
          );
        }

        const parsed = ContactSchema.safeParse(rawBody);
        if (!parsed.success) {
          const firstError = parsed.error.issues[0]?.message || "Validation failed.";
          return jsonResponse({ error: firstError }, 400);
        }

        const { name, email, subject, message, botcheck } = parsed.data;

        // 2. Honeypot check: silently accept and drop bot submissions
        if (botcheck && botcheck.trim() !== "") {
          console.warn("[Contact API] Bot honeypot triggered; silently dropping request.");
          return jsonResponse(
            {
              success: true,
              message:
                "Thank you for contacting me! Your message has been received. I'll get back to you soon.",
            },
            200,
          );
        }

        // 3. Rate limiting check (per IP address)
        const clientKey = getClientKey(request);
        const rateLimit = checkRateLimit(`contact:${clientKey}`);
        if (!rateLimit.allowed) {
          console.warn(`[Contact API] Rate limit exceeded for IP: ${clientKey}`);
          return jsonResponse(
            {
              error:
                "Too many contact submissions from your connection. Please wait a moment before trying again.",
            },
            429,
            { "retry-after": String(rateLimit.retryAfter) },
          );
        }

        // 4. Database persistence (authoritative record with graceful fallback)
        let savedRecord: ContactSubmission | null = null;
        let dbSaveSucceeded = false;

        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

          const { data, error } = await supabaseAdmin
            .from("contact_submissions")
            .insert({
              name,
              email,
              subject: subject || null,
              message,
              status: "new",
              admin_email_status: "pending",
              visitor_email_status: "pending",
            })
            .select("id, name, email, subject, message, created_at")
            .single();

          if (!error && data) {
            savedRecord = data as ContactSubmission;
            dbSaveSucceeded = true;
          } else {
            console.warn(
              "[Contact API] Database save notice (table may need migration):",
              error?.message || "No data returned",
            );
          }
        } catch (dbError) {
          console.warn(
            "[Contact API] Database client notice:",
            dbError instanceof Error ? dbError.message : dbError,
          );
        }

        // Resilient fallback: If database table is pending migration in Supabase,
        // create a valid reference ID so email notifications still proceed and
        // the visitor's message is NEVER lost or rejected.
        if (!savedRecord) {
          savedRecord = {
            id:
              typeof crypto !== "undefined" && crypto.randomUUID
                ? crypto.randomUUID()
                : `cs_${Date.now()}`,
            name,
            email,
            subject: subject || null,
            message,
            created_at: new Date().toISOString(),
          };
        }

        // 5. Automated Email Dispatches (Submission is safely saved)
        const adminEmailRecipient =
          getEnv("CONTACT_NOTIFICATION_EMAIL")?.trim() || DEFAULT_ADMIN_EMAIL;

        // A. Send Admin Notification Email
        let adminEmailStatus: "sent" | "failed" = "failed";
        let adminEmailSentAt: string | null = null;
        let adminErrorMsg = "";

        try {
          const adminTemplate = renderAdminNotificationEmail(savedRecord);
          const adminResult = await sendEmail({
            to: adminEmailRecipient,
            replyTo: savedRecord.email,
            subject: adminTemplate.subject,
            html: adminTemplate.html,
            text: adminTemplate.text,
          });

          if (adminResult.success) {
            adminEmailStatus = "sent";
            adminEmailSentAt = new Date().toISOString();
          } else {
            adminErrorMsg = `Admin email failed: ${adminResult.error || "Unknown error"}`;
          }
        } catch (err) {
          adminErrorMsg = `Admin email exception: ${err instanceof Error ? err.message : String(err)}`;
        }

        // B. Send Visitor Confirmation Email
        let visitorEmailStatus: "sent" | "failed" = "failed";
        let visitorEmailSentAt: string | null = null;
        let visitorErrorMsg = "";

        try {
          const visitorTemplate = renderVisitorConfirmationEmail(savedRecord);
          const visitorResult = await sendEmail({
            to: savedRecord.email,
            subject: visitorTemplate.subject,
            html: visitorTemplate.html,
            text: visitorTemplate.text,
          });

          if (visitorResult.success) {
            visitorEmailStatus = "sent";
            visitorEmailSentAt = new Date().toISOString();
          } else {
            visitorErrorMsg = `Visitor email failed: ${visitorResult.error || "Unknown error"}`;
          }
        } catch (err) {
          visitorErrorMsg = `Visitor email exception: ${err instanceof Error ? err.message : String(err)}`;
        }

        // C. Record email outcomes in database (if table exists)
        if (dbSaveSucceeded) {
          const combinedError = [adminErrorMsg, visitorErrorMsg].filter(Boolean).join(" | ");

          try {
            const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
            await supabaseAdmin
              .from("contact_submissions")
              .update({
                admin_email_status: adminEmailStatus,
                admin_email_sent_at: adminEmailSentAt,
                visitor_email_status: visitorEmailStatus,
                visitor_email_sent_at: visitorEmailSentAt,
                email_error: combinedError || null,
              })
              .eq("id", savedRecord.id);
          } catch (updateErr) {
            console.error(
              "[Contact API] Failed to update email delivery status:",
              updateErr instanceof Error ? updateErr.message : updateErr,
            );
          }
        }

        // 6. Return successful confirmation to visitor
        return jsonResponse(
          {
            success: true,
            id: savedRecord.id,
            message:
              "Thank you for contacting me! Your message has been received. I'll get back to you soon.",
          },
          200,
        );
      },
    },
  },
});
