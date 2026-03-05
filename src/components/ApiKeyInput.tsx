import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, Eye, EyeOff, Check } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface ApiKeyInputProps {
  onApiKeySet: (key: string) => void;
  currentApiKey: string;
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ onApiKeySet, currentApiKey }) => {
  const [key, setKey] = useState(currentApiKey);
  const [show, setShow] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSave = () => {
    if (!key.trim()) return;
    onApiKeySet(key.trim());
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 relative" title="Settings">
          <Settings className="h-4 w-4" />
          {currentApiKey && (
            <span className="absolute top-0.5 right-0.5 h-2 w-2 rounded-full bg-green-500" />
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80">
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="gemini-key" className="text-sm font-medium">
              Gemini API Key
            </Label>
            <p className="text-xs text-muted-foreground">
              Free at aistudio.google.com — required for emotion analysis and song suggestions.
            </p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="gemini-key"
                  type={show ? "text" : "password"}
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  placeholder="AIza..."
                  className="pr-8 text-sm font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
          </div>

          <Button onClick={handleSave} disabled={!key.trim()} className="w-full gap-2">
            <Check className="h-4 w-4" />
            Save
          </Button>

          {currentApiKey && (
            <p className="text-xs text-center text-green-600 dark:text-green-400">
              ✓ API key configured
            </p>
          )}

          <div className="pt-4 border-t space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Music data powered by</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• iTunes Search API — metadata, album art, 30s previews</li>
              <li>• Lyrics.ovh — full lyrics</li>
              <li>• lrclib.net — lyrics fallback</li>
            </ul>
            <p className="text-xs text-muted-foreground mt-1">All free, no extra keys needed.</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ApiKeyInput;
