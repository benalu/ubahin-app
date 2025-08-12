// src/lib/security/csp.ts
export function buildCSP(appUrl: string) {
  const self = appUrl;
  const directives = [
    `default-src 'self' ${self}`,
    // Biarkan inline *script* default Next jalan. (Jika mau super ketat, kita bisa tambah nonce flow nanti.)
    `script-src 'self' 'unsafe-inline' ${self}`,
    `style-src 'self' 'unsafe-inline' ${self}`,
    `img-src 'self' data: blob:`,
    `font-src 'self' data:`,
    `connect-src 'self' ${self} https://api.deepl.com https://api-free.deepl.com https://api.cloudconvert.com https://status.cloudconvert.com https://storage.cloudconvert.com`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self' https://upload.cloudconvert.com`,
    `frame-ancestors 'self'`,
    // opsional tapi bagus:
    `upgrade-insecure-requests`
  ];
  return directives.join("; ");
}
