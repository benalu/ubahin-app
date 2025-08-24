// src/features/translate/components/partials/document/DocActions.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Trash2, Play } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DocActionsProps {
  onClearAll: () => void;
  onTranslateAll: () => void;
  working: boolean;
  count: number;
  className?: string;
}

export default function DocActions({
  onClearAll,
  onTranslateAll,
  working,
  count,
  className,
}: DocActionsProps) {
  const canAct = !working && count > 0;
  const translateLabel = working
    ? "Working…"
    : count > 0
    ? `Translate ${count} File${count > 1 ? "s" : ""}`
    : "Translate";

  return (
    <div className={cn("flex gap-3", className)}>
      <Button
        variant="outline"
        onClick={onClearAll}
        disabled={!canAct}
        className={cn(canAct && "cursor-pointer")}
        title="Clear All Files"
        aria-label="Clear All Files"
      >
        <Trash2 className="h-4 w-4 mr-2" aria-hidden="true" />
        Clear All
      </Button>

      <Button
        onClick={() => void onTranslateAll()}
        disabled={!canAct}
        className={cn(canAct && "cursor-pointer")}
        title={translateLabel}
        aria-label={translateLabel}
      >
        <Play className="h-4 w-4 mr-2" aria-hidden="true" />
        {translateLabel}
      </Button>
    </div>
  );
}
