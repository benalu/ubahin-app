// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { nanoid } from 'nanoid'

// Middleware ini akan berjalan sebelum semua route yang cocok

export function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const sessionId = req.cookies.get('session-id')?.value

  if (!sessionId) {
    const newId = nanoid()
    res.cookies.set('session-id', newId, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 hari
    })
  }

  // ✅ Kamu bisa tambahkan bot check, logging, rate-limit di sini juga

  return res
}

// ⛔ Jalankan hanya di route API convert, status, wait
export const config = {
  matcher: [
    '/api/file-conversion/:path*',
  ],
}
