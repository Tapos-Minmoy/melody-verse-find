import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { MessageCircleHeart, Music2 } from "lucide-react";

import ApiKeyInput from "@/components/ApiKeyInput";
import ConversationInput from "@/components/ConversationInput";
import ChatInterface from "@/components/ChatInterface";
import SongLineCard, { SongLineResult } from "@/components/SongLineCard";
import LoadingState from "@/components/LoadingState";
import WelcomeScreen from "@/components/WelcomeScreen";

import { analyzeConversation, analyzeMoodWithGemini, EmotionAnalysis } from "@/lib/gemini";
import { searchTrack } from "@/lib/itunes";
import { fetchLyrics } from "@/lib/lyrics";

type Mode = "conversation" | "mood";

const Index = () => {
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem("gemini_api_key") ?? "");
  const [results, setResults] = useState<SongLineResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<Mode>("conversation");
  const [emotion, setEmotion] = useState<{ label: string; intensity: number } | null>(null);

  const handleApiKeySet = (newKey: string) => {
    setApiKey(newKey);
    localStorage.setItem("gemini_api_key", newKey);
    toast({ title: "API key saved" });
  };

  const requireApiKey = (): boolean => {
    if (!apiKey) {
      toast({
        title: "API key required",
        description: "Tap the settings icon to add your Gemini API key.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleApiError = (err: unknown) => {
    const msg = err instanceof Error ? err.message : "Something went wrong.";
    if (msg === "QUOTA_EXCEEDED") {
      toast({
        title: "Quota exceeded",
        description: "You've hit Gemini's free limit (15 req/min). Wait 1 minute then try again. Or enable billing at aistudio.google.com.",
        variant: "destructive",
      });
    } else if (msg === "INVALID_KEY") {
      toast({
        title: "Invalid API key",
        description: "Your Gemini API key was rejected. Open settings and paste it again from aistudio.google.com.",
        variant: "destructive",
      });
    } else {
      toast({ title: "Error", description: msg, variant: "destructive" });
    }
  };

  const runPipeline = async (analysis: EmotionAnalysis) => {
    setEmotion({ label: analysis.emotion, intensity: analysis.intensity });

    const songResults = await Promise.all(
      analysis.suggestedSongs.map(async (s, i) => {
        const [track, lyrics] = await Promise.all([
          searchTrack(s.title, s.artist),
          fetchLyrics(s.artist, s.title),
        ]);

        return {
          id: `song-${Date.now()}-${i}`,
          title: s.title,
          artist: s.artist,
          language: s.language,
          bestLine: s.suggestedLine,
          reason: "",
          lyrics: lyrics ?? null,
          artworkUrl: track?.artworkUrl100 ?? null,
          previewUrl: track?.previewUrl ?? null,
          trackViewUrl: track?.trackViewUrl ?? null,
        } satisfies SongLineResult;
      })
    );

    setResults(songResults);
  };

  const handleConversationSubmit = async (conversation: string, language: string) => {
    if (!requireApiKey()) return;
    setIsLoading(true);
    setResults([]);
    setEmotion(null);
    try {
      const analysis = await analyzeConversation(conversation, apiKey, language);
      await runPipeline(analysis);
    } catch (err) {
      console.error(err);
      handleApiError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMoodMessage = async (message: string) => {
    if (!requireApiKey()) return;
    setIsLoading(true);
    setResults([]);
    setEmotion(null);
    try {
      const analysis = await analyzeMoodWithGemini(message, apiKey);
      await runPipeline(analysis);
    } catch (err) {
      console.error(err);
      handleApiError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    setResults([]);
    setEmotion(null);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      {/* Top bar */}
      <header className="shrink-0 border-b bg-card px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <Music2 className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-base font-semibold leading-none">MelodyVerse</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Song lines for real moments</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border bg-muted p-0.5 gap-0.5">
            <button
              onClick={() => switchMode("conversation")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                mode === "conversation"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <MessageCircleHeart className="h-3.5 w-3.5" />
              Conversation
            </button>
            <button
              onClick={() => switchMode("mood")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                mode === "mood"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Music2 className="h-3.5 w-3.5" />
              Mood
            </button>
          </div>
          <ApiKeyInput onApiKeySet={handleApiKeySet} currentApiKey={apiKey} />
        </div>
      </header>

      {/* Main */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left — input */}
        <aside className="w-full md:w-[380px] lg:w-[420px] shrink-0 border-r flex flex-col bg-card">
          {emotion && (
            <div className="shrink-0 px-4 py-2.5 border-b bg-primary/5 flex items-center gap-2">
              <span className="text-xs font-medium capitalize text-primary">{emotion.label}</span>
              <div className="flex gap-0.5 ml-1">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 w-1.5 rounded-full ${i < emotion.intensity ? "bg-primary" : "bg-primary/20"}`}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground ml-auto">{emotion.intensity}/10</span>
            </div>
          )}
          <div className="flex-1 overflow-y-auto">
            {mode === "conversation" ? (
              <div className="p-4">
                <ConversationInput onSubmit={handleConversationSubmit} isLoading={isLoading} />
              </div>
            ) : (
              <ChatInterface onSendMessage={handleMoodMessage} isLoading={isLoading} />
            )}
          </div>
        </aside>

        {/* Right — results */}
        <main className="flex-1 overflow-y-auto bg-muted/20">
          {isLoading ? (
            <LoadingState />
          ) : results.length > 0 ? (
            <div className="p-6 space-y-4 max-w-4xl">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {mode === "conversation" ? "Song lines for this moment" : "Songs for your mood"}
                </h2>
                <span className="text-xs text-muted-foreground">{results.length} songs</span>
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {results.map((result, index) => (
                  <SongLineCard key={result.id} result={result} index={index} />
                ))}
              </div>
            </div>
          ) : (
            <WelcomeScreen mode={mode} />
          )}
        </main>
      </div>
    </div>
  );
};

export default Index;
