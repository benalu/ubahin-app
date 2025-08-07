// src/features/fileConversion/components/Dropzone.tsx

'use client';

import { UploadCloud } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useRef } from 'react';
import { generateAcceptString } from '@/features/fileConversion/lib/generateAcceptString';


interface DropzoneProps {
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  hasFiles: boolean;
}

export default function Dropzone({
  onDrop,
  onFileSelect,
  hasFiles,
}: DropzoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={generateAcceptString()}
        hidden
        onChange={onFileSelect}
      />

      <Card
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={handleClick}
        className={`cursor-pointer ${
          hasFiles ? 'min-h-[220px] col-start-2 row-start-1' : 'h-62'
        } flex flex-col items-center justify-center border border-white/10 bg-muted/70 backdrop-blur-xl shadow-lg rounded-2xl hover:shadow-md transition-shadow duration-200`}
      >
        <div className="p-3 rounded-full bg-secondary mb-2">
          <UploadCloud
            className={`w-10 h-10 text-white`}
          />
        </div>
        <p className="text-md text-center text-gray-800 font-semibold">
          {hasFiles ? 'Seret atau klik file untuk memilih' : 'Seret File ke sini atau klik untuk memilih'}
        </p>
      </Card>
    </>
  );
}
