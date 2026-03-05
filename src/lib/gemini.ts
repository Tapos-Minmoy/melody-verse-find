interface GeminiResponse {
  candidates: Array<{
    content: { parts: Array<{ text: string }> };
  }>;
}

export interface SuggestedContent {
  type: "song" | "poem";
  title: string;
  author: string;        // artist for songs, poet name for poems
  language: string;
  suggestedLine: string; // key lyric or poem excerpt to display/copy
  fullText?: string;     // full poem text (only for poems, provided by Gemini)
}

export interface EmotionAnalysis {
  emotion: string;
  intensity: number;
  keywords: string[];
  context: string;
  suggestedSongs: SuggestedContent[];
}

// ── Single Gemini call: analyse conversation + suggest songs with lines ────────

export async function analyzeConversation(
  conversation: string,
  apiKey: string,
  languageHint: string = "auto"
): Promise<EmotionAnalysis> {
  const languageInstruction =
    languageHint === "auto"
      ? "Match the song language(s) to the conversation language (Hindi, Bangla, or English)."
      : `Suggest songs primarily in ${languageHint}.`;

  const prompt = `You are a romantic content curator. Read this conversation between two people and suggest a mix of songs AND poems/kobita/shayari that capture the emotional moment.

Conversation:
"""
${conversation}
"""

${languageInstruction}

Return a mix of 2 songs and 1 poem (or 1 song and 2 poems) — whatever fits the emotion best.
For songs: provide the most powerful 1–2 lyric lines someone could copy and send in chat.
For poems/kobita/shayari: provide the full poem text (4–8 lines) and a key excerpt line.

Respond ONLY with valid JSON (no markdown, no code blocks):
{
  "emotion": "relational emotion (longing, deep love, missing someone, making up, confessing feelings, etc.)",
  "intensity": <1-10>,
  "keywords": ["2-4 keywords"],
  "context": "one sentence describing the emotional moment",
  "suggestedSongs": [
    {
      "type": "song",
      "title": "exact song title",
      "author": "exact artist name",
      "language": "Hindi | Bangla | English",
      "suggestedLine": "actual lyric line from this song in its original language",
      "fullText": null
    },
    {
      "type": "poem",
      "title": "poem or kobita title",
      "author": "poet name",
      "language": "Hindi | Bangla | English",
      "suggestedLine": "the most beautiful line from this poem",
      "fullText": "full poem text here, 4-8 lines, in original language"
    }
  ]
}

Rules:
- Songs must be REAL, well-known songs
- Poems: classic or well-known kobita/shayari/rhymes (Rabindranath, Nazrul, Gulzar, Mirza Ghalib, etc.)
- suggestedLine must be actual text, not invented
- Return exactly 3 items total (mix of songs and poems)`;

  return parseAnalysis(await callGemini(prompt, apiKey));
}

// ── Single Gemini call: mood mode ─────────────────────────────────────────────

export async function analyzeMoodWithGemini(
  text: string,
  apiKey: string
): Promise<EmotionAnalysis> {
  const prompt = `You are a romantic content curator. Analyse this message and suggest a mix of songs AND poems/kobita/shayari that match the mood.

Message: "${text}"

Return a mix — 2 songs and 1 poem, or 1 song and 2 poems — whatever fits best.
For poems/kobita/shayari: provide the full text (4–8 lines) and a key line.

Respond ONLY with valid JSON (no markdown, no code blocks):
{
  "emotion": "primary emotion (happy, sad, romantic, nostalgic, longing, calm, etc.)",
  "intensity": <1-10>,
  "keywords": ["2-4 keywords"],
  "context": "brief description of the mood",
  "suggestedSongs": [
    {
      "type": "song",
      "title": "exact song title",
      "author": "exact artist name",
      "language": "Hindi | Bangla | English",
      "suggestedLine": "actual memorable lyric line",
      "fullText": null
    },
    {
      "type": "poem",
      "title": "poem/kobita title",
      "author": "poet name (e.g. Rabindranath Tagore, Gulzar, Mirza Ghalib, Kazi Nazrul Islam)",
      "language": "Hindi | Bangla | English",
      "suggestedLine": "the most beautiful line from this poem",
      "fullText": "full poem text, 4-8 lines, in original language"
    }
  ]
}

Rules:
- Songs must be REAL and well-known
- Poems: use classic poets — Tagore, Nazrul, Gulzar, Ghalib, Jibanananda Das, etc.
- All text must be authentic, not invented
- Return exactly 3 items total`;

  return parseAnalysis(await callGemini(prompt, apiKey));
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function parseAnalysis(raw: string): EmotionAnalysis {
  const json = extractJson(raw);
  return {
    emotion: String(json.emotion ?? "romantic"),
    intensity: Number(json.intensity) || 7,
    keywords: Array.isArray(json.keywords) ? json.keywords.map(String) : [],
    context: String(json.context ?? ""),
    suggestedSongs: Array.isArray(json.suggestedSongs)
      ? (json.suggestedSongs as Array<Record<string, unknown>>).slice(0, 3).map((s) => ({
          type: (s.type === "poem" ? "poem" : "song") as "song" | "poem",
          title: String(s.title ?? "Unknown"),
          author: String(s.author ?? s.artist ?? "Unknown"),
          language: String(s.language ?? "Unknown"),
          suggestedLine: String(s.suggestedLine ?? ""),
          fullText: s.fullText ? String(s.fullText) : undefined,
        }))
      : [],
  };
}

const MODEL = "gemini-2.5-flash-lite";

async function callGemini(prompt: string, apiKey: string): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.5, maxOutputTokens: 1024 },
      }),
    }
  );

  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const errBody = await res.json();
      detail = errBody?.error?.message ?? detail;
    } catch { /* ignore */ }

    if (res.status === 429) throw new Error("QUOTA_EXCEEDED");
    if (res.status === 400 || res.status === 403) throw new Error("INVALID_KEY");
    throw new Error(detail);
  }

  const data: GeminiResponse = await res.json();
  const text = data.candidates[0]?.content?.parts[0]?.text;
  if (!text) throw new Error("Empty response from Gemini");
  return text;
}

// Validate key with a minimal call
export async function validateApiKey(
  apiKey: string
): Promise<{ ok: boolean; model?: string; error?: string }> {
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "Hi" }] }],
          generationConfig: { maxOutputTokens: 5 },
        }),
      }
    );

    if (res.ok) return { ok: true, model: MODEL };
    const errBody = await res.json().catch(() => ({}));
    const msg = errBody?.error?.message ?? `HTTP ${res.status}`;
    return { ok: false, error: msg };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Network error" };
  }
}

function extractJson(text: string): Record<string, unknown> {
  const cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "");
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON in Gemini response");
  return JSON.parse(match[0]);
}
