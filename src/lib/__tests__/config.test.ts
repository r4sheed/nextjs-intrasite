import { describe, expect, it } from 'vitest';

import { middlewareConfig, siteConfig } from '@/lib/config';
import { getAllRoutes } from '@/lib/routes';

describe('config validation', () => {
  it('authRoutePrefix should start with /api', () => {
    expect(middlewareConfig.authRoutePrefix).toMatch(/^\/api/);
  });

  it('defaultLoginRedirect should exist in route definitions', () => {
    const urls = getAllRoutes().map(r => r.url);
    expect(urls).toContain(middlewareConfig.defaultLoginRedirect);
  });

  it('siteConfig.url should be a valid absolute URL', () => {
    expect(siteConfig.url).toMatch(/^https?:\/\//);
  });
});
