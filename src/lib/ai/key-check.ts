/**
 * Checks whether required API keys are present in the environment.
 * Does not make network calls — the real API call will surface auth errors directly.
 */

export function checkGeminiKey(): { ok: boolean; reason?: string } {
  const key = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!key) return { ok: false, reason: "GOOGLE_GENERATIVE_AI_API_KEY is not set" };
  return { ok: true };
}

export function checkElevenLabsKey(): { ok: boolean; reason?: string } {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) return { ok: false, reason: "ELEVENLABS_API_KEY is not set" };
  return { ok: true };
}
