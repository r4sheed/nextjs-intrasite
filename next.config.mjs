import createNextIntlPlugin from 'next-intl/plugin';

import { createMDX } from 'fumadocs-mdx/next';

/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['pino', 'pino-pretty', 'thread-stream'],
  reactCompiler: true,
};


const withMDX = createMDX({
  // customise the config file path
  // configPath: "source.config.ts"
});

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(withMDX(nextConfig));
