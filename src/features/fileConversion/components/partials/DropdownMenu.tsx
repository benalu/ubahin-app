// src/features/fileConversion/components/partials/DropdownMenu.tsx

import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface DropdownMenuProps {
  isOpen: boolean;
  mounted: boolean;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
  options: string[];
  selected: string | null;
  onSelect: (value: string) => void;
  onClose: () => void;
  dropdownPosition: { top: number; left: number; width?: number; maxHeight?: number };
  header: React.ReactNode;
  isMobile?: boolean;
  actionButton?: React.ReactNode;
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
}: DropdownMenuProps) {
  if (!mounted || !isOpen || options.length === 0) return null;

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
        }}
        onPointerDown={e => e.stopPropagation()}
        onClick={e => e.stopPropagation()}
        onTouchStart={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-3 flex items-center justify-center">
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
        <div className="h-px bg-border" />
        {/* Options Grid */}
        <div className="p-4">
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
        </div>
        {/* Action Button (optional) */}
        {isMobile && actionButton}
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}