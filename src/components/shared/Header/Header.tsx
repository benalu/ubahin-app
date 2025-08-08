// src/components/shared/Header/Header.tsx
'use client';

import Logo from './Logo';
import NavItem from './NavItem';
import ThemeToggle from './ThemeToggle';
import { navItems } from './navItems';

export default function Header() {
  return (
    <header className="w-full flex justify-center px-4 py-6">
      <div className="bg-muted w-full max-w-[708px] flex items-center justify-between font-calSans py-2.5 px-2 rounded-2xl shadow-md shadow-secondary z-10">

        {/* Logo */}
        <Logo />

        {/* Navigation */}
        <nav className="flex items-center gap-3 relative">
          {navItems.map((item) => (
            <NavItem key={item.href} {...item} />
          ))}
        </nav>

        {/* Separator + Theme Toggle */}
        <div className="flex items-center gap-1 relative">
          <div className="hidden md:flex w-[2px] h-[45px] bg-gray-300 mx-2" />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
