/**
 * Middleware helper utilities for secure route handling and matching.
 * Provides pathname normalization, safe redirect validation, and dynamic route matching.
 */

/**
 * Normalizes a pathname by removing trailing slashes while preserving root '/'.
 *
 * @param pathname - The pathname to normalize
 * @returns Normalized pathname without trailing slash (except for root)
 *
 * @example
 * normalizePathname('/auth/login/') // '/auth/login'
 * normalizePathname('/') // '/'
 * normalizePathname('/settings') // '/settings'
 */
export function normalizePathname(pathname: string): string {
  if (pathname === '/' || pathname === '') {
    return '/';
  }
  return pathname.replace(/\/$/, '');
}

/**
 * Validates that a callback URL is safe for internal redirects only.
 * Prevents open-redirect vulnerabilities by ensuring the URL is relative
 * or matches the current origin.
 *
 * @param callbackUrl - The URL to validate (can be relative or absolute)
 * @param currentOrigin - The current request origin for validation
 * @returns Sanitized callback URL if safe, null if potentially malicious
 *
 * @example
 * // Safe relative URLs
 * validateCallbackUrl('/dashboard', 'https://example.com') // '/dashboard'
 * validateCallbackUrl('/settings?tab=profile', 'https://example.com') // '/settings?tab=profile'
 *
 * // Safe absolute URLs (same origin)
 * validateCallbackUrl('https://example.com/dashboard', 'https://example.com') // '/dashboard'
 *
 * // Unsafe external URLs
 * validateCallbackUrl('https://evil.com', 'https://example.com') // null
 * validateCallbackUrl('//evil.com', 'https://example.com') // null
 */
export function validateCallbackUrl(
  callbackUrl: string,
  currentOrigin: string
): string | null {
  // Empty or only whitespace
  if (!callbackUrl || !callbackUrl.trim()) {
    return null;
  }

  // Reject URLs that start with javascript:, data:, etc.
  const dangerousProtocols = /^(javascript|data|vbscript):/i;
  if (dangerousProtocols.test(callbackUrl)) {
    return null;
  }

  // Relative URLs starting with / are safe (but not protocol-relative //)
  if (callbackUrl.startsWith('/') && !callbackUrl.startsWith('//')) {
    return callbackUrl;
  }

  // Absolute URLs - must match current origin
  try {
    const url = new URL(callbackUrl, currentOrigin);
    const current = new URL(currentOrigin);

    // Check if origin matches (protocol + hostname + port)
    if (url.origin === current.origin) {
      // Return only the pathname + search + hash (strip origin)
      return `${url.pathname}${url.search}${url.hash}`;
    }

    // External URL - reject
    return null;
  } catch {
    // If URL constructor fails, it's invalid - reject
    return null;
  }
}

/**
 * Escapes special regex characters in a string for safe use in RegExp constructor.
 *
 * @param str - String to escape
 * @returns Escaped string safe for regex
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Creates a strict prefix matcher that ensures the prefix is followed by / or end of string.
 * Prevents false positives like /api/auth matching /api/authentication.
 *
 * @param prefix - The prefix to match (e.g., '/api/auth')
 * @returns RegExp that strictly matches the prefix
 *
 * @example
 * const matcher = createStrictPrefixMatcher('/api/auth');
 * matcher.test('/api/auth') // true
 * matcher.test('/api/auth/callback') // true
 * matcher.test('/api/authentication') // false
 */
export function createStrictPrefixMatcher(prefix: string): RegExp {
  const escaped = escapeRegex(prefix);
  return new RegExp(`^${escaped}(?:/|$)`);
}

/**
 * Converts a Next.js dynamic route pattern to a RegExp for matching.
 * Supports [param] and [...slug] patterns.
 *
 * @param pattern - Next.js route pattern (e.g., '/posts/[id]', '/blog/[...slug]')
 * @returns RegExp that matches the pattern
 *
 * @example
 * const matcher = routePatternToRegex('/posts/[id]');
 * matcher.test('/posts/123') // true
 * matcher.test('/posts/abc-def') // true
 * matcher.test('/posts') // false
 * matcher.test('/posts/123/edit') // false
 *
 * const catchAll = routePatternToRegex('/blog/[...slug]');
 * catchAll.test('/blog/a') // true
 * catchAll.test('/blog/a/b/c') // true
 */
export function routePatternToRegex(pattern: string): RegExp {
  // Escape special regex characters
  let regexPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Replace [...slug] catch-all segments with regex (matches one or more path segments)
  regexPattern = regexPattern.replace(/\\\[\\\.\\\.\\\.([^\]]+)\\\]/g, '(.+)');

  // Replace [param] dynamic segments with regex (matches single path segment, no slashes)
  regexPattern = regexPattern.replace(/\\\[([^\]]+)\\\]/g, '([^/]+)');

  // Ensure exact match
  return new RegExp(`^${regexPattern}$`);
}

/**
 * Checks if a pathname matches any route in a set, supporting dynamic route patterns.
 * First tries exact match, then tries pattern matching for dynamic routes.
 *
 * @param pathname - The pathname to check (should be normalized)
 * @param routeSet - Set of route patterns (can include dynamic patterns like /posts/[id])
 * @returns True if pathname matches any route pattern
 *
 * @example
 * const routes = new Set(['/home', '/posts/[id]', '/blog/[...slug]']);
 * matchesRoute('/home', routes) // true
 * matchesRoute('/posts/123', routes) // true
 * matchesRoute('/blog/a/b/c', routes) // true
 * matchesRoute('/unknown', routes) // false
 */
export function matchesRoute(pathname: string, routeSet: Set<string>): boolean {
  // Fast path: exact match
  if (routeSet.has(pathname)) {
    return true;
  }

  // Slow path: check dynamic patterns
  for (const route of routeSet) {
    // Skip if no dynamic segments
    if (!route.includes('[')) {
      continue;
    }

    const regex = routePatternToRegex(route);
    if (regex.test(pathname)) {
      return true;
    }
  }

  return false;
}
