// src/features/fileConversion/components/partials/FileToolbarDropdownMenu.tsx

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { RefObject } from 'react';

interface FileToolbarDropdownMenuProps {
  isOpen: boolean;
  mounted: boolean;
  dropdownRef: RefObject<HTMLDivElement | null>;
  availableFormats: string[];
  selectedFormat: string | null;
  handleFormatSelect: (format: string) => void;
  dropdownPosition: { top: number; left: number };
  currentCategoryName: string;
}

export function FileToolbarDropdownMenu({
  isOpen,
  mounted,
  dropdownRef,
  availableFormats,
  selectedFormat,
  handleFormatSelect,
  dropdownPosition,
  currentCategoryName,
}: FileToolbarDropdownMenuProps) {
  if (!mounted || !isOpen || availableFormats.length === 0) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        ref={dropdownRef}
        initial={{ opacity: 0, scale: 0.95, y: -4 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -4 }}
        transition={{ duration: 0.15 }}
        className="fixed z-50 bg-muted text-white rounded-lg shadow-lg py-3 min-w-[260px] space-y-2 w-max"
        style={{
          top: dropdownPosition.top,
          left: dropdownPosition.left,
        }}
      >
        <div className="space-y-1">
          <div className="text-secondary font-semibold text-xl text-center">
            {currentCategoryName}
          </div>
        </div>
        <div className="border-t border-secondary w-full" />
        <div className="grid grid-cols-3 gap-2 px-3">
          {availableFormats.map((format) => (
            <button
              key={format}
              onClick={() => handleFormatSelect(format)}
              className={`px-1 py-1.5 rounded-md text-[18px] text-center transition-all cursor-pointer ${
                selectedFormat === format
                  ? 'bg-gradient-to-r from-secondary to-indigo-600 text-white font-semibold'
                  : 'bg-gray-700 hover:bg-gray-500'
              }`}
            >
              .{format}
            </button>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
