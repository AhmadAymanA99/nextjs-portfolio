import { NextResponse, type NextRequest } from 'next/server'

/**
 * Pages live under app/[lang]. English keeps the unprefixed URLs (/faq), so
 * they are rewritten to /en/faq internally; Arabic is served as-is (/ar/faq).
 * A visitor who types /en/... is redirected to the unprefixed URL, so every
 * page has exactly one public address per language.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname === '/ar' || pathname.startsWith('/ar/')) return NextResponse.next()

  const url = request.nextUrl.clone()
  if (pathname === '/en' || pathname.startsWith('/en/')) {
    url.pathname = pathname.slice(3) || '/'
    return NextResponse.redirect(url, 308)
  }

  url.pathname = pathname === '/' ? '/en' : `/en${pathname}`
  return NextResponse.rewrite(url)
}

export const config = {
  // Everything except API routes, the admin area, Next.js internals and files
  // (anything with a dot: /rss.xml, /sitemap.xml, /images/…)
  matcher: ['/((?!api|admin|_next|_vercel|.*\\..*).*)'],
}
