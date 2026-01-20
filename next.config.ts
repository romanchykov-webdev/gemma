import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: false,
  experimental: {
    scrollRestoration: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'twjhdhfkcwoapajrkakp.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    // Форматы
    formats: ['image/webp', 'image/avif'],
    qualities: [70, 75, 80, 90],
  },
};

export default nextConfig;
