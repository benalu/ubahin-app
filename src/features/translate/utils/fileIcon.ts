export function getFileIcon(fileName: string) {
  const ext = fileName.toLowerCase().split(".").pop() || "";
  const iconMap: Record<string, string> = {
    pdf: "📄",
    doc: "📝",
    docx: "📝",
    ppt: "📊",
    pptx: "📊",
    xls: "📋",
    xlsx: "📋",
  };
  return iconMap[ext] || "📎";
}
