// src/features/translate/components/partials/document/DocFileList.tsx
"use client";

import { useMemo, useRef } from "react";
import {
  FixedSizeList as List,
  type FixedSizeList as FixedSizeListType,
} from "react-window";
import DocFileListItem from "./DocFileListItem";
import type { JobInfo } from "@/features/translate/hooks/useFileTranslate";

interface DocFileListProps {
  files: File[];
  jobs: Record<number, JobInfo>;
  onRemove: (index: number) => void;
  maxHeight?: number;
  /** Konten tambahan di bagian bawah panel (mis. tombol Add files) */
  footer?: React.ReactNode;
}

interface ItemData {
  files: File[];
  jobs: Record<number, JobInfo>;
  onRemove: (index: number) => void;
}

const FileItem = ({
  index,
  style,
  data,
}: {
  index: number;
  style: React.CSSProperties;
  data: ItemData;
}) => (
  <div style={style}>
    <div className="px-4 py-2">
      <DocFileListItem
        file={data.files[index]}
        index={index}
        job={data.jobs[index]}
        onRemove={data.onRemove}
      />
    </div>
  </div>
);

export default function DocFileList({
  files,
  jobs,
  onRemove,
  maxHeight = 400,
  footer,
}: DocFileListProps) {
  const listRef = useRef<FixedSizeListType | null>(null);

  const itemData = useMemo(
    () => ({ files, jobs, onRemove }),
    [files, jobs, onRemove]
  );

  if (files.length === 0) return null;

  const useVirtualization = files.length > 10;
  const itemHeight = 80;
  const listHeight = useVirtualization
    ? Math.min(maxHeight, files.length * itemHeight)
    : files.length * itemHeight;

  return (
    <div className="border-t border-gray-200 bg-white">
      <div className="p-4">
        <div className="space-y-3" style={{ height: listHeight }}>
          {useVirtualization ? (
            <List
              ref={listRef}
              height={listHeight}
              width="100%"
              itemCount={files.length}
              itemSize={itemHeight}
              itemData={itemData}
              overscanCount={5}
            >
              {FileItem}
            </List>
          ) : (
            files.map((file, index) => (
              <DocFileListItem
                key={`${file.name}-${index}`}
                file={file}
                index={index}
                job={jobs[index]}
                onRemove={onRemove}
              />
            ))
          )}
        </div>

        {/* Summary + optional footer */}
        <div className="pt-4 border-t border-gray-300">
          <div className="text-sm text-gray-600">
            {files.length} file{files.length > 1 ? "s" : ""} selected
            {useVirtualization && (
              <span className="ml-2 text-xs text-gray-400">
                (Virtual scrolling enabled)
              </span>
            )}
          </div>
          {footer ? <div className="mt-4 grid">{footer}</div> : null}
        </div>
      </div>
    </div>
  );
}
