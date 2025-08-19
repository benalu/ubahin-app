// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // ✅ opsi yang valid
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [16, 20, 24, 32, 40, 48, 64, 96, 128, 256, 384],
    imageSizes: [16, 20, 24, 32, 40, 48, 64, 96],
    minimumCacheTTL: 31536000,
    // unoptimized: false, // default juga false; boleh dihapus
    // ❌ quality: 85, // hapus: bukan properti valid
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
}
export default nextConfig
