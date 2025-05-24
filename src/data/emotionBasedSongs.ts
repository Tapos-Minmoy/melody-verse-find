
import { Song } from "@/components/SongCard";

export const emotionBasedSongs: Record<string, Song[]> = {
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
