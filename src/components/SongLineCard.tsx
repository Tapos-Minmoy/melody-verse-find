import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Copy, Check, Music, BookOpen, ExternalLink,
  ChevronDown, ChevronUp, Download,
} from "lucide-react";

import { toast } from "@/hooks/use-toast";
import AudioPreview from "./AudioPreview";
import { getYoutubeSearchUrl } from "@/lib/itunes";

export interface SongLineResult {
  id: string;
  type: "song" | "poem";
  title: string;
  author: string;
  language: string;
  bestLine: string;
  fullText: string | null;   // poem full text OR full lyrics
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
  const [showFull, setShowFull] = useState(false);

  const copyToClipboard = async (text: string, withCredit = false) => {
    await navigator.clipboard.writeText(text);
    if (withCredit) { setCopiedCredit(true); setTimeout(() => setCopiedCredit(false), 2000); }
    else             { setCopied(true);       setTimeout(() => setCopied(false), 2000); }
    toast({ title: "Copied!", description: "Ready to paste in your chat." });
  };

  const downloadPoem = () => {
    const text = `${result.title}\n— ${result.author}\n\n${result.fullText ?? result.bestLine}`;
    const blob  = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url   = URL.createObjectURL(blob);
    const a     = document.createElement("a");
    a.href      = url;
    a.download  = `${result.title} - ${result.author}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const isPoem    = result.type === "poem";
  const hasLine   = result.bestLine.trim().length > 0;
  const hasFull   = (result.fullText ?? "").trim().length > 0;
  const playUrl   = result.trackViewUrl ?? getYoutubeSearchUrl(result.title, result.author);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="h-full"
    >
      <Card className="flex flex-col h-full bg-card border shadow-sm hover:shadow-md transition-shadow">

        {/* Header */}
        <div className="flex gap-3 p-4 pb-3">
          {!isPoem && result.artworkUrl ? (
            <img
              src={result.artworkUrl}
              alt={result.title}
              className="w-14 h-14 rounded-lg object-cover shrink-0 shadow"
            />
          ) : (
            <div className={`w-14 h-14 rounded-lg flex items-center justify-center shrink-0 ${isPoem ? "bg-amber-50 dark:bg-amber-950/30" : "bg-muted"}`}>
              {isPoem
                ? <BookOpen className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                : <Music className="h-6 w-6 text-muted-foreground" />}
            </div>
          )}
          <div className="flex-1 min-w-0 pt-0.5">
            <p className="font-semibold text-sm leading-tight line-clamp-1">{result.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{result.author}</p>
            <div className="flex gap-1.5 mt-1.5 flex-wrap">
              <Badge
                variant="secondary"
                className={`text-[10px] px-1.5 py-0 h-4 ${isPoem ? "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400" : ""}`}
              >
                {isPoem ? "Poem / Kobita" : "Song"}
              </Badge>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">{result.language}</Badge>
            </div>
          </div>
        </div>

        <CardContent className="flex-1 px-4 pb-3 pt-0 space-y-3">
          {/* Key line / excerpt */}
          {hasLine ? (
            <div className={`rounded-xl p-3.5 relative border ${isPoem ? "bg-amber-50/50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800" : "bg-primary/5 border-primary/15"}`}>
              <span className="absolute top-2 left-3 text-2xl leading-none text-primary/25 font-serif select-none">&ldquo;</span>
              <p className="text-sm leading-relaxed whitespace-pre-line font-medium px-4 pt-1">
                {result.bestLine}
              </p>
              <span className="absolute bottom-1 right-3 text-2xl leading-none text-primary/25 font-serif select-none">&rdquo;</span>
            </div>
          ) : (
            <div className="rounded-xl bg-muted/60 border border-dashed p-3.5 text-center">
              <p className="text-xs text-muted-foreground">Excerpt not available.</p>
            </div>
          )}

          {/* Audio preview (songs only) */}
          {!isPoem && result.previewUrl && (
            <AudioPreview previewUrl={result.previewUrl} title={result.title} author={result.author} />
          )}
          {!isPoem && !result.previewUrl && (
            <p className="text-xs text-muted-foreground italic">No audio preview available.</p>
          )}

          {/* Full text toggle (poem full text OR song full lyrics) */}
          {hasFull && (
            <div>
              <button
                onClick={() => setShowFull(!showFull)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {showFull ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                {showFull
                  ? `Hide ${isPoem ? "full poem" : "full lyrics"}`
                  : `Show ${isPoem ? "full poem" : "full lyrics"}`}
              </button>
              {showFull && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-2 rounded-lg bg-muted/50 p-3 max-h-56 overflow-y-auto"
                >
                  <pre className="text-xs whitespace-pre-wrap leading-relaxed text-foreground/80">
                    {result.fullText}
                  </pre>
                </motion.div>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="px-4 pb-3 pt-0 gap-2 flex-wrap">
          {/* Copy line */}
          <Button
            size="sm"
            className="flex-1 h-8 gap-1.5 text-xs"
            disabled={!hasLine}
            onClick={() => copyToClipboard(result.bestLine)}
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied!" : "Copy line"}
          </Button>

          {/* Copy with credit */}
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-8 gap-1.5 text-xs"
            disabled={!hasLine}
            onClick={() => copyToClipboard(`"${result.bestLine}"\n— ${result.title}, ${result.author}`, true)}
          >
            {copiedCredit ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copiedCredit ? "Copied!" : "With credit"}
          </Button>

          {/* Download poem / open YouTube for songs without preview */}
          {isPoem ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={downloadPoem}
              title="Download poem as .txt"
            >
              <Download className="h-3.5 w-3.5" />
            </Button>
          ) : !result.previewUrl ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => window.open(playUrl, "_blank")}
              title="Open on YouTube"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          ) : null}

          {/* External link (songs only) */}
          {!isPoem && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => window.open(playUrl, "_blank")}
              title="Open in Apple Music / YouTube"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default SongLineCard;
