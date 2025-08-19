// src/ui/icons/fileExtIconMap.ts
export type FileIconInfo = { src: string; label: string };

export const FILE_EXT_ICON: Record<string, FileIconInfo> = {
  // Dokumen umum
  pdf:  { src: "/icons/translate/icon_pdf.svg",  label: "PDF" },
  doc:  { src: "/icons/translate/icon_docx.svg", label: "Word" },
  docx: { src: "/icons/translate/icon_docx.svg", label: "Word" },
  ppt:  { src: "/icons/translate/icon_pptx.svg", label: "PowerPoint" },
  pptx: { src: "/icons/translate/icon_pptx.svg", label: "PowerPoint" },
  xls:  { src: "/icons/translate/icon_xlsx.svg", label: "Excel" },
  xlsx: { src: "/icons/translate/icon_xlsx.svg", label: "Excel" },
  txt:  { src: "/icons/translate/icon_docTrans_file.svg", label: "Text" },

  // Format DeepL lain
  htm:   { src: "/icons/translate/icon_docTrans_file.svg", label: "HTML" },
  html:  { src: "/icons/translate/icon_docTrans_file.svg", label: "HTML" },
  xlf:   { src: "/icons/translate/icon_docTrans_file.svg", label: "XLIFF" },
  xliff: { src: "/icons/translate/icon_docTrans_file.svg", label: "XLIFF" },
  srt:   { src: "/icons/translate/icon_docTrans_file.svg", label: "Subtitle" },
};
