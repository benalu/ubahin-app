// src/features/translate/components/partials/text/ActionBar.tsx
"use client";

import * as React from "react";

type Props = {
  left?: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
  sticky?: boolean; // set true jika ingin nempel di bawah (mobile)
};

export default function ActionBar({ left, right, className, sticky }: Props) {
  return (
    <div
      className={`flex items-center justify-between px-6 py-3 text-sm ${
        sticky ? "sticky bottom-0" : ""
      } ${className ?? ""}`}
      role="toolbar"
    >
      <div className="flex items-center gap-2">{left}</div>
      <div className="flex items-center gap-3">{right}</div>
    </div>
  );
}
