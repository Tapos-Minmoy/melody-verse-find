
import React from "react";
import { EmotionAnalysis } from "@/lib/gemini";

interface EmotionAnalysisDisplayProps {
  emotionAnalysis: EmotionAnalysis;
}

const EmotionAnalysisDisplay: React.FC<EmotionAnalysisDisplayProps> = ({ emotionAnalysis }) => {
  return (
    <div className="bg-muted p-3 rounded-md">
      <h3 className="font-medium text-sm mb-1">Emotion Analysis</h3>
      <p className="text-sm">
        <span className="font-medium">{emotionAnalysis.emotion}</span> 
        <span className="text-muted-foreground"> ({emotionAnalysis.intensity}/10)</span>
      </p>
      {emotionAnalysis.keywords.length > 0 && (
        <div className="mt-2">
          <p className="text-xs text-muted-foreground">Keywords:</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {emotionAnalysis.keywords.map((keyword, index) => (
              <span key={index} className="bg-primary/10 text-xs px-2 py-1 rounded">
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmotionAnalysisDisplay;
