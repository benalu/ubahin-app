// src/features/translate/components/partials/LanguageSelector/parts/LanguageMenu.tsx

"use client";

import { Check } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { getDisplayLabelFor } from "@/lib/constants/lang";

type Item = { code: string; label?: string };

export default function LanguageMenu({
  curValue,
  popular,
  rest,
  isMobile,
  layoutClass,
  onSelect,
}: {
  curValue: string;
  popular: Item[];
  rest: Item[];
  isMobile: boolean;
  layoutClass: string;
  onSelect: (code: string) => void;
}) {
  return (
    <Command>
      {/* Search sticky */}
      <div className="sticky top-0 z-10 bg-white px-2 pt-2 pb-1 border-b">
        <CommandInput placeholder="Cari bahasa…" />
      </div>

      <CommandList className={isMobile ? "max-h-[65vh]" : "max-h-[440px]"}>
        <CommandEmpty className="py-6 text-center text-sm text-gray-500">
          Tidak ditemukan
        </CommandEmpty>

        {popular.length > 0 && (
          <CommandGroup heading="Populer" className="px-2">
            <div className={isMobile ? "space-y-1" : "grid grid-cols-2 gap-x-2"}>
              {popular.map(({ code }) => {
                const selected = code === curValue;
                const label = getDisplayLabelFor(code);
                return (
                  <CommandItem
                    key={code}
                    onSelect={() => onSelect(code)}
                    aria-selected={selected}
                    className="group rounded-md px-2 py-2 hover:bg-gray-50 cursor-pointer"
                  >
                    <span className="flex-1 truncate text-[15px]">{label}</span>
                    {selected && <Check className="h-4 w-4 text-green-600 ml-2" />}
                  </CommandItem>
                );
              })}
            </div>
          </CommandGroup>
        )}

        <CommandGroup heading="Semua bahasa" className="px-2">
          <div className={`grid ${layoutClass}`}>
            {rest.map(({ code, label }) => {
              const selected = code === curValue;
              const finalLabel = label ?? getDisplayLabelFor(code);
              return (
                <CommandItem
                  key={code}
                  onSelect={() => onSelect(code)}
                  aria-selected={selected}
                  className={[
                    "group rounded-md px-2 hover:bg-gray-50 cursor-pointer",
                    isMobile ? "py-2.5" : "py-2",
                  ].join(" ")}
                >
                  <span className="flex-1 truncate text-[15px]">{finalLabel}</span>
                  {selected && <Check className="h-4 w-4 text-green-600 ml-2" />}
                </CommandItem>
              );
            })}
          </div>
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
