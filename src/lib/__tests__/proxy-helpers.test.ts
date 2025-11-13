import { describe, expect, it } from 'vitest';

import {
  createStrictPrefixMatcher,
  matchesRoute,
  normalizePathname,
  routePatternToRegex,
  validateCallbackUrl,
} from '../proxy-helpers';

describe('normalizePathname', () => {
  it('should preserve root path', () => {
    expect(normalizePathname('/')).toBe('/');
  });

  it('should remove trailing slash from regular paths', () => {
    expect(normalizePathname('/auth/login/')).toBe('/auth/login');
    expect(normalizePathname('/settings/')).toBe('/settings');
    expect(normalizePathname('/posts/123/')).toBe('/posts/123');
  });

  it('should handle paths without trailing slash', () => {
    expect(normalizePathname('/auth/login')).toBe('/auth/login');
    expect(normalizePathname('/settings')).toBe('/settings');
  });

  it('should handle empty string as root', () => {
    expect(normalizePathname('')).toBe('/');
  });

  it('should handle multiple trailing slashes', () => {
    expect(normalizePathname('/auth/login///')).toBe('/auth/login//');
  });
});

describe('validateCallbackUrl', () => {
  const origin = 'https://example.com';

  describe('safe relative URLs', () => {
    it('should accept simple relative paths', () => {
      expect(validateCallbackUrl('/dashboard', origin)).toBe('/dashboard');
      expect(validateCallbackUrl('/settings', origin)).toBe('/settings');
      expect(validateCallbackUrl('/', origin)).toBe('/');
    });

    it('should accept relative paths with query strings', () => {
      expect(validateCallbackUrl('/settings?tab=profile', origin)).toBe(
        '/settings?tab=profile'
      );
      expect(validateCallbackUrl('/posts?page=2&sort=date', origin)).toBe(
        '/posts?page=2&sort=date'
      );
    });

    it('should accept relative paths with hashes', () => {
      expect(validateCallbackUrl('/dashboard#section', origin)).toBe(
        '/dashboard#section'
      );
      expect(validateCallbackUrl('/settings?tab=1#top', origin)).toBe(
        '/settings?tab=1#top'
      );
    });
  });

  describe('safe absolute URLs (same origin)', () => {
    it('should accept same-origin absolute URLs and strip origin', () => {
      expect(validateCallbackUrl('https://example.com/dashboard', origin)).toBe(
        '/dashboard'
      );
      expect(
        validateCallbackUrl('https://example.com/settings?tab=profile', origin)
      ).toBe('/settings?tab=profile');
    });

    it('should handle URLs with port matching', () => {
      const originWithPort = 'https://example.com:3000';
      expect(
        validateCallbackUrl(
          'https://example.com:3000/dashboard',
          originWithPort
        )
      ).toBe('/dashboard');
    });

    it('should reject URLs with different ports', () => {
      const originWithPort = 'https://example.com:3000';
      expect(
        validateCallbackUrl(
          'https://example.com:4000/dashboard',
          originWithPort
        )
      ).toBeNull();
    });
  });

  describe('unsafe external URLs', () => {
    it('should reject different domain', () => {
      expect(validateCallbackUrl('https://evil.com', origin)).toBeNull();
      expect(
        validateCallbackUrl('https://evil.com/steal-data', origin)
      ).toBeNull();
    });

    it('should reject protocol-relative URLs', () => {
      expect(validateCallbackUrl('//evil.com', origin)).toBeNull();
      expect(validateCallbackUrl('//evil.com/phishing', origin)).toBeNull();
    });

    it('should reject different protocols', () => {
      expect(
        validateCallbackUrl('http://example.com/dashboard', origin)
      ).toBeNull();
    });

    it('should reject subdomain variations', () => {
      expect(validateCallbackUrl('https://sub.example.com', origin)).toBeNull();
      expect(validateCallbackUrl('https://evilexample.com', origin)).toBeNull();
    });
  });

  describe('invalid inputs', () => {
    it('should reject empty strings', () => {
      expect(validateCallbackUrl('', origin)).toBeNull();
      expect(validateCallbackUrl('   ', origin)).toBeNull();
    });

    it('should reject dangerous protocol URLs', () => {
      expect(validateCallbackUrl('javascript:alert(1)', origin)).toBeNull();
      expect(
        validateCallbackUrl('data:text/html,<script>alert(1)</script>', origin)
      ).toBeNull();
      expect(validateCallbackUrl('vbscript:msgbox(1)', origin)).toBeNull();
    });
  });
});

describe('createStrictPrefixMatcher', () => {
  it('should match exact prefix', () => {
    const matcher = createStrictPrefixMatcher('/api/auth');
    expect(matcher.test('/api/auth')).toBe(true);
  });

  it('should match prefix with trailing path', () => {
    const matcher = createStrictPrefixMatcher('/api/auth');
    expect(matcher.test('/api/auth/callback')).toBe(true);
    expect(matcher.test('/api/auth/signin')).toBe(true);
    expect(matcher.test('/api/auth/a/b/c')).toBe(true);
  });

  it('should not match similar but different paths', () => {
    const matcher = createStrictPrefixMatcher('/api/auth');
    expect(matcher.test('/api/authentication')).toBe(false);
    expect(matcher.test('/api/authorize')).toBe(false);
    expect(matcher.test('/api/auth-service')).toBe(false);
  });

  it('should handle special regex characters in prefix', () => {
    const matcher = createStrictPrefixMatcher('/api/[test]');
    expect(matcher.test('/api/[test]')).toBe(true);
    expect(matcher.test('/api/[test]/callback')).toBe(true);
    expect(matcher.test('/api/other')).toBe(false);
  });

  it('should not match partial prefix', () => {
    const matcher = createStrictPrefixMatcher('/api/auth');
    expect(matcher.test('/api')).toBe(false);
    expect(matcher.test('/api/aut')).toBe(false);
  });
});

describe('routePatternToRegex', () => {
  describe('static routes', () => {
    it('should match exact static paths', () => {
      const regex = routePatternToRegex('/home');
      expect(regex.test('/home')).toBe(true);
      expect(regex.test('/home/')).toBe(false);
      expect(regex.test('/homes')).toBe(false);
    });
  });

  describe('dynamic segments [param]', () => {
    it('should match single dynamic segment', () => {
      const regex = routePatternToRegex('/posts/[id]');
      expect(regex.test('/posts/123')).toBe(true);
      expect(regex.test('/posts/abc')).toBe(true);
      expect(regex.test('/posts/abc-def-123')).toBe(true);
    });

    it('should not match missing segment', () => {
      const regex = routePatternToRegex('/posts/[id]');
      expect(regex.test('/posts')).toBe(false);
      expect(regex.test('/posts/')).toBe(false);
    });

    it('should not match nested path in single segment', () => {
      const regex = routePatternToRegex('/posts/[id]');
      expect(regex.test('/posts/123/edit')).toBe(false);
    });

    it('should match multiple dynamic segments', () => {
      const regex = routePatternToRegex('/users/[id]/posts/[postId]');
      expect(regex.test('/users/123/posts/456')).toBe(true);
      expect(regex.test('/users/abc/posts/xyz')).toBe(true);
      expect(regex.test('/users/123/posts')).toBe(false);
    });
  });

  describe('catch-all segments [...slug]', () => {
    it('should match single segment', () => {
      const regex = routePatternToRegex('/blog/[...slug]');
      expect(regex.test('/blog/a')).toBe(true);
    });

    it('should match multiple segments', () => {
      const regex = routePatternToRegex('/blog/[...slug]');
      expect(regex.test('/blog/a/b')).toBe(true);
      expect(regex.test('/blog/a/b/c/d')).toBe(true);
    });

    it('should not match empty catch-all', () => {
      const regex = routePatternToRegex('/blog/[...slug]');
      expect(regex.test('/blog')).toBe(false);
      expect(regex.test('/blog/')).toBe(false);
    });
  });

  describe('mixed patterns', () => {
    it('should handle mix of static and dynamic segments', () => {
      const regex = routePatternToRegex('/users/[id]/settings');
      expect(regex.test('/users/123/settings')).toBe(true);
      expect(regex.test('/users/abc/settings')).toBe(true);
      expect(regex.test('/users/123/profile')).toBe(false);
    });

    it('should handle dynamic segment followed by catch-all', () => {
      const regex = routePatternToRegex('/api/[version]/[...path]');
      expect(regex.test('/api/v1/users')).toBe(true);
      expect(regex.test('/api/v1/users/123/posts')).toBe(true);
      expect(regex.test('/api/v1')).toBe(false);
    });
  });

  describe('special characters', () => {
    it('should escape special regex characters in static parts', () => {
      const regex = routePatternToRegex('/api/v1.0/[id]');
      expect(regex.test('/api/v1.0/123')).toBe(true);
      expect(regex.test('/api/v1x0/123')).toBe(false);
    });
  });
});

describe('matchesRoute', () => {
  describe('static routes', () => {
    it('should match exact static routes', () => {
      const routes = new Set(['/home', '/about', '/contact']);
      expect(matchesRoute('/home', routes)).toBe(true);
      expect(matchesRoute('/about', routes)).toBe(true);
      expect(matchesRoute('/contact', routes)).toBe(true);
      expect(matchesRoute('/unknown', routes)).toBe(false);
    });
  });

  describe('dynamic routes', () => {
    it('should match dynamic segment patterns', () => {
      const routes = new Set(['/posts/[id]', '/users/[userId]']);
      expect(matchesRoute('/posts/123', routes)).toBe(true);
      expect(matchesRoute('/posts/abc-def', routes)).toBe(true);
      expect(matchesRoute('/users/456', routes)).toBe(true);
      expect(matchesRoute('/posts', routes)).toBe(false);
    });

    it('should match catch-all patterns', () => {
      const routes = new Set(['/blog/[...slug]', '/docs/[...path]']);
      expect(matchesRoute('/blog/a', routes)).toBe(true);
      expect(matchesRoute('/blog/a/b/c', routes)).toBe(true);
      expect(matchesRoute('/docs/intro/setup', routes)).toBe(true);
      expect(matchesRoute('/blog', routes)).toBe(false);
    });
  });

  describe('mixed routes', () => {
    it('should match both static and dynamic routes', () => {
      const routes = new Set([
        '/home',
        '/posts/[id]',
        '/blog/[...slug]',
        '/settings',
      ]);

      // Static
      expect(matchesRoute('/home', routes)).toBe(true);
      expect(matchesRoute('/settings', routes)).toBe(true);

      // Dynamic
      expect(matchesRoute('/posts/123', routes)).toBe(true);
      expect(matchesRoute('/blog/a/b/c', routes)).toBe(true);

      // No match
      expect(matchesRoute('/unknown', routes)).toBe(false);
    });
  });

  describe('performance: exact match first', () => {
    it('should prioritize exact match over pattern matching', () => {
      const routes = new Set(['/posts/new', '/posts/[id]']);

      // Should match exact route, not dynamic pattern
      expect(matchesRoute('/posts/new', routes)).toBe(true);
      expect(matchesRoute('/posts/123', routes)).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle empty route set', () => {
      const routes = new Set<string>([]);
      expect(matchesRoute('/any', routes)).toBe(false);
    });

    it('should handle root path', () => {
      const routes = new Set(['/']);
      expect(matchesRoute('/', routes)).toBe(true);
      expect(matchesRoute('/home', routes)).toBe(false);
    });

    it('should not match routes with only static patterns when checking dynamic path', () => {
      const routes = new Set(['/home', '/about', '/contact']);
      expect(matchesRoute('/posts/123', routes)).toBe(false);
    });
  });
});
