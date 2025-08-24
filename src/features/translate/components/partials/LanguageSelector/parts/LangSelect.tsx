// src/features/translate/components/partials/LanguageSelector/parts/LangSelect.tsx

"use client";

import { memo, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getDisplayLabelFor } from "@/lib/constants/lang";
import { useLangMenu } from "./useLangMenu";
import LanguageMenu from "./LanguageMenu";

export type Option = { code: string; label: string };

type Props = {
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

function LangSelect(props: Props) {
  const {
    mode, value, options, onChange,
    placeholder, openLabelForAuto, openLabel,
    highlightAutoWhenOpen, highlightWhenOpen,
  } = props;

  const [open, setOpen] = useState(false);

  const {
    curValue,
    isAuto,
    isMobile,
    layoutClass,
    popular,
    rest,
  } = useLangMenu({ mode, value, options });

  const currentLabel = useMemo(
    () => (curValue === "auto" ? placeholder : getDisplayLabelFor(curValue)),
    [curValue, placeholder]
  );

  const isBlueAuto = !!(open && isAuto && highlightAutoWhenOpen);
  const isBlueAny = !!(open && highlightWhenOpen);
  const isBlue = isBlueAuto || isBlueAny;
  const displayLabel = (isBlueAny && openLabel) || (isBlueAuto && openLabelForAuto) || currentLabel;

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
            isBlue ? "bg-blue-200 text-blue hover:bg-blue-200" : "bg-transparent hover:bg-gray-200 text-gray-700",
          ].join(" ")}
        >
          <span className="truncate text-[15px] sm:text-[17px] font-medium">{displayLabel}</span>
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
          sideOffset={8}
          className={[
            "p-0 rounded-lg border shadow-lg bg-white",
            isMobile ? "w-[95vw] max-w-sm" : "w-[560px] max-w-2xl",
          ].join(" ")}
        >
          <LanguageMenu
            curValue={curValue}
            popular={popular}
            rest={rest}
            isMobile={isMobile}
            layoutClass={layoutClass}
            onSelect={(code) => {
              onChange(code);
              setOpen(false);
            }}
          />
        </PopoverContent>
      )}
    </Popover>
  );
}

export default memo(LangSelect);

