import createNextIntlPlugin from 'next-intl/plugin';

import { createMDX } from 'fumadocs-mdx/next';

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
    ],
  },
  serverExternalPackages: ['pino', 'pino-pretty', 'thread-stream'],
  reactCompiler: true,
  redirects() {
    return [
      {
        source: "/",
        destination: "/news",
        permanent: true,
      },
    ];
  },
};


const withMDX = createMDX({
  // customise the config file path
  // configPath: "source.config.ts"
});

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(withMDX(nextConfig));
