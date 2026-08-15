/**
 * Server-only Gemini client. The API key is read from the server environment
 * inside the call and is never returned, logged, or sent to the browser.
 */
import { SYSTEM_INSTRUCTION } from "./portfolio-knowledge.server";

export type ChatRole = "user" | "assistant";
export type ChatMessage = { role: ChatRole; content: string };

const DEFAULT_MODEL = "gemini-3.6-flash";
const REQUEST_TIMEOUT_MS = 30_000;
const MAX_RETRIES = 2;

export type GeminiResult =
  | { ok: true; text: string }
  | { ok: false; status: number; message: string };

const SAFE_ERROR = "Sorry, the AI assistant is temporarily unavailable. Please try again.";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function generateReply(messages: ChatMessage[]): Promise<GeminiResult> {
  const apiKey = process.env["GEMINI_API_KEY"];
  if (!apiKey) {
    console.error("[chat] GEMINI_API_KEY is not configured on the server");
    return { ok: false, status: 503, message: SAFE_ERROR };
  }

  const model = process.env["GEMINI_MODEL"] || DEFAULT_MODEL;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model,
  )}:generateContent`;

  const body = {
    systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
    contents: messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    })),
    generationConfig: { temperature: 0.3, maxOutputTokens: 1024 },
  };

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json", "x-goog-api-key": apiKey },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (response.ok) {
        const data = (await response.json()) as {
          candidates?: { content?: { parts?: { text?: string }[] } }[];
        };
        const text = (data.candidates?.[0]?.content?.parts ?? [])
          .map((p) => p.text ?? "")
          .join("")
          .trim();
        if (!text) {
          console.error("[chat] Gemini returned an empty or malformed response");
          return { ok: false, status: 502, message: SAFE_ERROR };
        }
        return { ok: true, text };
      }

      // Permanent client errors: do not retry.
      if (response.status === 400 || response.status === 401 || response.status === 403) {
        console.error(`[chat] Gemini rejected the request (status ${response.status})`);
        return { ok: false, status: 502, message: SAFE_ERROR };
      }

      // 429 and 5xx: retry with backoff.
      console.error(`[chat] Gemini transient failure (status ${response.status})`);
      if (attempt === MAX_RETRIES) {
        return {
          ok: false,
          status: response.status === 429 ? 429 : 503,
          message:
            response.status === 429
              ? "The AI assistant is busy right now. Please try again in a moment."
              : SAFE_ERROR,
        };
      }
      await sleep(500 * 2 ** attempt);
    } catch (error) {
      const aborted = error instanceof Error && error.name === "AbortError";
      console.error(`[chat] Gemini request failed${aborted ? " (timeout)" : ""}`);
      if (attempt === MAX_RETRIES) return { ok: false, status: 504, message: SAFE_ERROR };
      await sleep(500 * 2 ** attempt);
    } finally {
      clearTimeout(timer);
    }
  }

  return { ok: false, status: 503, message: SAFE_ERROR };
}
