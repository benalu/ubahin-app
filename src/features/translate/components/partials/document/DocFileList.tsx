// src/features/translate/components/partials/document/DocFileList.tsx
"use client";

import { useMemo, useRef } from "react";
import {
  FixedSizeList as List,
  type FixedSizeList as FixedSizeListType,
} from "react-window";
import DocFileListItem from "./DocFileListItem";
import FileListHeader from "./FileListHeader";
import type { JobInfo } from "@/features/translate/hooks/useFileTranslate";

interface DocFileListProps {
  files: File[];
  jobs: Record<number, JobInfo>;
  onRemove: (index: number) => void;
  maxHeight?: number;
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
}: DocFileListProps) {
  const listRef = useRef<FixedSizeListType | null>(null);
  const itemData = useMemo(() => ({ files, jobs, onRemove }), [files, jobs, onRemove]);

  const useVirtualization = files.length > 10;
  const itemHeight = 92;
  const listHeight = useVirtualization
    ? Math.min(maxHeight, files.length * itemHeight)
    : files.length * itemHeight;

  const totalBytes = useMemo(
    () => files.reduce((sum, f) => sum + f.size, 0),
    [files]
  );

  if (files.length === 0) return null;

  return (
    <div className="rounded-2xl border border-gray-500 bg-white shadow-sm overflow-hidden">
      <FileListHeader count={files.length} totalBytes={totalBytes} />

      <div className="bg-gray-50">
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
              className="!overflow-x-hidden" // ⬅️ cegah horizontal bleed
            >
              {FileItem}
            </List>
          ) : (
            files.map((file, index) => (
              <div key={`${file.name}-${index}`} className="px-4 py-2">
                <DocFileListItem
                  file={file}
                  index={index}
                  job={jobs[index]}
                  onRemove={onRemove}
                />
              </div>
            ))
          )}
        </div>

        
      </div>
    </div>
  );
}
