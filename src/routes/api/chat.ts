import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { generateReply, type ChatMessage } from "@/lib/gemini.server";
import { checkRateLimit, getClientKey } from "@/lib/rate-limit.server";

const MAX_MESSAGE_LENGTH = 1000;
const MAX_HISTORY = 12;

const RequestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1).max(MAX_MESSAGE_LENGTH),
      }),
    )
    .min(1)
    .max(40),
});

function json(body: unknown, status: number, headers?: Record<string, string>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...headers },
  });
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let payload: unknown;
        try {
          payload = await request.json();
        } catch {
          return json({ error: "Invalid request." }, 400);
        }

        const parsed = RequestSchema.safeParse(payload);
        if (!parsed.success) {
          return json({ error: "Invalid request." }, 400);
        }

        const limit = checkRateLimit(getClientKey(request));
        if (!limit.allowed) {
          return json(
            { error: "You've reached the chat limit for now. Please try again later." },
            429,
            { "retry-after": String(limit.retryAfter) },
          );
        }

        // Keep only the most recent turns to control token usage.
        const messages: ChatMessage[] = parsed.data.messages.slice(-MAX_HISTORY);
        if (messages[0]?.role !== "user") messages.shift();
        if (messages.length === 0) return json({ error: "Invalid request." }, 400);

        const result = await generateReply(messages);
        if (!result.ok) {
          return json({ error: result.message }, result.status);
        }

        return json({ reply: result.text }, 200);
      },
    },
  },
});
