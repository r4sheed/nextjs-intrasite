import { describe, expect, it } from 'vitest';

import { middlewareConfig } from '@/lib/config';
import {
  guestRouteSet,
  guestRoutes,
  getAllRoutes,
  protectedRouteSet,
  protectedRoutes,
  publicRouteSet,
  publicRoutes,
  routes,
} from '@/lib/routes';

describe('Route definitions', () => {
  const collectRouteUrls = (node: unknown): string[] => {
    if (
      node &&
      typeof node === 'object' &&
      'url' in (node as Record<string, unknown>) &&
      'title' in (node as Record<string, unknown>)
    ) {
      return [(node as { url: string }).url];
    }

    if (node && typeof node === 'object') {
      return Object.values(node).flatMap(value => collectRouteUrls(value));
    }

    return [];
  };

  it('should flatten nested route tree via getAllRoutes', () => {
    const manualUrls = collectRouteUrls(routes).sort();
    const exposedUrls = getAllRoutes()
      .map(route => route.url)
      .sort();

    expect(exposedUrls).toEqual(manualUrls);
  });

  it('should derive route access lists from definitions', () => {
    const definitions = getAllRoutes();

    const collectByAccess = (access: string) =>
      definitions
        .filter(route => route.access === access)
        .map(route => route.url)
        .sort();

    expect(publicRoutes.slice().sort()).toEqual(collectByAccess('public'));
    expect(guestRoutes.slice().sort()).toEqual(collectByAccess('guest'));
    expect(protectedRoutes.slice().sort()).toEqual(
      collectByAccess('protected')
    );
  });

  it('should expose matching sets for quick lookups', () => {
    expect(publicRouteSet.size).toBe(publicRoutes.length);
    expect(guestRouteSet.size).toBe(guestRoutes.length);
    expect(protectedRouteSet.size).toBe(protectedRoutes.length);

    publicRoutes.forEach(url => expect(publicRouteSet.has(url)).toBe(true));
    guestRoutes.forEach(url => expect(guestRouteSet.has(url)).toBe(true));
    protectedRoutes.forEach(url =>
      expect(protectedRouteSet.has(url)).toBe(true)
    );
  });

  it('middlewareConfig.defaultLoginRedirect points to first protected route or home', () => {
    const expected = protectedRoutes[0] ?? routes.home.url;
    expect(middlewareConfig.defaultLoginRedirect).toBe(expected);
  });
});
