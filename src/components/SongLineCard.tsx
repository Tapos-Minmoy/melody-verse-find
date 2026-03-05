import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Music, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import AudioPreview from "./AudioPreview";
import { getYoutubeSearchUrl } from "@/lib/itunes";

export interface SongLineResult {
  id: string;
  title: string;
  artist: string;
  language: string;
  bestLine: string;
  reason: string;
  lyrics: string | null;
  artworkUrl: string | null;
  previewUrl: string | null;
  trackViewUrl: string | null;
}

interface SongLineCardProps {
  result: SongLineResult;
  index: number;
}

const SongLineCard: React.FC<SongLineCardProps> = ({ result, index }) => {
  const [copied, setCopied] = useState(false);
  const [copiedCredit, setCopiedCredit] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);

  const copyToClipboard = async (text: string, withCredit = false) => {
    await navigator.clipboard.writeText(text);
    if (withCredit) {
      setCopiedCredit(true);
      setTimeout(() => setCopiedCredit(false), 2000);
    } else {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
    toast({ title: "Copied!", description: "Ready to paste in your chat." });
  };

  const playUrl = result.trackViewUrl ?? getYoutubeSearchUrl(result.title, result.artist);
  const hasLine = result.bestLine.trim().length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="h-full"
    >
      <Card className="flex flex-col h-full bg-card border shadow-sm hover:shadow-md transition-shadow">
        {/* Song header */}
        <div className="flex gap-3 p-4 pb-3">
          {result.artworkUrl ? (
            <img
              src={result.artworkUrl}
              alt={result.title}
              className="w-14 h-14 rounded-lg object-cover shrink-0 shadow"
            />
          ) : (
            <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center shrink-0">
              <Music className="h-5 w-5 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1 min-w-0 pt-0.5">
            <p className="font-semibold text-sm leading-tight line-clamp-1">{result.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{result.artist}</p>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 mt-1.5 h-4">
              {result.language}
            </Badge>
          </div>
        </div>

        <CardContent className="flex-1 px-4 pb-3 pt-0 space-y-3">
          {/* The lyric line */}
          {hasLine ? (
            <div className="rounded-xl bg-primary/5 border border-primary/15 p-3.5 relative">
              <span className="absolute top-2 left-3 text-2xl leading-none text-primary/25 font-serif select-none">&ldquo;</span>
              <p className="text-sm leading-relaxed whitespace-pre-line font-medium px-4 pt-1">
                {result.bestLine}
              </p>
              <span className="absolute bottom-1 right-3 text-2xl leading-none text-primary/25 font-serif select-none">&rdquo;</span>
            </div>
          ) : (
            <div className="rounded-xl bg-muted/60 border border-dashed p-3.5 text-center">
              <p className="text-xs text-muted-foreground">Lyric line not available for this song.</p>
            </div>
          )}

          {/* 30s preview */}
          {result.previewUrl && (
            <AudioPreview previewUrl={result.previewUrl} />
          )}

          {/* Full lyrics toggle */}
          {result.lyrics && (
            <div>
              <button
                onClick={() => setShowLyrics(!showLyrics)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {showLyrics ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                {showLyrics ? "Hide full lyrics" : "Show full lyrics"}
              </button>
              {showLyrics && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-2 rounded-lg bg-muted/50 p-3 max-h-44 overflow-y-auto"
                >
                  <pre className="text-xs whitespace-pre-wrap leading-relaxed text-foreground/80">
                    {result.lyrics}
                  </pre>
                </motion.div>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="px-4 pb-3 pt-0 gap-2">
          <Button
            size="sm"
            className="flex-1 h-8 gap-1.5 text-xs"
            disabled={!hasLine}
            onClick={() => copyToClipboard(result.bestLine)}
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied!" : "Copy line"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-8 gap-1.5 text-xs"
            disabled={!hasLine}
            onClick={() => copyToClipboard(`"${result.bestLine}"\n— ${result.title}, ${result.artist}`, true)}
          >
            {copiedCredit ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copiedCredit ? "Copied!" : "With credit"}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={() => window.open(playUrl, "_blank")}
            title="Open in Apple Music or YouTube"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default SongLineCard;
