'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Upload, RotateCcw, Settings, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Upload', href: '/upload', icon: Upload },
  { label: 'Convert', href: '/convert', icon: RotateCcw },
  { label: 'Settings', href: '/settings', icon: Settings },
  { label: 'About', href: '/about', icon: Info },
];

export default function HeaderNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-3">
      {navItems.map(({ label, href, icon: Icon }) => {
        const isActive = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-label={label}
            draggable={false}
            className={cn(
              'min-w-16 md:min-w-32 h-full relative z-10 rounded-xl flex flex-1 items-center justify-center gap-3 overflow-hidden px-3 py-2 text-sm transition-all hover:bg-primary',
              isActive && 'bg-primary'
            )}
          >
            <Icon size={16} className="text-black" />
            <span className="text-cyan font-semibold text-[17px]">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
