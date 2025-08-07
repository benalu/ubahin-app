// src/components/shared/Header/Header.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  House,
  RefreshCcw,
  BookType,
  Moon,
  type LucideIcon, 
} from 'lucide-react';
import { isActivePath } from '@/lib/navigation';

interface NavItemProps {
  href: string;
  label: string;
  icon: LucideIcon; 
}

const navItems: NavItemProps[] = [
  { href: '/', icon: House, label: 'Home' },
  { href: '/file-conversion', icon: RefreshCcw, label: 'Convert' },
  { href: '/translate', icon: BookType, label: 'Translate' },
];

function NavItem({ href, icon: Icon, label }: NavItemProps) {
  const pathname = usePathname();
  const isActive = isActivePath(pathname, href);

  const baseTextColor = isActive ? 'text-white' : 'text-black';

  return (
    <Link
      href={href}
      className={`relative px-4 py-3 rounded-xl flex items-center gap-2 text-base transition-colors font-pogonia tracking-widest h-full 
        ${isActive ? 'text-white' : 'text-black hover:text-pink-400'}`}
    >
      {isActive && (
        <motion.div
          layoutId="nav-indicator"
          className="absolute -inset-1 left-0 right-0 rounded-xl bg-black/45 z-0"
          transition={{ type: 'spring', stiffness: 350, damping: 30, mass: 0.4 }}
        />
      )}
      <span className={`relative z-10 flex items-center gap-2 ${baseTextColor}`}>
        <Icon className="w-4.5 h-4.5" />
        <span className="hidden sm:inline">{label}</span>
      </span>
    </Link>
  );
}

export default function Header() {
  return (
    <header className="w-full flex justify-center px-4 py-6">
      <div className="bg-muted w-full max-w-[708px] flex items-center justify-between font-calSans py-2.5 px-2 rounded-2xl shadow-md shadow-secondary z-10">

        {/* Logo */}
        <div className="min-w-26 px-3 py-3.5 rounded-xl bg-gradient-to-r from-secondary to-indigo-600 text-white font-monda op-dlig op-salt op-ss01 tracking-[.20em] text-[20px] flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.03] uppercase">
          UBAHIN
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-3 relative">
          {navItems.map((item) => (
            <NavItem key={item.href} {...item} />
          ))}
        </nav>

        {/* Separator + Theme Toggle */}
        <div className="flex items-center gap-1 relative">
          <div className="hidden md:flex w-[2px] h-[45px] bg-gray-300 mx-2" />
          <button
            type="button"
            className="p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Toggle dark mode"
          >
            <Moon className="w-5 h-5 text-black" />
          </button>
        </div>
      </div>
    </header>
  );
}
