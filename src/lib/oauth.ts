import { env } from '@/lib/env';

/**
 * OAuth utilities factory
 */
export const oauth = {
  hasGoogle: () => !!(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET),
  hasGithub: () => !!(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET),
} as const;
