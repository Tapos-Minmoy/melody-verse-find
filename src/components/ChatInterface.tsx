
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
}

interface ChatInterfaceProps {
  onSendMessage: (message: string) => Promise<void>;
  isLoading: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onSendMessage, isLoading }) => {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: "Ask me about a song, mood, or lyrics in Bangla or Hindi, and I'll recommend some music!",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim() || isLoading) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    
    await onSendMessage(inputValue.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    // Focus textarea when component mounts
    textareaRef.current?.focus();
  }, []);

  // Detect if the message contains Bangla or Hindi characters
  const detectLanguage = (text: string): string => {
    // Bangla Unicode range: \u0980-\u09FF
    // Hindi Unicode range: \u0900-\u097F
    const banglaMatcher = /[\u0980-\u09FF]/;
    const hindiMatcher = /[\u0900-\u097F]/;
    
    if (banglaMatcher.test(text)) return "Bangla";
    if (hindiMatcher.test(text)) return "Hindi";
    return "Other";
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const language = message.sender === "user" ? detectLanguage(message.content) : "Other";
          
          return (
            <div
              key={message.id}
              className={cn(
                "flex max-w-[80%] rounded-lg p-4",
                message.sender === "user"
                  ? "bg-primary text-primary-foreground ml-auto"
                  : "bg-muted mr-auto"
              )}
            >
              <div>
                {message.content}
                {message.sender === "user" && language !== "Other" && (
                  <div className="text-xs opacity-70 mt-1 text-right">
                    {language}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="border-t p-4">
        <div className="flex items-end gap-2">
          <Textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type a message in Bangla or Hindi..."
            className="min-h-[60px] resize-none"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={isLoading || !inputValue.trim()}
            className="h-[60px] w-[60px] rounded-full"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;
