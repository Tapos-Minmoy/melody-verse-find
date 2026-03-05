import React, { useRef, useState, useEffect } from "react";
import { Play, Pause, Volume2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface AudioPreviewProps {
  previewUrl: string;
  title?: string;
  author?: string;
}

const AudioPreview: React.FC<AudioPreviewProps> = ({ previewUrl, title = "preview", author = "" }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setProgress(audio.currentTime);
    const onLoaded = () => setDuration(audio.duration);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = value[0];
    setProgress(value[0]);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const handleDownload = async () => {
    try {
      const res  = await fetch(previewUrl);
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `${title}${author ? ` - ${author}` : ""} (preview).m4a`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      window.open(previewUrl, "_blank");
    }
  };

  return (
    <div className="flex items-center gap-1.5 w-full bg-muted/40 rounded-lg px-2 py-1.5">
      <audio ref={audioRef} src={previewUrl} preload="metadata" />
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 shrink-0"
        onClick={togglePlay}
        title={isPlaying ? "Pause" : "Play 30s preview"}
      >
        {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
      </Button>
      <Slider
        value={[progress]}
        min={0}
        max={duration || 30}
        step={0.1}
        onValueChange={handleSeek}
        className="flex-1"
      />
      <span className="text-xs text-muted-foreground shrink-0 flex items-center gap-1">
        <Volume2 className="h-3 w-3" />
        {duration ? formatTime(duration) : "0:30"}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 shrink-0"
        onClick={handleDownload}
        title="Download audio preview"
      >
        <Download className="h-3 w-3" />
      </Button>
    </div>
  );
};

export default AudioPreview;
