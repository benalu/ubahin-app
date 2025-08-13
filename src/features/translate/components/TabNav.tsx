// src/features/translate/components/TabNav.tsx
"use client";

import type { IconComponent } from "@/ui/icons"; 

export type TabItem = {
  key: string;
  label: string;
  icon?: IconComponent; 
};

type Props = {
  tabs: TabItem[];
  activeKey: string;
  onChange: (key: string) => void;
  navClassName?: string;          
  itemClassName?: string;         
  activeItemClassName?: string;   
};

export default function TabNav({
  tabs,
  activeKey,
  onChange,
  navClassName = "flex items-center gap-6",
  itemClassName = "border-transparent text-gray-600 hover:text-gray-900",
  activeItemClassName = "border-secondary text-secondary",
}: Props) {
  return (
    <div role="tablist" aria-label="Translator tabs" className={navClassName}>
      {tabs.map(({ key, label, icon: Icon }) => {
        const active = key === activeKey;
        return (
          <button
            key={key}
            role="tab"
            aria-selected={active}
            aria-controls={`panel-${key}`}
            id={`tab-${key}`}
            onClick={() => onChange(key)}
            className={`flex items-center gap-2 pb-4 border-b-2 transition-colors cursor-pointer ${
              active ? activeItemClassName : itemClassName
            }`}
          >
            {Icon ? <Icon className="h-4 w-4" /> : null}
            <span className="font-medium">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
