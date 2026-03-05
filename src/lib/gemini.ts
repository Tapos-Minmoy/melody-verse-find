interface GeminiResponse {
  candidates: Array<{
    content: { parts: Array<{ text: string }> };
  }>;
}

export interface SuggestedSong {
  title: string;
  artist: string;
  language: string;
  suggestedLine: string;
}

export interface EmotionAnalysis {
  emotion: string;
  intensity: number;
  keywords: string[];
  context: string;
  suggestedSongs: SuggestedSong[];
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

  const prompt = `You are a romantic music curator. Read this conversation between two people and suggest 3 real songs that perfectly capture the emotional moment.

Conversation:
"""
${conversation}
"""

${languageInstruction}

For each song, also provide the single most powerful 1–2 line(s) from its actual lyrics that would resonate with this moment — something a person could copy and send in chat.

Respond ONLY with valid JSON (no markdown, no code blocks):
{
  "emotion": "relational emotion (e.g. longing, playful flirting, deep love, missing someone, making up after a fight, confessing feelings)",
  "intensity": <1-10>,
  "keywords": ["2-4 keywords"],
  "context": "one sentence describing the emotional moment",
  "suggestedSongs": [
    {
      "title": "exact song title",
      "artist": "exact artist name",
      "language": "Hindi | Bangla | English",
      "suggestedLine": "actual memorable lyric line from this song in its original language"
    }
  ]
}

Rules:
- Only suggest REAL, well-known songs that exist
- suggestedLine must be actual lyrics from the song, not made up
- Return exactly 3 songs`;

  return parseAnalysis(await callGemini(prompt, apiKey));
}

// ── Single Gemini call: mood mode ─────────────────────────────────────────────

export async function analyzeMoodWithGemini(
  text: string,
  apiKey: string
): Promise<EmotionAnalysis> {
  const prompt = `You are a music curator. Analyse this message and suggest 3 real songs in Hindi or Bangla (or English if the message is in English) that match the mood.

Message: "${text}"

For each song, include the most memorable 1–2 lines from its actual lyrics.

Respond ONLY with valid JSON (no markdown, no code blocks):
{
  "emotion": "primary emotion (happy, sad, romantic, nostalgic, energetic, calm, etc.)",
  "intensity": <1-10>,
  "keywords": ["2-4 keywords"],
  "context": "brief description of the mood",
  "suggestedSongs": [
    {
      "title": "exact song title",
      "artist": "exact artist name",
      "language": "Hindi | Bangla | English",
      "suggestedLine": "actual memorable lyric line from this song"
    }
  ]
}

Rules:
- Only suggest REAL, well-known songs
- suggestedLine must be actual lyrics, not invented
- Return exactly 3 songs`;

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
      ? (json.suggestedSongs as Array<Record<string, string>>).slice(0, 3).map((s) => ({
          title: s.title ?? "Unknown",
          artist: s.artist ?? "Unknown",
          language: s.language ?? "Unknown",
          suggestedLine: s.suggestedLine ?? "",
        }))
      : [],
  };
}

async function callGemini(prompt: string, apiKey: string): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
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
    throw new Error(detail);
  }

  const data: GeminiResponse = await res.json();
  const text = data.candidates[0]?.content?.parts[0]?.text;
  if (!text) throw new Error("Empty response from Gemini");
  return text;
}

function extractJson(text: string): Record<string, unknown> {
  const cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "");
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON in Gemini response");
  return JSON.parse(match[0]);
}
