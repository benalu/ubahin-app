// src/components/shared/Header/Logo.tsx
import Link from 'next/link';

export default function Logo() {
  return (
    <Link
      href="/"
      className="min-w-26 px-3 py-3.5 rounded-xl bg-gradient-to-r from-secondary to-indigo-600 text-white font-monda op-dlig op-salt op-ss01 tracking-[.20em] text-[20px] flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.03] uppercase"
    >
      UBAHIN
    </Link>
  );
}
