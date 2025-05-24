
import { Song } from "@/components/SongCard";

export const convertRecommendationsToSongs = (recommendations: string[]): Song[] => {
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
