// // src/features/translate/components/partials/LanguageSelector.tsx
"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeftRight } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";

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

function LangSelect({
  value, onChange, options, placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: Option[];
  placeholder: string;
}) {
  const safeOptions = dedupByCode(options);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="justify-between w-[180px]">
          <span className="truncate">
            {safeOptions.find(o => o.code === value)?.label ?? placeholder}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[280px]">
        <Command>
          <CommandInput placeholder="Cari bahasa..." />
          <CommandList>
            <CommandEmpty>Tidak ditemukan</CommandEmpty>
            <CommandGroup>
              {safeOptions.map(o => (
                <CommandItem key={o.code} onSelect={() => onChange(o.code)}>
                  {o.label}
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
    <div className="flex items-center justify-center gap-2 flex-wrap bg-white/60 backdrop-blur rounded-2xl border p-2">
      <LangSelect
        value={sourceLang}
        onChange={onSourceChange}
        options={sourceOptions}
        placeholder="Auto-Detect"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="rounded-full"
        onClick={() => {
          if (disableSwap) return;
          const s = sourceLang;
          onSourceChange(targetLang);
          onTargetChange(s);
        }}
        disabled={disableSwap}
        title="Swap (Ctrl/Cmd+K)"
      >
        <ArrowLeftRight className="h-5 w-5" />
      </Button>
      <LangSelect
        value={targetLang}
        onChange={onTargetChange}
        options={options}
        placeholder="Pilih bahasa"
      />
    </div>
  );
}
