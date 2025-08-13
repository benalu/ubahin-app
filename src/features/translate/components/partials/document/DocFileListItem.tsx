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

/** < 1 MB → "### KB"; >= 1 MB → "x.y MB" (tanpa .0) */
function formatSmartSize(bytes: number): string {
  const KB = 1024;
  const MB = 1024 * 1024;

  if (bytes < KB) return `${bytes} B`;

  if (bytes < MB) {
    const kb = Math.round(bytes / KB);
    return `${kb} KB`;
  }

  const mb = bytes / MB;
  // satu desimal, tapi hilangkan .0
  const shown = mb.toFixed(1).replace(/\.0$/, "");
  return `${shown} MB`;
}

function statusLabel(job?: JobInfo): string {
  if (!job) return "Ready to translate";
  switch (job.status) {
    case "uploading":
      return "Uploading…";
    case "processing":
      return `Translating${
        typeof job.secondsRemaining === "number"
          ? ` (~${job.secondsRemaining}s)`
          : "…"
      }`;
    case "done":
      return "Done";
    case "error":
      return `Error: ${job.error ?? "Unknown"}`;
    default:
      return "Ready to translate";
  }
}

export default function DocFileListItem({
  file,
  index,
  job,
  onRemove,
}: Props) {
  const sizeLabel = formatSmartSize(file.size);
  const label = statusLabel(job);

  return (
    <div className="flex items-center gap-3 bg-gray-100 p-3 rounded-lg">
      <FileTypeIcon fileName={file.name} className="h-5 w-5 text-gray-600" />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate" title={file.name}>
          {file.name}
        </p>
        <p className="text-sm text-gray-500">
          {sizeLabel} • {label}
        </p>
      </div>

      <button
        onClick={() => onRemove(index)}
        className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
        aria-label={`Remove ${file.name}`}
        title="Remove"
      >
        <Icons.close className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
