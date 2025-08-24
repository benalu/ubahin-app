// src/features/translate/components/partials/LanguageSelector.tsx
"use client";

import { useCallback, useMemo, useState, memo } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeftRight, Check, ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import {
  normalizeUiCode,
  getDisplayLabelFor,
  buildSourceOptions,
  buildTargetOptions,
} from "@/lib/constants/lang";

import { useSortedLanguages, getColumnLayout } from "@/utils/languageSorting";

type Option = { code: string; label: string };

const toLower = (s: string) => (s || "").toLowerCase();

function dedupByCode(list: Option[]) {
  const m = new Map<string, Option>();
  for (const o of list) {
    const key = toLower(o.code);
    if (!m.has(key)) m.set(key, { ...o, code: key });
  }
  return Array.from(m.values());
}

function resolvePopularForMode(raw: string, all: Map<string, Option>, mode: "source" | "target") {
  const key = toLower(raw);
  if (mode === "target") {
    if (key === "en") return all.get("en-us") ? "en-us" : (all.get("en-gb") ? "en-gb" : "en");
    if (key === "pt") return all.get("pt-br") ? "pt-br" : (all.get("pt-pt") ? "pt-pt" : "pt");
  }
  return normalizeUiCode(key, mode);
}

/* ------------------------- LangSelect ------------------------- */
type LangSelectProps = {
  mode: "source" | "target";
  value: string;
  onChange: (v: string) => void;
  options: Option[];
  placeholder: string;
  openLabelForAuto?: string;
  highlightAutoWhenOpen?: boolean;
  openLabel?: string;
  highlightWhenOpen?: boolean;
};

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
  const safeOptions = useMemo(() => dedupByCode(options), [options]);

  const byKey = useMemo(() => {
    const m = new Map<string, Option>();
    for (const o of safeOptions) {
      const k = normalizeUiCode(o.code, mode);
      if (!m.has(k)) m.set(k, { ...o, code: k });
    }
    return m;
  }, [safeOptions, mode]);

  
  const allForGroup = useMemo(() => {
    const keys = Array.from(byKey.keys());
    const filteredKeys = mode === "target" ? keys.filter((k) => k !== "auto") : keys; 
    return filteredKeys.map((k) => byKey.get(k)!);
  }, [byKey, mode]);

 
  const rest = useSortedLanguages(allForGroup);

  const curValue = normalizeUiCode(value, mode);
  const isAuto = curValue === "auto";
  const currentLabel = getDisplayLabelFor(curValue);

  const isBlueAuto = !!(open && isAuto && highlightAutoWhenOpen);
  const isBlueAny = !!(open && highlightWhenOpen);
  const isBlue = isBlueAuto || isBlueAny;
  const displayLabel = (isBlueAny && openLabel) || (isBlueAuto && openLabelForAuto) || currentLabel;

  const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
  const layout = getColumnLayout(rest.length, isMobile);

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
            isBlue ? "bg-blue-200 text-blue hover:bg-blue-200" : "bg-transparent hover:bg-gray-200 text-gray-600",
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
                ${isMobile ? 'w-[95vw] max-w-sm' : 'w-[420px] max-w-lg'}
              `}
        >
          <Command>
            <CommandInput placeholder="Cari bahasa…" />
            <CommandList className={isMobile ? "max-h-[60vh]" : "max-h-[400px]"}>
              <CommandEmpty>Tidak ditemukan</CommandEmpty>

              
              <CommandGroup heading="Semua bahasa">
                <div className={`relative grid ${layout.className}`}>
                  
                  {!isMobile && layout.columns > 1 &&
                    Array.from({ length: layout.columns - 1 }).map((_, i) => (
                      <div
                        key={`vline-${i}`}
                        aria-hidden
                        className="pointer-events-none absolute top-0 bottom-0 w-px bg-gray-200"
                        style={{ left: `${((i + 1) / layout.columns) * 100}%` }}
                      />
                    ))}

                  {rest.map((o) => {
                    const code = o.code;
                    const selected = code === curValue;
                    const label = getDisplayLabelFor(code);
                    return (
                      <CommandItem
                        key={code}
                        onSelect={() => {
                          onChange(code);
                          setOpen(false);
                        }}
                        aria-selected={selected}
                        className={`${isMobile ? "py-2.5" : "py-2"} hover:bg-gray-50 transition-colors cursor-pointer`}
                      >
                         <div className="relative flex items-center w-full">
                          {selected && (
                            <Check
                              className="absolute -left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-green-600 pointer-events-none"
                            />
                          )}
                          <span className="text-[15px] whitespace-nowrap">{label}</span>
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

/* ---------------------------- LanguageSelector --------------------------- */
type Props = {
  sourceLang: string;
  targetLang: string;
  onSourceChange: (v: string) => void;
  onTargetChange: (v: string) => void;
  disableSwap?: boolean;
};

function LanguageSelectorComp({
  sourceLang,
  targetLang,
  onSourceChange,
  onTargetChange,
  disableSwap,
}: Props) {
  const sourceOptions = useMemo(() => buildSourceOptions(), []);
  const targetOptions = useMemo(() => buildTargetOptions(), []);

  const handleSwap = useCallback(() => {
    if (disableSwap) return;
    const s = sourceLang;
    onSourceChange(targetLang);
    onTargetChange(s);
  }, [disableSwap, sourceLang, targetLang, onSourceChange, onTargetChange]);

  const displayTargetValue = useMemo(() => {
    const v = toLower(targetLang);
    if (v === "en") return "en-us";
    if (v === "pt") return "pt-br";
    return normalizeUiCode(targetLang, "target");
  }, [targetLang]);

  return (
    <div
      className="
        grid w-full items-center
        px-2 py-0.5 sm:py-1
        grid-cols-1 gap-1 sm:gap-1
        sm:grid-cols-[1fr_auto_1fr]
      "
    >
      <div className="min-w-0 sm:justify-self-end">
        <LangSelect
          mode="source"
          value={sourceLang}
          onChange={onSourceChange}
          options={sourceOptions}
          placeholder="Deteksi Bahasa"
          openLabelForAuto="Pilih bahasa sumber"
          highlightAutoWhenOpen
        />
      </div>

      <div className="flex justify-center">
        <Button
          type="button"
          variant="ghost"
          size="swap"
          className="bg-white"
          onClick={handleSwap}
          disabled={disableSwap}
          title="Swap (Ctrl/Cmd+K)"
          aria-label="Tukar bahasa"
        >
          <ArrowLeftRight className="text-gray-700" />
        </Button>
      </div>

      <div className="min-w-0 sm:justify-self-start">
        <LangSelect
          mode="target"
          value={displayTargetValue}
          onChange={onTargetChange}
          options={targetOptions}
          placeholder="Pilih bahasa"
          openLabel="Pilih bahasa sasaran"
          highlightWhenOpen
        />
      </div>
    </div>
  );
}

export default memo(LanguageSelectorComp);
