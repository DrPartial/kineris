import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@kineris/shared'],
  // On Vercel the browser calls same-origin /api/*, proxied to the backend project, so the
  // admin session cookie is first-party. Locally BACKEND_URL is unset and :4000 is called directly.
  async rewrites() {
    const backend = process.env.BACKEND_URL
    return backend ? [{ source: '/api/:path*', destination: `${backend}/api/:path*` }] : []
  },
}

export default nextConfig
