
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

Please respond in the following JSON format only, without any markdown formatting or code blocks:
{
  "emotion": "primary emotion (happy, sad, romantic, nostalgic, energetic, calm, etc.)",
  "intensity": number between 1-10,
  "keywords": ["relevant", "emotional", "keywords"],
  "recommendations": ["Song Title 1 by Artist 1", "Song Title 2 by Artist 2", "Song Title 3 by Artist 3"]
}

Important: 
- Return only valid JSON without markdown code blocks
- Keep recommendations as a simple array of strings
- Each recommendation should be in format "Song Title by Artist Name"`;

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
          maxOutputTokens: 1024,
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

    // Handle different response formats and normalize
    let recommendations = [];
    if (Array.isArray(parsedResponse.recommendations)) {
      recommendations = parsedResponse.recommendations;
    } else if (typeof parsedResponse.recommendations === 'object') {
      // Handle nested structure like { "Bangla": [...], "Hindi": [...] }
      const banglaRecs = parsedResponse.recommendations.Bangla || [];
      const hindiRecs = parsedResponse.recommendations.Hindi || [];
      recommendations = [...banglaRecs, ...hindiRecs];
    }

    // Clean up recommendations to ensure they're simple strings
    const cleanedRecommendations = recommendations.map((rec: any) => {
      if (typeof rec === 'string') {
        return rec;
      } else if (typeof rec === 'object' && rec.song) {
        return rec.song;
      }
      return String(rec);
    }).slice(0, 6); // Limit to 6 recommendations

    return {
      emotion: parsedResponse.emotion || 'neutral',
      intensity: Number(parsedResponse.intensity) || 5,
      keywords: Array.isArray(parsedResponse.keywords) ? parsedResponse.keywords : [],
      recommendations: cleanedRecommendations
    };
  } catch (error) {
    console.error('Error analyzing emotion with Gemini:', error);
    throw error;
  }
}
