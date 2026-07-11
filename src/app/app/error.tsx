"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center p-8 text-center">
      <AlertTriangle className="h-10 w-10 text-[oklch(0.62_0.16_42)]" />
      <h2 className="mt-4 font-serif text-xl">Something went wrong</h2>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">
        {error.message || "An unexpected error occurred while loading this section."}
      </p>
      <Button className="mt-4" onClick={reset}>Try again</Button>
    </div>
  );
}
