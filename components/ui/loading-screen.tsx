'use client';

import { Loader2 } from "lucide-react";

export function LoadingScreen() {
  return (
    <div className="h-screen w-full flex items-center justify-center bg-background">
      <div className="text-center space-y-3">
        <Loader2 className="w-10 h-10 animate-spin text-brand-blue mx-auto" />
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    </div>
  );
}
