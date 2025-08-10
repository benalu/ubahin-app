"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { LANGUAGES, getLangData } from "@/features/translate/constants/languages";

type Props = {
  value: string;
  onChange: (value: string) => void;
  exclude?: string[];
  className?: string;
};

export default function LanguageSelector({
  value,
  onChange,
  exclude = [],
  className = "",
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const currentLang = getLangData(value);
  const availableLanguages = LANGUAGES.filter(
    (lang) => !exclude.includes(lang.value)
  );

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700 min-w-0"
      >
        <span className="text-lg">{currentLang.flag}</span>
        <span className="truncate">{currentLang.label}</span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
            {availableLanguages.map((lang) => (
              <button
                key={lang.value}
                onClick={() => {
                  onChange(lang.value);
                  setIsOpen(false);
                }}
                className="flex items-center gap-3 w-full px-3 py-2 hover:bg-gray-50 text-sm text-left"
              >
                <span className="text-lg">{lang.flag}</span>
                <span>{lang.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
