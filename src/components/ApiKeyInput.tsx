import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, Eye, EyeOff, Check, Loader2, XCircle } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { validateApiKey } from "@/lib/gemini";

interface ApiKeyInputProps {
  onApiKeySet: (key: string) => void;
  currentApiKey: string;
}

type TestStatus = "idle" | "testing" | "ok" | "fail";


const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ onApiKeySet, currentApiKey }) => {
  const [key, setKey] = useState(currentApiKey);
  const [show, setShow] = useState(false);
  const [open, setOpen] = useState(false);
  const [testStatus, setTestStatus] = useState<TestStatus>("idle");
  const [testError, setTestError] = useState("");
  const [testModel, setTestModel] = useState("");

  const handleSave = () => {
    if (!key.trim()) return;
    onApiKeySet(key.trim());
    setTestStatus("idle");
    setOpen(false);
  };

  const handleTest = async () => {
    if (!key.trim()) return;
    setTestStatus("testing");
    setTestError("");
    const result = await validateApiKey(key.trim());
    if (result.ok) {
      setTestStatus("ok");
      setTestModel(result.model ?? "");
    } else {
      setTestStatus("fail");
      setTestError(result.error ?? "Unknown error");
    }
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
              Get a free key at{" "}
              <span className="font-medium text-foreground">aistudio.google.com</span>
              {" → "}Get API Key. Free tier: 15 requests/minute.
            </p>

            <div className="relative">
              <Input
                id="gemini-key"
                type={show ? "text" : "password"}
                value={key}
                onChange={(e) => { setKey(e.target.value); setTestStatus("idle"); }}
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

          {/* Test result */}
          {testStatus === "ok" && (
            <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 rounded-lg px-3 py-2">
              <Check className="h-3.5 w-3.5 shrink-0" />
              <span>Valid! Using <span className="font-mono font-semibold">{testModel}</span></span>
            </div>
          )}
          {testStatus === "fail" && (
            <div className="flex items-start gap-2 text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">
              <XCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Key test failed</p>
                <p className="mt-0.5 opacity-80">{testError}</p>
                {testError.toLowerCase().includes("quota") && (
                  <p className="mt-1 opacity-80">Free tier limit hit. Wait 1 minute and try again.</p>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!key.trim() || testStatus === "testing"}
              onClick={handleTest}
              className="flex-1 gap-1.5"
            >
              {testStatus === "testing" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Check className="h-3.5 w-3.5" />
              )}
              {testStatus === "testing" ? "Testing..." : "Test key"}
            </Button>
            <Button
              size="sm"
              disabled={!key.trim()}
              onClick={handleSave}
              className="flex-1 gap-1.5"
            >
              Save
            </Button>
          </div>

          <div className="pt-3 border-t space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">Quota exceeded? Try this:</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Wait 1 minute (15 req/min limit on free tier)</li>
              <li>• Or enable billing in Google Cloud Console for higher limits</li>
              <li>• Make sure the API key is from aistudio.google.com, not Cloud Console</li>
            </ul>
          </div>

          <div className="pt-3 border-t space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Music APIs (no key needed)</p>
            <ul className="text-xs text-muted-foreground space-y-0.5">
              <li>• iTunes — album art, 30s previews</li>
              <li>• Lyrics.ovh + lrclib.net — full lyrics</li>
            </ul>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ApiKeyInput;
