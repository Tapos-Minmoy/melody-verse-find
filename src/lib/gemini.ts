
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
  recommendations: Array<{
    title: string;
    artist: string;
    lyrics?: string;
  }>;
}

export async function analyzeEmotionWithGemini(text: string, apiKey: string): Promise<EmotionAnalysis> {
  const prompt = `Analyze the emotional content of this text and provide song recommendations in Bangla and Hindi based on the emotions detected: "${text}"

Please respond in the following JSON format only, without any markdown formatting or code blocks:
{
  "emotion": "primary emotion (happy, sad, romantic, nostalgic, energetic, calm, etc.)",
  "intensity": number between 1-10,
  "keywords": ["relevant", "emotional", "keywords"],
  "recommendations": [
    {
      "title": "Song Title 1",
      "artist": "Artist Name 1",
      "lyrics": "First few lines of the song lyrics in original language"
    },
    {
      "title": "Song Title 2", 
      "artist": "Artist Name 2",
      "lyrics": "First few lines of the song lyrics in original language"
    }
  ]
}

Important: 
- Return only valid JSON without markdown code blocks
- Include actual lyrics (first 4-6 lines) for each song recommendation
- Keep lyrics in the original language (Bangla/Hindi)
- Provide 3-4 song recommendations with lyrics`;

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
          temperature: 0.3,
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

    console.log('Raw Gemini response:', textResponse);

    // Clean the response to extract JSON
    let cleanedResponse = textResponse;
    
    // Remove markdown code blocks if present
    cleanedResponse = cleanedResponse.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    
    // Extract JSON object
    const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in Gemini response');
    }

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Attempted to parse:', jsonMatch[0]);
      throw new Error('Invalid JSON in Gemini response');
    }

    // Normalize recommendations format
    let recommendations = [];
    if (Array.isArray(parsedResponse.recommendations)) {
      recommendations = parsedResponse.recommendations.map((rec: any) => {
        if (typeof rec === 'string') {
          // Handle old format "Song Title by Artist"
          const parts = rec.split(' by ');
          return {
            title: parts[0] || rec,
            artist: parts[1] || 'Unknown Artist',
            lyrics: undefined
          };
        } else if (typeof rec === 'object') {
          return {
            title: rec.title || rec.song || 'Unknown Title',
            artist: rec.artist || 'Unknown Artist',
            lyrics: rec.lyrics
          };
        }
        return {
          title: String(rec),
          artist: 'Unknown Artist',
          lyrics: undefined
        };
      }).slice(0, 6);
    }

    return {
      emotion: parsedResponse.emotion || 'neutral',
      intensity: Number(parsedResponse.intensity) || 5,
      keywords: Array.isArray(parsedResponse.keywords) ? parsedResponse.keywords : [],
      recommendations
    };
  } catch (error) {
    console.error('Error analyzing emotion with Gemini:', error);
    throw error;
  }
}
