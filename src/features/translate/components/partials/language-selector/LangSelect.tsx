// src/features/translate/components/partials/language-selector/LangSelect.tsx

import { memo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import { normalizeUiCode } from "@/lib/constants/lang";
import { useProcessedLanguages } from "@/features/translate/hooks/useLanguageSelector";
import { getDisplayLabel } from "@/features/translate/utils/languageUtils";
import type { LangSelectProps } from "@/features/translate/types/languageSelector";

const LangSelect = memo(function LangSelect({
  mode,
  value,
  onChange,
  options,
  placeholder,
  openLabelForAuto,
  highlightAutoWhenOpen,
  openLabel,
  highlightWhenOpen,
}: LangSelectProps) {
  const [open, setOpen] = useState(false);
  
  const {
    languageMap,
    sortedLanguages,
    layout,
    isMobile
  } = useProcessedLanguages(options, mode);

  const curValue = normalizeUiCode(value, mode);
  const isAuto = curValue === "auto";

  // Determine highlight state and display label
  const isBlueAuto = !!(open && isAuto && highlightAutoWhenOpen);
  const isBlueAny = !!(open && highlightWhenOpen);
  const isBlue = isBlueAuto || isBlueAny;
  
  const displayLabel = getDisplayLabel(
    curValue, 
    open, 
    isBlueAny ? openLabel : undefined,
    isBlueAuto ? openLabelForAuto : undefined
  );

  const handleSelect = (code: string) => {
    onChange(code);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="select"
          className={[
            "w-full sm:w-auto min-w-0",
            "justify-between sm:justify-start sm:gap-2",
            "border-none shadow-none ring-0 focus-visible:ring-0 focus-visible:ring-offset-0",
            "cursor-pointer flex items-center",
            isBlue 
              ? "bg-blue-200 text-blue hover:bg-blue-200" 
              : "bg-transparent hover:bg-gray-200 text-gray-600",
          ].join(" ")}
        >
          <span className="truncate text-[15px] sm:text-[17px] font-medium">
            {displayLabel || placeholder}
          </span>
          <ChevronDown
            className={[
              "h-4 w-4 transition-transform duration-200",
              open ? "rotate-180" : "",
              isBlue ? "text-blue opacity-100" : "opacity-70",
            ].join(" ")}
          />
        </Button>
      </PopoverTrigger>

      {open && (
        <PopoverContent
          align="center"
          side={isMobile ? "bottom" : "bottom"}
          sideOffset={6}
          avoidCollisions={isMobile ? false : true}
          collisionPadding={isMobile ? 0 : 8}
          sticky="always"
          className={`
            p-1
            ${isMobile ? "w-[95vw] max-w-sm" : "w-[420px] max-w-lg"}
          `}
        >
          <Command>
            <CommandInput placeholder="Cari bahasa…" autoFocus={!isMobile} />
            <CommandList
              className={`${
                isMobile ? "max-h-[60vh]" : "max-h-[400px]"
              } overscroll-contain will-change-transform`}
            >
              <CommandEmpty>Tidak ditemukan</CommandEmpty>

              <CommandGroup heading="Semua bahasa">
                <div className={`relative grid ${layout.className}`}>
                  {/* Column delimiters for desktop */}
                  {!isMobile &&
                    layout.columns > 1 &&
                    Array.from({ length: layout.columns - 1 }).map((_, i) => (
                      <div
                        key={`vline-${i}`}
                        aria-hidden
                        className="pointer-events-none absolute top-0 bottom-0 w-px bg-gray-200 opacity-90"
                        style={{ left: `${((i + 1) / layout.columns) * 100}%` }}
                      />
                    ))}

                  {sortedLanguages.map((option) => {
                    const { code } = option;
                    const selected = code === curValue;
                    const label = getDisplayLabel(code, false);

                    return (
                      <CommandItem
                        key={code}
                        onSelect={() => handleSelect(code)}
                        aria-selected={selected}
                        className={`${
                          isMobile ? "py-2.5" : "py-2"
                        } hover:bg-gray-50 transition-colors cursor-pointer`}
                      >
                        <div className="flex items-center w-full min-w-0 -ml-2">
                          <span className="inline-flex items-center justify-center w-4 mr-1 shrink-0">
                            {selected && <Check className="h-4 w-4 text-green-600" />}
                          </span>
                          <span
                            className={[
                              "text-[15px]",
                              code === "auto"
                                ? "whitespace-nowrap"
                                : "whitespace-normal break-words leading-tight pr-1",
                            ].join(" ")}
                          >
                            {label}
                          </span>
                        </div>
                      </CommandItem>
                    );
                  })}
                </div>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      )}
    </Popover>
  );
});

export default LangSelect;