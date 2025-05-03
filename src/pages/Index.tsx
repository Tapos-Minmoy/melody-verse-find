
import React, { useState } from "react";
import { toast } from "@/hooks/use-toast";
import ChatInterface from "@/components/ChatInterface";
import SongResults from "@/components/SongResults";
import { Song } from "@/components/SongCard";

// Mock data for development - will be replaced with actual API calls
const mockSongs: Song[] = [
  {
    id: "1",
    title: "Tum Hi Ho",
    artist: "Arijit Singh",
    snippet: "तुम ही हो, तुम ही हो, तेरे बिन मैं कुछ भी नहीं हूँ",
    playUrl: "https://www.youtube.com/watch?v=Umqb9KENgmk"
  },
  {
    id: "2",
    title: "Ami Tomake",
    artist: "Arijit Singh",
    snippet: "আমি তোমাকে ভালোবাসি, চিরদিন তোমার থাকব পাশে",
    playUrl: "https://www.youtube.com/watch?v=6JrQYV8apbU"
  },
  {
    id: "3",
    title: "Raabta",
    artist: "Arijit Singh",
    snippet: "इक मुलाक़ात कहो या कहो नजर का मिलना",
    playUrl: "https://www.youtube.com/watch?v=zAU_rsoS5ok"
  },
  {
    id: "4",
    title: "Boba Tunnel",
    artist: "Anupam Roy",
    snippet: "বোবা টানেল, বড় একা লাগে",
    playUrl: "https://www.youtube.com/watch?v=0MrCh-gBPkE"
  },
  {
    id: "5",
    title: "Gerua",
    artist: "Arijit Singh",
    snippet: "ओ खुदा मिलने दे उनको मेरी दुआ तू सुन ले",
    playUrl: "https://www.youtube.com/watch?v=AEIVhBS6baE"
  }
];

const Index = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // This function will be replaced with actual API call
  const handleSendMessage = async (message: string) => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For now, just use our mock data
      setSongs(mockSongs);
      
      // Once we have an actual backend:
      // const response = await fetch('/api/recommend', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ chat: message }),
      // });
      // 
      // if (!response.ok) throw new Error('Failed to fetch recommendations');
      // const data = await response.json();
      // setSongs(data);
      
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      toast({
        title: "Error",
        description: "Failed to fetch song recommendations. Please try again.",
        variant: "destructive",
      });
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
          <p className="text-sm text-muted-foreground">Discover songs in Bangla and Hindi</p>
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
              <p className="mt-2 text-muted-foreground">Searching for songs...</p>
            </div>
          </div>
        ) : (
          songs.length > 0 && <SongResults songs={songs} />
        )}
        
        {!isLoading && songs.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Welcome to MelodyVerse</h2>
              <p className="text-muted-foreground">
                Ask about a song, mood, or lyrics in Bangla or Hindi to get recommendations
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
