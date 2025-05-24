
import React, { useState } from "react";
import { toast } from "@/hooks/use-toast";
import ChatInterface from "@/components/ChatInterface";
import SongResults from "@/components/SongResults";
import ApiKeyInput from "@/components/ApiKeyInput";
import { Song } from "@/components/SongCard";
import { analyzeEmotionWithGemini, EmotionAnalysis } from "@/lib/gemini";

// Enhanced mock songs based on emotions
const emotionBasedSongs: Record<string, Song[]> = {
  sad: [
    {
      id: "1",
      title: "Tum Hi Ho",
      artist: "Arijit Singh",
      snippet: "तुम ही हो, तुम ही हो, तेरे बिन मैं कुछ भी नहीं हूँ",
      playUrl: "https://www.youtube.com/watch?v=Umqb9KENgmk"
    },
    {
      id: "2", 
      title: "Boba Tunnel",
      artist: "Anupam Roy",
      snippet: "বোবা টানেল, বড় একা লাগে",
      playUrl: "https://www.youtube.com/watch?v=0MrCh-gBPkE"
    }
  ],
  happy: [
    {
      id: "3",
      title: "Gerua",
      artist: "Arijit Singh", 
      snippet: "ओ खुदा मिलने दे उनको मेरी दुआ तू सुन ले",
      playUrl: "https://www.youtube.com/watch?v=AEIVhBS6baE"
    },
    {
      id: "4",
      title: "Tomake Chai",
      artist: "Arijit Singh",
      snippet: "তোমাকে চাই, তোমাকে চাই, আর কিছুই নাই",
      playUrl: "https://www.youtube.com/watch?v=example"
    }
  ],
  romantic: [
    {
      id: "5",
      title: "Raabta",
      artist: "Arijit Singh",
      snippet: "इक मुलाक़ात कहो या कहो नजर का मिलना",
      playUrl: "https://www.youtube.com/watch?v=zAU_rsoS5ok"
    },
    {
      id: "6",
      title: "Ami Tomake",
      artist: "Arijit Singh",
      snippet: "আমি তোমাকে ভালোবাসি, চিরদিন তোমার থাকব পাশে",
      playUrl: "https://www.youtube.com/watch?v=6JrQYV8apbU"
    }
  ]
};

const Index = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState<string>("");
  const [emotionAnalysis, setEmotionAnalysis] = useState<EmotionAnalysis | null>(null);

  const handleApiKeySet = (newApiKey: string) => {
    setApiKey(newApiKey);
    localStorage.setItem('gemini_api_key', newApiKey);
    toast({
      title: "API Key Set",
      description: "Gemini API key has been configured successfully.",
    });
  };

  React.useEffect(() => {
    const savedApiKey = localStorage.getItem('gemini_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  // Helper function to convert Gemini recommendations to Song objects
  const convertRecommendationsToSongs = (recommendations: string[]): Song[] => {
    return recommendations.map((rec, index) => {
      // Try to parse "Song Title by Artist" format
      const parts = rec.split(' by ');
      const title = parts[0] || rec;
      const artist = parts[1] || 'Unknown Artist';
      
      // Generate a YouTube search URL
      const searchQuery = encodeURIComponent(`${title} ${artist}`);
      const playUrl = `https://www.youtube.com/results?search_query=${searchQuery}`;

      return {
        id: `gemini-${Date.now()}-${index}`,
        title: title.replace(/^["']|["']$/g, ''), // Remove quotes
        artist: artist.replace(/^["']|["']$/g, ''), // Remove quotes
        snippet: `Recommended based on your emotional state`,
        playUrl
      };
    });
  };

  const handleSendMessage = async (message: string) => {
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please set your Gemini API key to analyze emotions and get recommendations.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Analyze emotion with Gemini
      const analysis = await analyzeEmotionWithGemini(message, apiKey);
      setEmotionAnalysis(analysis);
      
      console.log('Emotion analysis result:', analysis);
      
      // Convert Gemini recommendations to Song objects
      let recommendedSongs: Song[] = [];
      
      if (analysis.recommendations && analysis.recommendations.length > 0) {
        recommendedSongs = convertRecommendationsToSongs(analysis.recommendations);
      } else {
        // Fallback to mock data if no recommendations
        const emotion = analysis.emotion.toLowerCase();
        if (emotionBasedSongs[emotion]) {
          recommendedSongs = emotionBasedSongs[emotion];
        } else {
          // Default fallback
          recommendedSongs = Object.values(emotionBasedSongs).flat().slice(0, 4);
        }
      }

      setSongs(recommendedSongs);
      
      toast({
        title: "Emotion Analysis Complete",
        description: `Detected emotion: ${analysis.emotion} (${analysis.intensity}/10)`,
      });
    } catch (error) {
      console.error('Error analyzing emotion:', error);
      toast({
        title: "Error",
        description: "Failed to analyze emotion. Please check your API key and try again.",
        variant: "destructive",
      });
      
      // Show fallback songs on error
      setSongs(Object.values(emotionBasedSongs).flat().slice(0, 4));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Chat Section */}
      <div className="md:w-1/3 flex flex-col h-[70vh] md:h-screen md:border-r">
        <div className="p-4 border-b bg-card">
          <h1 className="text-2xl font-bold">MelodyVerse</h1>
          <p className="text-sm text-muted-foreground">AI-powered emotion-based music discovery</p>
        </div>
        
        <div className="p-4 border-b">
          <ApiKeyInput onApiKeySet={handleApiKeySet} currentApiKey={apiKey} />
          
          {emotionAnalysis && (
            <div className="bg-muted p-3 rounded-md">
              <h3 className="font-medium text-sm mb-1">Emotion Analysis</h3>
              <p className="text-sm">
                <span className="font-medium">{emotionAnalysis.emotion}</span> 
                <span className="text-muted-foreground"> ({emotionAnalysis.intensity}/10)</span>
              </p>
              {emotionAnalysis.keywords.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-muted-foreground">Keywords:</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {emotionAnalysis.keywords.map((keyword, index) => (
                      <span key={index} className="bg-primary/10 text-xs px-2 py-1 rounded">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="flex-1 overflow-hidden">
          <ChatInterface onSendMessage={handleSendMessage} isLoading={isLoading} />
        </div>
      </div>
      
      {/* Results Section */}
      <div className="md:w-2/3 p-6 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Analyzing emotions...</p>
            </div>
          </div>
        ) : (
          songs.length > 0 && <SongResults songs={songs} />
        )}
        
        {!isLoading && songs.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-lg mx-auto">
              <h2 className="text-2xl font-bold mb-2">Welcome to MelodyVerse</h2>
              <p className="text-muted-foreground mb-4">
                Share your feelings in Bangla or Hindi and get personalized music recommendations based on AI emotion analysis
              </p>
              <div className="text-sm bg-muted p-4 rounded-lg">
                <h3 className="font-medium mb-2">Example phrases you can try:</h3>
                <ul className="space-y-2 text-left">
                  <li className="bg-primary/10 p-2 rounded">आज मैं बहुत उदास हूँ और अकेला महसूस कर रहा हूँ</li>
                  <li className="bg-primary/10 p-2 rounded">আজ আমার মন খুব খুশি, কিছু আনন্দের গান শুনতে চাই</li>
                  <li className="bg-primary/10 p-2 rounded">I'm feeling nostalgic about my childhood memories</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
