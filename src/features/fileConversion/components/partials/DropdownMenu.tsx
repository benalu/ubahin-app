// src/features/fileConversion/components/partials/DropdownMenu.tsx

import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { FILE_CATEGORIES } from '@/utils/fileCategories';

interface DropdownMenuProps {
  isOpen: boolean;
  mounted: boolean;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
  options: string[] | Record<string, string[]>; // ✅ Support both flat and grouped
  selected: string | null;
  onSelect: (value: string) => void;
  onClose: () => void;
  dropdownPosition: { top: number; left: number; width?: number; maxHeight?: number };
  header: React.ReactNode;
  isMobile?: boolean;
  actionButton?: React.ReactNode;
  grouped?: boolean; // ✅ NEW: Enable grouped view
}

export function DropdownMenu({
  isOpen,
  mounted,
  dropdownRef,
  options,
  selected,
  onSelect,
  onClose,
  dropdownPosition,
  header,
  isMobile = false,
  actionButton,
  grouped = false,
}: DropdownMenuProps) {
  if (!mounted || !isOpen) return null;

  // ✅ Check if options is empty
  const isEmpty = Array.isArray(options) 
    ? options.length === 0 
    : Object.keys(options).length === 0;
  
  if (isEmpty) return null;

  // ✅ Render grouped or flat view
  const isGrouped = grouped && !Array.isArray(options);

  return createPortal(
    <AnimatePresence>
      {isMobile && isOpen && createPortal(
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] sm:hidden"
            onClick={onClose}
            aria-hidden="true"
          />
        </AnimatePresence>,
        document.body
      )}
      <motion.div
        ref={dropdownRef}
        role="menu"
        initial={{ opacity: 0, scale: 0.95, y: isMobile ? 20 : -4 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: isMobile ? 20 : -4 }}
        transition={{ duration: 0.15 }}
        className={`fixed z-[110] rounded-lg shadow-2xl border bg-popover text-popover-foreground border-border ${isMobile ? 'mx-4' : ''}`}
        style={{
          top: dropdownPosition.top,
          left: dropdownPosition.left,
          width: dropdownPosition.width,
          maxHeight: dropdownPosition.maxHeight,
          overflow: 'auto',
        }}
        onPointerDown={e => e.stopPropagation()}
        onClick={e => e.stopPropagation()}
        onTouchStart={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-popover z-10 relative p-3 flex items-center justify-center border-b border-border">
          {header}
          {isMobile && (
            <button
              onClick={onClose}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full hover:bg-accent transition-colors"
              aria-label="Close"
              style={{ touchAction: 'manipulation' }}
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {isGrouped ? (
            <GroupedOptions
              options={options as Record<string, string[]>}
              selected={selected}
              onSelect={onSelect}
              isMobile={isMobile}
            />
          ) : (
            <FlatOptions
              options={options as string[]}
              selected={selected}
              onSelect={onSelect}
              isMobile={isMobile}
            />
          )}
        </div>

        {/* Action Button (optional) */}
        {isMobile && actionButton}
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}

// ✅ Grouped Options Component
function GroupedOptions({
  options,
  selected,
  onSelect,
  isMobile,
}: {
  options: Record<string, string[]>;
  selected: string | null;
  onSelect: (value: string) => void;
  isMobile: boolean;
}) {
  return (
    <div className="space-y-4">
      {Object.entries(options).map(([category, formats]) => {
        if (formats.length === 0) return null;

        const categoryConfig = FILE_CATEGORIES[category];
        const Icon = categoryConfig?.icon;
        const categoryLabel = category.charAt(0).toUpperCase() + category.slice(1);

        return (
          <div key={category} className="space-y-2">
            {/* Category Header */}
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              {Icon && <Icon className="w-4 h-4" />}
              <span>{categoryLabel}</span>
            </div>

            {/* Format Buttons */}
            <div className={`grid gap-2 ${isMobile ? 'grid-cols-4' : 'grid-cols-3'}`}>
              {formats.map(format => (
                <motion.button
                  key={format}
                  onClick={() => onSelect(format)}
                  className={`px-3 py-2 rounded-md text-base font-medium text-center transition-all cursor-pointer
                    ${selected === format
                      ? 'bg-gradient-to-r from-secondary to-indigo-600 text-white font-semibold'
                      : 'bg-muted hover:bg-gray-300 text-foreground'
                    }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  .{format}
                </motion.button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ✅ Flat Options Component (Original)
function FlatOptions({
  options,
  selected,
  onSelect,
  isMobile,
}: {
  options: string[];
  selected: string | null;
  onSelect: (value: string) => void;
  isMobile: boolean;
}) {
  return (
    <div className={`grid gap-2 ${isMobile ? 'grid-cols-4' : 'grid-cols-3'}`}>
      {options.map(opt => (
        <motion.button
          key={opt}
          onClick={() => onSelect(opt)}
          className={`px-3 py-2 rounded-md text-base font-medium text-center transition-all cursor-pointer
            ${selected === opt
              ? 'bg-gradient-to-r from-secondary to-indigo-600 text-white font-semibold'
              : 'bg-muted hover:bg-gray-300 text-foreground'
            }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          .{opt}
        </motion.button>
      ))}
    </div>
  );
}