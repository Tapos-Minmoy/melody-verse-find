
import { Song } from "@/components/SongCard";

export async function fetchSongRecommendations(chatMessage: string): Promise<Song[]> {
  // This is a placeholder that will be replaced with actual API call
  // when the backend is ready
  
  try {
    const response = await fetch('/api/recommend', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ chat: chatMessage }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch recommendations');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    throw error;
  }
}
