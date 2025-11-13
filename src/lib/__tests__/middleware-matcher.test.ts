import { readFileSync } from 'fs';
import { describe, expect, it } from 'vitest';

describe('middleware config.matcher patterns (source check)', () => {
  const src = readFileSync('src/middleware.ts', 'utf8');

  it('contains the path matcher that excludes static assets and _next internals', () => {
    // Check for a few key fragments rather than exact escaping-sensitive string
    expect(src.includes('((?!_next')).toBe(true);
    expect(src.includes('html')).toBe(true);
    expect(src.includes('webmanifest')).toBe(true);
  });

  it('contains an API/trpc matcher', () => {
    const hasApiMatcher =
      src.includes("'/(api|trpc)(.*)'") || src.includes('/(api|trpc)(.*)');
    expect(hasApiMatcher).toBe(true);
  });
});
