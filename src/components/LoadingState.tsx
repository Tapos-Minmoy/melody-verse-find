
import React from "react";

const LoadingState: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-muted-foreground">Analyzing emotions...</p>
      </div>
    </div>
  );
};

export default LoadingState;
