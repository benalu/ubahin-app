// src/features/fileConversion/lib/apiUtils.ts

import { UploadedFile } from '@/types/type';

type ConvertResult = {
  success: boolean;
  jobId?: string;
  upload?: {
    url: string;
    parameters: Record<string, string>;
  };
  downloadUrl?: string;
};

export async function convertFileToCloudConvert(
  item: UploadedFile
): Promise<ConvertResult> {
  // Step 1: Minta signed upload URL dari server
  const metadata = new FormData();
  metadata.append('fileName', item.file.name);
  metadata.append('outputFormat', item.outputFormat);

  const res = await fetch('/api/file-conversion/convert', {
    method: 'POST',
    body: metadata,
  });

  if (!res.ok) {
    console.error('[Convert] Gagal mendapatkan instruksi upload');
    return { success: false };
  }

  const {
    uploadForm,
    jobId,
  }: {
    uploadForm: {
      url: string;
      parameters: Record<string, string>;
    };
    jobId: string;
  } = await res.json();

  const uploadUrl = uploadForm.url;
  const uploadParams = uploadForm.parameters;

  // Step 2: Upload langsung ke CloudConvert
  const uploadFormData = new FormData();
  Object.entries(uploadParams).forEach(([key, value]) => {
    uploadFormData.append(key, String(value));
  });
  uploadFormData.append('file', item.file);

  const uploadRes = await fetch(uploadUrl, {
    method: 'POST',
    body: uploadFormData,
  });

  if (!uploadRes.ok) {
    console.error('[Convert] Upload gagal');
    return { success: false };
  }

  // Step 3: Beritahu server bahwa job siap dimulai
  await fetch('/api/file-conversion/wait', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jobId }),
  });

  // Step 4: Cek status (1x) — bisa diulang pakai polling di luar fungsi ini
  const statusRes = await fetch(`/api/file-conversion/status?jobId=${jobId}`);
  const statusJson = await statusRes.json();

  return {
    success: true,
    jobId,
    upload: {
      url: uploadUrl,
      parameters: uploadParams,
    },
    downloadUrl: statusJson?.downloadUrl,
  };
}

export function getFileExtensionFromFilename(name: string): string {
  const ext = name.includes('.') ? name.split('.').pop() : '';
  return ext?.toLowerCase() || '';
}
