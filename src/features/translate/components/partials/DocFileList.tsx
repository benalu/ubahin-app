// src/features/translate/components/partials/DocFileList.tsx
"use client";

import DocFileListItem from "./DocFileListItem";
import type { JobInfo } from "@/features/translate/hooks/useFileTranslate";

type Props = {
  files: File[];
  jobs: Record<number, JobInfo>;
  working: boolean;
  onRemove: (index: number) => void;
  onClearAll: () => void;
  onTranslateAll: () => void;
};

export default function DocFileList({
  files,
  jobs,
  working,
  onRemove,
  onClearAll,
  onTranslateAll,
}: Props) {
  if (files.length === 0) return null;

  return (
    <div className="border-t border-gray-200 bg-gray-50">
      <div className="p-4 space-y-3">
        {files.map((file, index) => (
          <DocFileListItem
            key={`${file.name}-${index}`}
            file={file}
            index={index}
            job={jobs[index]}
            onRemove={onRemove}
          />
        ))}

        <div className="flex items-center justify-between pt-2">
          <span className="text-sm text-gray-600">
            {files.length} file{files.length > 1 ? "s" : ""} selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClearAll}
              className="text-sm text-red-600 hover:text-red-700"
              disabled={working}
            >
              Clear all
            </button>
            <button
              onClick={onTranslateAll}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={!files.length || working}
              title={working ? "Working…" : "Translate files"}
            >
              {working ? "Working…" : "Translate files"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
