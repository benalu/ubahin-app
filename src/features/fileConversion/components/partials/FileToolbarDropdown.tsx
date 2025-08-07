// src/features/fileConversion/components/partials/FileToolbarDropdown.tsx

'use client';

import { ChevronDown, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { RefObject } from 'react';

interface FileToolbarDropdownProps {
  selectedFormat: string | null;
  isDropdownOpen: boolean;
  toggleDropdown: () => void;
  buttonRef: RefObject<HTMLButtonElement | null>;
  getButtonText: () => string;
  allSameCategory: boolean;
  availableFormats: string[];
}

export function FileToolbarDropdown({
  selectedFormat,
  isDropdownOpen,
  toggleDropdown,
  buttonRef,
  getButtonText,
  allSameCategory,
  availableFormats,
}: FileToolbarDropdownProps) {
  return (
    <div className="flex items-center justify-between sm:justify-normal gap-2 text-sm font-semibold text-gray-800 w-full sm:w-auto">
      {/* Label hanya di desktop */}
      <span className="hidden sm:inline text-gray-800 text-[16px]">Set all to</span>

      <button
        ref={buttonRef}
        type="button"
        disabled={!allSameCategory || availableFormats.length === 0}
        onClick={toggleDropdown}
        className={`w-full sm:w-auto sm:min-w-[100px] rounded-full px-4 py-3.5 text-sm font-medium flex items-center gap-2 transition-all duration-200 justify-between shadow-sm hover:shadow-md ${
          allSameCategory && availableFormats.length > 0
            ? selectedFormat
              ? 'bg-cyan-800 hover:bg-cyan-700 text-white cursor-pointer'
              : 'bg-secondary hover:bg-secondary/90 text-white cursor-pointer'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
      >
        {selectedFormat ? (
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-white" />
            <span>{getButtonText()}</span>
          </div>
        ) : (
          <>
            <span className="sm:hidden">Set to all</span>
            <span className="hidden sm:inline">Select format</span>
          </>
        )}
        <motion.div
          animate={{ rotate: isDropdownOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 flex-shrink-0" />
        </motion.div>
      </button>
    </div>
  );
}
