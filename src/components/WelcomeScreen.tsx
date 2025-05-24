
import React from "react";

const WelcomeScreen: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center max-w-lg mx-auto">
        <h2 className="text-2xl font-bold mb-2">Welcome to MelodyVerse</h2>
        <p className="text-muted-foreground mb-4">
          Share your feelings in Bangla or Hindi and get personalized music recommendations based on AI emotion analysis
        </p>
        <div className="text-sm bg-muted p-4 rounded-lg">
          <h3 className="font-medium mb-2">Example phrases you can try:</h3>
          <ul className="space-y-2 text-left">
            <li className="bg-primary/10 p-2 rounded">आज मैं बहुत उदास हूँ और अकेला महसूस कर रहा हूँ</li>
            <li className="bg-primary/10 p-2 rounded">আজ আমার মন খুব খুশি, কিছু আনন্দের গান শুনতে চাই</li>
            <li className="bg-primary/10 p-2 rounded">I'm feeling nostalgic about my childhood memories</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
