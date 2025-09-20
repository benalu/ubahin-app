// src/features/translate/hooks/useFileTranslate.tsx
"use client";

import { useCallback, useState } from "react";
import { toastError, toastSuccess } from "@/lib/errors/notify";
import { createFileError, getErrorMessage } from "@/lib/errors/errorMessages";
import { isDeepLDocName } from "@/lib/constants/translateDocs";
import { normalizeUiCode } from "@/lib/constants/lang";
import { MAX_UPLOAD_FILES, MAX_FILE_SIZE } from "@/lib/constants/file";

type LangCode = string;

export type JobStatus = "idle" | "uploading" | "processing" | "done" | "error";
export type JobInfo = { status: JobStatus; secondsRemaining?: number; error?: string };

// DeepL response types + guards
type DeepLUploadOk = { document_id: string; document_key: string };
type DeepLErrorPayload = { error?: string; message?: string; [k: string]: unknown };
type DeepLStatusOk = {
  status: "queued" | "translating" | "done" | "error";
  seconds_remaining?: number;
  error_message?: string;
};

/** Strict helpers (tanpa any) */
function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null;
}
function isDeepLUploadOk(x: unknown): x is DeepLUploadOk {
  if (!isRecord(x)) return false;
  const id = x["document_id"];
  const key = x["document_key"];
  return typeof id === "string" && typeof key === "string";
}
function isDeepLStatusOk(x: unknown): x is DeepLStatusOk {
  if (!isRecord(x)) return false;

  const status = x["status"];
  if (
    status !== "queued" &&
    status !== "translating" &&
    status !== "done" &&
    status !== "error"
  ) return false;

  if ("seconds_remaining" in x) {
    const sr = x["seconds_remaining"];
    if (typeof sr !== "number") return false;
  }

  if ("error_message" in x) {
    const em = x["error_message"];
    if (typeof em !== "string" && typeof em !== "undefined") return false;
  }

  return true;
}

export function useFileTranslate(opts: { sourceLang: LangCode; targetLang: LangCode }) {
  const { sourceLang, targetLang } = opts;

  const [files, setFiles] = useState<File[]>([]);
  const [jobs, setJobs] = useState<Record<number, JobInfo>>({});
  const [working, setWorking] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const setJob = useCallback((i: number, patch: Partial<JobInfo>) => {
    setJobs((prev) => {
      const current: JobInfo = prev[i] ?? { status: "idle" };
      const next: JobInfo = { ...current, ...patch, status: (patch.status ?? current.status) as JobStatus };
      return { ...prev, [i]: next };
    });
  }, []);

  /** Pisahkan file yang didukung DeepL (berdasarkan nama/ekstensi) */
  function partitionSupported(list: FileList | File[]): { accepted: File[]; rejected: File[] } {
    const arr = Array.isArray(list) ? list : Array.from(list);
    const accepted: File[] = [];
    const rejected: File[] = [];
    for (const f of arr) {
      if (isDeepLDocName(f.name)) accepted.push(f);
      else rejected.push(f);
    }
    return { accepted, rejected };
  }

  /** Sisa slot untuk UI & guard */
  const remainingSlots = useCallback(() => Math.max(0, MAX_UPLOAD_FILES - files.length), [files.length]);

  /** Tambah file (validasi format/ukuran/duplikat/limit) */
  const addFiles = useCallback((fileList: FileList | File[]) => {
    const { accepted, rejected } = partitionSupported(fileList);

    // 1) format tidak didukung
    if (rejected.length) {
      const first = rejected[0];
      const extra = rejected.length > 1 ? ` dan ${rejected.length - 1} file lain` : "";
      toastError(createFileError("UNSUPPORTED_FORMAT", `${first.name}${extra}`));
    }

    // 2) size limit
    const tooLarge = accepted.filter((f) => f.size > MAX_FILE_SIZE);
    if (tooLarge.length) {
      const first = tooLarge[0];
      const extra = tooLarge.length > 1 ? ` dan ${tooLarge.length - 1} file lain` : "";
      toastError(createFileError("FILE_TOO_LARGE", `${first.name}${extra}`, { fileSize: first.size }));
    }
    const sizeOk = accepted.filter((f) => f.size <= MAX_FILE_SIZE);

    // 3) dedupe by filename
    const existingNames = new Set(files.map((f) => f.name));
    const deduped = sizeOk.filter((f) => !existingNames.has(f.name));
    const dupCount = sizeOk.length - deduped.length;
    if (dupCount > 0) {
      toastError(createFileError("DUPLICATE_FILE", `${dupCount} file`));
    }

    // 4) limit jumlah file
    const slots = remainingSlots();
    if (slots <= 0 && deduped.length) {
      toastError(createFileError("TOO_MANY_FILES", `${MAX_UPLOAD_FILES} file`));
      return;
    }
    const toAdd = deduped.slice(0, slots);
    const overflow = deduped.length - toAdd.length;
    if (overflow > 0) {
      toastError(createFileError("TOO_MANY_FILES", `${MAX_UPLOAD_FILES} file`));
    }

    if (toAdd.length) {
      setFiles((prev) => [...prev, ...toAdd]);
    }
  }, [files, remainingSlots]);

  /** Drag state handlers */
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);
  const onDragLeave = useCallback((e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragging(false);
  }, []);
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  }, [addFiles]);

  /** Hapus file + re-index jobs agar status tidak salah sasaran */
  const removeFile = useCallback((index: number) => {
    setFiles((prevFiles) => {
      const nextFiles = prevFiles.filter((_, i) => i !== index);
      setJobs((prevJobs) => {
        const next: Record<number, JobInfo> = {};
        let cursor = 0;
        for (let i = 0; i < prevFiles.length; i++) {
          if (i === index) continue;
          const job = prevJobs[i];
          if (job) next[cursor] = job;
          cursor++;
        }
        return next;
      });
      return nextFiles;
    });
  }, []);

  const clearAll = useCallback(() => {
    setFiles([]);
    setJobs({});
  }, []);

  /** Pipeline terjemah satu file */
  async function translateOne(i: number, file: File) {
    try {
      setJob(i, { status: "uploading", error: undefined, secondsRemaining: undefined });

      const uiTarget = normalizeUiCode(targetLang);
      const uiSource = normalizeUiCode(sourceLang);

      // 1) Upload
      const fd = new FormData();
      fd.set("file", file);
      fd.set("targetLang", uiTarget);
      if (uiSource !== "auto") fd.set("sourceLang", uiSource);

      const upRes = await fetch("/api/translate/deepl/document", { method: "POST", body: fd });
      const upCT = upRes.headers.get("content-type") || "";
      const upIsJson = upCT.toLowerCase().includes("application/json");
      if (!upIsJson) throw new Error("Unexpected response from upload (non-JSON)");

      const upJson: unknown = await upRes.json();
      if (!upRes.ok) {
        const err = upJson as DeepLErrorPayload;
        throw new Error(err.error || err.message || "Upload failed");
      }
      if (!isDeepLUploadOk(upJson)) throw new Error("Invalid upload payload");
      const { document_id, document_key } = upJson;

      setJob(i, { status: "processing" });

      // 2) Poll status
      let done = false;
      while (!done) {
        await new Promise((r) => setTimeout(r, 1200));
        const stRes = await fetch(
          `/api/translate/deepl/document/status?document_id=${encodeURIComponent(document_id)}&document_key=${encodeURIComponent(document_key)}`
        );
        const stJson: unknown = await stRes.json();
        if (!stRes.ok) {
          const err = stJson as DeepLErrorPayload;
          throw new Error(err.error || err.message || "Status error");
        }
        if (!isDeepLStatusOk(stJson)) throw new Error("Invalid status payload");

        const st = (stJson as DeepLStatusOk).status;
        if (st === "done") {
          done = true;
        } else if (st === "error") {
          const em = (stJson as DeepLStatusOk).error_message;
          throw new Error(em || "DeepL document error");
        } else {
          setJob(i, {
            status: "processing",
            secondsRemaining:
              typeof (stJson as DeepLStatusOk).seconds_remaining === "number"
                ? (stJson as DeepLStatusOk).seconds_remaining
                : undefined,
          });
        }
      }

      // 3) Download
      const dlRes = await fetch(
        `/api/translate/deepl/document/download?document_id=${encodeURIComponent(document_id)}&document_key=${encodeURIComponent(document_key)}`
      );
      if (!dlRes.ok) {
        const payload = await dlRes.text();
        throw new Error(payload.slice(0, 200));
      }
      const blob = await dlRes.blob();
      const url = URL.createObjectURL(blob);

      const dot = file.name.lastIndexOf(".");
      const base = dot > 0 ? file.name.slice(0, dot) : file.name;
      const ext = dot > 0 ? file.name.slice(dot) : "";
      const a = document.createElement("a");
      a.href = url;
      a.download = `${base}.translated${ext || ""}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      setJob(i, { status: "done", secondsRemaining: undefined });
      toastSuccess(`"${file.name}" selesai diterjemahkan`);
    } catch (e: unknown) {
      const em = getErrorMessage(e instanceof Error ? e : String(e), {
        operation: "convert",
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      });
      toastError(em);
      setJob(i, { status: "error", error: em.message, secondsRemaining: undefined });
    }
  }

  /** Jalankan semua file berurutan (menghormati status 'done') */
  async function translateAll() {
    if (working) return;
    if (!files.length) {
      // gunakan error generic tanpa memaksa fileName
      toastError("BAD_REQUEST");
      return;
    }
    setWorking(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const st = jobs[i]?.status;
        if (st === "done") continue;
        // eslint-disable-next-line no-await-in-loop
        await translateOne(i, files[i]);
      }
    } finally {
      setWorking(false);
    }
  }

  return {
    files,
    jobs,
    working,
    isDragging,
    addFiles,
    onDragOver,
    onDragLeave,
    onDrop,
    removeFile,
    clearAll,
    translateAll,
    setFiles, // diekspos jika dibutuhkan
    /** untuk UI */
    maxFiles: MAX_UPLOAD_FILES,
    remaining: remainingSlots(),
  };
}
