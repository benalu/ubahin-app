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
import { getLangData } from "@/features/translate/constants/languages";

type Option = { code: string; label: string };

function dedupByCode(list: Option[]) {
  const m = new Map<string, Option>();
  for (const o of list) if (!m.has(o.code)) m.set(o.code, o);
  return Array.from(m.values());
}

function withAuto(options: Option[], autoLabel = "Deteksi Bahasa") {
  const hasAuto = options.some((o) => o.code === "auto");
  const merged = hasAuto ? options : [{ code: "auto", label: autoLabel }, ...options];
  return dedupByCode(merged);
}

const POPULAR_CODES = new Set(["en", "id", "es", "fr", "de", "ja", "ko", "zh", "pt", "ru", "ar"]);

/* ------------------------- LangSelect (memoized) ------------------------- */

type LangSelectProps = {
  value: string;
  onChange: (v: string) => void;
  options: Option[];
  placeholder: string;
  // Sumber: jika open & value === 'auto', ganti label dan highlight biru
  openLabelForAuto?: string;
  highlightAutoWhenOpen?: boolean;
  // Umum: jika open (apa pun valuenya), ganti label dan highlight biru
  openLabel?: string;
  highlightWhenOpen?: boolean;
};

const LangSelect = memo(function LangSelect({
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

  const { popular, rest } = useMemo(() => {
    const popular: Option[] = [];
    const rest: Option[] = [];
    for (const o of safeOptions) (POPULAR_CODES.has(o.code) ? popular : rest).push(o);
    return { popular, rest };
  }, [safeOptions]);

  const currentLabel = useMemo(
    () => safeOptions.find((o) => o.code === value)?.label ?? placeholder,
    [safeOptions, value, placeholder]
  );

  const isAuto = value === "auto";
  const isBlueAuto = !!(open && isAuto && highlightAutoWhenOpen);
  const isBlueAny = !!(open && highlightWhenOpen);
  const isBlue = isBlueAuto || isBlueAny;

  const displayLabel =
    (isBlueAny && openLabel) ||
    (isBlueAuto && openLabelForAuto) ||
    currentLabel;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {/* Mobile: full width; Desktop: auto width (tanpa min-width supaya hover pas ke konten) */}
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
            {displayLabel}
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
          sideOffset={6}
          className="p-0 w-[92vw] max-w-md sm:w-[240px]"
        >
          <Command>
            <CommandInput placeholder="Cari bahasa…" />
            <CommandList>
              <CommandEmpty>Tidak ditemukan</CommandEmpty>

              {popular.length > 0 && (
                <CommandGroup heading="Populer">
                  {popular.map((o) => (
                    <CommandItem
                      key={o.code}
                      onSelect={() => {
                        onChange(o.code);
                        setOpen(false);
                      }}
                      aria-selected={o.code === value}
                      className="hover:bg-gray-50 transition-colors duration-150 py-2 cursor-pointer"
                    >
                      <span className="mr-2 h-5 w-5 grid place-items-center rounded-full bg-gray-50 border text-xs">
                        {getLangData(o.code).flag}
                      </span>
                      <span className="flex-1 truncate text-[15px]">{o.label}</span>
                      {o.code === value && <Check className="h-4 w-4 text-green-600" />}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              <CommandGroup heading="Semua bahasa">
                {rest.map((o) => (
                  <CommandItem
                    key={o.code}
                    onSelect={() => {
                      onChange(o.code);
                      setOpen(false);
                    }}
                    aria-selected={o.code === value}
                    className="hover:bg-gray-50 transition-colors duration-150 py-2 cursor-pointer"
                  >
                    <span className="mr-2 h-5 w-5 grid place-items-center rounded-full bg-gray-50 border text-xs">
                      {getLangData(o.code).flag}
                    </span>
                    <span className="flex-1 truncate text-[15px]">{o.label}</span>
                    {o.code === value && <Check className="h-4 w-4 text-green-600" />}
                  </CommandItem>
                ))}
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
  options: Option[];
  disableSwap?: boolean;
};

function LanguageSelectorComp({
  sourceLang,
  targetLang,
  onSourceChange,
  onTargetChange,
  options,
  disableSwap,
}: Props) {
  const sourceOptions = useMemo(() => withAuto(options), [options]);

  const handleSwap = useCallback(() => {
    if (disableSwap) return;
    const s = sourceLang;
    onSourceChange(targetLang);
    onTargetChange(s);
  }, [disableSwap, sourceLang, targetLang, onSourceChange, onTargetChange]);

  return (
    <div
      className="
        grid w-full items-center
        px-2 py-0.5 sm:py-1
        grid-cols-1 gap-1 sm:gap-1
        sm:grid-cols-[1fr_auto_1fr]
      "
    >
      {/* LEFT (Deteksi Bahasa: special when open) */}
      <div className="min-w-0 sm:justify-self-end">
        <LangSelect
          value={sourceLang}
          onChange={onSourceChange}
          options={sourceOptions}
          placeholder="Deteksi Bahasa"
          openLabelForAuto="Pilih bahasa sumber"
          highlightAutoWhenOpen
        />
      </div>

      {/* CENTER: SWAP */}
      <div className="flex justify-center">
        <Button
          type="button"
          variant="ghost"
          size="swap"
          className="bg-white "
          onClick={handleSwap}
          disabled={disableSwap}
          title="Swap (Ctrl/Cmd+K)"
          aria-label="Tukar bahasa"
        >
          <ArrowLeftRight className="text-gray-700" />
        </Button>
      </div>

      {/* RIGHT (Target: highlight when open) */}
      <div className="min-w-0 sm:justify-self-start">
        <LangSelect
          value={targetLang}
          onChange={onTargetChange}
          options={options}
          placeholder="Pilih bahasa"
          openLabel="Pilih bahasa sasaran"
          highlightWhenOpen
        />
      </div>
    </div>
  );
}

export default memo(LanguageSelectorComp);
