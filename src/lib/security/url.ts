// src/lib/security/url.ts
export function isTrustedDownloadUrl(raw: string) {
  try {
    const u = new URL(raw);
    const allowedHosts = [
      "storage.cloudconvert.com",
      "download.cloudconvert.com",
      "cloudconvert.com"
      // tambahkan kalau CloudConvert mengubah host CDN-nya
    ];
    const isHttps = u.protocol === "https:";
    const allowed = allowedHosts.some((h) => u.hostname === h || u.hostname.endsWith(`.${h}`));
    return isHttps && allowed;
  } catch {
    return false;
  }
}
