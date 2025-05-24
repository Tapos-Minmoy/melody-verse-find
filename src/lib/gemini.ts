
interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

export interface EmotionAnalysis {
  emotion: string;
  intensity: number;
  keywords: string[];
  recommendations: string[];
}

export async function analyzeEmotionWithGemini(text: string, apiKey: string): Promise<EmotionAnalysis> {
  const prompt = `Analyze the emotional content of this text and provide song recommendations in Bangla and Hindi based on the emotions detected: "${text}"

Please respond in the following JSON format:
{
  "emotion": "primary emotion (happy, sad, romantic, nostalgic, energetic, calm, etc.)",
  "intensity": number between 1-10,
  "keywords": ["relevant", "emotional", "keywords"],
  "recommendations": ["specific song suggestions in Bangla and Hindi that match this emotion"]
}`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 1,
          topP: 1,
          maxOutputTokens: 2048,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data: GeminiResponse = await response.json();
    const textResponse = data.candidates[0]?.content?.parts[0]?.text;
    
    if (!textResponse) {
      throw new Error('No response from Gemini API');
    }

    // Parse the JSON response from Gemini
    const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response from Gemini');
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Error analyzing emotion with Gemini:', error);
    throw error;
  }
}
