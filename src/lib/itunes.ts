export interface ItunesTrack {
  trackId: number;
  trackName: string;
  artistName: string;
  collectionName: string;
  artworkUrl100: string;
  previewUrl: string | null;
  trackViewUrl: string;
}

interface ItunesSearchResponse {
  resultCount: number;
  results: ItunesTrack[];
}

export async function searchTrack(title: string, artist: string): Promise<ItunesTrack | null> {
  const query = encodeURIComponent(`${title} ${artist}`);
  const url = `https://itunes.apple.com/search?term=${query}&entity=song&limit=5&country=IN`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`iTunes API error: ${response.status}`);

    const data: ItunesSearchResponse = await response.json();

    if (data.resultCount === 0 || data.results.length === 0) return null;

    // Prefer exact artist match, otherwise take first result
    const exact = data.results.find(
      (r) => r.artistName.toLowerCase().includes(artist.toLowerCase())
    );
    const track = exact ?? data.results[0];

    // Upgrade artwork to 600x600
    return {
      ...track,
      artworkUrl100: track.artworkUrl100.replace("100x100bb", "600x600bb"),
    };
  } catch (error) {
    console.error("iTunes search error:", error);
    return null;
  }
}

export function getYoutubeSearchUrl(title: string, artist: string): string {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(`${title} ${artist}`)}`;
}
