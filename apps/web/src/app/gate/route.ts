import { NextResponse, type NextRequest } from 'next/server'
import { GATE_COOKIE, gateToken } from '@/lib/siteGate'

const page = (error: boolean, next: string) => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex"><title>Kineris</title>
<style>
:root{color-scheme:dark}
body{margin:0;min-height:100svh;display:grid;place-items:center;background:#0b1512;color:#eef0ea;font-family:ui-sans-serif,system-ui,sans-serif}
form{width:min(340px,86vw)}
h1{font-size:1.6rem;letter-spacing:-.02em;margin:0 0 .4rem}
p{margin:0 0 1.4rem;color:#9aa8a1;font-size:.95rem}
input{box-sizing:border-box;width:100%;padding:.8rem 1rem;border-radius:8px;border:1px solid #2c3d37;background:#101d19;color:inherit;font-size:1rem}
button{margin-top:.75rem;width:100%;padding:.8rem 1rem;border:0;border-radius:8px;background:#eef0ea;color:#0b1512;font-weight:600;font-size:1rem;cursor:pointer}
.err{color:#ff8a5c;margin:.6rem 0 0;font-size:.9rem}
</style></head><body>
<form method="post" action="/gate">
<h1>Kineris</h1><p>This site is not public yet. Enter the password to continue.</p>
<input type="hidden" name="next" value="${next.replace(/[^\w/%?=&.\-~]/g, '')}">
<input type="password" name="password" placeholder="Password" autofocus required autocomplete="current-password">
<button type="submit">Enter</button>
${error ? '<p class="err">Incorrect password.</p>' : ''}
</form></body></html>`

const safeNext = (n: string | null | undefined) => (n && n.startsWith('/') && !n.startsWith('//') ? n : '/')

export function GET(req: NextRequest) {
  const next = safeNext(req.nextUrl.searchParams.get('next'))
  return new NextResponse(page(req.nextUrl.searchParams.has('error'), next), {
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' },
  })
}

export async function POST(req: NextRequest) {
  const password = process.env.SITE_PASSWORD
  const form = await req.formData()
  const next = safeNext(String(form.get('next') ?? '/'))
  if (!password || form.get('password') !== password) {
    return NextResponse.redirect(new URL(`/gate?error=1&next=${encodeURIComponent(next)}`, req.url), 303)
  }
  const res = NextResponse.redirect(new URL(next, req.url), 303)
  res.cookies.set(GATE_COOKIE, await gateToken(password), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })
  return res
}
