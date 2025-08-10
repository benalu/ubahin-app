// src/features/landing/components/SupportedFormats.tsx

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Image as ImageIcon, Music4, FileText, Clapperboard } from "lucide-react";
import React from "react";

type Item = {
  title: string;
  formats: string[];
  icon: React.ReactNode;
  accent?: string;
};

const items: Item[] = [
  { title: "Gambar", formats: ["png", "jpg", "gif", "webp", "heic"], icon: <ImageIcon className="h-5 w-5" />,     accent: "from-emerald-400/20" },
  { title: "Audio - Video", formats: ["mp3", "wav", "flac", "aac", "mp4", "m4a", "avi", "mov"], icon: <Music4 className="h-5 w-5" />,        accent: "from-violet-400/20" },
  { title: "Dokumen", formats: ["pdf", "docx", "ppt", "html", "rtf", "xls", "xlsx", "csv", "txt"], icon: <FileText className="h-5 w-5" />,      accent: "from-amber-400/25" },
  { title: "Arsip", formats: ["rar", "zip", "tar", "7z", "gz"], icon: <Clapperboard className="h-5 w-5" />,  accent: "from-rose-400/20" },
];

export default function SupportedFormats() {
  return (
    <section className="px-4">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 text-center md:mb-8">
          <h2 className="text-balance text-2xl font-semibold md:text-3xl">
            <span className="font-monda op-dlig op-salt op-ss01 tracking-[.20em] text-[25px]">UBAHIN</span> mendukung...
          </h2>
          
        </header>

        {/* Auto-fit fills leftover space → jauh lebih rapat di desktop, tetap rapi di mobile */}
        <div className="grid gap-3 md:gap-4 [grid-template-columns:repeat(auto-fit,minmax(230px,1fr))]">
          {items.map(({ title, formats, icon, accent }) => (
            <Card
              key={title}
              className={[
                "relative overflow-hidden rounded-2xl border-l-4 border-secondary bg-card/70",
                "shadow-sm transition-all hover:shadow-md",
                "p-4 md:p-5",
              ].join(" ")}
            >
              {/* subtle gradient accent di sudut kanan atas 
              <div
                aria-hidden
                className={[
                  "pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full",
                  "bg-gradient-to-br to-transparent blur-2xl",
                  accent ?? "from-primary/20",
                ].join(" ")}
              />
              */}

              {/* header ringkas */}
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted/60 ring-1 ring-border">
                  {icon}
                </div>
                <h3 className="text-sm font-medium tracking-tight md:text-base">{title}</h3>
              </div>

              {/* badges mini, otomatis wrap */}
              <div className="flex flex-wrap gap-1.5 md:gap-2">
                {formats.map((f) => (
                  <Badge
                    key={f}
                    variant="default"
                    className="h-6 rounded-full px-2 text-[11px] md:h-7 md:px-2.5 md:text-xs text-gray-200"
                  >
                    {f}
                  </Badge>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
