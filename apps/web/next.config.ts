import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Lets Next trace @kineris/shared's source (not a separate build step)
  // across the workspace boundary into this app's server/client bundles.
  transpilePackages: ['@kineris/shared'],
}

export default nextConfig
