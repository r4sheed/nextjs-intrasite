import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Enable React Compiler for automatic memoization (Next.js 16)
  reactCompiler: true,
  // Image config adjustments
  images: {
    localPatterns: [
      {
        pathname: '/assets/images/**',
        search: '',
      },
    ],
  },
};

export default nextConfig;
