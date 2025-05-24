
import React, { useState } from "react";
import { toast } from "@/hooks/use-toast";
import ChatInterface from "@/components/ChatInterface";
import SongResults from "@/components/SongResults";
import ApiKeyInput from "@/components/ApiKeyInput";
import EmotionAnalysisDisplay from "@/components/EmotionAnalysisDisplay";
import LoadingState from "@/components/LoadingState";
import WelcomeScreen from "@/components/WelcomeScreen";
import { Song } from "@/components/SongCard";
import { analyzeEmotionWithGemini, EmotionAnalysis } from "@/lib/gemini";
import { emotionBasedSongs } from "@/data/emotionBasedSongs";
import { convertRecommendationsToSongs } from "@/utils/songUtils";

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
            <EmotionAnalysisDisplay emotionAnalysis={emotionAnalysis} />
          )}
        </div>
        
        <div className="flex-1 overflow-hidden">
          <ChatInterface onSendMessage={handleSendMessage} isLoading={isLoading} />
        </div>
      </div>
      
      {/* Results Section */}
      <div className="md:w-2/3 p-6 overflow-y-auto">
        {isLoading ? (
          <LoadingState />
        ) : (
          songs.length > 0 && <SongResults songs={songs} />
        )}
        
        {!isLoading && songs.length === 0 && (
          <WelcomeScreen />
        )}
      </div>
    </div>
  );
};

export default Index;
