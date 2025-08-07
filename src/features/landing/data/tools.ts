export interface ToolCategory {
  title: string;
  iconSrc: string;
  iconAlt: string;
  features: string[];
  description: string;
}

export const toolCategories: ToolCategory[] = [
  {
    title: "Translation",
    iconSrc: "/icons/landing/translate.svg",
    iconAlt: "Translation Icon",
    features: ["Paraphraser", "Grammar Checker", "Plagiarism Checker"],
    description: "Terjemahkan dokumen dan Teks dengan mudah serta gratis.",
  },
  {
    title: "Konversi File",
    iconSrc: "/icons/landing/convert.svg",
    iconAlt: "Konversi Icon",
    features: ["Image to PDF", "DOCX to PDF", "PDF to DOCX"],
    description: "Konversi file ke berbagai format dengan cepat tanpa hambatan.",
  },
  {
    title: "Kustom PDF",
    iconSrc: "/icons/landing/editpdf.svg",
    iconAlt: "Edit PDF Icon",
    features: ["Merge PDFs", "Split PDFs", "Compress PDF"],
    description: "Melihat, membuat anotasi, menambahkan teks atau gambar.",
  },
  {
    title: "Image Editing Tools",
    iconSrc: "/icons/landing/multipdf.svg",
    iconAlt: "Image Tools Icon",
    features: ["Resize", "Compress", "Convert Format"],
    description: "Menggabungkan, Memutar, Mengatur Ulang, dan Menghapus gambar",
  },
  {
    title: "Paraphrasing Tools",
    iconSrc: "/icons/landing/paraphrase.svg",
    iconAlt: "Paraphrasing Icon",
    features: ["Resize", "Compress", "Convert Format"],
    description: "Ubah kalimat jadi lebih natural atau formal",
  },
];
