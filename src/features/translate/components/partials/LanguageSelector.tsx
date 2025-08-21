// // src/features/translate/components/partials/LanguageSelector.tsx
"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeftRight, Check, ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";
import { getLangData } from "@/features/translate/constants/languages";

type Option = { code: string; label: string };

function dedupByCode(list: Option[]) {
  const m = new Map<string, Option>();
  for (const o of list) if (!m.has(o.code)) m.set(o.code, o);
  return Array.from(m.values());
}

function withAuto(options: Option[], autoLabel = "Auto-Detect") {
  const hasAuto = options.some(o => o.code === "auto");
  const merged = hasAuto ? options : [{ code: "auto", label: autoLabel }, ...options];
  return dedupByCode(merged);
}

const POPULAR_CODES = ["en", "id", "es", "fr", "de", "ja", "ko", "zh", "pt", "ru", "ar"] as const;

function LangSelect({
  value, onChange, options, placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: Option[];
  placeholder: string;
}) {
  const safeOptions = dedupByCode(options);
  const current = getLangData(value);

  const popular = safeOptions.filter(o => (POPULAR_CODES as readonly string[]).includes(o.code));
  const rest = safeOptions.filter(o => !(POPULAR_CODES as readonly string[]).includes(o.code));

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="h-11 w-full sm:w-[220px] min-w-0 rounded-xl border-gray-200 bg-white/80 hover:bg-white px-3 justify-between"
        >
          <span className="flex items-center gap-2 min-w-0">
            <span className="h-6 w-6 grid place-items-center rounded-full bg-gray-50 border text-base">
              {current.flag}
            </span>
            <span className="truncate text-sm font-medium">
              {safeOptions.find(o => o.code === value)?.label ?? placeholder}
            </span>
          </span>
          <ChevronDown className="h-4 w-4 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="center"
        sideOffset={6}
        className="p-0 w-[92vw] max-w-md sm:w-[340px]"
      >
        <Command>
          <CommandInput placeholder="Cari bahasa…" />
          <CommandList>
            <CommandEmpty>Tidak ditemukan</CommandEmpty>
            {popular.length > 0 && (
              <CommandGroup heading="Populer">
                {popular.map(o => (
                  <CommandItem
                    key={o.code}
                    onSelect={() => onChange(o.code)}
                    aria-selected={o.code === value}
                  >
                    <span className="mr-2 h-5 w-5 grid place-items-center rounded-full bg-gray-50 border text-xs">
                      {getLangData(o.code).flag}
                    </span>
                    <span className="flex-1 truncate">{o.label}</span>
                    {o.code === value && <Check className="h-4 w-4 text-green-600" />}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            <CommandGroup heading="Semua bahasa">
              {rest.map(o => (
                <CommandItem
                  key={o.code}
                  onSelect={() => onChange(o.code)}
                  aria-selected={o.code === value}
                >
                  <span className="mr-2 h-5 w-5 grid place-items-center rounded-full bg-gray-50 border text-xs">
                    {getLangData(o.code).flag}
                  </span>
                  <span className="flex-1 truncate">{o.label}</span>
                  {o.code === value && <Check className="h-4 w-4 text-green-600" />}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default function LanguageSelector({
  sourceLang, targetLang, onSourceChange, onTargetChange, options, disableSwap,
}: {
  sourceLang: string;
  targetLang: string;
  onSourceChange: (v: string) => void;
  onTargetChange: (v: string) => void;
  options: Option[];
  disableSwap?: boolean;
}) {
  const sourceOptions = withAuto(options); // pastikan 'auto' tunggal

  return (
    <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-center gap-2 bg-white/70 backdrop-blur rounded-2xl border p-3 w-full shadow-sm">
      <div className="min-w-0">
        <LangSelect
          value={sourceLang}
          onChange={onSourceChange}
          options={sourceOptions}
          placeholder="Auto-Detect"
        />
      </div>
      <div className="flex justify-center">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="rounded-full border bg-white hover:bg-gray-50 shadow-sm"
          onClick={() => {
            if (disableSwap) return;
            const s = sourceLang;
            onSourceChange(targetLang);
            onTargetChange(s);
          }}
          disabled={disableSwap}
          title="Swap (Ctrl/Cmd+K)"
          aria-label="Tukar bahasa"
        >
          <ArrowLeftRight className="h-5 w-5" />
        </Button>
      </div>
      <div className="min-w-0">
        <LangSelect
          value={targetLang}
          onChange={onTargetChange}
          options={options}
          placeholder="Pilih bahasa"
        />
      </div>
    </div>
  );
}
