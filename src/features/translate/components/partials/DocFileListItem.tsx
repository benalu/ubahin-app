// src/features/translate/components/partials/DocFileListItem.tsx
"use client";
import FileTypeIcon from "@/ui/icons/file-types";
import { Icons } from "@/ui/icons";
import type { JobInfo } from "@/features/translate/hooks/useFileTranslate";

type Props = {
  file: File;
  index: number;
  job?: JobInfo;
  onRemove: (index: number) => void;
};

export default function DocFileListItem({
  file,
  index,
  job,
  onRemove,
}: Props) {
  return (
    <div className="flex items-center gap-3 bg-white p-3 rounded-lg">
      <FileTypeIcon fileName={file.name} className="h-5 w-5 text-gray-600" />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate">{file.name}</p>
        <p className="text-sm text-gray-500">
          {(file.size / 1024 / 1024).toFixed(1)} MB •{" "}
          {job?.status === "uploading"
            ? "Uploading…"
            : job?.status === "processing"
            ? `Translating${
                typeof job.secondsRemaining === "number"
                  ? ` (~${job.secondsRemaining}s)`
                  : "…"
              }`
            : job?.status === "done"
            ? "Done"
            : job?.status === "error"
            ? `Error: ${job.error}`
            : "Ready to translate"}
        </p>
      </div>
      <button
        onClick={() => onRemove(index)}
        className="p-1 text-gray-400 hover:text-gray-600"
        aria-label={`Remove ${file.name}`}
        title="Remove"
      >
        <Icons.close className="h-4 w-4" />
      </button>
    </div>
  );
}
