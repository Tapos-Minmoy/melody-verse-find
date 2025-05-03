
import { Song } from "@/components/SongCard";

export async function fetchSongRecommendations(chatMessage: string): Promise<Song[]> {
  try {
    // This is where we'll connect to the FastAPI backend when it's deployed
    // For now, we'll use a local endpoint URL that will need to be updated
    // with the actual deployed backend URL
    const response = await fetch('/api/recommend', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ chat: chatMessage }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch recommendations: ${response.status} ${errorText}`);
    }
    
    // The backend will return an array of songs with the following structure:
    // { id, title, artist, snippet, play_url }
    const data = await response.json();
    
    // Transform the backend response to match our frontend Song interface if needed
    return data.map((item: any) => ({
      id: item.id || String(Math.random()),
      title: item.title,
      artist: item.artist,
      snippet: item.snippet,
      playUrl: item.play_url || item.playUrl
    }));
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    throw error;
  }
}
