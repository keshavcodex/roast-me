import { GoogleGenAI, Modality,ThinkingLevel } from "@google/genai";
import { NextResponse } from "next/server";
import { ANONYMOUS_USER_COOKIE, resolveAnonymousUserId } from "@/lib/anonymous-user";
import { saveRoastRecord } from "@/lib/db";
import type { AudioSessionRequest } from "@/types/live";

export const runtime = "nodejs";

const ROAST_AUDIO_CONTEXT = `You are Roast Me, an extremely savage but ultimately motivating close friend.
Your job is to roast the user's excuse in 1–3 short, natural sentences.
Be brutally sarcastic, witty, conversational, and specific to the excuse. Attack only the excuse, never a protected or personal characteristic.
If the user writes Hinglish, reply in natural Hinglish. Never give generic motivational quotes, therapist language, or an explanation of the joke.
Use ruthless, sarcastic tough love: make the excuse sound embarrassingly flimsy, then end with a pointed, concrete push to act in the same sarcastic voice.
Sound confident, playful, amused, and slightly mocking—not angry, robotic, corporate, or overly dramatic.
Return only the roast, with no labels or quotation marks.`;

function isValidRequest(value: unknown): value is Required<AudioSessionRequest> {
  if (typeof value !== "object" || value === null) return false;
  const body = value as AudioSessionRequest;
  return typeof body.message === "string" && body.message.trim().length > 0
    && body.message.trim().length <= 600
    && Number.isInteger(body.intensity) && body.intensity >= 1 && body.intensity <= 5;
}

function isPersistRequest(value: unknown): value is { kind: "persist"; message: string; response: string; intensity: number } {
  if (typeof value !== "object" || value === null) return false;
  const body = value as Record<string, unknown>;
  const intensity = body.intensity;

  return body.kind === "persist"
    && typeof body.message === "string"
    && body.message.trim().length > 0
    && body.message.trim().length <= 600
    && typeof body.response === "string"
    && body.response.trim().length > 0
    && typeof intensity === "number"
    && Number.isInteger(intensity)
    && intensity >= 1
    && intensity <= 5;
}

export async function POST(request: Request) {
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "That excuse arrived in pieces." }, { status: 400 }); }

  if (isPersistRequest(body)) {
    const { userId } = resolveAnonymousUserId(request.headers.get("cookie"));
    const response = NextResponse.json({ ok: true });
    response.cookies.set(ANONYMOUS_USER_COOKIE, userId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365 * 2,
    });

    try {
      await saveRoastRecord({
        userId,
        request: body.message,
        response: body.response.trim(),
      });
    } catch (error) {
      console.warn("Audio roast text persistence failed.", error);
    }

    return response;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_AUDIO_MODEL;
  if (!apiKey) return NextResponse.json({ error: "Audio roast engine is not configured." }, { status: 503 });
  if (!model) return NextResponse.json({ error: "GEMINI_AUDIO_MODEL is required for audio roasts." }, { status: 503 });
  if (!isValidRequest(body)) return NextResponse.json({ error: "Give me a valid excuse and intensity." }, { status: 400 });

  try {
    const client = new GoogleGenAI({ apiKey, httpOptions: { apiVersion: "v1alpha" } });
    const token = await client.authTokens.create({
      config: {
        uses: 1,
        expireTime: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
        newSessionExpireTime: new Date(Date.now() + 60 * 1000).toISOString(),
        liveConnectConstraints: {
          model,
          config: {
            responseModalities: [Modality.AUDIO],
            outputAudioTranscription: {},
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } } },
            thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
            systemInstruction: { parts: [{ text: ROAST_AUDIO_CONTEXT }] },
          },
        },
      },
    });
    if (!token.name) return NextResponse.json({ error: "Could not prepare the audio session." }, { status: 502 });
    return NextResponse.json({ token: token.name, model });
  } catch {
    return NextResponse.json({ error: "Gemini could not start an audio session. Check GEMINI_AUDIO_MODEL and your API key." }, { status: 502 });
  }
}
