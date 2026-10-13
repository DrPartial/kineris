import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Lets Next trace @kineris/shared's source (not a separate build step)
  // across the workspace boundary into this app's server/client bundles.
  transpilePackages: ['@kineris/shared'],
  // On Vercel the browser calls same-origin /api/*, proxied to the backend project, so the
  // session cookie is first-party. Locally BACKEND_URL is unset and the client hits :4000 directly.
  async rewrites() {
    const backend = process.env.BACKEND_URL
    return backend ? [{ source: '/api/:path*', destination: `${backend}/api/:path*` }] : []
  },
}

export default nextConfig
