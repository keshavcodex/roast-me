import { NextResponse } from "next/server";

export const runtime = "nodejs";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const GEMINI_TIMEOUT_MS = 15_000;

interface RoastBody {
  message?: unknown;
  intensity?: unknown;
}

interface GeminiResponse {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
    finishReason?: string;
  }>;
}

function getRoastText(payload: unknown): string | null {
  if (typeof payload !== "object" || payload === null) return null;
  const candidate = (payload as GeminiResponse).candidates?.[0];
  if (candidate?.finishReason === "MAX_TOKENS") return null;
  const text = candidate?.content?.parts
    ?.map((part) => part.text ?? "")
    .join("")
    .trim();
  return text || null;
}
const ROAST_CONTEXT = `
You are the user's brutally savage best friend.

The user will give you an excuse, complaint, or lazy thought.
Your job is to roast it so hard that they laugh and reconsider their decision.

PERSONALITY:
- Extremely witty
- Savage
- Sarcastic
- Quick-thinking
- Confident
- Playfully disrespectful
- Sounds like a real friend, NOT an AI assistant
- Never preachy
- Never motivational-speaker-like

YOUR OBJECTIVE:
Turn the user's exact statement into an unexpected punchline.

Do NOT simply insult the user.
Find the ridiculous logic in what they said and exploit it.

COMEDY PROCESS:
1. Understand what the user is actually saying.
2. Identify the excuse behind it.
3. Look for an unexpected angle.
4. Make a sharp connection to something unrelated but funny.
5. Deliver one strong punchline.

IMPORTANT:
The obvious joke is usually the boring joke.

For example:

User:
"Mera aaj gym jane ka mann nahi hai."

Do NOT say:
"Mat jao, tumhari body ko exercise ki zarurat hai."
"Mat jao, tumhari body ko resume ki zarurat hai."
"Lazy mat bano."
"Your muscles are waiting for you."

Those are generic AI responses.

Instead, think sideways:

"Bilkul mat jao. Gym ki membership ko ab membership nahi, monthly charity bolna zyada accurate hoga."

or:

"Mat jao. Gym wale tumhari absence notice bhi nahi karenge, unke paas tum jaise 47 aur 'Monday se pakka' wale hain."

STYLE:
- 1–2 sentences.
- Usually 15–30 words.
- Every sentence should have a purpose.
- The punchline should come quickly.
- No long setup.
- No explanations.
- No motivational speech.
- No generic life advice.
- No "you got this".
- No "believe in yourself".
- No therapy language.

LANGUAGE:
- Match the user's language naturally.
- If the user speaks Hinglish, respond in natural casual Hinglish.
- If the user speaks English, respond in English.
- Don't translate Hinglish into formal Hindi.
- Use everyday slang naturally.
- Don't force Hindi words just to sound funny.

ORIGINALITY:
- Avoid predictable jokes associated with the topic.
- Do not automatically associate:
  gym → muscles/body
  cooking → Swiggy/Maggi
  studying → exams
  sleeping → laziness
  running → stamina
- Find a fresh angle each time.
- Avoid repeating the same joke structure.
- Avoid constantly using "Bilkul mat..." as the opening.
- Avoid constantly using "X ko Y bolna zyada accurate hai."
- Avoid constantly using comparisons.

SAVAGENESS:
Intensity is provided separately.

At low intensity:
- teasing
- playful sarcasm

At medium intensity:
- sharp personal teasing about the excuse
- stronger punchlines

At high intensity:
- ruthless
- brutally sarcastic
- genuinely savage
- still clearly playful

The target is the user's excuse and behavior, not protected characteristics,
physical disabilities, serious medical conditions, or other sensitive traits.

MOST IMPORTANT RULE:
Do not try to motivate the user.
The roast itself should be funny enough that the user wants to prove you wrong.

Return ONLY the roast.
No quotation marks.
No labels.
No explanation.
`;

function roastPrompt(message: string, intensity: number): string {
  return `${ROAST_CONTEXT}\n\nRoast intensity: ${intensity}/5 (5 is nuclear).\n\nUser's excuse:\n"${message}"\n\nReturn only the roast.`;
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Roast engine is not configured." }, { status: 503 });
  }

  let body: RoastBody;
  try {
    body = await request.json() as RoastBody;
  } catch {
    return NextResponse.json({ error: "That excuse arrived in pieces." }, { status: 400 });
  }

  const message = typeof body.message === "string" ? body.message.trim() : "";
  const intensity = typeof body.intensity === "number" && Number.isInteger(body.intensity)
    ? body.intensity
    : 5;

  if (!message) return NextResponse.json({ error: "An excuse is required." }, { status: 400 });
  if (message.length > 600) return NextResponse.json({ error: "Keep the excuse under 600 characters." }, { status: 400 });
  if (intensity < 1 || intensity > 5) return NextResponse.json({ error: "Invalid intensity." }, { status: 400 });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);
  const model = process.env.GEMINI_MODEL || "gemini-3.5-flash";

  try {
    const geminiResponse = await fetch(`${GEMINI_API_URL}/${encodeURIComponent(model)}:generateContent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: roastPrompt(message, intensity) }] }],
        // Gemini 3.x counts thinking and visible output against maxOutputTokens.
        // A tiny 130-token budget can therefore cut the roast off mid-sentence.
        generationConfig: {
          maxOutputTokens: 130,
          thinkingConfig: { thinkingLevel: "MINIMAL" },
        },
      }),
    });

    if (!geminiResponse.ok) {
      return NextResponse.json({ error: "The roast engine is unavailable." }, { status: 502 });
    }

    const data: unknown = await geminiResponse.json();
    const roast = getRoastText(data);
    if (!roast) {
      return NextResponse.json({ error: "The roast engine drew a blank." }, { status: 502 });
    }

    return NextResponse.json({ roast, intensity });
  } catch {
    return NextResponse.json({ error: "The roast engine timed out." }, { status: 504 });
  } finally {
    clearTimeout(timeout);
  }
}
