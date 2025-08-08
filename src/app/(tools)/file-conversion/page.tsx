// src/app/(tools)/file-conversion/page.tsx

'use client';

import { Dropzone, FileCard, Toolbar } from '@/features/fileConversion/components';
import { PollingHandler } from '@/features/fileConversion/components/partials/PollingHandler';
import { useFileConversionWithGlobalSession } from '@/features/fileConversion/hooks/useFileConversionWithGlobalSession';
import { AnimatePresence, motion } from 'framer-motion';
export default function FileConversionPage() {
  const {
    files,
    canDownload,
    handleDrop,
    handleManualSelect,
    handleRemoveFile,
    handleConvert,
    handleConvertAll,
    resetFiles,
    setFiles,
    allSameCategory,
    isRestoring,
    hasSessionData,
    handleSetAllFormats,
  } = useFileConversionWithGlobalSession();

  return (
    <main className="flex flex-col items-center px-4 -mt-2 pb-10">
      <div className="w-full max-w-[708px] space-y-6">
        {/* Toolbar */}
        <Toolbar
          onConvertAll={handleConvertAll}
          onRemoveAll={resetFiles}
          hasFiles={files.length > 0}
          disabledDownload={!canDownload}
          allSameCategory={allSameCategory}
          files={files}
          onSetAllFormats={handleSetAllFormats}
        />

        {files.length > 0 ? (
          // ✅ Layout responsif: vertikal di mobile, grid di desktop
          <div className="flex flex-col md:grid md:grid-cols-2 gap-4 auto-rows-max">
            {/* Dropzone */}
            <Dropzone
              onDrop={handleDrop}
              onFileSelect={handleManualSelect}
              hasFiles={true}
            />

            {/* FileCards with animation */}
            <AnimatePresence mode="popLayout">
              {files.map((item, index) => (
                <motion.div
                  key={item.file.name + index}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.25 }}
                  className="relative"
                >
                  <FileCard
                    item={item}
                    index={index}
                    onRemove={handleRemoveFile}
                    onConvert={handleConvert}
                    onFormatChange={(i, format) => {
                      setFiles((prev) =>
                        prev.map((f, j) =>
                          j === i ? { ...f, outputFormat: format } : f
                        )
                      );
                    }}
                  />

                  {/* Polling */}
                  {item.jobId && !item.downloadUrl && !item.converted && (
                    <PollingHandler
                      item={item}
                      index={index}
                      jobId={item.jobId}
                      onUpdate={(i, url) =>
                        setFiles((prev) =>
                          prev.map((f, j) =>
                            j === i
                              ? { ...f, converted: true, downloadUrl: url }
                              : f
                          )
                        )
                      }
                    />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          // No files → full Dropzone
          <Dropzone
            onDrop={handleDrop}
            onFileSelect={handleManualSelect}
            hasFiles={false}
          />
        )}
      </div>
    </main>
  );
}