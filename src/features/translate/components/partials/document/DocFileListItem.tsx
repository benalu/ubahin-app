// src/features/translate/components/partials/DocFileListItem.tsx
"use client";

import { cn } from "@/lib/utils";
import FileTypeIcon from "@/ui/icons/file-types";
import { Icons } from "@/ui/icons";
import type { JobInfo } from "@/features/translate/hooks/useFileTranslate";
import { Check, AlertTriangle, Loader2 } from "lucide-react";

type Props = {
  file: File;
  index: number;
  job?: JobInfo;
  onRemove: (index: number) => void;
};

function formatSmartSize(bytes: number): string {
  const KB = 1024;
  const MB = 1024 * 1024;
  if (bytes < KB) return `${bytes} B`;
  if (bytes < MB) return `${Math.round(bytes / KB)} KB`;
  const shown = (bytes / MB).toFixed(1).replace(/\.0$/, "");
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

function StatusBadge({ job }: { job?: JobInfo }) {
  if (!job) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
        Ready
      </span>
    );
  }
  const base = "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs";
  if (job.status === "processing" || job.status === "uploading") {
    return (
      <span className={cn(base, "bg-blue-50 text-blue-700")}>
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        {job.status === "uploading" ? "Uploading" : "Working"}
      </span>
    );
  }
  if (job.status === "done") {
    return (
      <span className={cn(base, "bg-green-50 text-green-700")}>
        <Check className="h-3.5 w-3.5" />
        Done
      </span>
    );
  }
  if (job.status === "error") {
    return (
      <span className={cn(base, "bg-red-50 text-red-700")}>
        <AlertTriangle className="h-3.5 w-3.5" />
        Error
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
      Ready
    </span>
  );
}

function ProgressBar({ value }: { value?: number }) {
  if (typeof value === "number" && isFinite(value)) {
    const width = Math.max(0, Math.min(100, value));
    return (
      <div className="mt-2 h-1.5 w-full rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-blue-600 transition-[width] duration-200"
          style={{ width: `${width}%` }}
        />
      </div>
    );
  }
  return (
    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
      <div className="h-full w-1/3 animate-[indeterminate_1.2s_infinite] rounded-full bg-blue-600" />
      <style jsx>{`
        @keyframes indeterminate {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(50%);
          }
          100% {
            transform: translateX(250%);
          }
        }
      `}</style>
    </div>
  );
}

export default function DocFileListItem({ file, index, job, onRemove }: Props) {
  const sizeLabel = formatSmartSize(file.size);
  const label = statusLabel(job);

  const showProgress =
    job?.status === "processing" || job?.status === "uploading";

  const progressValue =
    typeof (job as unknown as { progress?: number })?.progress === "number"
      ? ((job as unknown as { progress?: number }).progress as number)
      : undefined;

  return (
    <div className="group rounded-lg border border-gray-300 bg-white p-3 transition-colors hover:bg-gray-50">
      <div className="flex items-center gap-3">
        <FileTypeIcon fileName={file.name} className="h-5 w-5 text-gray-600" />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <p className="truncate font-medium text-gray-900" title={file.name}>
              {file.name}
            </p>
            <StatusBadge job={job} />
          </div>

          <p className="mt-0.5 text-xs text-gray-500">
            {sizeLabel} • {label}
          </p>
        </div>

        <button
          onClick={() => onRemove(index)}
          className="rounded p-1 text-gray-400 outline-none transition-colors hover:text-gray-600 focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer"
          aria-label={`Remove ${file.name}`}
          title="Remove"
        >
          <Icons.close className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {showProgress && <ProgressBar value={progressValue} />}
    </div>
  );
}
