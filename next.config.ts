import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'fyc3c1bv8t.ufs.sh',
      },
    ],
  },
};

export default nextConfig;
