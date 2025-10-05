// src/features/landing/components/SupportedFormats.tsx
import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Image as ImageIcon, Archive, Play } from "lucide-react";

type FormatCategory = {
  title: string;
  description: string;
  formats: string[];
  icon: React.ReactNode;
  color: string; // gradient hover tint
  popular?: string[];
};

const formatCategories: FormatCategory[] = [
  {
    title: "Dokumen",
    description: "Format dokumen untuk teks, laporan, dan presentasi.",
    formats: ["PDF", "DOCX", "PPTX", "TXT", "RTF", "ODT"],
    icon: <FileText className="h-6 w-6" aria-hidden="true" />,
    color: "from-blue-500/10 to-blue-600/10",
    popular: ["PDF", "DOCX"],
  },
  {
    title: "Gambar",
    description: "Semua format gambar populer untuk web dan cetak.",
    formats: ["PNG", "JPG", "WEBP", "SVG", "GIF", "HEIC"],
    icon: <ImageIcon className="h-6 w-6" aria-hidden="true" />,
    color: "from-green-500/10 to-green-600/10",
    popular: ["PNG", "JPG"],
  },
  {
    title: "Media",
    description: "Audio dan video berkualitas tinggi untuk kreator.",
    formats: ["MP3", "WAV", "MP4", "AVI", "MOV", "FLAC"],
    icon: <Play className="h-6 w-6" aria-hidden="true" />,
    color: "from-purple-500/10 to-purple-600/10",
    popular: ["MP3", "MP4"],
  },
  {
    title: "Arsip",
    description: "Ekstrak dan kompres untuk berbagai kebutuhan.",
    formats: ["ZIP", "RAR", "7Z", "TAR", "GZ"],
    icon: <Archive className="h-6 w-6" aria-hidden="true" />,
    color: "from-orange-500/10 to-orange-600/10",
    popular: ["ZIP"],
  },
];

export default function SupportedsFormats() {
  return (
    <section
      id="supported-formats"
      className="pt-6 md:pt-8 pb-14 md:pb-16 px-4"
      aria-labelledby="supported-formats-heading"
    >
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <header className="mb-8 text-center">
          <h2
            id="supported-formats-heading"
            className="text-3xl md:text-4xl font-bold mb-2"
          >
            <span className="font-monda op-dlig op-salt op-ss01 tracking-[.20em]">
              UBAHIN
            </span>
            <span className="text-primary"> mendukung 50+ format</span>
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Konversi dan terjemahkan file{" "}
            <strong>dokumen</strong>, <strong>gambar</strong>,{" "}
            <strong>audio-video</strong>, dan <strong>arsip</strong>—langsung di
            browser.
          </p>
        </header>

        {/* Kategori */}
        <div className="grid gap-5 md:gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {formatCategories.map(
            ({ title, description, formats, icon, color, popular }) => {
              const headingId = `cat-${title.toLowerCase()}`;
              const descId = `desc-${title.toLowerCase()}`;
              return (
                <Card
                  key={title}
                  className="group relative overflow-hidden border border-border/60 bg-card/70 p-5 md:p-6 transition-shadow duration-300 hover:shadow-lg"
                >
                  {/* Hover tint */}
                  <div
                    className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                    aria-hidden="true"
                  />

                  <article
                    aria-labelledby={headingId}
                    aria-describedby={descId}
                    className="relative"
                  >
                    {/* Icon & Title */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-muted/60 ring-1 ring-border/70 group-hover:scale-105 transition-transform duration-300">
                        {icon}
                      </div>
                      <div>
                        <h3
                          id={headingId}
                          className="font-semibold text-lg leading-tight"
                        >
                          {title}
                        </h3>
                        <p
                          id={descId}
                          className="text-xs text-muted-foreground"
                        >
                          {description}
                        </p>
                      </div>
                    </div>

                    {/* Formats as semantic list */}
                    <ul className="mt-2 flex flex-wrap gap-1.5">
                      {formats.map((format) => (
                        <li key={format}>
                          <Badge
                            variant={
                              popular?.includes(format) ? "default" : "secondary"
                            }
                            className="text-[11px] px-2 py-0.5"
                          >
                            {format}
                          </Badge>
                        </li>
                      ))}
                    </ul>
                  </article>
                </Card>
              );
            }
          )}
        </div>
      </div>
    </section>
  );
}
