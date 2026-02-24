import { updateSession } from "@/lib/supabase/proxy"
import { type NextRequest, NextResponse } from "next/server"
import createMiddleware from 'next-intl/middleware';
import {routing} from '@/i18n/routing';

const intlMiddleware = createMiddleware(routing)

const PUBLIC_FILE_PATTERNS = [
  '/robots.txt',
  '/sitemap.xml',
  '/favicon.ico',
  '/manifest.webmanifest',
  // add others if needed: apple-touch-icon, browserconfig.xml, etc.
];

export default async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // ── 1. Skip everything for static metadata files ────────────────────────
  if (PUBLIC_FILE_PATTERNS.some((p) => pathname === p || pathname.startsWith(`${p}?`))) {
    return NextResponse.next();
  }

  // ── 2. Run next-intl middleware (locale detection, redirect, rewrite) ───
  const intlResponse = intlMiddleware(request);

  // If next-intl wants to redirect/rewrite, do it before any auth/session logic.
  const isRedirect = intlResponse.headers.has('location')
  const isRewrite = intlResponse.headers.has('x-middleware-rewrite')
  if (isRedirect || isRewrite) return intlResponse

  // Only run Supabase session logic if env vars are set
  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  ) {
    const response = await updateSession(request)

    // Merge headers produced by next-intl (e.g. locale handling) into the final response.
    intlResponse.headers.forEach((value, key) => {
      if (key.toLowerCase() === 'set-cookie') return
      response.headers.set(key, value)
    })

    // Protect admin routes
    if (request.nextUrl.pathname.startsWith("/admin") || request.nextUrl.pathname.startsWith("/pt/admin") || request.nextUrl.pathname.startsWith("/en/admin")) {
      const { createServerClient } = await import("@supabase/ssr")
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll()
            },
            setAll() {},
          },
        }
      )
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        const url = request.nextUrl.clone()
        url.pathname = "/pt/auth/login"
        return NextResponse.redirect(url)
      }
    }

    return response
  }

  // If no Supabase, block admin routes
  if (request.nextUrl.pathname.startsWith("/admin") || request.nextUrl.pathname.startsWith("/pt/admin") || request.nextUrl.pathname.startsWith("/en/admin")) {
    const url = request.nextUrl.clone()
    url.pathname = "/pt/auth/login"
    return NextResponse.redirect(url)
  }

  const next = NextResponse.next()
  intlResponse.headers.forEach((value, key) => {
    if (key.toLowerCase() === 'set-cookie') return
    next.headers.set(key, value)
  })

  return next
}

export const config = {
  matcher: [
    '/((?!api|trpc|_next/static|_next/image|_vercel|favicon.ico|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|xml)$).*)',
  ],
}
