// src/features/translate/components/partials/text/AccessibleProgress.tsx
"use client";

import * as React from "react";

type Props = {
  value: number;
  max: number;
  label?: string;
  className?: string;
  barClassName?: string;
};

export default function AccessibleProgress({
  value,
  max,
  label = "Kemajuan",
  className,
  barClassName,
}: Props) {
  const clamped = Math.max(0, Math.min(value, max));
  const pct = (clamped / (max || 1)) * 100;

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={clamped}
      className={`w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden ${className ?? ""}`}
    >
      <div
        className={`h-full transition-all duration-300 ${barClassName ?? ""}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
