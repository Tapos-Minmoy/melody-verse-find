import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles } from "lucide-react";

interface ConversationInputProps {
  onSubmit: (conversation: string, language: string) => Promise<void>;
  isLoading: boolean;
}

const CHIPS = [
  { label: "Missing each other", text: "Her: I keep thinking about you all day\nHim: Same. I wish I could just be there with you right now" },
  { label: "First I love you", text: "Him: I don't know how to say this but... I think I'm in love with you\nHer: I've been waiting so long to hear that" },
  { label: "After a fight", text: "Her: I'm sorry about what I said earlier\nHim: It's okay, I'm sorry too. I hate when we fight" },
  { label: "Late night", text: "Him: Can't sleep\nHer: Me neither, I was thinking about you\nHim: What were you thinking?\nHer: Just how lucky I am" },
  { label: "Long distance", text: "Her: 47 more days\nHim: I'm counting every single one\nHer: This distance is killing me\nHim: Soon. I promise." },
];

const ConversationInput: React.FC<ConversationInputProps> = ({ onSubmit, isLoading }) => {
  const [text, setText] = useState("");
  const [language, setLanguage] = useState("auto");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isLoading) return;
    await onSubmit(text.trim(), language);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {/* Example chips */}
      <div>
        <p className="text-xs text-muted-foreground mb-2">Quick examples:</p>
        <div className="flex gap-1.5 flex-wrap">
          {CHIPS.map((chip) => (
            <button
              key={chip.label}
              type="button"
              onClick={() => setText(chip.text)}
              className="text-xs px-2.5 py-1 rounded-full border bg-background hover:bg-muted transition-colors"
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Text area */}
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={"Paste your conversation or describe the moment...\n\nExample:\nHer: I miss you so much\nHim: I miss you more"}
        className="min-h-[160px] resize-none text-sm font-mono leading-relaxed bg-background"
        disabled={isLoading}
      />

      {/* Controls */}
      <div className="flex items-center gap-2">
        <Select value={language} onValueChange={setLanguage} disabled={isLoading}>
          <SelectTrigger className="w-32 text-xs h-9 bg-background">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="auto">Auto-detect</SelectItem>
            <SelectItem value="Hindi">Hindi</SelectItem>
            <SelectItem value="Bangla">Bangla</SelectItem>
            <SelectItem value="English">English</SelectItem>
          </SelectContent>
        </Select>

        <Button
          type="submit"
          disabled={isLoading || !text.trim()}
          className="flex-1 gap-2 h-9"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Find song line
        </Button>
      </div>
    </form>
  );
};

export default ConversationInput;
