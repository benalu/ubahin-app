// src/components/shared/MobileBottomNav.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { House, RefreshCcw, BookType, Moon, type LucideIcon } from 'lucide-react';
import { isActivePath } from '@/lib/navigation';

interface BottomNavItem {
  href: string;
  icon: LucideIcon;
  label: string;
}

const navItems: BottomNavItem[] = [
  { href: '/', icon: House, label: 'Home' },
  { href: '/file-conversion', icon: RefreshCcw, label: 'Convert' },
  { href: '/translate', icon: BookType, label: 'Translate' },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-4 left-4 right-4 z-50 bg-muted rounded-2xl px-4 py-2 flex justify-between items-center md:hidden font-calSans">
      {navItems.map(({ href, icon: Icon }) => {
        const isActive = isActivePath(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            className={`relative w-12 h-12 flex items-center justify-center rounded-xl transition-colors ${
              isActive
                ? 'bg-black text-white shadow-md'
                : 'text-black hover:text-pink-400'
            }`}
          >
            <Icon className="w-5 h-5" />
          </Link>
        );
      })}

      {/* Theme toggle icon */}
      <button
        type="button"
        aria-label="Toggle dark mode"
        className="w-12 h-12 flex items-center justify-center rounded-xl text-black hover:text-pink-400 transition-colors"
      >
        <Moon className="w-5 h-5" />
      </button>
    </nav>
  );
}
