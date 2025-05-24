
import { Song } from "@/components/SongCard";

export const convertRecommendationsToSongs = (recommendations: Array<{title: string; artist: string; lyrics?: string}>): Song[] => {
  return recommendations.map((rec, index) => {
    // Clean up title and artist
    const title = rec.title.replace(/^["']|["']$/g, ''); // Remove quotes
    const artist = rec.artist.replace(/^["']|["']$/g, ''); // Remove quotes
    
    // Generate a YouTube search URL
    const searchQuery = encodeURIComponent(`${title} ${artist}`);
    const playUrl = `https://www.youtube.com/results?search_query=${searchQuery}`;

    return {
      id: `gemini-${Date.now()}-${index}`,
      title,
      artist,
      snippet: `Recommended based on your emotional state`,
      playUrl,
      lyrics: rec.lyrics
    };
  });
};
