
import React from "react";
import SongCard, { Song } from "./SongCard";

interface SongResultsProps {
  songs: Song[];
}

const SongResults: React.FC<SongResultsProps> = ({ songs }) => {
  if (songs.length === 0) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">Recommended Songs</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {songs.map((song, index) => (
          <SongCard key={song.id} song={song} index={index} />
        ))}
      </div>
    </div>
  );
};

export default SongResults;
