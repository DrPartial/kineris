import { NextResponse, type NextRequest } from 'next/server'
import { GATE_COOKIE, gateToken } from '@/lib/siteGate'

export async function middleware(req: NextRequest) {
  const password = process.env.SITE_PASSWORD
  if (!password) return NextResponse.next()
  if (req.nextUrl.pathname === '/gate') return NextResponse.next()

  if (req.cookies.get(GATE_COOKIE)?.value === (await gateToken(password))) return NextResponse.next()

  // API/data requests get a plain 401; pages are sent to the password form.
  if (req.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'Password required' }, { status: 401 })
  }
  const url = req.nextUrl.clone()
  url.pathname = '/gate'
  url.search = `?next=${encodeURIComponent(req.nextUrl.pathname + req.nextUrl.search)}`
  return NextResponse.redirect(url)
}

export const config = {
  matcher: ['/((?!_next/static|favicon.ico).*)'],
}
