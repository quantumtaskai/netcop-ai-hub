import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Production optimizations
  compress: true,
  
  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
  
  // Performance optimizations
  experimental: {
    // optimizeCss: true, // Disabled temporarily due to critters dependency issue
    optimizePackageImports: ['react-hot-toast', 'zustand'],
  },
  
  // Build and runtime configuration
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: true, // Temporarily allow warnings during build
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
