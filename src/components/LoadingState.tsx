import React from "react";
import { Card, CardContent } from "@/components/ui/card";

const SkeletonCard = () => (
  <Card className="overflow-hidden animate-pulse">
    <div className="flex gap-3 p-4 pb-0">
      <div className="w-16 h-16 rounded-lg bg-muted shrink-0" />
      <div className="flex-1 space-y-2 pt-1">
        <div className="h-3.5 bg-muted rounded w-3/4" />
        <div className="h-3 bg-muted rounded w-1/2" />
        <div className="h-5 bg-muted rounded-full w-14 mt-1" />
      </div>
    </div>
    <CardContent className="pt-4 pb-3 space-y-3">
      <div className="bg-muted rounded-lg p-3 space-y-2">
        <div className="h-3 bg-muted-foreground/20 rounded w-full" />
        <div className="h-3 bg-muted-foreground/20 rounded w-5/6" />
        <div className="h-3 bg-muted-foreground/20 rounded w-2/3" />
      </div>
      <div className="h-2 bg-muted rounded w-3/4" />
      <div className="flex gap-1.5 mt-2">
        <div className="h-6 bg-muted rounded flex-1" />
        <div className="h-6 w-8 bg-muted rounded" />
      </div>
    </CardContent>
  </Card>
);

const LoadingState: React.FC = () => {
  return (
    <div className="p-6 space-y-4 max-w-4xl">
      <div className="flex items-center gap-3">
        <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <span className="text-sm text-muted-foreground">Finding the perfect song lines...</span>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
};

export default LoadingState;
