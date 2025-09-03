import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    // Enable image optimization instead of using unoptimized
    unoptimized: false,
    // Add image domains if you're fetching images from external sources
    domains: ['localhost'],
    // Add remote patterns if needed
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Enable React StrictMode for better development experience
  reactStrictMode: true,
  // SWC minification is enabled by default in Next.js 15
  // swcMinify: true,
  // Configure compiler options
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
    // Enable styled-components if needed
    // styledComponents: true,
  },
  // Add custom webpack configuration
  webpack: (config, { isServer }) => {
    // Add optimizations here if needed
    return config;
  },
}

export default withBundleAnalyzer(nextConfig);

