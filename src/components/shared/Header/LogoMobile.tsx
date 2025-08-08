// src/components/shared/Header/LogoMobile.tsx
'use client';

import Link from 'next/link';

export default function LogoMobile() {
  return (
    <div className="md:hidden w-full flex justify-center pt-6 pb-6">
      <div className="rounded-xl bg-muted dark:bg-zinc-800 p-2 shadow-md shadow-secondary">
        <Link
          href="/"
          aria-label="Homepage"
          className="min-w-32 px-3 py-3.5 rounded-xl bg-gradient-to-r from-secondary to-indigo-600 text-white font-monda op-dlig op-salt op-ss01 tracking-[.20em] text-[22px] flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.03] uppercase"
        >
          UBAHIN
        </Link>
      </div>
    </div>
  );
}
