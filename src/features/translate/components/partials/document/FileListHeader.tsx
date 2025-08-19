// src/features/translate/components/partials/document/FileListHeader.tsx
"use client";

type Props = {
  count: number;
  totalBytes: number;
  title?: string;
};

function formatSmartSize(bytes: number): string {
  const KB = 1024;
  const MB = 1024 * 1024;
  if (bytes < KB) return `${bytes} B`;
  if (bytes < MB) return `${Math.round(bytes / KB)} KB`;
  const shown = (bytes / MB).toFixed(1).replace(/\.0$/, "");
  return `${shown} MB`;
}

export default function FileListHeader({ count, totalBytes, title = "Dokumen" }: Props) {
  return (
    <header className="flex items-center justify-between px-4 py-2 border-b border-gray-400 bg-white">
      <h3 className="text-sm font-medium text-gray-700">{title}</h3>
      <div className="text-xs text-gray-500" aria-live="polite">
        {count} file{count !== 1 ? "s" : ""} • {formatSmartSize(totalBytes)}
      </div>
    </header>
  );
}
