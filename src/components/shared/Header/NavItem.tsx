'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { isActivePath } from '@/lib/navigation';
import { useGlobalSession } from '@/hooks/useGlobalSession'; // ← pakai ini

interface NavItemProps {
  href: string;
  label: string;
  icon: LucideIcon;
  showIndicator?: boolean;
}

export default function NavItem({ href, icon: Icon, label, showIndicator = false }: NavItemProps) {
  const pathname = usePathname();
  const isActive = isActivePath(pathname, href);
  const baseTextColor = isActive ? 'text-white' : 'text-black';

  const { fileCount } = useGlobalSession(); // ← ambil dari global state

  return (
    <Link
      href={href}
      className={`relative px-4 py-3 rounded-xl flex items-center gap-2 text-base transition-colors font-pogonia tracking-widest h-full 
        ${isActive ? 'text-white' : 'text-black hover:text-pink-400'}`}
    >
      {isActive && (
        <motion.div
          layoutId="nav-indicator"
          className="absolute -inset-1 left-0 right-0 rounded-xl bg-neutral-800 z-0"
          transition={{ type: 'spring', stiffness: 350, damping: 30, mass: 0.4 }}
        />
      )}

      <span className={`relative z-10 flex items-center gap-2 ${baseTextColor}`}>
        <div className="relative">
          <Icon className="w-4.5 h-4.5" />

          {/* Indikator file di atas icon */}
          {showIndicator && fileCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-pink-500 text-white text-[10px] font-bold flex items-center justify-center shadow">
              {fileCount > 9 ? '9+' : fileCount}
            </span>
          )}
        </div>
        <span className="hidden sm:inline">{label}</span>
      </span>
    </Link>
  );
}

