// src/features/translate/components/partials/document/DocToolbar.tsx
"use client";

import { memo } from "react";
import DocActions from "./DocActions";

export interface DocToolbarProps {
  onClearAll: () => void;
  onTranslateAll: () => void;
  working: boolean;
  count: number;
}

function DocToolbarBase({
  onClearAll,
  onTranslateAll,
  working,
  count,
}: DocToolbarProps) {
  return (
    <div className="flex items-center justify-end gap-2 bg-white/60 border rounded-2xl p-2">
      <DocActions
        onClearAll={onClearAll}
        onTranslateAll={onTranslateAll}
        working={working}
        count={count}
      />
    </div>
  );
}

export default memo(DocToolbarBase);
