import React from "react";
import { MessageCircleHeart, Music2, Copy, Play } from "lucide-react";

interface WelcomeScreenProps {
  mode?: "conversation" | "mood";
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ mode = "conversation" }) => {
  if (mode === "conversation") {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="text-center max-w-md mx-auto space-y-5">
          <div className="flex items-center justify-center gap-2 text-primary">
            <MessageCircleHeart className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold mb-1">Song lines for your conversations</h2>
            <p className="text-sm text-muted-foreground">
              Paste a chat between two people — get real song lines that capture the moment, ready to copy and send.
            </p>
          </div>

          <div className="text-left bg-muted rounded-xl p-4 space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Example conversation</p>
            <div className="space-y-1.5">
              <div className="flex justify-end">
                <div className="bg-primary text-primary-foreground text-xs rounded-2xl rounded-tr-sm px-3 py-1.5 max-w-[75%]">
                  I keep thinking about you all day
                </div>
              </div>
              <div className="flex justify-start">
                <div className="bg-background border text-xs rounded-2xl rounded-tl-sm px-3 py-1.5 max-w-[75%]">
                  Same. I wish I could just be there
                </div>
              </div>
            </div>
            <div className="mt-3 border-t pt-3">
              <p className="text-xs text-muted-foreground mb-1">MelodyVerse suggests:</p>
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-2.5">
                <p className="text-xs italic font-medium">"तू जो नहीं है तो कुछ भी नहीं है..."</p>
                <p className="text-xs text-muted-foreground mt-1">Tum Ho · Mohit Chauhan</p>
              </div>
              <div className="flex gap-1.5 mt-2">
                <div className="flex items-center gap-1 text-xs text-primary bg-primary/10 rounded px-2 py-1">
                  <Copy className="h-3 w-3" /> Copy line
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted rounded px-2 py-1">
                  <Play className="h-3 w-3" /> 30s preview
                </div>
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Works with Hindi, Bangla, English or mixed conversations
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-full min-h-[60vh]">
      <div className="text-center max-w-md mx-auto space-y-5">
        <div className="flex items-center justify-center gap-2 text-primary">
          <Music2 className="h-8 w-8" />
        </div>
        <div>
          <h2 className="text-xl font-bold mb-1">Songs for your mood</h2>
          <p className="text-sm text-muted-foreground">
            Express how you're feeling and get real song recommendations with lyrics and a 30-second preview.
          </p>
        </div>
        <div className="text-sm bg-muted p-4 rounded-lg text-left space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Try saying</p>
          <div className="space-y-2">
            <div className="bg-primary/10 p-2 rounded text-xs">आज मैं बहुत उदास हूँ और अकेला महसूस कर रहा हूँ</div>
            <div className="bg-primary/10 p-2 rounded text-xs">আজ আমার মন খুব খুশি, কিছু আনন্দের গান শুনতে চাই</div>
            <div className="bg-primary/10 p-2 rounded text-xs">I'm feeling nostalgic and missing someone</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
