/**
 * Cache and rendering configuration constants for Next.js features.
 * Centralizing these avoids hardcoded values scattered across the codebase.
 */

export const REVALIDATE = {
  /** Default ISR revalidation window in seconds */
  DEFAULT: 60,
} as const;

export const CACHE_TAGS = {
  /** Posts-related fetches */
  POSTS: 'posts',
  /** Auth/session-related fetches */
  AUTH: 'auth',
} as const;

/**
 * Rendering mode constants to be used in route segments.
 * See: https://nextjs.org/docs/app/building-your-application/rendering/static-and-dynamic-rendering
 */
export const RENDERING = {
  /** Use with `export const dynamic` */
  DYNAMIC: 'force-dynamic' as const,
  STATIC: 'force-static' as const,
  ERROR_ON_DYNAMIC: 'error' as const,
  /** Use with `export const revalidate` */
  REVALIDATE_SECONDS: 60 as const,
};

export type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS];
