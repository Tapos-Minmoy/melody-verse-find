
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Key, Eye, EyeOff } from 'lucide-react';

interface ApiKeyInputProps {
  onApiKeySet: (apiKey: string) => void;
  currentApiKey?: string;
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ onApiKeySet, currentApiKey }) => {
  const [apiKey, setApiKey] = useState(currentApiKey || '');
  const [showKey, setShowKey] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      onApiKeySet(apiKey.trim());
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Key className="h-5 w-5" />
          Gemini API Configuration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <Input
              type={showKey ? 'text' : 'password'}
              placeholder="Enter your Gemini API key..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1 h-8 w-8 p-0"
              onClick={() => setShowKey(!showKey)}
            >
              {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
          <Button type="submit" size="sm" disabled={!apiKey.trim()}>
            {currentApiKey ? 'Update API Key' : 'Set API Key'}
          </Button>
        </form>
        <p className="text-xs text-muted-foreground mt-2">
          Get your free API key from{' '}
          <a 
            href="https://makersuite.google.com/app/apikey" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Google AI Studio
          </a>
        </p>
      </CardContent>
    </Card>
  );
};

export default ApiKeyInput;
