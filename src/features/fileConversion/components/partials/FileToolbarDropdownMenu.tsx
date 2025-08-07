// src/features/fileConversion/components/partials/FileToolbarDropdownMenu.tsx (Updated)

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { RefObject, useEffect } from 'react';
import { X } from 'lucide-react';

interface FileToolbarDropdownMenuProps {
  isOpen: boolean;
  mounted: boolean;
  dropdownRef: RefObject<HTMLDivElement | null>;
  availableFormats: string[];
  selectedFormat: string | null;
  handleFormatSelect: (format: string) => void;
  dropdownPosition: { top: number; left: number };
  currentCategoryName: string;
  onClose: () => void;
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
  onClose,
}: FileToolbarDropdownMenuProps) {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

  // ✅ Enhanced position calculation for mobile
  const getDropdownStyle = () => {
    if (!mounted || typeof window === 'undefined') return {};

    if (isMobile) {
      return {
        position: 'fixed' as const,
        bottom: 20,
        left: 16,
        right: 16,
        width: 'auto',
        maxHeight: '60vh',
      };
    }

    return {
      position: 'fixed' as const,
      top: dropdownPosition.top,
      left: dropdownPosition.left,
      width: 260,
      maxHeight: 400,
    };
  };

  if (!mounted || !isOpen || availableFormats.length === 0) return null;

  return createPortal(
    <>
      {/* ✅ Mobile backdrop */}
      {isMobile && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-[100]"
          onClick={onClose}
        />
      )}

      <AnimatePresence>
        <motion.div
          ref={dropdownRef}
          initial={{ 
            opacity: 0, 
            scale: 0.95,
            y: isMobile ? 20 : -4
          }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            y: 0
          }}
          exit={{ 
            opacity: 0, 
            scale: 0.95,
            y: isMobile ? 20 : -4
          }}
          transition={{ duration: 0.15 }}
          className={`z-[110] bg-muted text-white rounded-lg shadow-2xl border border-white/10 ${
            isMobile ? 'mx-4' : ''
          }`}
          style={getDropdownStyle()}
        >
          {/* ✅ Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <h3 className="text-lg font-semibold text-secondary">
              {isMobile ? `Set All to ${currentCategoryName}` : currentCategoryName}
            </h3>
            {isMobile && (
              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* ✅ Format Grid */}
          <div className="p-4">
            <div className={`grid gap-2 ${
              isMobile ? 'grid-cols-4' : 'grid-cols-3'
            }`}>
              {availableFormats.map((format) => (
                <motion.button
                  key={format}
                  onClick={() => handleFormatSelect(format)}
                  className={`px-3 py-2 rounded-md text-base font-medium text-center transition-all cursor-pointer ${
                    selectedFormat === format
                      ? 'bg-gradient-to-r from-secondary to-indigo-600 text-white font-semibold'
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  .{format}
                </motion.button>
              ))}
            </div>
          </div>

          {/* ✅ Mobile action button */}
          {isMobile && (
            <div className="p-4 border-t border-white/10">
              <button
                onClick={onClose}
                className="w-full bg-secondary text-white py-3 rounded-lg font-medium hover:bg-secondary/90 transition-colors"
              >
                Selesai
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </>,
    document.body
  );
}