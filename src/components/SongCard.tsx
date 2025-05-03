
import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { motion } from "framer-motion";

export interface Song {
  id: string;
  title: string;
  artist: string;
  snippet?: string;
  playUrl: string;
}

interface SongCardProps {
  song: Song;
  index: number;
}

const SongCard: React.FC<SongCardProps> = ({ song, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card className="overflow-hidden">
        <CardContent className="pt-6">
          <h3 className="text-xl font-semibold mb-1 line-clamp-1">{song.title}</h3>
          <p className="text-muted-foreground mb-3">{song.artist}</p>
          
          {song.snippet && (
            <div className="bg-muted p-3 rounded-md text-sm italic mb-3">
              "{song.snippet}"
            </div>
          )}
        </CardContent>
        
        <CardFooter className="border-t p-3 bg-muted/30">
          <Button 
            variant="outline" 
            size="sm"
            className="ml-auto"
            onClick={() => window.open(song.playUrl, "_blank")}
          >
            <Play className="mr-1 h-4 w-4" />
            Play
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default SongCard;
