import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // Apply CORS headers only to the manifest.json file
  if (req.nextUrl.pathname === '/manifest.json') {
    res.headers.set('Access-Control-Allow-Origin', '*')
    res.headers.set('Access-Control-Allow-Methods', 'GET')
    res.headers.set('Access-Control-Allow-Headers', 'X-Requested-With, content-type, Authorization')
  }

  return res
}

export const config = {
  matcher: '/manifest.json', // Apply this middleware only to /manifest.json
}
