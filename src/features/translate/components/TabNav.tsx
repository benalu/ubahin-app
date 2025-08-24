// src/features/translate/components/TabNav.tsx
"use client";

import { useId } from "react";
import type { ComponentType, SVGProps } from "react";
import { cn } from "@/lib/utils";

export type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

export type TabItem = {
  key: string;
  label: string;
  subLabel?: string;     // << subjudul di bawah label
  icon?: IconComponent;  // ikon kiri (opsional)
  disabled?: boolean;
};

type Props = {
  tabs: TabItem[];
  activeKey: string;
  onChange: (key: string) => void;
  className?: string; // kelas tambahan wrapper
};

export default function TabNav({ tabs, activeKey, onChange, className }: Props) {
  const baseId = useId();

  return (
    <div
      role="tablist"
      aria-orientation="horizontal"
      className={cn(
        // grid responsif: 1 kolom di mobile, 3 kolom di ≥sm
        "grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3",
        className
      )}
    >
      {tabs.map(({ key, label, subLabel, icon: Icon, disabled }) => {
        const active = key === activeKey;

        return (
          <button
            key={key}
            type="button"
            id={`${baseId}-tab-${key}`}
            role="tab"
            aria-selected={active}
            aria-controls={`${baseId}-panel-${key}`}
            aria-disabled={disabled || undefined}
            disabled={disabled}
            onClick={() => !disabled && onChange(key)}
            className={cn(
              "group w-full text-left",
              "rounded-xl border bg-white shadow-md",
              "px-3.5 py-3 sm:px-2 sm:py-2",
              "transition-colors focus:outline-none",
              "focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 cursor-pointer",
              disabled && "opacity-50 cursor-not-allowed",
              active
                ? "border-blue-500/70 bg-blue-50"
                : "border-slate-200 hover:bg-slate-50"
            )}
          >
            <div className="flex items-start gap-3">
              {Icon ? (
                <Icon
                  className={cn(
                    "h-8 w-6 mt-0.5 sm:h-9 sm:w-6",
                    active ? "text-blue-600" : "text-slate-500 group-hover:text-slate-700"
                  )}
                  aria-hidden="true"
                />
              ) : null}

              <div className="min-w-0">
                <div
                  className={cn(
                    "font-semibold leading-tight text-[15px]",
                    active ? "text-slate-900" : "text-slate-800"
                  )}
                >
                  {label}
                </div>

                {subLabel ? (
                  <div className={cn("text-xs mt-0.5",
                    active ? "text-blue-700/80" : "text-slate-500"
                  )}>
                    {subLabel}
                  </div>
                ) : null}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

