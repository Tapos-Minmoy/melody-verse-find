interface LyricsOvhResponse {
  lyrics?: string;
  error?: string;
}

interface LrclibResult {
  id: number;
  trackName: string;
  artistName: string;
  plainLyrics: string | null;
  syncedLyrics: string | null;
}

export async function fetchLyrics(artist: string, title: string): Promise<string | null> {
  // Try Lyrics.ovh first
  try {
    const encodedArtist = encodeURIComponent(artist);
    const encodedTitle = encodeURIComponent(title);
    const response = await fetch(`https://api.lyrics.ovh/v1/${encodedArtist}/${encodedTitle}`);

    if (response.ok) {
      const data: LyricsOvhResponse = await response.json();
      if (data.lyrics && data.lyrics.trim().length > 0) {
        return cleanLyrics(data.lyrics);
      }
    }
  } catch (error) {
    console.warn("Lyrics.ovh failed, trying lrclib:", error);
  }

  // Fallback to lrclib.net
  try {
    const params = new URLSearchParams({
      artist_name: artist,
      track_name: title,
    });
    const response = await fetch(`https://lrclib.net/api/search?${params}`);

    if (response.ok) {
      const results: LrclibResult[] = await response.json();
      if (results.length > 0) {
        const best = results.find((r) => r.plainLyrics) ?? results[0];
        const lyrics = best.plainLyrics ?? stripSyncTags(best.syncedLyrics ?? "");
        if (lyrics.trim().length > 0) return cleanLyrics(lyrics);
      }
    }
  } catch (error) {
    console.warn("lrclib.net also failed:", error);
  }

  return null;
}

function cleanLyrics(lyrics: string): string {
  return lyrics
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function stripSyncTags(syncedLyrics: string): string {
  // Remove timestamps like [00:12.34]
  return syncedLyrics.replace(/\[\d{2}:\d{2}\.\d{2,3}\]/g, "").trim();
}
