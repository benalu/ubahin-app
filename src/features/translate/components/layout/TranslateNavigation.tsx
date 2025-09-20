// src/features/translate/components/TranslateNavigation.tsx
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getNavigationItems } from "@/features/translate/config/tabs";
import { LANGUAGES } from "@/features/translate/constants/languages";
import { useMemo } from "react";

// Utility function - bisa dipindah ke file terpisah jika digunakan di tempat lain
function getAvailableLanguagesCount(languages: typeof LANGUAGES): number {
  return languages.filter(lang => lang.value !== "auto").length;
}

export default function TranslateNavigation() {
  const pathname = usePathname();

  // Memoized values
  const langCount = useMemo(
    () => getAvailableLanguagesCount(LANGUAGES), 
    []
  );
  
  const navItems = useMemo(
    () => getNavigationItems(langCount),
    [langCount]
  );

  return (
    <div className="mx-auto max-w-3xl px-8 pt-4">
      <nav className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
        {navItems.map(({ key, path, label, subLabel, icon: Icon }) => {
          const isActive = pathname === path;

          return (
            <Link
              key={key}
              href={path}
              className={cn(
                "group w-full text-left",
                "rounded-xl border bg-white ",
                "px-3.5 py-3 sm:px-2 sm:py-2",
                "transition-colors focus:outline-none",
                "focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2",
                isActive
                  ? "border-black-500/70 bg-black-50"
                  : "border-slate-200 hover:bg-slate-50"
              )}
            >
              <div className="flex items-start gap-3">
                <Icon
                  className={cn(
                    "h-8 w-6 mt-0.5 sm:h-9 sm:w-6",
                    isActive 
                      ? "text-black-600" 
                      : "text-slate-500 group-hover:text-slate-700"
                  )}
                  aria-hidden="true"
                />

                <div className="min-w-0">
                  <div
                    className={cn(
                      "font-semibold leading-tight text-[15px]",
                      isActive ? "text-slate-900" : "text-slate-800"
                    )}
                  >
                    {label}
                  </div>

                  <div className={cn(
                    "text-xs mt-0.5",
                    isActive ? "text-black-700/80" : "text-slate-500"
                  )}>
                    {subLabel}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}